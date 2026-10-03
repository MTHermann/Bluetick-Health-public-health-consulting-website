import { appendFile } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { blogPosts, siteUrl } from '../../src/content/siteContent.js'

const ORIGIN = 'https://bluetick-health.co.za'
const MODES = new Set(['dry-run', 'initialize', 'live', 'reconcile'])
const STATUSES = new Set(['seen', 'pending', 'intent', 'queued', 'ambiguous'])
const QUEUED = new Set(['queued', 'scheduled', 'pending', 'notsent', 'not_sent'])
const NOT_QUEUED = new Set(['draft', 'sent', 'published', 'failed', 'error', 'deleted'])

export class RunnerError extends Error {
  constructor(code = 'configuration') {
    super(`LinkedIn automation stopped (${code}). Credentials and upstream details withheld.`)
    this.name = 'RunnerError'
    this.code = code
  }
}

function trustedUrl(url) {
  if (typeof url !== 'string' ||
      !/^https:\/\/bluetick-health\.co\.za\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(url)) {
    throw new RunnerError('canonical')
  }
  return url
}

export function catalog(posts = blogPosts) {
  let configured
  try { configured = new URL(siteUrl) } catch { throw new RunnerError('catalog') }
  if (configured.origin !== ORIGIN || configured.username || configured.password ||
      configured.search || configured.hash || configured.pathname !== '/') {
    throw new RunnerError('catalog')
  }
  if (!Array.isArray(posts)) throw new RunnerError('catalog')
  const slugs = new Set()
  return posts.map(post => {
    const { slug, title, excerpt } = post ?? {}
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        slugs.has(slug) || typeof title !== 'string' || typeof excerpt !== 'string') {
      throw new RunnerError('catalog')
    }
    slugs.add(slug)
    return { slug, title, excerpt, url: `${ORIGIN}/blog/${slug}/` }
  })
}

function plainText(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)|\[([^\]]*)\]\([^)]*\)/g, '$1$2')
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos);|&#(?:x[0-9a-f]+|\d+);/gi, entity => {
      const named = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" }
      if (named[entity.toLowerCase()] !== undefined) return named[entity.toLowerCase()]
      const number = entity.slice(2, -1)
      const code = number[0].toLowerCase() === 'x' ? parseInt(number.slice(1), 16) : Number(number)
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' '
    })
    .replace(/[\p{Cc}\p{Cf}\p{Cs}]/gu, ' ')
    .replace(/[*_`~#<>[\]{}|\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value, length) {
  const part = value.slice(0, length)
  return /[\ud800-\udbff]$/.test(part) ? part.slice(0, -1) : part
}

export function caption(post) {
  const url = trustedUrl(post.url)
  if (typeof post.title !== 'string' || typeof post.excerpt !== 'string') throw new RunnerError('catalog')
  const title = plainText(post.title)
  const excerpt = plainText(post.excerpt)
  if (!title || !excerpt) throw new RunnerError('catalog')
  // Reserve space for the full canonical URL, including paragraph separators.
  const budget = 3000 - url.length - 4
  const titlePart = truncate(title, Math.min(title.length, Math.floor(budget / 2)))
  const excerptPart = truncate(excerpt, budget - titlePart.length)
  return `${titlePart}\n\n${excerptPart}\n\n${url}`
}

export async function verifyCanonicalUrl(url, fetcher = fetch) {
  trustedUrl(url)
  let response
  try {
    response = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(30000) })
  } catch { throw new RunnerError('canonical') }
  if (!response.ok || response.redirected || (response.url && response.url !== url) ||
      !/^text\/html(?:;|$)/i.test(response.headers.get('content-type') ?? '')) {
    throw new RunnerError('canonical')
  }
  let html
  try { html = await response.text() } catch { throw new RunnerError('canonical') }
  const canonical = []
  const markup = html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
  for (const tag of markup.match(/<link\b[^>]*>/gi) ?? []) {
    const attributes = {}
    for (const match of tag.matchAll(/([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
      const name = match[1].toLowerCase()
      if (Object.hasOwn(attributes, name)) throw new RunnerError('canonical')
      attributes[name] = match[2] ?? match[3] ?? match[4]
    }
    if ((attributes.rel ?? '').toLowerCase().split(/\s+/).includes('canonical')) canonical.push(attributes.href)
  }
  if (canonical.length !== 1 || canonical[0] !== url) throw new RunnerError('canonical')
  return true
}

function hash(text) { return createHash('sha256').update(text).digest('hex') }
function cooldown(error, currentTime) {
  const seconds = Number(error.retryAfter)
  const wait = Number.isFinite(seconds) && seconds > 0 ? Math.max(60, seconds) : 3600
  return new Date(Math.min(currentTime.getTime() + wait * 1000, 8.64e15)).toISOString()
}
function matchesUrl(post, url) {
  return typeof post.text === 'string' && post.text.split(/\r?\n/).includes(url)
}
function postStatus(post) { return String(post.status).toLowerCase() }
function checkLedger(ledger) {
  if (!ledger || ledger.version !== 1 || !Number.isFinite(Date.parse(ledger.initializedAt)) ||
      !ledger.entries || typeof ledger.entries !== 'object' || Array.isArray(ledger.entries)) {
    throw new RunnerError('state')
  }
  for (const [slug, entry] of Object.entries(ledger.entries)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !entry || !STATUSES.has(entry.status)) {
      throw new RunnerError('state')
    }
  }
  if (ledger.cooldownUntil !== undefined && !Number.isFinite(Date.parse(ledger.cooldownUntil))) {
    throw new RunnerError('state')
  }
}
function targetMatches(left, right) {
  return left?.organizationId === right?.organizationId && left?.channelId === right?.channelId
}
function inChannel(post, target) {
  return post.channelId === target.channelId
}
function validateChannel(channels, target) {
  if (!Array.isArray(channels) || !channels.some(channel =>
    channel.id === target.channelId && channel.organizationId === target.organizationId &&
    String(channel.service).toLowerCase() === 'linkedin' &&
    channel.isLocked !== true && channel.isDisconnected !== true)) throw new RunnerError('target')
}

export async function reconcileCatalog({
  state, buffer, posts = blogPosts, verifyUrl = verifyCanonicalUrl, mode = 'dry-run',
  target, reconciliation = {}, now = () => new Date(), snapshot: suppliedSnapshot,
}) {
  if (!MODES.has(mode)) throw new RunnerError('configuration')
  const entries = catalog(posts).map(post => ({ ...post, text: caption(post) }))
  let snapshot = suppliedSnapshot === undefined ? (state ? await state.load() : null) : suppliedSnapshot
  if (snapshot) checkLedger(snapshot.ledger)
  const result = { mode, baseline: !snapshot, discovered: 0, queued: 0, ambiguous: 0, previews: [] }
  if (mode === 'dry-run') {
    result.previews = entries.filter(post => !snapshot || !snapshot.ledger.entries[post.slug] ||
      snapshot.ledger.entries[post.slug].status === 'pending').map(({ slug, text }) => ({ slug, text }))
    result.discovered = result.previews.length
    return result
  }
  if (!state) throw new RunnerError('configuration')
  async function save(ledger) {
    // Never change the loaded snapshot until the compare-and-swap write succeeds.
    snapshot = await state.save(snapshot, ledger)
    return snapshot.ledger
  }
  const time = () => now().toISOString()
  async function stopForReadError(error, current) {
    if (!['auth', 'rate-limit', 'queue-full', 'rejected'].includes(error?.code)) throw error
    result.stopped = error.code
    if (error.code === 'rate-limit') {
      current.cooldownUntil = cooldown(error, now())
      await save(current)
      result.cooldownUntil = current.cooldownUntil
    }
    return result
  }
  if (!snapshot) {
    if (mode === 'reconcile') throw new RunnerError('reconciliation')
    await save({ version: 1, initializedAt: time(), entries: Object.fromEntries(
      entries.map(post => [post.slug, { status: 'seen', seenAt: time() }])) })
    return result
  }
  result.baseline = false
  if (mode === 'initialize') return result
  if (!target || typeof target.organizationId !== 'string' || !target.organizationId ||
      typeof target.channelId !== 'string' || !target.channelId) throw new RunnerError('configuration')
  let ledger = structuredClone(snapshot.ledger)
  if (ledger.target && !targetMatches(ledger.target, target)) throw new RunnerError('target')
  for (const entry of Object.values(ledger.entries)) {
    if (entry.status === 'intent' || entry.status === 'ambiguous') {
      if (entry.organizationId && !targetMatches(entry, target)) throw new RunnerError('target')
    }
  }

  if (mode === 'reconcile') {
    const { slug, action, confirmed, postId } = reconciliation
    const entry = ledger.entries[slug]
    if (confirmed !== true || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? '') ||
        !entry || (action === 'retry' && !['intent', 'ambiguous'].includes(entry.status)) ||
        !['skip', 'retry', 'queued'].includes(action)) throw new RunnerError('reconciliation')
    if (action !== 'skip' && (!ledger.target || !targetMatches(ledger.target, target) || !targetMatches(entry, target))) {
      throw new RunnerError('target')
    }
    if (action === 'queued') {
      if (typeof postId !== 'string' || !postId || !buffer) throw new RunnerError('reconciliation')
      validateChannel(await buffer.channels(), target)
      const remote = (await buffer.posts()).find(post => post.id === postId && inChannel(post, target))
      const url = `${ORIGIN}/blog/${slug}/`
      if (!remote || !matchesUrl(remote, url) || hash(remote.text) !== entry.textHash ||
          !QUEUED.has(postStatus(remote))) throw new RunnerError('reconciliation')
      ledger.entries[slug] = { ...entry, status: 'queued', postId }
    } else {
      ledger.entries[slug] = { ...entry, status: action === 'skip' ? 'seen' : 'pending' }
    }
    ledger.entries[slug].reconciliation = { action, confirmed: true, confirmedAt: time() }
    await save(ledger)
    return result
  }

  for (const post of entries) {
    if (!Object.hasOwn(ledger.entries, post.slug)) {
      ledger.entries[post.slug] = { status: 'pending', discoveredAt: time() }
      result.discovered++
    }
  }
  if (result.discovered) ledger = structuredClone(await save(ledger))
  // A stale intent includes the crash-after-success case: never retry it automatically.
  for (const entry of Object.values(ledger.entries)) {
    if (entry.status === 'intent' || entry.status === 'ambiguous') result.ambiguous++
  }
  const pending = entries.filter(post => ledger.entries[post.slug].status === 'pending')
  if (!pending.length) return result
  if (ledger.cooldownUntil && Date.parse(ledger.cooldownUntil) > now().getTime()) {
    result.cooldownUntil = ledger.cooldownUntil
    return result
  }
  if (!buffer) throw new RunnerError('configuration')
  let channels, remote
  try {
    channels = await buffer.channels()
    validateChannel(channels, target)
    remote = await buffer.posts()
  } catch (error) { return stopForReadError(error, ledger) }
  if (!Array.isArray(remote) || remote.some(post => !inChannel(post, target) ||
      typeof post.text !== 'string' || typeof post.id !== 'string' || typeof post.status !== 'string')) {
    throw new RunnerError('buffer')
  }
  if (!ledger.target) {
    ledger.target = { ...target }
    ledger = structuredClone(await save(ledger))
  }
  // Unknown future statuses must not cause an unsafe queue-capacity undercount.
  let queued = remote.filter(post => !NOT_QUEUED.has(postStatus(post))).length
  for (const post of pending) {
    const existing = remote.find(item => matchesUrl(item, post.url))
    if (existing) {
      ledger.entries[post.slug] = { ...ledger.entries[post.slug],
        status: QUEUED.has(postStatus(existing)) ? 'queued' : 'seen', postId: existing.id, matchedAt: time() }
      ledger = structuredClone(await save(ledger))
      continue
    }
    if (queued >= 10) {
      result.stopped = 'queue-full'
      break
    }
    if (await verifyUrl(post.url) !== true) throw new RunnerError('canonical')
    ledger.entries[post.slug] = { ...ledger.entries[post.slug], status: 'intent',
      intentId: randomUUID(), textHash: hash(post.text), canonicalUrl: post.url,
      organizationId: target.organizationId, channelId: target.channelId, intentAt: time() }
    ledger = structuredClone(await save(ledger))
    let created
    try {
      created = await buffer.createPost(post.text)
      if (!created || typeof created.id !== 'string' || !created.id) throw new RunnerError('ambiguous')
    } catch (error) {
      const code = ['auth', 'rate-limit', 'queue-full', 'rejected'].includes(error?.code) ? error.code : 'ambiguous'
      ledger.entries[post.slug].status = code === 'ambiguous' ? 'ambiguous' : 'pending'
      ledger.entries[post.slug].lastOutcome = code
      if (code === 'rate-limit') {
        ledger.cooldownUntil = cooldown(error, now())
        result.cooldownUntil = ledger.cooldownUntil
      }
      await save(ledger)
      result.stopped = code
      if (code === 'ambiguous') result.ambiguous++
      break
    }
    // A failed final write must leave the durable intent, not downgrade it to pending.
    ledger.entries[post.slug] = { ...ledger.entries[post.slug], status: 'queued', postId: created.id, queuedAt: time() }
    ledger = structuredClone(await save(ledger))
    result.queued++
    queued++
    remote.push({ id: created.id, text: post.text, status: 'queued', channelId: target.channelId })
  }
  return result
}

export function summarize(result) {
  if (result.disabled) return 'LinkedIn automation disabled.\n'
  const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0
  const stopped = ['auth', 'rate-limit', 'queue-full', 'rejected', 'ambiguous'].includes(result.stopped) ? result.stopped : ''
  const until = Number.isFinite(Date.parse(result.cooldownUntil)) ? new Date(result.cooldownUntil).toISOString() : ''
  const summary = `LinkedIn ${MODES.has(result.mode) ? result.mode : 'status'}: ${result.baseline ? 'baseline only; no existing articles posted' : 'catalog checked'}; ` +
    `new: ${count(result.discovered)}; queued: ${count(result.queued)}; unresolved: ${count(result.ambiguous)}` +
    `${stopped ? `; stopped: ${stopped}` : ''}` +
    `${until ? `; cooldown until ${until}` : ''}.\n`
  if (result.mode !== 'dry-run' || !Array.isArray(result.previews)) return summary
  const previews = result.previews.slice(0, 100).filter(preview =>
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(preview?.slug ?? '') && typeof preview.text === 'string')
    .map(preview => {
      const text = truncate(preview.text.split(/\r?\n/).map(plainText).join('\n'), 3000)
      return `\n${preview.slug} (preview only):\n\`\`\`text\n${text}\n\`\`\`\n`
    })
  return summary + previews.join('')
}

export async function run(env = process.env, fetcher = fetch, dependencies = {}) {
  if (env.BUFFER_ENABLED !== 'true') return { disabled: true }
  const mode = env.BUFFER_MODE || 'dry-run'
  if (!MODES.has(mode)) throw new RunnerError('configuration')
  let state = dependencies.state
  if (!state && (mode !== 'dry-run' || (env.GITHUB_TOKEN && env.GITHUB_REPOSITORY))) {
    if (!env.GITHUB_TOKEN || !env.GITHUB_REPOSITORY) throw new RunnerError('configuration')
    const { GitHubState } = await import('./state.mjs')
    state = new GitHubState({ token: env.GITHUB_TOKEN, repository: env.GITHUB_REPOSITORY, fetcher })
  }
  const snapshot = state ? await state.load() : null
  if (snapshot) checkLedger(snapshot.ledger)
  let buffer = dependencies.buffer
  const target = { organizationId: env.BUFFER_ORGANIZATION_ID, channelId: env.BUFFER_CHANNEL_ID }
  const posts = dependencies.posts ?? blogPosts
  const needsBuffer = snapshot && ((mode === 'live' && catalog(posts).some(post =>
    !Object.hasOwn(snapshot.ledger.entries, post.slug) || snapshot.ledger.entries[post.slug].status === 'pending')) ||
    (mode === 'reconcile' && env.BUFFER_RECONCILE_ACTION === 'queued'))
  if (!buffer && needsBuffer) {
    const token = env.BUFFER_API_KEY || env.BUFFER_TOKEN
    if (!token || !target.organizationId || !target.channelId) throw new RunnerError('configuration')
    const { BufferClient } = await import('./buffer.mjs')
    buffer = new BufferClient({ token, ...target, fetcher })
  }
  const result = await reconcileCatalog({ state, buffer, snapshot, mode, target,
    posts,
    verifyUrl: dependencies.verifyUrl ?? (url => verifyCanonicalUrl(url, fetcher)),
    reconciliation: { slug: env.BUFFER_RECONCILE_SLUG, action: env.BUFFER_RECONCILE_ACTION,
      postId: env.BUFFER_RECONCILE_POST_ID, confirmed: env.BUFFER_RECONCILE_CONFIRMED === 'true' } })
  const summary = summarize(result)
  console.log(summary.trim())
  if (env.GITHUB_STEP_SUMMARY) await appendFile(env.GITHUB_STEP_SUMMARY, summary)
  return result
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch(error => {
    const code = ['configuration', 'catalog', 'canonical', 'target', 'reconciliation', 'conflict', 'state',
      'auth', 'rate-limit', 'queue-full', 'rejected', 'ambiguous', 'buffer'].includes(error?.code)
      ? error.code : 'internal'
    console.error(new RunnerError(code).message)
    process.exitCode = 1
  })
}
