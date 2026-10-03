const API = 'https://api.github.com'
export const STATE_BRANCH = 'buffer-ledger'
const FILE = 'ledger.json'
const statuses = new Set(['seen', 'pending', 'intent', 'queued', 'ambiguous'])

export class StateError extends Error {
  constructor(code = 'state') {
    super(code === 'conflict' ? 'Ledger changed concurrently; run reconciliation again.' : 'Ledger unavailable; no posts may be submitted.')
    this.code = code
  }
}

export function validateLedger(ledger) {
  if (!ledger || ledger.version !== 1 || !Number.isFinite(Date.parse(ledger.initializedAt)) ||
      !ledger.entries || typeof ledger.entries !== 'object' || Array.isArray(ledger.entries)) {
    throw new StateError()
  }
  if (ledger.target && (!ledger.target.organizationId || !ledger.target.channelId)) throw new StateError()
  if (ledger.cooldownUntil && !Number.isFinite(Date.parse(ledger.cooldownUntil))) throw new StateError()
  for (const [slug, entry] of Object.entries(ledger.entries)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !entry || !statuses.has(entry.status)) throw new StateError()
    if (['intent', 'ambiguous'].includes(entry.status) &&
        (typeof entry.intentId !== 'string' || !entry.intentId || typeof entry.textHash !== 'string' ||
         !/^[a-f0-9]{64}$/.test(entry.textHash) || !entry.channelId || !entry.organizationId)) {
      throw new StateError()
    }
    if (entry.status === 'queued' && (typeof entry.postId !== 'string' || !entry.postId)) throw new StateError()
  }
  return ledger
}

function objectSha(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{40}$/.test(value)) throw new StateError()
  return value
}

export class GitHubState {
  constructor({ token, repository, fetcher = fetch }) {
    if (!token || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository || '')) throw new StateError()
    this.token = token
    this.base = `${API}/repos/${repository}/git`
    this.fetcher = fetcher
  }

  async request(path, { method = 'GET', body, missing = false, conflict = false } = {}) {
    try {
      const response = await this.fetcher(`${this.base}/${path}`, {
        method,
        redirect: 'error',
        signal: AbortSignal.timeout(30000),
        headers: {
          Authorization: ['Bearer', this.token].join(' '),
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      if (missing && response.status === 404) return null
      if (conflict && [409, 422].includes(response.status)) throw new StateError('conflict')
      if (!response.ok) throw new StateError()
      return await response.json()
    } catch (error) {
      if (error instanceof StateError) throw error
      throw new StateError()
    }
  }

  async load() {
    const ref = await this.request(`ref/heads/${STATE_BRANCH}`, { missing: true })
    if (ref === null) return null
    try {
      const sha = objectSha(ref.object?.sha)
      const commit = await this.request(`commits/${sha}`)
      const tree = await this.request(`trees/${objectSha(commit.tree?.sha)}`)
      if (tree.truncated) throw new StateError()
      const file = tree.tree.find(item => item.path === FILE && item.type === 'blob' && item.mode === '100644')
      if (!file) throw new StateError()
      const blob = await this.request(`blobs/${objectSha(file.sha)}`)
      if (blob.encoding !== 'base64' || typeof blob.content !== 'string' || blob.size > 5_000_000) throw new StateError()
      const ledger = validateLedger(JSON.parse(Buffer.from(blob.content, 'base64').toString('utf8')))
      return { sha, ledger }
    } catch (error) {
      if (error instanceof StateError) throw error
      throw new StateError()
    }
  }

  async save(snapshot, ledger) {
    validateLedger(ledger)
    if (snapshot) objectSha(snapshot.sha)
    const blob = await this.request('blobs', {
      method: 'POST', body: { content: `${JSON.stringify(ledger, null, 2)}\n`, encoding: 'utf-8' },
    })
    const tree = await this.request('trees', {
      method: 'POST', body: { tree: [{ path: FILE, mode: '100644', type: 'blob', sha: objectSha(blob.sha) }] },
    })
    const commit = await this.request('commits', {
      method: 'POST',
      body: {
        message: 'Update Buffer blog ledger',
        tree: objectSha(tree.sha),
        parents: snapshot ? [snapshot.sha] : [],
      },
    })
    objectSha(commit.sha)
    // Sibling commits cannot fast-forward: only one contender may own an intent.
    if (snapshot) {
      await this.request(`refs/heads/${STATE_BRANCH}`, {
        method: 'PATCH', conflict: true, body: { sha: commit.sha, force: false },
      })
    } else {
      await this.request('refs', {
        method: 'POST', conflict: true, body: { ref: `refs/heads/${STATE_BRANCH}`, sha: commit.sha },
      })
    }
    const confirmed = await this.request(`ref/heads/${STATE_BRANCH}`)
    if (confirmed.object?.sha !== commit.sha) throw new StateError('conflict')
    return { sha: commit.sha, ledger: structuredClone(ledger) }
  }
}
