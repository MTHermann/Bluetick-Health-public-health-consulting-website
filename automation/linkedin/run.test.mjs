import test from 'node:test'
import assert from 'node:assert/strict'
import { catalog, run, summarize } from './run.mjs'

test('catalog uses exported slugs, not publication dates or source parsing', () => {
  const posts = [{ slug: 'new-blog', title: 'Title', excerpt: 'Summary', datePublished: '2000-01-01' }]
  assert.deepEqual(catalog(posts), [{
    slug: 'new-blog', title: 'Title', excerpt: 'Summary',
    url: 'https://bluetick-health.co.za/blog/new-blog/',
  }])
  assert.throws(() => catalog([...posts, ...posts]))
  assert.throws(() => catalog([{ ...posts[0], slug: '../escape' }]))
})

test('automation reconciles before dispatch and passes content as JSON', async () => {
  const calls = []
  await run({
    LINKEDIN_BACKEND_URL: 'https://queue.example/',
    LINKEDIN_AUTOMATION_SECRET: 'mock-only',
  }, async (url, options) => {
    calls.push({ url: String(url), options })
    return Response.json({ ok: true })
  })
  assert.equal(calls.length, 2)
  assert.equal(calls[0].url, 'https://queue.example/api/automation/sync')
  assert.equal(JSON.parse(calls[0].options.body).blogs.length, catalog().length)
  assert.equal(calls[0].options.redirect, 'error')
  assert.equal(calls[1].url, 'https://queue.example/api/automation/dispatch')
})

test('failed sync stops dispatch; errors never contain response bodies', async () => {
  let calls = 0
  await assert.rejects(run({
    LINKEDIN_BACKEND_URL: 'https://queue.example/',
    LINKEDIN_AUTOMATION_SECRET: 'mock-only',
  }, async () => {
    calls++
    return new Response('sensitive upstream body', { status: 401 })
  }), { message: 'Backend /api/automation/sync returned HTTP 401' })
  assert.equal(calls, 1)
})

test('credentials never follow redirects or go to insecure backend URLs', async () => {
  await assert.rejects(run({
    LINKEDIN_BACKEND_URL: 'http://queue.example/',
    LINKEDIN_AUTOMATION_SECRET: 'mock-only',
  }, () => assert.fail('must not fetch')))
})

test('summaries expose counts and safe statuses only, never backend content', () => {
  const summary = summarize({ baselineApplied: true, queued: 0 }, {
    dryRun: true,
    posts: [{ status: 'pending', caption: 'private caption', slug: 'private-slug' },
      { status: 'untrusted backend text' }],
  })
  assert.match(summary, /baseline initialized/)
  assert.match(summary, /dry-run preview rows: 2 \(pending: 1\)/)
  assert.doesNotMatch(summary, /private|untrusted/)
  assert.match(summarize({}, { rateLimitedUntil: '2026-10-03T12:15:00Z' }),
    /rate-limit cooldown until 2026-10-03T12:15:00.000Z/)
})
