import test from 'node:test'
import assert from 'node:assert/strict'
import { GitHubState, StateError, validateLedger } from './state.mjs'

const baseline = () => ({ version: 1, initializedAt: '2026-10-03T00:00:00Z', entries: { old: { status: 'seen' } } })

function github() {
  let head = null
  let serial = 0
  const objects = new Map()
  const calls = []
  const fetcher = async (url, options) => {
    assert.ok(url.startsWith('https://api.github.com/repos/owner/repo/git/'))
    assert.equal(options.redirect, 'error')
    assert.ok(options.signal)
    const path = url.split('/git/')[1]
    const body = options.body ? JSON.parse(options.body) : null
    calls.push({ path, method: options.method, body })
    const reply = (data, status = 200) => new Response(JSON.stringify(data), { status })
    if (options.method === 'GET') {
      if (path === 'ref/heads/buffer-ledger') return head ? reply({ object: { sha: head } }) : reply({}, 404)
      const [type, sha] = path.split('/')
      const value = objects.get(sha)
      if (type === 'blobs') return reply({ encoding: 'base64', content: Buffer.from(value.content).toString('base64') })
      if (type === 'trees') return reply({ tree: value.tree })
      return reply({ tree: { sha: value.tree }, parents: value.parents })
    }
    if (path.startsWith('refs')) {
      const commit = objects.get(body.sha)
      if ((options.method === 'POST' && head) ||
          (options.method === 'PATCH' && commit.parents[0] !== head)) return reply({}, 422)
      assert.notEqual(body.force, true)
      head = body.sha
      return reply({ object: { sha: head } })
    }
    const sha = (++serial).toString(16).padStart(40, '0')
    objects.set(sha, body)
    return reply({ sha })
  }
  return { fetcher, calls, objects }
}

test('missing ref is the only first-install case; writes an isolated orphan ledger', async () => {
  const api = github()
  const state = new GitHubState({ token: 'test-only', repository: 'owner/repo', fetcher: api.fetcher })
  assert.equal(await state.load(), null)
  const saved = await state.save(null, baseline())
  assert.deepEqual((await state.load()).ledger, baseline())
  assert.ok(saved.sha)
  assert.deepEqual(api.calls.find(c => c.path === 'commits').body.parents, [])
  assert.equal(api.calls.find(c => c.path === 'refs').body.ref, 'refs/heads/buffer-ledger')
  assert.deepEqual(api.calls.find(c => c.path === 'trees' && c.method === 'POST').body.tree.map(f => f.path), ['ledger.json'])
})

test('concurrent initializers cannot overwrite the first baseline', async () => {
  const api = github()
  const state = new GitHubState({ token: 'test-only', repository: 'owner/repo', fetcher: api.fetcher })
  const results = await Promise.allSettled([state.save(null, baseline()), state.save(null, baseline())])
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1)
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'conflict')
})

test('non-force ref update rejects sibling commits and preserves winning intent', async () => {
  const api = github()
  const state = new GitHubState({ token: 'test-only', repository: 'owner/repo', fetcher: api.fetcher })
  const snapshot = await state.save(null, baseline())
  const winner = baseline()
  winner.entries.new = { status: 'pending' }
  await state.save(snapshot, winner)
  await assert.rejects(state.save(snapshot, baseline()), e => e.code === 'conflict')
  assert.deepEqual((await state.load()).ledger, winner)
})

test('state network/auth/malformed data failures never become a missing baseline', async () => {
  for (const fetcher of [
    async () => { throw new Error('private response') },
    async () => new Response('{}', { status: 403 }),
    async () => new Response('invalid'),
    async () => new Response('{}'),
  ]) {
    const state = new GitHubState({ token: 'test-only', repository: 'owner/repo', fetcher })
    await assert.rejects(state.load(), e => e instanceof StateError && !e.message.includes('private'))
  }
})

test('missing or corrupt ledger on an existing branch fails closed', async () => {
  const api = github()
  const state = new GitHubState({ token: 'test-only', repository: 'owner/repo', fetcher: api.fetcher })
  await state.save(null, baseline())
  const tree = [...api.objects.values()].find(o => Array.isArray(o.tree))
  tree.tree = []
  await assert.rejects(state.load(), StateError)
})

test('uncertain ref write or failed confirmation is not successful ownership', async () => {
  const api = github()
  let fail = false
  const fetcher = async (url, options) => {
    if (fail && url.endsWith('/ref/heads/buffer-ledger')) throw new Error('timeout')
    const response = await api.fetcher(url, options)
    if (options.method === 'POST' && url.endsWith('/refs')) fail = true
    return response
  }
  const state = new GitHubState({ token: 'test-only', repository: 'owner/repo', fetcher })
  await assert.rejects(state.save(null, baseline()), StateError)
  assert.deepEqual((await new GitHubState({ token: 'test-only', repository: 'owner/repo', fetcher: api.fetcher }).load()).ledger, baseline())
})

test('invalid versions, entries, unresolved intent fields and credentials in repository URL are rejected', () => {
  for (const ledger of [
    {}, { ...baseline(), version: 2 }, { ...baseline(), entries: [] },
    { ...baseline(), entries: { bad: { status: 'unknown' } } },
    { ...baseline(), entries: { bad: { status: 'intent' } } },
    { ...baseline(), entries: { bad: { status: 'queued' } } },
  ]) assert.throws(() => validateLedger(ledger), StateError)
  assert.throws(() => new GitHubState({ token: 'test-only', repository: 'owner/repo?token=private' }), StateError)
})

test('malformed successful Git object writes never grant intent ownership', async () => {
  for (const brokenPath of ['blobs', 'trees', 'commits']) {
    const api = github()
    const fetcher = async (url, options) => options.method === 'POST' && url.endsWith(`/${brokenPath}`)
      ? new Response('{}') : api.fetcher(url, options)
    const state = new GitHubState({ token: 'test-only', repository: 'owner/repo', fetcher })
    await assert.rejects(state.save(null, baseline()), StateError)
    assert.equal(api.calls.filter(c => c.path === 'refs').length, 0)
  }
})
