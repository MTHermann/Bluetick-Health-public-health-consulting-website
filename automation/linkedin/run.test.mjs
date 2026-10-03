import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { catalog, caption, verifyCanonicalUrl, reconcileCatalog, run, summarize } from './run.mjs'

const old = { slug: 'old-blog', title: 'Old title', excerpt: 'Old summary' }
const fresh = { slug: 'new-blog', title: 'New title', excerpt: 'New summary' }
const target = { organizationId: 'org-1', channelId: 'channel-1' }
const date = '2026-10-03T12:00:00.000Z'
const now = () => new Date(date)
const initial = () => ({ version: 1, initializedAt: date, entries: { 'old-blog': { status: 'seen' } } })
const digest = text => createHash('sha256').update(text).digest('hex')

function memoryState(ledger = initial()) {
  let stored = ledger ? { sha: '0', ledger: structuredClone(ledger) } : null
  let version = 0
  const writes = []
  return {
    writes,
    failAt: 0,
    async load() { return structuredClone(stored) },
    async save(snapshot, next) {
      if (this.failAt === writes.length + 1) throw Object.assign(new Error('private state body'), { code: 'state' })
      if ((snapshot?.sha ?? null) !== (stored?.sha ?? null)) {
        throw Object.assign(new Error('safe conflict'), { code: 'conflict' })
      }
      stored = { sha: String(++version), ledger: structuredClone(next) }
      writes.push(structuredClone(stored))
      return structuredClone(stored)
    },
  }
}
function mockBuffer(remote = []) {
  const calls = []
  return {
    calls,
    async channels() {
      calls.push('channels')
      return [{ id: target.channelId, organizationId: target.organizationId, service: 'linkedin' }]
    },
    async posts() { calls.push('posts'); return structuredClone(remote) },
    async createPost(text) { calls.push({ text }); return { id: 'created-1' } },
  }
}
function options(state, buffer, overrides = {}) {
  return { state, buffer, target, pageConfirmed: true, posts: [old, fresh], mode: 'live', verifyUrl: async () => true, now, ...overrides }
}
function uncertain(status = 'ambiguous') {
  const text = caption(catalog([fresh])[0])
  return { ...initial(), target, entries: { ...initial().entries,
    [fresh.slug]: { status, intentId: 'intent-1', textHash: digest(text),
      canonicalUrl: catalog([fresh])[0].url, ...target } } }
}

test('catalog is authoritative, fixed-origin, slug-keyed and rejects duplicate or unsafe slugs', () => {
  assert.deepEqual(catalog([fresh]), [{ ...fresh, url: 'https://bluetick-health.co.za/blog/new-blog/' }])
  assert.ok(catalog().length > 0)
  for (const slug of ['../escape', 'foo/bar', 'Foo', 'foo%2fbar', '', '__proto__', 'constructor/']) {
    assert.throws(() => catalog([{ ...fresh, slug }]), { code: 'catalog' })
  }
  assert.throws(() => catalog([fresh, fresh]), { code: 'catalog' })
  assert.throws(() => catalog([{ ...fresh, title: null }]), { code: 'catalog' })
})

test('caption is plain, bounded, strips markup, markdown, entities and controls', () => {
  const post = catalog([{ ...fresh, title: '# **Title**\u202e<script>bad()</script>',
    excerpt: '[Readable](https://evil.example) <b>words</b>&nbsp;&#x202e; &#60;tag&#62;\u0000' }])[0]
  const text = caption(post)
  assert.match(text, /^Title\n\nReadable words tag\n\nhttps:/)
  assert.doesNotMatch(text, /bad|evil|[*#<>\u202e\u0000]/)
  const long = caption({ ...post, title: 'T'.repeat(4000), excerpt: 'E'.repeat(6000) })
  assert.equal(long.length, 3000)
  assert.ok(long.endsWith(post.url))
  assert.throws(() => caption({ ...post, url: 'https://evil.example/blog/new-blog/' }), { code: 'canonical' })
})

test('caption raw-text filtering handles malformed end tags without reconstructing markup', () => {
  for (const name of ['script', 'style']) {
    for (const ending of [`</${name}\t\n bar>`, `</${name}/unexpected>`, `</${name}\f extra>`]) {
      const text = caption(catalog([{ ...fresh, title: `Before<${name}>hidden${ending}After` }])[0])
      assert.match(text, /^Before After\n/)
      assert.doesNotMatch(text, /hidden|unexpected|extra|<|>/)
    }
    const text = caption(catalog([{ ...fresh,
      title: `Visible <${name}>hidden</${name}:foo>still hidden` }])[0])
    assert.match(text, /^Visible\n/)
    assert.doesNotMatch(text, /hidden|foo/)
  }
  const text = caption(catalog([{ ...fresh,
    title: '<scr<script>hidden</script>ipt>Readable</scr<script>hidden</script>ipt>' }])[0])
  assert.match(text, /^Readable\n/)
  assert.doesNotMatch(text, /hidden|script|<|>/)
  const comment = caption(catalog([{ ...fresh,
    title: 'Before<!-- hidden -->After' }])[0])
  assert.match(comment, /^Before After\n/)
  assert.doesNotMatch(comment, /hidden/)
})

test('canonical verification uses fixed URL, forbids redirects and requires exact canonical', async () => {
  const url = catalog([fresh])[0].url
  let requested
  assert.equal(await verifyCanonicalUrl(url, async (input, init) => {
    requested = { input, init }
    return new Response(`<html><head><link rel="canonical" href="${url}" /></head></html>`,
      { headers: { 'content-type': 'text/html; charset=utf-8' } })
  }), true)
  assert.equal(requested.input, url)
  assert.equal(requested.init.redirect, 'error')
  for (const html of [
    `<link rel="canonical" href="https://evil.example/" />`,
    `<link rel="canonical" href="${url}?other=1" />`,
    `<link rel="canonical" href="${url.slice(0, -1)}" />`,
    `<link rel="canonical" href="${url}" /><link rel="canonical" href="${url}" />`,
    `<!-- <link rel="canonical" href="${url}" /> -->`,
    `<script>const fake = '<link rel="canonical" href="${url}" />'</script>`,
    '<html>no canonical</html>',
  ]) {
    await assert.rejects(verifyCanonicalUrl(url, async () => new Response(`<html><head>${html}</head></html>`,
      { headers: { 'content-type': 'text/html' } })), { code: 'canonical' })
  }
  await assert.rejects(verifyCanonicalUrl(url, async () => new Response('', { status: 302 })), { code: 'canonical' })
  await assert.rejects(verifyCanonicalUrl(url, async () => { throw new Error('private transport') }), { code: 'canonical' })
  for (const bad of ['http://bluetick-health.co.za/blog/new-blog/', 'https://bluetick-health.co.za.evil/blog/new-blog/',
    'https://user@bluetick-health.co.za/blog/new-blog/', 'https://bluetick-health.co.za/blog/../new-blog/',
    'https://bluetick-health.co.za/blog/new-blog/?x=1']) {
    await assert.rejects(verifyCanonicalUrl(bad, () => assert.fail('no request')), { code: 'canonical' })
  }
})

test('canonical extraction cannot see links inside malformed or unclosed raw-text elements', async () => {
  const url = catalog([fresh])[0].url
  const link = `<link rel="canonical" href="${url}" />`
  const response = html => new Response(`<html><head>${html}</head></html>`, { headers: { 'content-type': 'text/html' } })
  for (const name of ['script', 'style', 'title']) {
    for (const ending of [`</${name}\t\n bar>`, `</${name}/unexpected>`, `</${name}\f extra>`]) {
      assert.equal(await verifyCanonicalUrl(url, async () =>
        response(`<${name}><link rel="canonical" href="https://evil.example/" />${ending}${link}`)), true)
    }
    for (const html of [`<${name}>${link}`, `<${name}></${name}:foo>${link}`,
      `<${name}></${name}\u00a0foo>${link}`]) {
      await assert.rejects(verifyCanonicalUrl(url, async () => response(html)), { code: 'canonical' })
    }
    assert.equal(await verifyCanonicalUrl(url, async () =>
      response(`<${name}></${name}:foo>${link}</${name}>${link}`)), true)
  }
  for (const html of [
    `<li<script>hidden</script>nk rel="canonical" href="${url}" />`,
    `<li<style>hidden</style>nk rel="canonical" href="${url}" />`,
    `<li<!--hidden-->nk rel="canonical" href="${url}" />`,
    `<link:foo rel="canonical" href="${url}" />`,
    `<link evil:rel="canonical" href="${url}" />`,
    `<link rel="canonical" evil:href="${url}" />`,
    `<!-- unclosed comment ${link}`,
  ]) {
    await assert.rejects(verifyCanonicalUrl(url, async () => response(html)), { code: 'canonical' })
  }
  assert.equal(await verifyCanonicalUrl(url, async () => response(`<!-- ${link} -->${link}`)), true)
})

test('canonical tokens respect quoted attributes and require a real closed head', async () => {
  const url = catalog([fresh])[0].url
  const link = `<link rel="canonical" href="${url}" />`
  const response = html => new Response(html, { headers: { 'content-type': 'text/html' } })
  for (const html of [
    `<html><head><meta content='${link}' /></head></html>`,
    `<html><head data='${link}'></head></html>`,
    `<html><head><link title="${link.replaceAll('"', "'")}" /></head></html>`,
    `<html><head><link "${link.replaceAll('"', "'")}" /></head></html>`,
    `<html><body>${link}</body></html>`,
    `<html data='<head>${link}</head>'></html>`,
    `<html><head>${link}`,
    `<html><head><meta content="unterminated ${link}</head></html>`,
    `<html><head><script></script:foo>${link}</head></html>`,
    `<html><head><script><!--<script></script>${link}</head></html>`,
    `<html><head><textarea>${link}</head></html>`,
    `<html><head><textarea>${link}</textarea>${link}</head></html>`,
    `<html><head><title>${link}</head></html>`,
  ]) {
    await assert.rejects(verifyCanonicalUrl(url, async () => response(html)), { code: 'canonical' })
  }
  assert.equal(await verifyCanonicalUrl(url, async () =>
    response(`<html><head><meta content='${link}' />${link}</head><body>${link}</body></html>`)), true)
  assert.equal(await verifyCanonicalUrl(url, async () =>
    response(`<html><head><script>hidden</script data='${link}'>${link}</head></html>`)), true)
})

test('canonical verifier accepts every current authoritative blog HTML fixture', async () => {
  for (const post of catalog()) {
    const html = await readFile(new URL(`../../blog/${post.slug}/index.html`, import.meta.url), 'utf8')
    assert.equal(await verifyCanonicalUrl(post.url, async () =>
      new Response(html, { headers: { 'content-type': 'text/html' } })), true)
  }
})

test('disabled exits before all network and even invalid configuration', async () => {
  const result = await run({ BUFFER_MODE: 'unsafe' }, () => assert.fail('no network'), {
    state: { load: () => assert.fail('no state') }, posts: null,
  })
  assert.equal(result.disabled, true)
})

test('default dry-run requires no secrets and no network', async () => {
  const result = await run({ BUFFER_ENABLED: 'true' }, () => assert.fail('no network'), { posts: [fresh] })
  assert.equal(result.mode, 'dry-run')
  assert.equal(result.baseline, true)
  assert.equal(result.previews.length, 1)
})

test('dry-run previews baseline or pending articles without any durable mutations or Buffer calls', async () => {
  for (const baseline of [null, initial()]) {
    const state = memoryState(baseline)
    const buffer = mockBuffer()
    const result = await reconcileCatalog(options(state, buffer, { mode: 'dry-run' }))
    assert.equal(result.previews.length, baseline ? 1 : 2)
    assert.equal(state.writes.length, 0)
    assert.deepEqual(buffer.calls, [])
  }
})

test('valid prototype-like slugs are discovered, previewed and deduplicated using own entries', async () => {
  for (const slug of ['constructor', 'to-string']) {
    const state = memoryState()
    const buffer = mockBuffer()
    const posts = [old, { ...fresh, slug }]
    const preview = await reconcileCatalog(options(state, buffer, { posts, mode: 'dry-run' }))
    assert.equal(preview.previews.length, 1)
    assert.equal(preview.previews[0].slug, slug)
    assert.equal((await reconcileCatalog(options(state, buffer, { posts }))).queued, 1)
    assert.equal((await reconcileCatalog(options(state, buffer, { posts, mode: 'dry-run' }))).previews.length, 0)
    assert.equal((await reconcileCatalog(options(state, buffer, { posts }))).queued, 0)
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 1)
  }
})

test('initialize and first live run durably mark existing seen without Buffer or verification', async () => {
  for (const mode of ['initialize', 'live']) {
    const state = memoryState(null)
    const buffer = mockBuffer()
    const result = await reconcileCatalog(options(state, buffer, {
      mode, target: undefined, verifyUrl: () => assert.fail('no verification'),
    }))
    assert.equal(result.baseline, true)
    assert.equal(state.writes.length, 1)
    assert.deepEqual(Object.values((await state.load()).ledger.entries).map(entry => entry.status), ['seen', 'seen'])
    assert.deepEqual(buffer.calls, [])
  }
})

test('initialize on existing state never silently baselines newly added posts', async () => {
  const state = memoryState()
  await reconcileCatalog(options(state, mockBuffer(), { mode: 'initialize' }))
  assert.equal(state.writes.length, 0)
})

test('run baseline live needs only state, not Buffer secrets', async () => {
  const state = memoryState(null)
  const result = await run({ BUFFER_ENABLED: 'true', BUFFER_MODE: 'live' },
    () => assert.fail('no network'), { state, posts: [old, fresh] })
  assert.equal(result.baseline, true)
  assert.equal(state.writes.length, 1)
})

test('run initializes through real GitHubState with mocked Git API and no Buffer requests', async () => {
  const calls = []
  const sha = '1'.repeat(40)
  let committed = false
  let persisted
  const fetcher = async (url, request = {}) => {
    calls.push({ url, request })
    assert.ok(url.startsWith('https://api.github.com/repos/test-owner/test-repository/git/'))
    if (url.endsWith('/ref/heads/buffer-ledger')) {
      return committed ? Response.json({ object: { sha } }) : new Response('', { status: 404 })
    }
    const body = JSON.parse(request.body)
    if (url.endsWith('/blobs')) {
      persisted = JSON.parse(body.content)
      return Response.json({ sha })
    }
    if (url.endsWith('/trees')) return Response.json({ sha })
    if (url.endsWith('/commits')) {
      assert.deepEqual(body.parents, [])
      return Response.json({ sha })
    }
    if (url.endsWith('/refs')) {
      assert.equal(body.ref, 'refs/heads/buffer-ledger')
      committed = true
      return Response.json({ object: { sha } })
    }
    assert.fail('unexpected API endpoint')
  }
  await run({ BUFFER_ENABLED: 'true', BUFFER_MODE: 'initialize',
    GITHUB_TOKEN: 'mock-only', GITHUB_REPOSITORY: 'test-owner/test-repository' },
  fetcher, { posts: [old, fresh] })
  assert.equal(persisted.entries[fresh.slug].status, 'seen')
  assert.equal(calls.filter(call => call.request.method === 'POST').length, 4)
})

test('run wires BUFFER_API_KEY and real BufferClient using only mocked GraphQL', async () => {
  const state = memoryState()
  const queries = []
  const fetcher = async (url, request) => {
    assert.equal(url, 'https://api.buffer.com/graphql')
    assert.equal(request.headers.Authorization, ['Bearer', 'mock-only'].join(' '))
    const body = JSON.parse(request.body)
    queries.push(body)
    if (body.query.includes('LinkedInChannels')) {
      assert.equal(body.variables.input.organizationId, target.organizationId)
      return Response.json({ data: { account: { organizations: [{ id: target.organizationId }] },
        channels: [{ id: target.channelId, service: 'linkedin', type: 'page',
          isLocked: false, isDisconnected: false }] } })
    }
    if (body.query.includes('LinkedInPosts')) {
      return Response.json({ data: { posts: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } } } })
    }
    assert.ok(body.query.includes('LinkedInCreatePost'))
    assert.equal((await state.load()).ledger.entries[fresh.slug].status, 'intent')
    return Response.json({ data: { createPost: { __typename: 'PostActionSuccess', post: { id: 'created-live' } } } })
  }
  const result = await run({ BUFFER_ENABLED: 'true', BUFFER_MODE: 'live', BUFFER_API_KEY: 'mock-only',
    BUFFER_ORGANIZATION_ID: target.organizationId, BUFFER_CHANNEL_ID: target.channelId,
    BUFFER_LINKEDIN_PAGE_CONFIRMED: 'true' },
  fetcher, { state, posts: [old, fresh], verifyUrl: async () => true })
  assert.equal(result.queued, 1)
  assert.equal(queries.length, 3)
  assert.equal((await state.load()).ledger.entries[fresh.slug].postId, 'created-live')
})

test('new slugs persist pending, bind target, then persist UUID intent before one create', async () => {
  const state = memoryState()
  const buffer = mockBuffer()
  buffer.createPost = async text => {
    buffer.calls.push({ text })
    const durable = (await state.load()).ledger
    assert.equal(durable.entries[fresh.slug].status, 'intent')
    assert.match(durable.entries[fresh.slug].intentId, /^[0-9a-f-]{36}$/)
    assert.equal(durable.entries[fresh.slug].textHash, digest(text))
    assert.deepEqual(durable.target, target)
    return { id: 'created-1' }
  }
  const result = await reconcileCatalog(options(state, buffer))
  assert.equal(result.queued, 1)
  assert.equal(state.writes[0].ledger.entries[fresh.slug].status, 'pending')
  assert.equal(state.writes.at(-1).ledger.entries[fresh.slug].status, 'queued')
  assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 1)
  await reconcileCatalog(options(state, buffer))
  await reconcileCatalog(options(state, buffer, { posts: [{ ...old, title: 'Edited' }, { ...fresh, excerpt: 'Edited' }] }))
  assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 1)
})

test('all new slugs become durable pending before external Buffer reads', async () => {
  const state = memoryState()
  const extra = { ...fresh, slug: 'second-new' }
  const buffer = mockBuffer()
  buffer.channels = async () => {
    const ledger = (await state.load()).ledger
    assert.equal(ledger.entries[fresh.slug].status, 'pending')
    assert.equal(ledger.entries[extra.slug].status, 'pending')
    throw Object.assign(new Error('safe auth'), { code: 'auth' })
  }
  const result = await reconcileCatalog(options(state, buffer, { posts: [old, fresh, extra] }))
  assert.equal(result.stopped, 'auth')
})

test('CAS concurrency permits at most one Buffer mutation', async () => {
  for (const ledger of [initial(), { ...initial(), target, entries: {
    ...initial().entries, [fresh.slug]: { status: 'pending' },
  } }]) {
    const state = memoryState(ledger)
    const snapshot = await state.load()
    const buffer = mockBuffer()
    const results = await Promise.allSettled([
      reconcileCatalog(options(state, buffer, { snapshot })),
      reconcileCatalog(options(state, buffer, { snapshot })),
    ])
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1)
    assert.equal(results.find(result => result.status === 'rejected').reason.code, 'conflict')
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 1)
  }
})

test('state failures at pending, binding or intent prevent creation', async () => {
  for (const failAt of [1, 2, 3]) {
    const state = memoryState()
    state.failAt = failAt
    const buffer = mockBuffer()
    await assert.rejects(reconcileCatalog(options(state, buffer)), { code: 'state' })
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 0)
  }
})

test('final state failure after successful create leaves durable intent and never automatically retries', async () => {
  const state = memoryState()
  state.failAt = 4
  const buffer = mockBuffer()
  await assert.rejects(reconcileCatalog(options(state, buffer)), { code: 'state' })
  assert.equal((await state.load()).ledger.entries[fresh.slug].status, 'intent')
  state.failAt = 0
  const result = await reconcileCatalog(options(state, buffer))
  assert.equal(result.ambiguous, 1)
  assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 1)
})

test('unknown transport error and invalid success response become durable ambiguous, without retries', async () => {
  for (const invalid of [false, true]) {
    const state = memoryState()
    const buffer = mockBuffer()
    buffer.createPost = async () => {
      buffer.calls.push('create')
      if (invalid) return {}
      throw new Error('private transport error token')
    }
    const result = await reconcileCatalog(options(state, buffer))
    assert.equal(result.stopped, 'ambiguous')
    assert.equal((await state.load()).ledger.entries[fresh.slug].status, 'ambiguous')
    await reconcileCatalog(options(state, buffer))
    assert.equal(buffer.calls.filter(call => call === 'create').length, 1)
  }
})

test('failure persisting ambiguous outcome also preserves intent', async () => {
  const state = memoryState()
  state.failAt = 4
  const buffer = mockBuffer()
  buffer.createPost = async () => { throw new Error('private transport') }
  await assert.rejects(reconcileCatalog(options(state, buffer)), { code: 'state' })
  assert.equal((await state.load()).ledger.entries[fresh.slug].status, 'intent')
})

test('known safe rejections persist pending and stop processing further slugs', async () => {
  for (const code of ['auth', 'rate-limit', 'queue-full', 'rejected']) {
    const state = memoryState()
    const buffer = mockBuffer()
    let calls = 0
    buffer.createPost = async () => { calls++; throw Object.assign(new Error('private rejection'), { code, retryAfter: 120 }) }
    const result = await reconcileCatalog(options(state, buffer, { posts: [old, fresh, { ...fresh, slug: 'second-new' }] }))
    assert.equal(result.stopped, code)
    assert.equal(calls, 1)
    const ledger = (await state.load()).ledger
    assert.equal(ledger.entries[fresh.slug].status, 'pending')
    assert.equal(ledger.entries['second-new'].status, 'pending')
    if (code === 'rate-limit') assert.equal(ledger.cooldownUntil, '2026-10-03T12:02:00.000Z')
  }
})

test('persisted cooldown prevents all Buffer calls but still durably discovers new articles', async () => {
  const ledger = { ...initial(), cooldownUntil: '2026-10-04T12:00:00.000Z' }
  const state = memoryState(ledger)
  const buffer = mockBuffer()
  const result = await reconcileCatalog(options(state, buffer))
  assert.equal(result.cooldownUntil, ledger.cooldownUntil)
  assert.equal(state.writes.length, 1)
  assert.deepEqual(buffer.calls, [])
})

test('rate-limited channel or post reads persist cooldown without creating an intent', async () => {
  for (const method of ['channels', 'posts']) {
    const state = memoryState()
    const buffer = mockBuffer()
    buffer[method] = async () => {
      throw Object.assign(new Error('private rate limit'), { code: 'rate-limit', retryAfter: 180 })
    }
    const result = await reconcileCatalog(options(state, buffer))
    assert.equal(result.stopped, 'rate-limit')
    const ledger = (await state.load()).ledger
    assert.equal(ledger.cooldownUntil, '2026-10-03T12:03:00.000Z')
    assert.equal(ledger.entries[fresh.slug].status, 'pending')
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 0)
  }
})

test('queue capacity counts existing queued posts and newly created posts', async () => {
  for (const count of [9, 10]) {
    const remote = Array.from({ length: count }, (_, index) =>
      ({ id: String(index), channelId: target.channelId, status: 'queued', text: 'other article' }))
    const state = memoryState()
    const buffer = mockBuffer(remote)
    const result = await reconcileCatalog(options(state, buffer, { posts: [old, fresh, { ...fresh, slug: 'second-new' }] }))
    assert.equal(result.queued, count === 9 ? 1 : 0)
    assert.equal(result.stopped, 'queue-full')
    assert.equal((await state.load()).ledger.entries['second-new'].status, 'pending')
  }
  for (const status of ['SCHEDULED', 'notSent', 'future-waiting-status', 'error', 'draft']) {
    const remote = Array.from({ length: 10 }, (_, index) =>
      ({ id: String(index), channelId: target.channelId, status, text: 'other article' }))
    const buffer = mockBuffer(remote)
    assert.equal((await reconcileCatalog(options(memoryState(), buffer))).stopped, 'queue-full')
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 0)
  }
  const sent = Array.from({ length: 10 }, (_, index) =>
    ({ id: String(index), channelId: target.channelId, status: 'sent', text: 'other article' }))
  assert.equal((await reconcileCatalog(options(memoryState(), mockBuffer(sent)))).queued, 1)
})

test('existing complete canonical URL tokens avoid duplicates in lines or prose', async () => {
  const url = catalog([fresh])[0].url
  for (const status of ['queued', 'published', 'sent', 'draft', 'failed']) {
    const state = memoryState()
    const buffer = mockBuffer([{ id: 'existing', channelId: target.channelId, status, text: `old caption\n\n${url}` }])
    await reconcileCatalog(options(state, buffer, { verifyUrl: () => assert.fail('no mutation verification') }))
    assert.equal((await state.load()).ledger.entries[fresh.slug].status, status === 'queued' ? 'queued' : 'seen')
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 0)
  }
  for (const text of [`Read ${url} today`, `Read (${url}) today`, `Read ${url}.`,
    `Read ${url}), today`, `[Read](${url})`, `"${url}"`, `“${url}”`, `<${url}>`]) {
    const state = memoryState()
    const buffer = mockBuffer([{ id: 'inline-existing', channelId: target.channelId, status: 'queued', text }])
    assert.equal((await reconcileCatalog(options(state, buffer))).queued, 0)
    assert.equal((await state.load()).ledger.entries[fresh.slug].postId, 'inline-existing')
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 0)
  }
})

test('URL token matching rejects embedded foreign URLs and longer paths, queries, fragments or encoded suffixes', async () => {
  const url = catalog([fresh])[0].url
  for (const text of [
    `Read https://evil.example/?u=${url} today`,
    `Read https://evil.example/?u=(${url}) today`,
    `Read prefix${url} today`,
    `Read prefix/${url} today`,
    `Read u=${url} today`,
    `Read ${url}extra/ today`,
    `Read ${url.slice(0, -1)}-other/ today`,
    `Read ${url}?other=1 today`,
    `Read ${url}? today`,
    `Read ${url}#fragment today`,
    `Read ${url}# today`,
    `Read ${url}%2fextra today`,
    `Read ${url}%3fother=1 today`,
    `Read ${url}../ today`,
    `Read ${url}.. today`,
    `Read ${url}.extra today`,
  ]) {
    const state = memoryState()
    const buffer = mockBuffer([{ id: 'unrelated', channelId: target.channelId, status: 'queued', text }])
    assert.equal((await reconcileCatalog(options(state, buffer))).queued, 1, text)
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 1, text)
  }
})

test('wrong org, wrong service, missing channel, mixed-channel posts and target changes fail closed', async () => {
  for (const channel of [
    { id: target.channelId, organizationId: 'other-org', service: 'linkedin' },
    { id: target.channelId, organizationId: target.organizationId, service: 'facebook' },
    { id: 'other-channel', organizationId: target.organizationId, service: 'linkedin' },
    { id: target.channelId, organizationId: target.organizationId, service: 'linkedin', isLocked: true },
    { id: target.channelId, organizationId: target.organizationId, service: 'linkedin', isDisconnected: true },
  ]) {
    const state = memoryState()
    const buffer = mockBuffer()
    buffer.channels = async () => [channel]
    await assert.rejects(reconcileCatalog(options(state, buffer)), { code: 'target' })
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 0)
  }
  const state = memoryState({ ...initial(), target: { ...target, channelId: 'old-channel' } })
  const buffer = mockBuffer()
  await assert.rejects(reconcileCatalog(options(state, buffer)), { code: 'target' })
  assert.equal(state.writes.length, 0)
  assert.equal(buffer.calls.length, 0)
  await assert.rejects(reconcileCatalog(options(memoryState(), mockBuffer([
    { id: 'foreign', channelId: 'other', status: 'queued', text: 'text' },
  ]))), { code: 'buffer' })
})

test('canonical verification failure leaves pending without create', async () => {
  for (const returnsFalse of [false, true]) {
    const state = memoryState()
    const buffer = mockBuffer()
    await assert.rejects(reconcileCatalog(options(state, buffer, { verifyUrl: async () => {
      if (returnsFalse) return false
      throw Object.assign(new Error('safe canonical'), { code: 'canonical' })
    } })), { code: 'canonical' })
    assert.equal((await state.load()).ledger.entries[fresh.slug].status, 'pending')
    assert.equal(buffer.calls.filter(call => typeof call === 'object').length, 0)
  }
})

test('stale intent and ambiguous rows skip automatically, even if article text was edited', async () => {
  for (const status of ['intent', 'ambiguous']) {
    const state = memoryState(uncertain(status))
    const buffer = mockBuffer()
    const result = await reconcileCatalog(options(state, buffer, { posts: [old, { ...fresh, title: 'Edited' }] }))
    assert.equal(result.ambiguous, 1)
    assert.equal(state.writes.length, 0)
    assert.deepEqual(buffer.calls, [])
  }
})

test('reconciliation requires explicit confirmation, uncertain status and fixed bound target', async () => {
  for (const reconciliation of [
    { slug: fresh.slug, action: 'retry' },
    { slug: old.slug, action: 'retry', confirmed: true },
    { slug: fresh.slug, action: 'unknown', confirmed: true },
    { slug: '../new-blog', action: 'skip', confirmed: true },
    { slug: 'constructor', action: 'skip', confirmed: true },
  ]) {
    const state = memoryState(uncertain())
    await assert.rejects(reconcileCatalog(options(state, mockBuffer(), { mode: 'reconcile', reconciliation })),
      { code: 'reconciliation' })
    assert.equal(state.writes.length, 0)
  }
})

test('manual skip/retry record confirmation and do not call Buffer or post in reconciliation run', async () => {
  for (const action of ['skip', 'retry']) {
    const state = memoryState(uncertain('intent'))
    const buffer = mockBuffer()
    await reconcileCatalog(options(state, buffer, { mode: 'reconcile',
      reconciliation: { slug: fresh.slug, action, confirmed: true } }))
    const entry = (await state.load()).ledger.entries[fresh.slug]
    assert.equal(entry.status, action === 'skip' ? 'seen' : 'pending')
    assert.deepEqual(entry.reconciliation, { action, confirmed: true, confirmedAt: date })
    assert.deepEqual(buffer.calls, [])
    if (action === 'retry') assert.equal((await reconcileCatalog(options(state, buffer))).queued, 1)
  }
  const state = memoryState({ ...initial(), entries: {
    ...initial().entries, [fresh.slug]: { status: 'pending' },
  } })
  const buffer = mockBuffer()
  await reconcileCatalog(options(state, buffer, { mode: 'reconcile',
    reconciliation: { slug: fresh.slug, action: 'skip', confirmed: true } }))
  assert.equal((await state.load()).ledger.entries[fresh.slug].status, 'seen')
  assert.deepEqual(buffer.calls, [])
})

test('queued reconciliation must prove exact ID, full text hash, canonical URL and channel', async () => {
  const text = caption(catalog([fresh])[0])
  const valid = { id: 'confirmed-post', channelId: target.channelId, status: 'queued', text }
  for (const remote of [
    valid, { ...valid, id: 'wrong-id' }, { ...valid, channelId: 'other' },
    { ...valid, text: `Edited\n${catalog([fresh])[0].url}` }, { ...valid, status: 'draft' },
    { ...valid, text: 'no canonical' },
  ]) {
    const state = memoryState(uncertain())
    const action = reconcileCatalog(options(state, mockBuffer([remote]), { mode: 'reconcile',
      reconciliation: { slug: fresh.slug, action: 'queued', postId: valid.id, confirmed: true } }))
    if (remote === valid) {
      await action
      assert.equal((await state.load()).ledger.entries[fresh.slug].postId, valid.id)
    } else {
      await assert.rejects(action, { code: 'reconciliation' })
      assert.equal(state.writes.length, 0)
    }
  }
})

test('run wires explicit reconcile environment safely', async () => {
  const state = memoryState(uncertain())
  const result = await run({ BUFFER_ENABLED: 'true', BUFFER_MODE: 'reconcile',
    BUFFER_ORGANIZATION_ID: target.organizationId, BUFFER_CHANNEL_ID: target.channelId,
    BUFFER_RECONCILE_SLUG: fresh.slug, BUFFER_RECONCILE_ACTION: 'skip', BUFFER_RECONCILE_CONFIRMED: 'true' },
  () => assert.fail('no network'), { state, posts: [old, fresh] })
  assert.equal(result.mode, 'reconcile')
  assert.equal((await state.load()).ledger.entries[fresh.slug].status, 'seen')
})

test('live processing and queued reconciliation require explicit Page confirmation', async () => {
  for (const pageConfirmed of [false, undefined, 'true']) {
    const state = memoryState()
    const buffer = mockBuffer()
    await assert.rejects(reconcileCatalog(options(state, buffer, { pageConfirmed })), { code: 'target' })
    assert.equal(buffer.calls.length, 0)
    assert.equal((await state.load()).ledger.entries[fresh.slug].status, 'pending')
    await assert.rejects(reconcileCatalog(options(memoryState(uncertain()), buffer, {
      pageConfirmed, mode: 'reconcile',
      reconciliation: { slug: fresh.slug, action: 'queued', postId: 'id', confirmed: true },
    })), { code: 'target' })
    assert.equal(buffer.calls.length, 0)
  }
})

test('run rejects missing or false Page confirmation before any client calls or ledger writes', async () => {
  for (const confirmation of [undefined, 'false', 'TRUE']) {
    for (const mode of ['live', 'reconcile']) {
      const state = memoryState(mode === 'live' ? initial() : uncertain())
      const buffer = mockBuffer()
      await assert.rejects(run({ BUFFER_ENABLED: 'true', BUFFER_MODE: mode,
        BUFFER_ORGANIZATION_ID: target.organizationId, BUFFER_CHANNEL_ID: target.channelId,
        BUFFER_LINKEDIN_PAGE_CONFIRMED: confirmation, BUFFER_RECONCILE_SLUG: fresh.slug,
        BUFFER_RECONCILE_ACTION: 'queued', BUFFER_RECONCILE_POST_ID: 'id',
        BUFFER_RECONCILE_CONFIRMED: 'true' },
      () => assert.fail('no network'), { state, buffer, posts: [old, fresh] }), { code: 'target' })
      assert.equal(state.writes.length, 0)
      assert.deepEqual(buffer.calls, [])
    }
  }
  const state = memoryState(uncertain())
  const buffer = mockBuffer([{ id: 'confirmed-id', channelId: target.channelId, status: 'queued',
    text: caption(catalog([fresh])[0]) }])
  await run({ BUFFER_ENABLED: 'true', BUFFER_MODE: 'reconcile',
    BUFFER_ORGANIZATION_ID: target.organizationId, BUFFER_CHANNEL_ID: target.channelId,
    BUFFER_LINKEDIN_PAGE_CONFIRMED: 'true', BUFFER_RECONCILE_SLUG: fresh.slug,
    BUFFER_RECONCILE_ACTION: 'queued', BUFFER_RECONCILE_POST_ID: 'confirmed-id',
    BUFFER_RECONCILE_CONFIRMED: 'true' },
  () => assert.fail('no network'), { state, buffer, posts: [old, fresh] })
  assert.deepEqual(buffer.calls, ['channels', 'posts'])
  assert.equal((await state.load()).ledger.entries[fresh.slug].status, 'queued')
})

test('summaries expose safe counts and sanitized fenced previews, never upstream error fields', () => {
  const summary = summarize({ mode: 'dry-run', baseline: true, discovered: 2, queued: 0, ambiguous: 1,
    upstreamBody: 'private unsafe upstream',
    previews: [{ slug: fresh.slug, text: '# **Title**\n\n<script>private()</script>Readable\n\nhttps://bluetick-health.co.za/blog/new-blog/' }] })
  assert.match(summary, /dry-run/)
  assert.match(summary, /baseline only/)
  assert.match(summary, /```text\nTitle\n\nReadable/)
  assert.doesNotMatch(summary, /private|unsafe|upstream|<script>|#|\*\*/)
  assert.doesNotMatch(summarize({ mode: 'dry-run', discovered: 1,
    previews: [{ slug: fresh.slug, text: 'preview-caption' }] }, { previews: false }), /preview-caption/)
  assert.doesNotMatch(summarize({ mode: 'private', stopped: 'upstream', discovered: '**unsafe**',
    cooldownUntil: 'not a date' }), /private|unsafe|upstream|not a date/)
})
