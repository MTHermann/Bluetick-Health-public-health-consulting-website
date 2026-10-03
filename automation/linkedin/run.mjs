import { appendFile } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { blogPosts, siteUrl } from '../../src/content/siteContent.js'

const ORIGIN = 'https://bluetick-health.co.za'
const MODES = new Set(['dry-run', 'initialize', 'live', 'reconcile'])
const STATUSES = new Set(['seen', 'pending', 'intent', 'queued', 'ambiguous'])
const QUEUED = new Set(['queued', 'scheduled', 'pending', 'notsent', 'not_sent'])
const NOT_QUEUED = new Set(['sent'])

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

function stripRawText(value) {
  // HTML raw-text end tags allow ASCII whitespace/slashes, but not name prefixes.
  // An unclosed raw-text element consumes the remainder of the document.
  return value.replace(/<!--[\s\S]*?(?:-->|$)/g, ' ')
    .replace(/<(script|style)(?=[ \t\r\n\f/>])[^>]*>[\s\S]*?(?:<\/\1(?:[ \t\r\n\f/][^>]*)?>|$)/gi, ' ')
}

function plainText(value) {
  return stripRawText(value)
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

function tagAttributes(tag, nameEnd) {
  const attributes = Object.create(null)
  let rest = tag.slice(nameEnd, -1)
  while (rest) {
    const whitespace = /^[ \t\r\n\f]+/.exec(rest)
    if (!whitespace) {
      if (rest === '/') break
      throw new RunnerError('canonical')
    }
    rest = rest.slice(whitespace[0].length)
    if (!rest || rest === '/') break
    const attribute = /^([^ \t\r\n\f/"'=<>`]+)(?:[ \t\r\n\f]*=[ \t\r\n\f]*(?:"([^"]*)"|'([^']*)'|([^ \t\r\n\f"'=<>`]+)))?/.exec(rest)
    if (!attribute) throw new RunnerError('canonical')
    const name = attribute[1].toLowerCase()
    if (Object.hasOwn(attributes, name)) throw new RunnerError('canonical')
    attributes[name] = attribute[2] ?? attribute[3] ?? attribute[4] ?? ''
    rest = rest.slice(attribute[0].length)
  }
  return attributes
}

function headCanonicalLinks(html) {
  const links = []
  const tagToken = /<(?:[^"'<>]|"[^"]*"|'[^']*')*>/y
  const rawText = new Map(['script', 'style', 'title'].map(name => [
    name, new RegExp(`</${name}(?=[ \\t\\r\\n\\f/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>`, 'gi'),
  ]))
  let position = 0
  let inHead = false
  while (position < html.length) {
    const next = html.indexOf('<', position)
    if (next < 0) break
    if (!/^[ \t\r\n\f]*$/.test(html.slice(position, next))) throw new RunnerError('canonical')
    if (html.startsWith('<!--', next)) {
      const end = /--!?>/g
      end.lastIndex = next + 4
      const closing = end.exec(html)
      if (!closing) throw new RunnerError('canonical')
      position = closing.index + closing[0].length
      continue
    }
    tagToken.lastIndex = next
    const token = tagToken.exec(html)
    if (!token) throw new RunnerError('canonical')
    const tag = token[0]
    position = tagToken.lastIndex
    if (!inHead && /^<!doctype(?=[ \t\r\n\f>])/i.test(tag)) continue
    const element = /^<(\/?)([a-z][a-z0-9:-]*)(?=[ \t\r\n\f/>])/i.exec(tag)
    if (!element) throw new RunnerError('canonical')
    const name = element[2].toLowerCase()
    const closing = element[1] === '/'
    if (!inHead) {
      if (name === 'html' && !closing) continue
      if (name !== 'head' || closing) throw new RunnerError('canonical')
      inHead = true
      continue
    }
    if (name === 'head' && closing) return links
    if (closing || (!['meta', 'link', 'base'].includes(name) && !rawText.has(name))) throw new RunnerError('canonical')
    if (rawText.has(name)) {
      // Scan past raw text without interpreting tags or quoted attributes within it.
      const end = rawText.get(name)
      end.lastIndex = position
      const endTag = end.exec(html)
      if (!endTag) throw new RunnerError('canonical')
      // Script escape-state recovery is browser-specific; reject it rather than expose hidden tags.
      if (name === 'script' && html.slice(position, endTag.index).includes('<!--')) throw new RunnerError('canonical')
      position = endTag.index + endTag[0].length
      continue
    }
    if (name === 'link') {
      const attributes = tagAttributes(tag, element[0].length)
      if ((attributes.rel ?? '').toLowerCase().split(/[ \t\r\n\f]+/).includes('canonical')) {
        links.push(attributes.href)
      }
    }
  }
  throw new RunnerError('canonical')
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
  const canonical = headCanonicalLinks(html)
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
  if (typeof post.text !== 'string') return false
  // Consume whole URL tokens, so an embedded URL in another URL's query cannot match.
  for (const token of post.text.matchAll(/https?:\/\/[^\s<>"'`\u2018\u2019\u201c\u201d]+/gi)) {
    const preceding = token.index ? post.text[token.index - 1] : ''
    if (preceding && !/[\s([{"'<`\u2018\u201c]/u.test(preceding)) continue
    let candidate = token[0].replace(/[)\]},;!]+$/, '')
    if (candidate.endsWith('.') && !candidate.endsWith('..')) candidate = candidate.slice(0, -1)
    candidate = candidate.replace(/[)\]}]+$/, '')
    if (candidate === url) return true
  }
  return false
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
  target, pageConfirmed = false, reconciliation = {}, now = () => new Date(), snapshot: suppliedSnapshot,
}) {
  if (!MODES.has(mode)) throw new RunnerError('configuration')
  const entries = catalog(posts).map(post => ({ ...post, text: caption(post) }))
  let snapshot = suppliedSnapshot === undefined ? (state ? await state.load() : null) : suppliedSnapshot
  if (snapshot) checkLedger(snapshot.ledger)
  const result = { mode, baseline: !snapshot, discovered: 0, queued: 0, ambiguous: 0, previews: [] }
  if (mode === 'dry-run') {
    result.previews = entries.filter(post => !snapshot || !Object.hasOwn(snapshot.ledger.entries, post.slug) ||
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
    const entry = Object.hasOwn(ledger.entries, slug) ? ledger.entries[slug] : undefined
    if (confirmed !== true || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? '') ||
        !entry || (action === 'retry' && !['intent', 'ambiguous'].includes(entry.status)) ||
        !['skip', 'retry', 'queued'].includes(action)) throw new RunnerError('reconciliation')
    if (action !== 'skip' && (!ledger.target || !targetMatches(ledger.target, target) || !targetMatches(entry, target))) {
      throw new RunnerError('target')
    }
    if (action === 'queued') {
      if (pageConfirmed !== true) throw new RunnerError('target')
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
  if (pageConfirmed !== true) throw new RunnerError('target')
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
  // Only the documented sent status is positively known not to occupy queue space.
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

export function summarize(result, { previews: includePreviews = true } = {}) {
  if (result.disabled) return 'LinkedIn automation disabled.\n'
  const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0
  const stopped = ['auth', 'rate-limit', 'queue-full', 'rejected', 'ambiguous'].includes(result.stopped) ? result.stopped : ''
  const until = Number.isFinite(Date.parse(result.cooldownUntil)) ? new Date(result.cooldownUntil).toISOString() : ''
  const summary = `LinkedIn ${MODES.has(result.mode) ? result.mode : 'status'}: ${result.baseline ? 'baseline only; no existing articles posted' : 'catalog checked'}; ` +
    `new: ${count(result.discovered)}; queued: ${count(result.queued)}; unresolved: ${count(result.ambiguous)}` +
    `${stopped ? `; stopped: ${stopped}` : ''}` +
    `${until ? `; cooldown until ${until}` : ''}.\n`
  if (!includePreviews || result.mode !== 'dry-run' || !Array.isArray(result.previews)) return summary
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
  if (needsBuffer && env.BUFFER_LINKEDIN_PAGE_CONFIRMED !== 'true') throw new RunnerError('target')
  if (!buffer && needsBuffer) {
    const token = env.BUFFER_API_KEY
    if (!token || !target.organizationId || !target.channelId) throw new RunnerError('configuration')
    const { BufferClient } = await import('./buffer.mjs')
    buffer = new BufferClient({ token, ...target, fetcher })
  }
  const result = await reconcileCatalog({ state, buffer, snapshot, mode, target,
    pageConfirmed: env.BUFFER_LINKEDIN_PAGE_CONFIRMED === 'true',
    posts,
    verifyUrl: dependencies.verifyUrl ?? (url => verifyCanonicalUrl(url, fetcher)),
    reconciliation: { slug: env.BUFFER_RECONCILE_SLUG, action: env.BUFFER_RECONCILE_ACTION,
      postId: env.BUFFER_RECONCILE_POST_ID, confirmed: env.BUFFER_RECONCILE_CONFIRMED === 'true' } })
  const summary = summarize(result)
  console.log(summarize(result, { previews: false }).trim())
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
