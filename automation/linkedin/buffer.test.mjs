import assert from 'node:assert/strict'
import test from 'node:test'
import { BufferClient, BufferError } from './buffer.mjs'

const options = { token: 'mock-only', organizationId: 'org-1', channelId: 'channel-1' }
const success = { data: { createPost: { __typename: 'PostActionSuccess', post: { id: 'post-1' } } } }
function response(body, status = 200, headers = {}) {
  return { ok: status >= 200 && status < 300, status, headers: new Headers(headers), json: async () => body }
}
function client(fetcher) {
  return new BufferClient({ ...options, fetcher })
}
function rejects(code, retryAfter) {
  return error => {
    assert.ok(error instanceof BufferError)
    assert.equal(error.code, code)
    if (retryAfter !== undefined) assert.equal(error.retryAfter, retryAfter)
    assert.doesNotMatch(error.message, /mock-only|private upstream/)
    assert.equal(error.cause, undefined)
    return true
  }
}

test('uses current Buffer createPost schema, fixed endpoint, and secure transport', async () => {
  let calls = 0
  const api = client(async (url, init) => {
    calls++
    assert.equal(url, 'https://api.buffer.com/graphql')
    assert.equal(init.method, 'POST')
    assert.equal(init.redirect, 'error')
    assert.ok(init.signal instanceof AbortSignal)
    assert.equal(init.headers.Authorization, ['Bearer', options.token].join(' '))
    assert.equal(init.headers['Content-Type'], 'application/json')
    const { query, variables } = JSON.parse(init.body)
    assert.match(query, /\$input: CreatePostInput!/)
    assert.match(query, /createPost\(input: \$input\)/)
    assert.match(query, /__typename/)
    assert.match(query, /on PostActionSuccess \{ post \{ id \} \}/)
    assert.deepEqual(variables, {
      input: { text: 'Line "one"\nhttps://example.org/', channelId: 'channel-1', schedulingType: 'automatic', mode: 'addToQueue' },
    })
    return response(success)
  })
  assert.deepEqual(await api.createPost('Line "one"\nhttps://example.org/'), { id: 'post-1' })
  assert.equal(calls, 1)
  assert.doesNotMatch(JSON.stringify(api), /mock-only/)
})

test('queries organizations and channels with ChannelsInput and normalizes array', async () => {
  const channels = [{ id: 'channel-1', name: 'LinkedIn', service: 'linkedin', type: 'profile', isDisconnected: false }]
  const api = client(async (_, init) => {
    const body = JSON.parse(init.body)
    assert.match(body.query, /\$input: ChannelsInput!/)
    assert.match(body.query, /account \{ organizations \{ id name \} \}/)
    assert.deepEqual(body.variables, { input: { organizationId: 'org-1' } })
    return response({ data: { account: { organizations: [{ id: 'org-1', name: 'Organization' }] }, channels } })
  })
  assert.deepEqual(await api.channels(), channels.map(channel => ({ ...channel, organizationId: 'org-1' })))
})

test('requires account access to the configured organization before attributing channel ownership', async () => {
  for (const [organizations, code] of [
    [undefined, 'ambiguous'], [[null], 'ambiguous'], [[], 'auth'], [[{ id: 'other-org' }], 'auth'],
  ]) {
    await assert.rejects(client(async () => response({
      data: { account: { organizations }, channels: [{ id: 'channel-1', service: 'linkedin' }] },
    })).channels(), rejects(code))
  }
})

test('reads every posts page without status filtering, deduplicating overlaps', async () => {
  const post = id => ({ id, text: 'Caption', status: 'scheduled', channelId: 'channel-1' })
  const pages = [
    { edges: [{ node: post('p1') }], pageInfo: { hasNextPage: true, endCursor: 'cursor-1' } },
    { edges: [{ node: post('p1') }, { node: post('p2') }], pageInfo: { hasNextPage: true, endCursor: 'cursor-2' } },
    { edges: [{ node: { ...post('p3'), text: null, status: 'sent' } }], pageInfo: { hasNextPage: false, endCursor: null } },
  ]
  let calls = 0
  const api = client(async (_, init) => {
    const { query, variables } = JSON.parse(init.body)
    assert.match(query, /\$input: PostsInput!/)
    assert.match(query, /first: 100, after: \$after/)
    assert.match(query, /edges \{ node \{ id text status/)
    assert.deepEqual(variables.input, { organizationId: 'org-1', filter: { channelIds: ['channel-1'] } })
    assert.equal(variables.after, [null, 'cursor-1', 'cursor-2'][calls])
    return response({ data: { posts: pages[calls++] } })
  })
  assert.deepEqual((await api.posts()).map(p => [p.id, p.text, p.status]),
    [['p1', 'Caption', 'scheduled'], ['p2', 'Caption', 'scheduled'], ['p3', '', 'sent']])
  assert.equal(calls, 3)
})

test('does not silently truncate invalid or looping pagination', async () => {
  for (const pageInfo of [{}, { hasNextPage: true }, { hasNextPage: true, endCursor: 'repeat' }]) {
    let calls = 0
    const api = client(async () => {
      calls++
      return response({ data: { posts: { edges: [], pageInfo } } })
    })
    await assert.rejects(api.posts(), rejects('ambiguous'))
    assert.ok(calls <= 2)
  }
})

test('only explicit typed no-mutation rejections get safe codes', async () => {
  for (const [type, code] of [
    ['UnauthorizedError', 'auth'], ['InvalidInputError', 'rejected'],
    ['NotFoundError', 'rejected'], ['LimitReachedError', 'queue-full'],
    ['UnexpectedError', 'ambiguous'], ['RestProxyError', 'ambiguous'],
    ['MutationError', 'ambiguous'], ['UnknownError', 'ambiguous'],
  ]) {
    let calls = 0
    const api = client(async () => {
      calls++
      return response({ data: { createPost: { __typename: type, message: 'private upstream' } } })
    })
    await assert.rejects(api.createPost('Caption'), rejects(code))
    assert.equal(calls, 1)
  }
})

test('HTTP auth and rate limit failures are sanitized and never retried', async () => {
  for (const [status, code] of [[401, 'auth'], [403, 'auth'], [429, 'rate-limit']]) {
    let calls = 0
    await assert.rejects(client(async () => {
      calls++
      return response({ message: 'private upstream' }, status, { 'Retry-After': '60' })
    }).createPost('Caption'), rejects(code, status === 429 ? 60 : undefined))
    assert.equal(calls, 1)
  }
})

test('Retry-After HTTP dates and invalid headers are handled', async () => {
  const date = new Date(Date.now() + 90000).toUTCString()
  await assert.rejects(client(async () => response({}, 429, { 'Retry-After': date })).createPost('Caption'),
    error => error.code === 'rate-limit' && error.retryAfter >= 88 && error.retryAfter <= 90)
  for (const value of ['', 'nonsense', '-1']) {
    await assert.rejects(client(async () => response({}, 429, { 'Retry-After': value })).createPost('Caption'),
      error => error.code === 'rate-limit' && error.retryAfter === undefined)
  }
})

test('top-level GraphQL errors are safe only for documented pre-execution failures without data', async () => {
  for (const [codes, code] of [
    [['UNAUTHORIZED'], 'auth'], [['FORBIDDEN'], 'auth'],
    [['RATE_LIMIT_EXCEEDED'], 'rate-limit'],
    [['UNEXPECTED'], 'ambiguous'], [['GRAPHQL_VALIDATION_FAILED'], 'ambiguous'],
    [['RATE_LIMIT_EXCEEDED', 'UNKNOWN'], 'ambiguous'],
  ]) {
    await assert.rejects(client(async () => response({
      data: null, errors: codes.map(value => ({ message: 'private upstream', extensions: { code: value } })),
    }, 200, { 'Retry-After': '20' })).createPost('Caption'), rejects(code, code === 'rate-limit' ? 20 : undefined))
  }
  await assert.rejects(client(async () => response({
    ...success, errors: [{ extensions: { code: 'RATE_LIMIT_EXCEEDED' } }],
  })).createPost('Caption'), rejects('ambiguous'))
})

test('transport, 5xx, other HTTP failures and malformed successes are ambiguous without retries', async () => {
  const fetchers = [
    async () => { throw new Error('private upstream mock-only') },
    async () => { throw new DOMException('private upstream', 'TimeoutError') },
    async () => { throw new DOMException('private upstream', 'AbortError') },
    ...[400, 404, 408, 500, 502, 503].map(status => async () => response({}, status)),
    async () => ({ ...response(null), json: async () => { throw new Error('private upstream') } }),
    ...[null, [], {}, { errors: {} }, { errors: [null] }, { data: {} },
      { data: { createPost: null } }, { data: { createPost: { post: { id: 'p1' } } } },
      { data: { createPost: { __typename: 'PostActionSuccess', post: {} } } },
      { data: { createPost: { __typename: 'InvalidInputError', post: { id: 'p1' } } } },
    ].map(body => async () => response(body)),
  ]
  for (const fetcher of fetchers) {
    let calls = 0
    await assert.rejects(client(async (...args) => { calls++; return fetcher(...args) }).createPost('Caption'), rejects('ambiguous'))
    assert.equal(calls, 1)
  }
})

test('malformed read responses fail closed', async () => {
  for (const channels of [null, {}, [null], [{ name: 'No id' }]]) {
    await assert.rejects(client(async () => response({
      data: { account: { organizations: [{ id: 'org-1' }] }, channels },
    })).channels(), rejects('ambiguous'))
  }
  for (const node of [null, { id: 'p1' }, { id: 'p1', status: 'sent', text: {} },
    { id: 'p1', status: 'scheduled', text: 'Caption', channelId: 'other-channel' }]) {
    await assert.rejects(client(async () => response({
      data: { posts: { edges: [{ node }], pageInfo: { hasNextPage: false } } },
    })).posts(), rejects('ambiguous'))
  }
})

test('invalid local input never makes a request; error messages cannot leak arbitrary input', async () => {
  assert.throws(() => new BufferClient(), rejects('auth'))
  assert.throws(() => new BufferClient({ ...options, token: 'bad\nheader' }), rejects('auth'))
  assert.throws(() => new BufferClient({ ...options, organizationId: '' }), rejects('rejected'))
  let calls = 0
  const api = client(async () => { calls++; return response(success) })
  for (const text of ['', ' ', null, {}]) await assert.rejects(api.createPost(text), rejects('rejected'))
  assert.equal(calls, 0)
  assert.equal(new BufferError('private upstream').code, 'ambiguous')
})
