import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { generateFeed } from './feed.mjs'
import { blogPosts, defaultAuthor, getPageMeta, getPostPath, siteUrl } from '../src/content/siteContent.js'

const origin = 'https://bluetickhealth.co.za'
const root = fileURLToPath(new URL('../', import.meta.url))
const post = {
  slug: 'example-post',
  title: 'Example post',
  datePublished: '2026-08-31',
  author: 'Editorial team',
  excerpt: 'Example excerpt',
}

const approvedPosts = [
  ['missing-data-handling-health-research', 'Missing Data Handling in Health Research: Practical Strategies and Pitfalls'],
  ['data-visualization-health-decision-making', 'Data Visualization for Health Decision-Making'],
  ['health-equity-analysis-health-outcomes', 'Health Equity Analysis: Measuring and Interpreting Inequality in Health Outcomes'],
]

test('approved articles have unique identities, complete content, and existing article metadata', () => {
  assert.equal(new Set(blogPosts.map((entry) => entry.slug)).size, blogPosts.length)
  assert.equal(new Set(blogPosts.map((entry) => entry.title)).size, blogPosts.length)
  for (const [slug, title] of approvedPosts) {
    const article = blogPosts.find((entry) => entry.slug === slug)
    assert.ok(article, `Missing approved article: ${slug}`)
    assert.equal(article.title, title)
    assert.deepEqual(Object.keys(article).sort(), Object.keys(blogPosts[0]).sort())
    assert.equal(article.author, defaultAuthor)
    for (const field of ['excerpt', 'summary', 'codeLanguage', 'code', 'codeOutput', 'codeInterpretation']) {
      assert.ok(typeof article[field] === 'string' && article[field].trim(), `Missing ${field}: ${slug}`)
    }
    for (const field of ['keywords', 'paragraphs']) {
      assert.ok(Array.isArray(article[field]) && article[field].length > 0)
      assert.ok(article[field].every((value) => typeof value === 'string' && value.trim()))
    }
    const path = getPostPath(slug)
    assert.equal(path, `/blog/${slug}/`)
    const meta = getPageMeta(path)
    assert.equal(meta.type, 'article')
    assert.equal(meta.article, article)
    assert.equal(meta.title, `${title} | Bluetick Health Blog`)
    assert.equal(meta.description, article.summary)
    assert.equal(meta.keywords, article.keywords.join(', '))
    assert.equal(meta.structuredData.headline, title)
    assert.equal(meta.structuredData.datePublished, article.datePublished)
    assert.equal(meta.structuredData.mainEntityOfPage, `${siteUrl}${path}`)
  }
})

test('approved articles use the existing static page shell with matching share metadata', () => {
  const template = readFileSync(new URL('../blog/redcap-implementation-guide/index.html', import.meta.url), 'utf8')
  const shell = (html) => html.replace(/    <title>.*<\/title>\n/g, '')
    .replace(/    <meta (?:name|property)="(?:title|description|keywords|og:url|og:title|og:description|twitter:url|twitter:title|twitter:description)"[^\n]*\n/g, '')
    .replace(/    <link rel="canonical"[^\n]*\n/g, '').trim()
  for (const [slug] of approvedPosts) {
    const article = blogPosts.find((entry) => entry.slug === slug)
    const meta = getPageMeta(getPostPath(slug))
    const html = readFileSync(new URL(`../blog/${slug}/index.html`, import.meta.url), 'utf8')
    assert.equal(shell(html), shell(template))
    assert.ok(html.includes(`<title>${meta.title}</title>`))
    for (const attribute of ['name="title"', 'property="og:title"', 'name="twitter:title"']) {
      assert.ok(html.includes(`<meta ${attribute} content="${meta.title}" />`))
    }
    for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
      assert.ok(html.includes(`<meta ${attribute} content="${article.summary}" />`))
    }
    assert.ok(html.includes(`<meta name="keywords" content="${meta.keywords}" />`))
    for (const attribute of ['property="og:url"', 'name="twitter:url"']) {
      assert.ok(html.includes(`<meta ${attribute} content="${siteUrl}${getPostPath(slug)}" />`))
    }
    assert.ok(html.includes(`<link rel="canonical" href="${siteUrl}${getPostPath(slug)}" />`))
  }
})

test('serializes a complete UTF-8 RSS document with escaped XML and namespaced attribution', () => {
  const special = `Health & <research> "quotes" 'apostrophes' — café 🩺`
  const escaped = 'Health &amp; &lt;research&gt; &quot;quotes&quot; &apos;apostrophes&apos; — café 🩺'
  assert.equal(generateFeed([{ ...post, title: special, excerpt: special, author: special }], origin),
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Bluetick Health Blog</title>
    <description>Public health, clinical research and statistical consulting articles from Bluetick Health.</description>
    <link>https://bluetickhealth.co.za/blog/</link>
    <language>en-ZA</language>
    <atom:link href="https://bluetickhealth.co.za/feed.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>${escaped}</title>
      <link>https://bluetickhealth.co.za/blog/example-post/</link>
      <guid isPermaLink="true">https://bluetickhealth.co.za/blog/example-post/</guid>
      <pubDate>Mon, 31 Aug 2026 00:00:00 GMT</pubDate>
      <description>${escaped}</description>
      <dc:creator>${escaped}</dc:creator>
    </item>
  </channel>
</rss>
`)
})

test('falls back to summary and omits RSS author fields that require email', () => {
  const xml = generateFeed([{ ...post, excerpt: '', summary: 'Summary & details', author: undefined }], origin)
  assert.match(xml, /<description>Summary &amp; details<\/description>/)
  assert.doesNotMatch(xml, /<author>|<dc:creator>/)
  assert.doesNotMatch(generateFeed([post], origin), /<author>/)
  assert.match(generateFeed([], origin), /<channel>[\s\S]*<\/channel>/)
})

test('rejects invalid dates clearly, including calendar rollovers', () => {
  for (const datePublished of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-00-01',
    '2026-08-00', 'not-a-date', '2026-8-1', '2026-08-31T12:00:00Z', '', null, undefined]) {
    assert.throws(() => generateFeed([{ ...post, datePublished }], origin),
      /Invalid datePublished for blog post "example-post".*expected a valid YYYY-MM-DD date/)
  }
  assert.match(generateFeed([{ ...post, datePublished: '2024-02-29' }], origin),
    /<pubDate>Thu, 29 Feb 2024 00:00:00 GMT<\/pubDate>/)
})

test('rejects text that cannot be represented in XML 1.0', () => {
  for (const title of ['Invalid\u0000text', 'Invalid\u000Btext', '\uD800', '\uFFFE']) {
    assert.throws(() => generateFeed([{ ...post, title }], origin), /forbidden in XML 1.0/)
  }
})

test('orders newest first without mutating posts and keeps ties stable', () => {
  const posts = Object.freeze([
    Object.freeze({ ...post, slug: 'old', title: 'Old', datePublished: '2024-01-01' }),
    Object.freeze({ ...post, slug: 'new', title: 'New', datePublished: '2026-01-01' }),
    Object.freeze({ ...post, slug: 'same-date', title: 'Same date', datePublished: '2026-01-01' }),
  ])
  const xml = generateFeed(posts, origin)
  assert.deepEqual([...xml.matchAll(/<item>\s*<title>(.*?)<\/title>/g)].map((match) => match[1]),
    ['New', 'Same date', 'Old'])
  assert.deepEqual(posts.map((entry) => entry.slug), ['old', 'new', 'same-date'])
})

test('includes already-visible future-dated content with deterministic dates and URL GUIDs', () => {
  const posts = [{ ...post, datePublished: '2099-01-01' }]
  const first = generateFeed(posts, origin)
  assert.equal(generateFeed(posts, origin), first)
  assert.match(first, /<pubDate>Thu, 01 Jan 2099 00:00:00 GMT<\/pubDate>/)
  const guid = first.match(/<guid isPermaLink="true">(.*?)<\/guid>/)[1]
  assert.equal(guid, `${origin}${getPostPath(post.slug)}`)
  const edited = generateFeed([{ ...posts[0], title: 'Edited title', excerpt: 'Edited excerpt' }], origin)
  assert.ok(edited.includes(`<guid isPermaLink="true">${guid}</guid>`))
  assert.equal(edited.match(/<pubDate>(.*?)<\/pubDate>/)[1], first.match(/<pubDate>(.*?)<\/pubDate>/)[1])
  assert.notEqual(edited, first)
})

test('normal production build regenerates root feed with all deployed article URLs', () => {
  const feedPath = new URL('../dist/feed.xml', import.meta.url)
  mkdirSync(new URL('../dist/', import.meta.url), { recursive: true })
  writeFileSync(feedPath, 'stale feed')
  execFileSync('npm', ['run', 'build'], { cwd: root, encoding: 'utf8' })
  const bytes = readFileSync(feedPath)
  const xml = bytes.toString('utf8')
  assert.deepEqual(Buffer.from(xml, 'utf8'), bytes)
  const domain = readFileSync(new URL('../CNAME', import.meta.url), 'utf8').trim()
  assert.equal(domain, 'bluetickhealth.co.za')
  assert.equal(xml, generateFeed(blogPosts, `https://${domain}`))
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1])
  assert.equal(items.length, blogPosts.length)
  const dates = items.map((item) => Date.parse(item.match(/<pubDate>(.*?)<\/pubDate>/)[1]))
  assert.deepEqual(dates, [...dates].sort((left, right) => right - left))
  for (const item of items) {
    const link = item.match(/<link>(.*?)<\/link>/)[1]
    const guid = item.match(/<guid isPermaLink="true">(.*?)<\/guid>/)[1]
    assert.equal(new URL(link).origin, origin)
    assert.equal(guid, link)
    const htmlPath = new URL(`../dist${new URL(link).pathname}index.html`, import.meta.url)
    assert.ok(existsSync(htmlPath), `Missing built article for ${link}`)
    assert.doesNotMatch(readFileSync(htmlPath, 'utf8'), /feed\.xml|application\/rss\+xml/)
  }
})
