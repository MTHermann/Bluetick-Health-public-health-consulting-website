const ENDPOINT = 'https://api.buffer.com/graphql'
const messages = {
  auth: 'Buffer authorization failed.',
  'rate-limit': 'Buffer rate limit reached.',
  'queue-full': 'Buffer queue limit reached.',
  rejected: 'Buffer request rejected.',
  ambiguous: 'Buffer outcome is unknown; reconcile before retrying.',
}

export class BufferError extends Error {
  constructor(code, retryAfter) {
    const safeCode = Object.hasOwn(messages, code) ? code : 'ambiguous'
    super(messages[safeCode])
    this.name = 'BufferError'
    this.code = safeCode
    if (Number.isFinite(retryAfter) && retryAfter >= 0) this.retryAfter = retryAfter
  }
}

const channelsQuery = `
  query LinkedInChannels($input: ChannelsInput!) {
    account { organizations { id name } }
    channels(input: $input) {
      id name service type isLocked isDisconnected
    }
  }
`
const postsQuery = `
  query LinkedInPosts($input: PostsInput!, $after: String) {
    posts(input: $input, first: 100, after: $after) {
      edges { node { id text status channelId createdAt dueAt sentAt } }
      pageInfo { hasNextPage endCursor }
    }
  }
`
// Schema: bufferapp/buffer-n8n, nodes/Buffer/actions/post/create.ts.
// Pagination: developers.buffer.com/examples/get-paginated-posts.html.
const createMutation = `
  mutation LinkedInCreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      __typename
      ... on PostActionSuccess { post { id } }
    }
  }
`

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function retrySeconds(response) {
  const value = response.headers?.get?.('retry-after')
  if (typeof value !== 'string' || !value.trim()) return undefined
  if (/^\d+(?:\.\d+)?$/.test(value.trim())) return Number(value)
  if (!/^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value.trim())) return undefined
  const date = Date.parse(value)
  return Number.isFinite(date) ? Math.max(0, Math.ceil((date - Date.now()) / 1000)) : undefined
}

export class BufferClient {
  #token
  #organizationId
  #channelId
  #fetcher

  constructor({ token, organizationId, channelId, fetcher = fetch } = {}) {
    if (!nonempty(token) || /[\r\n]/.test(token)) throw new BufferError('auth')
    if (!nonempty(organizationId) || !nonempty(channelId) || typeof fetcher !== 'function') {
      throw new BufferError('rejected')
    }
    this.#token = token
    this.#organizationId = organizationId
    this.#channelId = channelId
    this.#fetcher = fetcher
  }

  async #request(query, variables) {
    try {
      const response = await this.#fetcher(ENDPOINT, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(30000),
        headers: {
          'Content-Type': 'application/json',
          Authorization: ['Bearer', this.#token].join(' '),
        },
        body: JSON.stringify({ query, variables }),
      })
      const retryAfter = retrySeconds(response)
      if (response.status === 401 || response.status === 403) throw new BufferError('auth')
      if (response.status === 429) throw new BufferError('rate-limit', retryAfter)
      if (!response.ok) throw new BufferError('ambiguous')
      const body = await response.json()
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new BufferError('ambiguous')
      if (body.errors !== undefined && (!Array.isArray(body.errors) || body.errors.length)) {
        // Only allow-listed pre-execution failures with no mutation result are safe.
        const codes = Array.isArray(body.errors)
          ? body.errors.map(error => error?.extensions?.code) : []
        if (body.data == null && codes.length &&
            codes.every(code => ['UNAUTHORIZED', 'FORBIDDEN', 'RATE_LIMIT_EXCEEDED'].includes(code))) {
          if (codes.includes('UNAUTHORIZED') || codes.includes('FORBIDDEN')) throw new BufferError('auth')
          throw new BufferError('rate-limit', retryAfter)
        }
        throw new BufferError('ambiguous')
      }
      if (!body.data || typeof body.data !== 'object') throw new BufferError('ambiguous')
      return body.data
    } catch (error) {
      if (error instanceof BufferError) throw error
      // Never propagate upstream messages, bodies, credentials, or causes.
      throw new BufferError('ambiguous')
    }
  }

  async channels() {
    const data = await this.#request(channelsQuery, { input: { organizationId: this.#organizationId } })
    const organizations = data.account?.organizations
    if (!Array.isArray(organizations) || organizations.some(organization => !nonempty(organization?.id))) {
      throw new BufferError('ambiguous')
    }
    if (!organizations.some(organization => organization.id === this.#organizationId)) {
      throw new BufferError('auth')
    }
    if (!Array.isArray(data.channels) || data.channels.some(channel => !nonempty(channel?.id))) {
      throw new BufferError('ambiguous')
    }
    // Attribute ownership from the organization-scoped query, not an unverified schema field.
    return data.channels.map(channel => ({ ...channel, organizationId: this.#organizationId }))
  }

  async posts() {
    const result = new Map()
    const cursors = new Set()
    let after = null
    for (;;) {
      const data = await this.#request(postsQuery, {
        input: { organizationId: this.#organizationId, filter: { channelIds: [this.#channelId] } },
        after,
      })
      const connection = data.posts
      if (!Array.isArray(connection?.edges) || typeof connection.pageInfo?.hasNextPage !== 'boolean') {
        throw new BufferError('ambiguous')
      }
      for (const edge of connection.edges) {
        const post = edge?.node
        if (!nonempty(post?.id) || !nonempty(post.status) || post.channelId !== this.#channelId ||
            (post.text !== null && typeof post.text !== 'string')) throw new BufferError('ambiguous')
        result.set(post.id, { ...post, text: post.text ?? '' })
      }
      if (!connection.pageInfo.hasNextPage) return [...result.values()]
      after = connection.pageInfo.endCursor
      if (!nonempty(after) || cursors.has(after)) throw new BufferError('ambiguous')
      cursors.add(after)
    }
  }

  async createPost(text) {
    if (!nonempty(text)) throw new BufferError('rejected')
    const data = await this.#request(createMutation, {
      input: { text, channelId: this.#channelId, schedulingType: 'automatic', mode: 'addToQueue' },
    })
    const result = data.createPost
    if (result?.__typename === 'PostActionSuccess' && nonempty(result.post?.id)) {
      return { id: result.post.id }
    }
    if (result?.post != null) throw new BufferError('ambiguous')
    const rejections = {
      UnauthorizedError: 'auth',
      InvalidInputError: 'rejected',
      NotFoundError: 'rejected',
      LimitReachedError: 'queue-full',
    }
    throw new BufferError(Object.hasOwn(rejections, result?.__typename ?? '')
      ? rejections[result.__typename] : 'ambiguous')
  }
}
