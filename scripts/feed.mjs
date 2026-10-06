import { readFileSync } from 'node:fs'
import { blogPosts, getPostPath, siteName } from '../src/content/siteContent.js'

function escapeXml(value) {
  const text = String(value)
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|\p{Surrogate}/u.test(text)) {
    throw new Error('Feed text contains characters forbidden in XML 1.0')
  }
  return text.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[character])
}

function publicationDate(post) {
  const value = post.datePublished
  const date = new Date(`${value}T00:00:00Z`)
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)
      || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid datePublished for blog post "${post.slug}": ${value}; expected a valid YYYY-MM-DD date`)
  }
  return date
}

export function generateFeed(posts, origin) {
  const channelUrl = new URL('/blog/', origin).href
  const feedUrl = new URL('/feed.xml', origin).href
  const items = posts.map((post) => ({ post, date: publicationDate(post) }))
    .sort((left, right) => right.date - left.date)
    .map(({ post, date }) => {
      const url = escapeXml(new URL(getPostPath(post.slug), origin).href)
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date.toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt || post.summary || '')}</description>${post.author ? `
      <dc:creator>${escapeXml(post.author)}</dc:creator>` : ''}
    </item>`
    }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteName)} Blog</title>
    <description>Public health, clinical research and statistical consulting articles from ${escapeXml(siteName)}.</description>
    <link>${escapeXml(channelUrl)}</link>
    <language>en-ZA</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`
}

export function rssFeedPlugin() {
  return {
    name: 'blog-rss-feed',
    apply: 'build',
    generateBundle() {
      const domain = readFileSync(new URL('../CNAME', import.meta.url), 'utf8').trim()
      this.emitFile({
        type: 'asset',
        fileName: 'feed.xml',
        source: generateFeed(blogPosts, `https://${domain}`),
      })
    },
  }
}
