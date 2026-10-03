import { appendFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { blogPosts, siteUrl } from '../../src/content/siteContent.js'

export function catalog(posts = blogPosts) {
  const slugs = new Set()
  return posts.map(({ slug, title, excerpt }) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slugs.has(slug) ||
        typeof title !== 'string' || typeof excerpt !== 'string') {
      throw new Error('Invalid authoritative blog catalog')
    }
    slugs.add(slug)
    return { slug, title, excerpt, url: `${siteUrl}/blog/${slug}/` }
  })
}

export function summarize(sync, dispatch) {
  const statuses = ['pending', 'publishing', 'posted', 'retry', 'blocked', 'ambiguous', 'cancelled']
  const posts = Array.isArray(dispatch.posts) ? dispatch.posts : []
  const counts = statuses.map(status => [status, posts.filter(post => post.status === status).length])
    .filter(([, count]) => count).map(([status, count]) => `${status}: ${count}`).join(', ')
  const queued = Number.isSafeInteger(sync.queued) && sync.queued >= 0 ? sync.queued : 0
  const cooldown = typeof dispatch.rateLimitedUntil === 'string' && Number.isFinite(Date.parse(dispatch.rateLimitedUntil))
    ? `; rate-limit cooldown until ${new Date(dispatch.rateLimitedUntil).toISOString()}` : ''
  return `LinkedIn: ${sync.baselineApplied === true ? 'baseline initialized (no old posts queued)' : 'catalog reconciled'}; newly queued: ${queued}; ${dispatch.dryRun === true ? 'dry-run preview' : 'dispatch'} rows: ${posts.length}${counts ? ` (${counts})` : ''}${cooldown}.\n`
}

export async function run(env = process.env, fetcher = fetch) {
  const backend = new URL(env.LINKEDIN_BACKEND_URL)
  if (backend.protocol !== 'https:' || backend.username || backend.password ||
      backend.search || backend.hash || backend.pathname !== '/') {
    throw new Error('LINKEDIN_BACKEND_URL must be an HTTPS origin')
  }
  if (!env.LINKEDIN_AUTOMATION_SECRET) throw new Error('Automation secret is missing')
  async function request(path, data) {
    const response = await fetcher(new URL(path, backend), {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(180000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: ['Bearer', env.LINKEDIN_AUTOMATION_SECRET].join(' '),
      },
      body: JSON.stringify(data),
    })
    // Do not log response bodies, captions, credentials, or upstream errors.
    if (!response.ok) throw new Error(`Backend ${path} returned HTTP ${response.status}`)
    return response.json()
  }
  const sync = await request('/api/automation/sync', { blogs: catalog() })
  const dispatch = await request('/api/automation/dispatch', {})
  const summary = summarize(sync, dispatch)
  console.log(summary.trim())
  if (env.GITHUB_STEP_SUMMARY) await appendFile(env.GITHUB_STEP_SUMMARY, summary)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch(error => {
    if (/^Backend \/api\/automation\/(?:sync|dispatch) returned HTTP \d{3}$/.test(error.message)) {
      console.error(error.message)
    }
    console.error('LinkedIn automation failed. Check backend configuration and queue status; credentials and response bodies withheld.')
    process.exitCode = 1
  })
}
