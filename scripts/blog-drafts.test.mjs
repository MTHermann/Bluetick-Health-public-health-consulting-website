import test from 'node:test'
import assert from 'node:assert/strict'
import { blogDrafts } from '../src/content/blogDrafts.js'
import { blogPosts, getPageMeta, getPostPath } from '../src/content/siteContent.js'
import { generateFeed } from './feed.mjs'

test('review queue contains unpublished posts in the existing content format', () => {
  for (const { status, post } of blogDrafts) {
    assert.equal(status, 'pending-approval')
    assert.equal(post.datePublished, null)
    assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    for (const field of ['title', 'author', 'excerpt', 'summary']) {
      assert.equal(typeof post[field], 'string')
      assert.ok(post[field].trim(), `Missing ${field} for ${post.slug}`)
    }
    for (const field of ['keywords', 'paragraphs']) {
      assert.ok(Array.isArray(post[field]) && post[field].length > 0)
      assert.ok(post[field].every((value) => typeof value === 'string' && value.trim()))
    }
  }
})

test('published posts and the review queue have unique slugs and normalised titles', () => {
  const posts = [...blogPosts, ...blogDrafts.map(({ post }) => post)]
  for (const field of ['slug', 'title']) {
    const values = posts.map((post) => post[field].trim().replace(/\s+/g, ' ').toLowerCase())
    assert.equal(new Set(values).size, values.length, `Duplicate ${field}`)
  }
})

test('drafts are unavailable to public article lookup, metadata, and the feed', () => {
  const feed = generateFeed(blogPosts, 'https://bluetickhealth.co.za')
  for (const { post } of blogDrafts) {
    assert.equal(blogPosts.find((entry) => entry.slug === post.slug), undefined)
    assert.deepEqual(getPageMeta(getPostPath(post.slug)), getPageMeta('/'))
    assert.ok(!feed.includes(post.slug))
    assert.ok(!feed.includes(post.title))
  }
  for (const post of blogPosts) {
    const meta = getPageMeta(getPostPath(post.slug))
    assert.equal(meta.type, 'article')
    assert.equal(meta.article, post)
    assert.equal(meta.structuredData.datePublished, post.datePublished)
  }
})
