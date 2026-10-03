import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorker } from '../worker.mjs';
import { D1 } from './d1.mjs';

const NOW = Date.parse('2026-10-03T12:00:00Z');
const ORIGIN = 'https://scheduler.example.test';
const SITE = 'https://bluetick-health.co.za';
const TEAM = 'test-team.cloudflareaccess.com';
const AUDIENCE = 'configured-access-audience';
const AUTOMATION_SECRET = 'test-only-automation-value-'.repeat(3);
const keys = await crypto.subtle.generateKey({
  name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256',
}, true, ['sign', 'verify']);
const publicKey = { ...await crypto.subtle.exportKey('jwk', keys.publicKey),
  kid: 'test-key', use: 'sig', alg: 'RS256' };

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

async function jwt(claims = {}, header = {}) {
  const first = encode({ alg: 'RS256', kid: 'test-key', ...header });
  const second = encode({ iss: `https://${TEAM}`, aud: AUDIENCE,
    exp: NOW / 1000 + 86400, nbf: NOW / 1000 - 1,
    email: 'admin@example.test', ...claims });
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey,
    new TextEncoder().encode(`${first}.${second}`));
  return `${first}.${second}.${Buffer.from(signature).toString('base64url')}`;
}

const ADMIN_JWT = await jwt();

function blog(id = 'first-blog', changes = {}) {
  return { slug: id, title: `Title ${id}`, url: `${SITE}/blog/${id}/`,
    excerpt: `Excerpt ${id}`, ...changes };
}

function fixture(t, overrides = {}) {
  const db = new D1();
  t.after(() => db.close());
  const outgoing = [];
  const logs = [];
  let time = NOW;
  let canonical = null;
  let jwks = () => new Response(JSON.stringify({ keys: [publicKey] }));
  let linkedin = () => new Response(null, {
    status: 201, headers: { 'x-restli-id': 'urn:li:share:12345' },
  });
  const env = {
    DB: db,
    ASSETS: { async fetch(request) {
      outgoing.push({ asset: request.url });
      return new Response('<html><script src="app.js"></script></html>', {
        headers: { 'Content-Type': 'text/html' },
      });
    } },
    ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUDIENCE,
    ADMIN_EMAILS: 'admin@example.test,second@example.test',
    AUTOMATION_SECRET,
    LINKEDIN_ACCESS_TOKEN: 'test-only-token',
    LINKEDIN_TOKEN_EXPIRES_AT: '2026-12-01T00:00:00Z',
    LINKEDIN_VERSION: '202610',
    LINKEDIN_ORGANIZATION_URN: 'urn:li:organization:12345',
    ...overrides,
  };
  const dependencies = {
    now: () => time,
    log: event => logs.push(event),
    fetch: async (url, options) => {
      outgoing.push({ url, options });
      assert.equal(options.redirect, 'error');
      if (url === `https://${TEAM}/cdn-cgi/access/certs`) {
        return jwks(url, options);
      }
      if (url === 'https://api.linkedin.com/rest/posts') return linkedin(url, options);
      assert.match(url, /^https:\/\/bluetick-health\.co\.za\/blog\/[a-z0-9-]+\/$/);
      return canonical ? canonical(url, options) :
        new Response(`<html><head><link rel="canonical" href="${url}"></head></html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    },
  };
  const worker = createWorker(dependencies);
  async function call(path, { method = 'POST', input = {}, headers = {},
    admin = path.startsWith('/api/admin/') || path.startsWith('/admin/'),
    credentials = true, rawBody, handler = worker } = {}) {
    const defaults = {};
    if (credentials) {
      if (admin) defaults['Cf-Access-Jwt-Assertion'] = ADMIN_JWT;
      else defaults.Authorization = ['Bearer', AUTOMATION_SECRET].join(' ');
    }
    if (!['GET', 'HEAD'].includes(method)) {
      defaults['Content-Type'] = 'application/json';
      if (admin) {
        defaults.Origin = ORIGIN;
        defaults['X-Admin-Request'] = '1';
      }
    }
    const all = new Headers(defaults);
    for (const [name, value] of Object.entries(headers)) {
      if (value === null) all.delete(name);
      else all.set(name, value);
    }
    return handler.fetch(new Request(`${ORIGIN}${path}`, {
      method, headers: all,
      ...(!['GET', 'HEAD'].includes(method) ? { body: rawBody ?? JSON.stringify(input) } : {}),
    }), env);
  }
  async function invoke(path, options, expected = 200) {
    const response = await call(path, options);
    const result = await response.json();
    assert.equal(response.status, expected, JSON.stringify(result));
    return result;
  }
  return {
    db, env, outgoing, logs, worker, call, invoke,
    currentTime() { return time; },
    newWorker() { return createWorker(dependencies); },
    setTime(value) { time = value; },
    setJwks(value) { jwks = value; },
    setCanonical(value) { canonical = value; },
    setLinkedin(value) { linkedin = value; },
    async sync(blogs, baseline) {
      return invoke('/api/automation/sync', { input: { blogs, ...(baseline === undefined ? {} : { baseline }) } });
    },
    async schedule(id, dueAt = new Date(time + 1).toISOString(), caption = 'A useful caption') {
      const result = await invoke('/api/admin/schedule', { input: { slug: id, caption, dueAt } }, 201);
      time += 1;
      return result;
    },
    async dispatch(expected = 200) {
      return invoke('/api/automation/dispatch', {}, expected);
    },
  };
}

test('Access RSA signature, fixed issuer/JWKS, audience, exp, nbf and explicit allowlist', async t => {
  const cases = [
    ['valid', {}, {}, 200],
    ['audience list', { aud: ['other', AUDIENCE] }, {}, 200],
    ['unlisted admin', { email: 'other@example.test' }, {}, 403],
    ['missing email', { email: null }, {}, 403],
    ['wrong issuer', { iss: 'https://attacker.example.test' }, {}, 401],
    ['wrong audience', { aud: 'wrong' }, {}, 401],
    ['expired', { exp: NOW / 1000 }, {}, 401],
    ['missing expiry', { exp: null }, {}, 401],
    ['future nbf', { nbf: NOW / 1000 + 1 }, {}, 401],
    ['malformed nbf', { nbf: '0' }, {}, 401],
    ['wrong algorithm', {}, { alg: 'HS256' }, 401],
    ['unknown key', {}, { kid: 'unknown-key' }, 401],
    ['unsupported critical header', {}, { crit: ['custom'] }, 401],
  ];
  for (const [name, claims, header, expected] of cases) {
    await t.test(name, async sub => {
      const f = fixture(sub);
      await f.invoke('/api/admin/state', {
        method: 'GET', headers: { 'Cf-Access-Jwt-Assertion': await jwt(claims, header) },
      }, expected);
      assert.ok(f.outgoing.every(call => call.url === `https://${TEAM}/cdn-cgi/access/certs`));
    });
  }
});

test('signature tampering, malformed JWT and unconfigured authentication fail closed', async t => {
  const f = fixture(t);
  const parts = ADMIN_JWT.split('.');
  const forged = `${parts[0]}.${encode({ email: 'admin@example.test', iss: `https://${TEAM}`,
    aud: AUDIENCE, exp: NOW / 1000 + 100 })}.${parts[2]}`;
  for (const token of [forged, 'x.y.z', 'not-a-jwt', `${ADMIN_JWT}.extra`]) {
    await f.invoke('/api/admin/state', {
      method: 'GET', headers: { 'Cf-Access-Jwt-Assertion': token },
    }, 401);
  }
  for (const [name, value] of [['ADMIN_EMAILS', ''], ['ADMIN_EMAILS', '*'],
    ['ACCESS_AUD', ''], ['ACCESS_TEAM_DOMAIN', 'https://attacker.test']]) {
    const original = f.env[name];
    f.env[name] = value;
    await f.invoke('/api/admin/state', { method: 'GET' }, 503);
    f.env[name] = original;
  }
  await f.invoke('/api/admin/state', { method: 'GET', credentials: false }, 401);
  assert.equal(f.outgoing.length, 1, 'JWKS is cached and token claims never select a fetch origin');
});

test('unavailable, malformed or conflicting JWKS fail closed; cache expiry refreshes pinned keys', async t => {
  for (const response of [
    () => new Response('unavailable', { status: 503 }),
    () => new Response('not-json'),
    () => new Response(JSON.stringify({ keys: [publicKey, publicKey] })),
    () => { throw new TypeError('private-network-detail'); },
  ]) {
    await t.test('invalid JWKS', async sub => {
      const f = fixture(sub);
      f.setJwks(response);
      await f.invoke('/api/admin/state', { method: 'GET' }, 401);
      assert.equal(JSON.stringify(f.logs).includes('private-network-detail'), false);
    });
  }
  const f = fixture(t);
  await f.invoke('/api/admin/state', { method: 'GET' });
  f.setJwks(() => new Response('offline', { status: 503 }));
  await f.invoke('/api/admin/state', { method: 'GET' });
  f.setTime(NOW + 5 * 60 * 1000);
  await f.invoke('/api/admin/state', { method: 'GET' }, 401);
  assert.equal(f.outgoing.length, 2);
});

test('browser cookie protects same-origin assets; ambiguous credentials and roles are rejected', async t => {
  const f = fixture(t);
  const response = await f.call('/admin/linkedin/', {
    method: 'GET', credentials: false, headers: { Cookie: `CF_Authorization=${ADMIN_JWT}` },
  });
  assert.equal(response.status, 200);
  assert.equal(f.outgoing.at(-1).asset, `${ORIGIN}/admin/linkedin/`);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
  assert.equal((await f.call('/admin/linkedin/admin.js', { method: 'GET' })).status, 200);
  assert.equal(f.outgoing.at(-1).asset, `${ORIGIN}/admin/linkedin/admin.js`);
  const redirect = await f.call('/admin/linkedin', { method: 'GET' });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('Location'), '/admin/linkedin/');
  assert.equal((await f.call('/admin/linkedin/', { method: 'GET', credentials: false })).status, 401);
  await f.invoke('/api/admin/state', { method: 'GET', headers: { Cookie: 'CF_Authorization=other' } }, 401);
  await f.invoke('/api/admin/state', { method: 'GET',
    headers: { Cookie: `CF_Authorization=${ADMIN_JWT}; CF_Authorization=${ADMIN_JWT}` } }, 401);
  await f.invoke('/api/admin/state', { method: 'GET',
    headers: { Authorization: ['Bearer', AUTOMATION_SECRET].join(' ') } }, 401);
  await f.invoke('/api/automation/sync', { input: { blogs: [] },
    headers: { 'Cf-Access-Jwt-Assertion': ADMIN_JWT } }, 401);
  await f.invoke('/api/automation/sync', { input: { blogs: [] },
    credentials: false, headers: { 'Cf-Access-Jwt-Assertion': ADMIN_JWT } }, 401);
  await f.invoke('/api/automation/sync', { input: { blogs: [] },
    headers: { Authorization: '******' } }, 401);
  f.env.AUTOMATION_SECRET = '';
  await f.invoke('/api/automation/dispatch', {}, 503);
});

test('every asset URL is authenticated and alternate paths cannot bypass the Worker', async t => {
  const f = fixture(t);
  for (const path of ['/admin/linkedin', '/admin/linkedin/', '/admin/linkedin/index.html',
    '/admin/linkedin/admin.js', '/admin/linkedin/admin.css']) {
    const response = await f.call(path, { method: 'GET', credentials: false });
    assert.equal(response.status, 401);
  }
  for (const path of ['/', '/index.html', '/admin.js', '/admin.css',
    '/admin/linkedin/../index.html', '/admin/linkedin/%2e%2e/index.html']) {
    const response = await f.call(path, { method: 'GET', credentials: false });
    assert.equal(response.status, 404);
  }
  assert.equal(f.outgoing.length, 0, 'no unauthorized request reaches the asset binding');
  const token = await jwt({ email: 'not-an-admin@example.test' });
  const denied = await f.call('/admin/linkedin/', {
    method: 'GET', headers: { 'Cf-Access-Jwt-Assertion': token },
  });
  assert.equal(denied.status, 403);
  assert.equal(f.outgoing.filter(call => call.asset).length, 0);
});

test('admin mutations enforce exact Origin, custom header and bounded JSON; no CORS', async t => {
  const f = fixture(t);
  await f.sync([blog()]);
  const input = { slug: 'first-blog', caption: 'Caption', dueAt: new Date(NOW).toISOString() };
  for (const headers of [{ Origin: null }, { Origin: `${ORIGIN}.evil.test` },
    { Origin: `${ORIGIN}/` }, { 'X-Admin-Request': null }, { 'X-Admin-Request': '0' }]) {
    await f.invoke('/api/admin/schedule', { input, headers }, 403);
  }
  await f.invoke('/api/admin/schedule', { input, headers: { 'Content-Type': 'text/plain' } }, 415);
  await f.invoke('/api/admin/schedule', { rawBody: '{' }, 400);
  await f.invoke('/api/admin/schedule', { input: { ...input, caption: 'x'.repeat(3001) } }, 400);
  await f.invoke('/api/admin/schedule', { input: { ...input, dueAt: '2026-02-30T00:00:00Z' } }, 400);
  await f.invoke('/api/admin/schedule', { input: { ...input, dueAt: '2026-10-03T12:00:00+00:00' } }, 400);
  await f.invoke('/api/admin/schedule', { input: { ...input, unexpected: true } }, 400);
  await f.invoke('/api/admin/schedule', { rawBody: ' '.repeat(256 * 1024 + 1) }, 413);
  await f.invoke('/api/admin/schedule', { input, headers: { 'Content-Length': '9999999' } }, 413);
  const preflight = await f.call('/api/admin/schedule', { method: 'OPTIONS' });
  assert.equal(preflight.status, 405);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(f.db.row('first-blog'), undefined);
});

test('first catalog snapshot always baselines, later slugs queue once only with opt-in', async t => {
  const f = fixture(t, { AUTO_SCHEDULE: 'true' });
  assert.deepEqual(await f.sync([blog()]), {
    initialized: true, baselineApplied: true, queued: 0, automaticScheduling: true,
  });
  assert.equal(f.db.row('first-blog'), undefined);
  assert.equal((await f.sync([blog(), blog('second-blog')])).queued, 1);
  assert.equal(f.db.row('second-blog').status, 'pending');
  const repeated = await f.sync([blog('second-blog', { title: 'Edited title' })], true);
  assert.equal(repeated.baselineApplied, false);
  assert.equal(repeated.queued, 0);
  const state = await f.invoke('/api/admin/state', { method: 'GET' });
  assert.equal(state.blogs.length, 1, 'authoritative active catalog follows the snapshot');
  assert.equal(state.blogs[0].title, 'Edited title');
  assert.match(f.db.row('second-blog').caption, /^Title second-blog/);
  await f.invoke('/api/admin/posts/second-blog', { method: 'DELETE' });
  await f.sync([blog('second-blog')]);
  assert.equal(f.db.row('second-blog').status, 'cancelled');
  await f.sync([blog()]);
  await f.schedule('first-blog');
  await f.sync([blog(), blog('second-blog')]);
  assert.equal(f.db.sqlite.prepare('SELECT count(*) AS n FROM posts').get().n, 2);
});

test('automatic scheduling defaults off and seen edits cannot later backfill old blogs', async t => {
  const f = fixture(t);
  await f.sync([blog()], true);
  assert.equal((await f.sync([blog(), blog('new-blog')])).queued, 0);
  f.env.AUTO_SCHEDULE = 'true';
  assert.equal((await f.sync([blog(), blog('new-blog')])).queued, 0);
  assert.equal((await f.sync([blog(), blog('new-blog'), blog('really-new-blog')])).queued, 1);
  await f.schedule('new-blog');
  assert.equal(f.db.row('new-blog').status, 'pending');
});

test('catalog rejects arbitrary hosts, paths, duplicates and unsafe input without partial writes', async t => {
  const f = fixture(t, { AUTO_SCHEDULE: 'true' });
  const invalid = [
    [blog('first-blog', { url: 'https://attacker.test/blog/first-blog/' })],
    [blog('first-blog', { url: `${SITE}/blog/first-blog/?redirect=1` })],
    [blog('first-blog', { url: `${SITE}/blog/first-blog` })],
    [blog('../outside')], [blog('UPPERCASE')],
    [blog(), blog()], [blog('first-blog', { title: '' })],
    [blog('first-blog', { excerpt: 'x'.repeat(2001) })],
  ];
  for (const blogs of invalid) await f.invoke('/api/automation/sync', { input: { blogs } }, 400);
  assert.equal(f.db.sqlite.prepare('SELECT count(*) AS n FROM blogs').get().n, 0);
  assert.equal(f.db.sqlite.prepare('SELECT count(*) AS n FROM metadata').get().n, 0);
  assert.equal(f.outgoing.length, 0);
});

test('concurrent first syncs have exactly one baseline and deduplicate new slugs atomically', async t => {
  const f = fixture(t, { AUTO_SCHEDULE: 'true' });
  const first = await Promise.all([f.sync([blog()], true),
    f.invoke('/api/automation/sync', { input: { blogs: [blog()], baseline: true }, handler: f.newWorker() })]);
  assert.equal(first.filter(result => result.baselineApplied).length, 1);
  assert.equal(first.reduce((sum, result) => sum + result.queued, 0), 0);
  const next = await Promise.all([
    f.sync([blog(), blog('second-blog')]), f.sync([blog(), blog('second-blog')]),
  ]);
  assert.equal(next.reduce((sum, result) => sum + result.queued, 0), 1);
  assert.equal(f.db.sqlite.prepare('SELECT count(*) AS n FROM seen_slugs').get().n, 2);
});

test('D1 sync transaction rolls back catalog, seen and queue together on storage failure', async t => {
  const f = fixture(t, { AUTO_SCHEDULE: 'true' });
  await f.sync([blog()]);
  f.db.sqlite.exec(`CREATE TRIGGER reject_second_blog BEFORE INSERT ON seen_slugs
    WHEN NEW.slug = 'second-blog' BEGIN SELECT RAISE(ABORT, 'test-storage-failure'); END`);
  await f.invoke('/api/automation/sync', { input: { blogs: [blog('second-blog')] } }, 500);
  assert.equal(f.db.row('second-blog'), undefined);
  assert.equal(f.db.sqlite.prepare('SELECT active FROM blogs WHERE slug = ?').get('first-blog').active, 1);
  assert.equal(f.db.sqlite.prepare('SELECT count(*) AS n FROM blogs').get().n, 1);
  assert.equal(f.db.sqlite.prepare('SELECT count(*) AS n FROM seen_slugs').get().n, 1);
  assert.deepEqual(f.logs.at(-1), { event: 'worker_internal_error' });
});

test('queue schedule/edit/cancel are guarded, unique and preserve normalized UTC due time', async t => {
  const f = fixture(t);
  await f.sync([blog(), blog('second-blog')]);
  const scheduled = await f.schedule('first-blog', '2026-10-04T10:30:00.1Z', 'Original');
  assert.equal(scheduled.post.dueAt, '2026-10-04T10:30:00.100Z');
  await f.invoke('/api/admin/schedule', { input: {
    slug: 'first-blog', caption: 'Duplicate', dueAt: new Date(NOW + 1000).toISOString(),
  } }, 409);
  await f.invoke('/api/admin/schedule', { input: {
    slug: 'unknown-blog', caption: 'Unknown', dueAt: new Date(NOW + 1000).toISOString(),
  } }, 409);
  const edited = await f.invoke('/api/admin/posts/first-blog', { method: 'PATCH',
    input: { caption: 'Updated', dueAt: '2026-10-05T00:00:00Z' } });
  assert.equal(edited.post.caption, 'Updated');
  assert.equal(f.db.row('first-blog').due_at, '2026-10-05T00:00:00.000Z');
  await f.invoke('/api/admin/posts/first-blog', { method: 'DELETE' });
  await f.invoke('/api/admin/posts/first-blog', { method: 'PATCH',
    input: { caption: 'Updated', dueAt: '2026-10-05T00:00:00Z' } }, 409);
  await f.schedule('second-blog');
  f.db.sqlite.prepare("UPDATE posts SET status = 'retry' WHERE slug = ?").run('second-blog');
  await f.invoke('/api/admin/posts/second-blog', { method: 'PATCH',
    input: { caption: 'Retry rescheduled', dueAt: '2026-10-03T12:00:01Z' } });
  assert.equal(f.db.row('second-blog').status, 'pending');
});

test('admin schedule and PATCH reject past/current due times while internal auto-enqueue can be due now', async t => {
  const f = fixture(t, { AUTO_SCHEDULE: 'true' });
  await f.sync([blog()]);
  for (const dueAt of [new Date(NOW - 1).toISOString(), new Date(NOW).toISOString()]) {
    await f.invoke('/api/admin/schedule', { input: {
      slug: 'first-blog', caption: 'Past schedule', dueAt,
    } }, 400);
    assert.equal(f.db.row('first-blog'), undefined);
  }
  await f.schedule('first-blog', new Date(NOW + 5000).toISOString(), 'Future schedule');
  const originalDueAt = f.db.row('first-blog').due_at;
  for (const dueAt of [new Date(NOW - 1).toISOString(), new Date(f.currentTime()).toISOString()]) {
    await f.invoke('/api/admin/posts/first-blog', { method: 'PATCH', input: {
      caption: 'Past edit', dueAt,
    } }, 400);
    assert.equal(f.db.row('first-blog').due_at, originalDueAt);
    assert.equal(f.db.row('first-blog').caption, 'Future schedule');
  }
  await f.sync([blog(), blog('new-blog')]);
  assert.equal(f.db.row('new-blog').due_at, new Date(f.currentTime()).toISOString());
  assert.equal((await f.dispatch()).posts[0].slug, 'new-blog', 'internal sync may queue immediate work');
});

test('dry-run previews only due posts, leaves queue pending and reports no secrets in state', async t => {
  const f = fixture(t);
  await f.sync([blog(), blog('future-blog')]);
  await f.schedule('first-blog');
  await f.schedule('future-blog', '2026-10-04T12:00:00Z');
  const preview = await f.dispatch();
  assert.equal(preview.dryRun, true);
  assert.equal(preview.posts.length, 1);
  assert.equal(preview.posts[0].url, blog().url);
  assert.equal(f.db.row('first-blog').status, 'pending');
  assert.equal(f.db.row('first-blog').claim_id, null);
  assert.equal((await f.dispatch()).posts.length, 1, 'preview does not consume queue');
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 0);
  const state = await f.invoke('/api/admin/state', { method: 'GET' });
  assert.deepEqual(Object.keys(state.configuration).sort(), [
    'autoSchedule', 'organizationConfigured', 'publishingEnabled', 'tokenConfigured', 'tokenExpiresAt', 'versionConfigured',
  ]);
  assert.equal(state.configuration.publishingEnabled, false);
  assert.equal(JSON.stringify(state).includes(f.env.LINKEDIN_ACCESS_TOKEN), false);
  assert.equal(JSON.stringify(state).includes(AUTOMATION_SECRET), false);
});

test('UTC due dates survive a fresh worker and cannot dispatch before the persisted instant', async t => {
  const f = fixture(t);
  await f.sync([blog()]);
  await f.schedule('first-blog', '2026-10-04T12:00:00.250Z');
  assert.equal((await f.invoke('/api/automation/dispatch', { handler: f.newWorker() })).posts.length, 0);
  f.setTime(Date.parse('2026-10-04T12:00:00.249Z'));
  assert.equal((await f.invoke('/api/automation/dispatch', { handler: f.newWorker() })).posts.length, 0);
  f.setTime(Date.parse('2026-10-04T12:00:00.250Z'));
  assert.equal((await f.invoke('/api/automation/dispatch', { handler: f.newWorker() })).posts.length, 1);
});

test('live dispatch validates configuration before claims or external calls', async t => {
  for (const [name, value] of [
    ['LINKEDIN_ACCESS_TOKEN', ''], ['LINKEDIN_ACCESS_TOKEN', 'token\ninvalid'],
    ['LINKEDIN_TOKEN_EXPIRES_AT', '2026-10-03T12:00:00Z'],
    ['LINKEDIN_TOKEN_EXPIRES_AT', 'not-a-date'], ['LINKEDIN_VERSION', '202613'],
    ['LINKEDIN_VERSION', '20261'], ['LINKEDIN_ORGANIZATION_URN', 'urn:li:organization:abc'],
    ['LINKEDIN_ORGANIZATION_URN', 'urn:li:person:12345'],
  ]) {
    await t.test(name + ':' + value, async sub => {
      const f = fixture(sub, { PUBLISH_ENABLED: 'true', [name]: value });
      await f.sync([blog()]);
      await f.schedule('first-blog');
      f.outgoing.length = 0;
      await f.dispatch(503);
      assert.equal(f.db.row('first-blog').status, 'pending');
      assert.equal(f.outgoing.length, 0);
    });
  }
});

test('201 with ID persists posted and uses exact LinkedIn REST article shape/headers', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog(), blog('future-blog')]);
  await f.schedule('first-blog', new Date(NOW + 1).toISOString(), 'User caption');
  await f.schedule('future-blog', '2026-10-04T12:00:00Z');
  const result = await f.dispatch();
  assert.equal(result.dryRun, false);
  assert.equal(result.posts[0].status, 'posted');
  assert.equal(f.db.row('first-blog').linkedin_id, 'urn:li:share:12345');
  assert.equal(f.db.row('first-blog').claim_id, null);
  assert.equal(f.db.row('future-blog').status, 'pending');
  const post = f.outgoing.find(call => call.url === 'https://api.linkedin.com/rest/posts');
  assert.equal(post.options.method, 'POST');
  assert.equal(post.options.headers.Authorization, ['Bearer', f.env.LINKEDIN_ACCESS_TOKEN].join(' '));
  assert.equal(post.options.headers['LinkedIn-Version'], '202610');
  assert.equal(post.options.headers['X-Restli-Protocol-Version'], '2.0.0');
  assert.deepEqual(JSON.parse(post.options.body), {
    author: 'urn:li:organization:12345', commentary: 'User caption', visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    content: { article: { source: blog().url, title: blog().title } },
    lifecycleState: 'PUBLISHED', isReshareDisabledByAuthor: false,
  });
  assert.equal((await f.dispatch()).posts.length, 0);
});

test('an inactive authoritative catalog entry is blocked before any site or LinkedIn request', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog()]);
  await f.schedule('first-blog');
  await f.sync([]);
  f.outgoing.length = 0;
  assert.equal((await f.dispatch()).posts[0].status, 'blocked');
  assert.equal(f.outgoing.length, 0);
});

test('LinkedIn failures persist safe retry/blocked/ambiguous outcomes without remote bodies in logs', async t => {
  const cases = [
    ['429 seconds', 429, { 'Retry-After': '3600' }, 'retry', NOW + 3600 * 1000],
    ['429 HTTP date', 429, { 'Retry-After': 'Sat, 03 Oct 2026 14:00:00 GMT' }, 'retry', NOW + 7200 * 1000],
    ['429 long delay honored', 429, { 'Retry-After': '40000000' }, 'retry', NOW + 40000000 * 1000],
    ['429 fallback', 429, {}, 'retry', NOW + 15 * 60 * 1000],
    ['401 token', 401, {}, 'blocked'],
    ['403 permission', 403, {}, 'blocked'],
    ['400 invalid', 400, {}, 'blocked'],
    ['408 timeout uncertain', 408, {}, 'ambiguous'],
    ['409 conflict uncertain', 409, {}, 'ambiguous'],
    ['500 uncertain', 500, {}, 'ambiguous'],
    ['503 uncertain', 503, {}, 'ambiguous'],
    ['201 missing ID', 201, {}, 'ambiguous'],
    ['201 invalid ID', 201, { 'x-restli-id': 'unsafe-remote-value' }, 'ambiguous'],
    ['200 uncertain', 200, {}, 'ambiguous'],
  ];
  for (const [name, status, headers, outcome, due] of cases) {
    await t.test(name, async sub => {
      const f = fixture(sub, { PUBLISH_ENABLED: 'true' });
      await f.sync([blog()]);
      await f.schedule('first-blog');
      f.setLinkedin(() => new Response('PRIVATE_REMOTE_RESPONSE', { status, headers }));
      const result = await f.dispatch();
      assert.equal(result.posts[0].status, outcome);
      assert.equal(f.db.row('first-blog').status, outcome);
      if (due) assert.equal(f.db.row('first-blog').due_at,
        new Date(name === '429 HTTP date' ? due : due + 1).toISOString());
      assert.equal(JSON.stringify(f.logs).includes('PRIVATE_REMOTE_RESPONSE'), false);
      assert.equal(JSON.stringify(f.logs).includes(f.env.LINKEDIN_ACCESS_TOKEN), false);
      const count = f.outgoing.length;
      const repeated = await f.dispatch(status === 401 ? 503 : 200);
      if (status !== 401) assert.equal(repeated.posts.length, 0);
      assert.equal(f.outgoing.length, count, 'no blind immediate retry');
    });
  }
});

test('429 stops the batch, releases unattempted claims and persists a global cooldown', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog('blog-a'), blog('blog-b'), blog('blog-c')]);
  for (const id of ['blog-a', 'blog-b', 'blog-c']) await f.schedule(id);
  const expectedResume = new Date(f.currentTime() + 3600 * 1000).toISOString();
  f.setLinkedin(() => new Response(null, { status: 429, headers: { 'Retry-After': '3600' } }));
  const first = await f.dispatch();
  assert.equal(first.posts.length, 1);
  assert.equal(first.rateLimitedUntil, expectedResume);
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 1);
  for (const id of ['blog-a', 'blog-b', 'blog-c']) {
    assert.equal(f.db.row(id).status, 'retry');
    assert.equal(f.db.row(id).claim_id, null);
    assert.equal(f.db.row(id).lease_until, null);
    assert.equal(f.db.row(id).due_at, first.rateLimitedUntil);
  }
  await f.sync([blog('blog-a'), blog('blog-b'), blog('blog-c'), blog('blog-d')]);
  await f.schedule('blog-d');
  const count = f.outgoing.length;
  const second = await f.invoke('/api/automation/dispatch', { handler: f.newWorker() });
  assert.equal(second.posts.length, 0);
  assert.equal(second.rateLimitedUntil, first.rateLimitedUntil);
  assert.equal(f.outgoing.length, count);
  assert.equal(f.db.row('blog-d').status, 'pending', 'global cooldown applies even to newly scheduled posts');
  f.setTime(Date.parse(first.rateLimitedUntil));
  f.setLinkedin(() => new Response(null, { status: 201, headers: { 'x-restli-id': 'urn:li:share:12345' } }));
  assert.equal((await f.dispatch()).posts.length, 4);
});

test('Retry-After zero still stops additional posts in the current batch', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog('blog-a'), blog('blog-b')]);
  await f.schedule('blog-a');
  await f.schedule('blog-b');
  f.setLinkedin(() => new Response(null, { status: 429, headers: { 'Retry-After': '0' } }));
  assert.equal((await f.dispatch()).posts.length, 1);
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 1);
  assert.equal(f.db.row('blog-b').status, 'retry');
});

test('concurrent dispatch of two due posts makes one call after 429 and shares cooldown across workers', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog('blog-a'), blog('blog-b')]);
  await f.schedule('blog-a');
  await f.schedule('blog-b');
  f.setLinkedin(() => new Response(null, { status: 429, headers: { 'Retry-After': '120' } }));
  const results = await Promise.all([
    f.dispatch(), f.invoke('/api/automation/dispatch', { handler: f.newWorker() }),
  ]);
  assert.equal(results.reduce((total, result) => total + result.posts.length, 0), 1);
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 1);
  assert.equal(f.db.row('blog-a').status, 'retry');
  assert.equal(f.db.row('blog-b').status, 'retry');
  assert.equal(f.db.row('blog-b').claim_id, null);
  const held = await Promise.all([
    f.dispatch(), f.invoke('/api/automation/dispatch', { handler: f.newWorker() }),
  ]);
  for (const result of held) {
    assert.equal(result.posts.length, 0);
    assert.equal(result.rateLimitedUntil, f.db.row('blog-a').due_at);
  }
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 1);
});

test('cooldown created by another worker during canonical fetch prevents a subsequent LinkedIn POST', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  const ids = ['blog-a', 'blog-b', 'blog-c', 'blog-d', 'blog-e', 'blog-f'];
  await f.sync(ids.map(id => blog(id)));
  for (const id of ids) await f.schedule(id);
  let entered;
  let release;
  const started = new Promise(resolve => { entered = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  f.setCanonical(async url => {
    if (url === blog('blog-a').url) {
      entered();
      await gate;
    }
    return new Response(`<link rel="canonical" href="${url}">`,
      { headers: { 'Content-Type': 'text/html' } });
  });
  f.setLinkedin(() => new Response(null, { status: 429, headers: { 'Retry-After': '60' } }));
  const original = f.dispatch();
  await started;
  const other = await f.invoke('/api/automation/dispatch', { handler: f.newWorker() });
  assert.equal(other.posts[0].slug, 'blog-f');
  assert.equal(other.posts[0].status, 'retry');
  release();
  const resumed = await original;
  assert.equal(resumed.posts[0].slug, 'blog-a');
  assert.equal(resumed.posts[0].status, 'retry');
  assert.equal(resumed.rateLimitedUntil, other.rateLimitedUntil);
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 1);
  for (const id of ids) {
    assert.equal(f.db.row(id).status, 'retry');
    assert.equal(f.db.row(id).claim_id, null);
    assert.equal(f.db.row(id).due_at, other.rateLimitedUntil);
  }
});

test('token rejection by another worker during canonical fetch prevents use of the same token', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  const ids = ['blog-a', 'blog-b', 'blog-c', 'blog-d', 'blog-e', 'blog-f'];
  await f.sync(ids.map(id => blog(id)));
  for (const id of ids) await f.schedule(id);
  let entered;
  let release;
  const started = new Promise(resolve => { entered = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  f.setCanonical(async url => {
    if (url === blog('blog-a').url) {
      entered();
      await gate;
    }
    return new Response(`<link rel="canonical" href="${url}">`,
      { headers: { 'Content-Type': 'text/html' } });
  });
  f.setLinkedin(() => new Response(null, { status: 401 }));
  const original = f.dispatch();
  await started;
  const other = await f.invoke('/api/automation/dispatch', { handler: f.newWorker() });
  assert.equal(other.posts[0].slug, 'blog-f');
  release();
  const resumed = await original;
  assert.equal(resumed.posts[0].status, 'blocked');
  assert.equal(resumed.posts[0].lastError, 'linkedin_token_rejected');
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 1);
  assert.equal(f.db.row('blog-a').status, 'blocked');
  for (const id of ids.slice(1, -1)) {
    assert.equal(f.db.row(id).status, 'pending');
    assert.equal(f.db.row(id).claim_id, null);
  }
});

test('401 holds a rejected token globally and blocked posts recover after explicit reschedule and renewal', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog('blog-a'), blog('blog-b')]);
  await f.schedule('blog-a');
  await f.schedule('blog-b');
  f.setLinkedin(() => new Response('PRIVATE_BODY', { status: 401 }));
  assert.equal((await f.dispatch()).posts.length, 1);
  assert.equal(f.db.row('blog-a').status, 'blocked');
  assert.equal(f.db.row('blog-b').status, 'pending');
  assert.equal(f.db.row('blog-b').claim_id, null);
  const count = f.outgoing.length;
  await f.dispatch(503);
  assert.equal(f.outgoing.length, count);
  await f.invoke('/api/admin/reconcile/blog-a', { input: { resolution: 'posted' } }, 409);
  const dueAt = new Date(f.currentTime() + 1000).toISOString();
  await f.invoke('/api/admin/posts/blog-a', { method: 'PATCH', input: {
    caption: 'Explicitly rescheduled after rejection', dueAt,
  } });
  assert.equal(f.db.row('blog-a').status, 'pending');
  assert.equal(f.db.row('blog-a').last_error, null);
  await f.dispatch(503);
  assert.equal(f.outgoing.length, count, 'rescheduling cannot reuse a known rejected token');
  f.env.LINKEDIN_ACCESS_TOKEN = 'test-only-renewed-token';
  f.setLinkedin(() => new Response(null, { status: 201, headers: { 'x-restli-id': 'urn:li:share:12345' } }));
  assert.equal((await f.dispatch()).posts.length, 1, 'rescheduled post must still respect its future due time');
  assert.equal(f.db.row('blog-a').status, 'pending');
  f.setTime(Date.parse(dueAt));
  assert.equal((await f.dispatch()).posts[0].slug, 'blog-a');
  assert.equal(f.db.row('blog-a').status, 'posted');
  assert.equal(JSON.stringify(f.logs).includes('PRIVATE_BODY'), false);
  assert.equal(f.db.sqlite.prepare("SELECT value FROM metadata WHERE key = 'rejected_token_fingerprint'")
    .get().value.includes('test-only-token'), false, 'only a fingerprint is persisted');
});

test('definitively rejected blocked posts may be explicitly edited, cancelled or retried', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog('blog-a'), blog('blog-b'), blog('blog-c')]);
  for (const id of ['blog-a', 'blog-b', 'blog-c']) await f.schedule(id);
  f.setLinkedin(() => new Response(null, { status: 403 }));
  await f.dispatch();
  for (const id of ['blog-a', 'blog-b', 'blog-c']) assert.equal(f.db.row(id).status, 'blocked');
  await f.invoke('/api/admin/posts/blog-a', { method: 'PATCH', input: {
    caption: 'Permissions fixed', dueAt: new Date(f.currentTime() + 1000).toISOString(),
  } });
  assert.equal(f.db.row('blog-a').status, 'pending');
  await f.invoke('/api/admin/posts/blog-b', { method: 'DELETE' });
  assert.equal(f.db.row('blog-b').status, 'cancelled');
  await f.invoke('/api/admin/reconcile/blog-c', { input: { resolution: 'retry' } });
  assert.equal(f.db.row('blog-c').status, 'retry');
});

test('network/timeout exceptions are ambiguous and not automatically retried', async t => {
  for (const exception of [new TypeError('sensitive-network-detail'), new DOMException('timeout', 'TimeoutError')]) {
    await t.test(exception.name, async sub => {
      const f = fixture(sub, { PUBLISH_ENABLED: 'true' });
      await f.sync([blog()]);
      await f.schedule('first-blog');
      f.setLinkedin(() => { throw exception; });
      assert.equal((await f.dispatch()).posts[0].status, 'ambiguous');
      f.setTime(NOW + 24 * 60 * 60 * 1000);
      assert.equal((await f.dispatch()).posts.length, 0);
      assert.equal(JSON.stringify(f.logs).includes('sensitive-network-detail'), false);
    });
  }
});

test('canonical/200 check precedes POST and refuses redirects, forged and conflicting links', async t => {
  const cases = [
    ['404', () => new Response('missing', { status: 404 })],
    ['redirect', () => new Response(null, { status: 301, headers: { Location: 'https://other.test' } })],
    ['network', () => { throw new TypeError('network'); }],
    ['missing', () => new Response('<html/>', { headers: { 'Content-Type': 'text/html' } })],
    ['wrong', () => new Response('<link rel="canonical" href="https://other.test/">',
      { headers: { 'Content-Type': 'text/html' } })],
    ['comment', url => new Response(`<!-- <link rel="canonical" href="${url}"> -->`,
      { headers: { 'Content-Type': 'text/html' } })],
    ['script', url => new Response(`<script>const text='<link rel="canonical" href="${url}">'</script>`,
      { headers: { 'Content-Type': 'text/html' } })],
    ['conflicting', url => new Response(`<link rel="canonical" href="${url}">
      <link rel="canonical" href="https://other.test/">`, { headers: { 'Content-Type': 'text/html' } })],
    ['not html', url => new Response(`<link rel="canonical" href="${url}">`,
      { headers: { 'Content-Type': 'text/plain' } })],
  ];
  for (const [name, response] of cases) {
    await t.test(name, async sub => {
      const f = fixture(sub, { PUBLISH_ENABLED: 'true' });
      await f.sync([blog()]);
      await f.schedule('first-blog');
      f.setCanonical(response);
      const result = await f.dispatch();
      assert.equal(result.posts[0].status, 'retry');
      assert.equal(result.posts[0].lastError, 'canonical_unavailable');
      assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 0);
    });
  }
});

test('concurrent dispatches claim a slug once and admin edits cannot race a claimed post', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog()]);
  await f.schedule('first-blog');
  let entered;
  let release;
  const started = new Promise(resolve => { entered = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  f.setLinkedin(async () => {
    entered();
    await gate;
    return new Response(null, { status: 201, headers: { 'x-restli-id': 'urn:li:share:12345' } });
  });
  const dispatch = f.dispatch();
  await started;
  assert.equal(f.db.row('first-blog').status, 'publishing');
  const next = await f.invoke('/api/automation/dispatch', { handler: f.newWorker() });
  assert.equal(next.posts.length, 0);
  await f.invoke('/api/admin/posts/first-blog', { method: 'PATCH',
    input: { caption: 'Racing edit', dueAt: '2026-10-03T12:00:01Z' } }, 409);
  await f.invoke('/api/admin/posts/first-blog', { method: 'DELETE' }, 409);
  await f.invoke('/api/admin/reconcile/first-blog', { input: { resolution: 'retry' } }, 409);
  release();
  await dispatch;
  assert.equal(f.db.row('first-blog').caption, 'A useful caption');
  assert.equal(f.db.row('first-blog').status, 'posted');
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 1);
});

test('expired publishing leases become ambiguous; only explicit admin reconciliation can release', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog(), blog('second-blog')]);
  await f.schedule('first-blog');
  await f.schedule('second-blog');
  f.db.sqlite.prepare(`UPDATE posts SET status = 'publishing', claim_id = 'stale',
    lease_until = ?`).run(NOW - 1);
  const result = await f.dispatch();
  assert.equal(result.posts.length, 0);
  assert.equal(f.db.row('first-blog').status, 'ambiguous');
  assert.equal(f.db.row('first-blog').last_error, 'publishing_lease_expired');
  await f.invoke('/api/admin/reconcile/first-blog', { input: {
    resolution: 'posted', linkedinId: 'urn:li:share:98765',
  } });
  assert.equal(f.db.row('first-blog').status, 'posted');
  assert.equal(f.db.row('first-blog').linkedin_id, 'urn:li:share:98765');
  await f.invoke('/api/admin/reconcile/second-blog', { input: { resolution: 'retry' } });
  assert.equal(f.db.row('second-blog').claim_id, null);
  assert.equal((await f.dispatch()).posts[0].slug, 'second-blog');
  await f.invoke('/api/admin/reconcile/first-blog', { input: { resolution: 'retry' } }, 409);
});

test('dispatch work limit is five across independent worker instances', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  const blogs = Array.from({ length: 7 }, (_, index) => blog(`blog-${index}`));
  await f.sync(blogs);
  for (const entry of blogs) await f.schedule(entry.slug);
  assert.equal((await f.dispatch()).posts.length, 5);
  assert.equal(f.db.sqlite.prepare("SELECT count(*) AS n FROM posts WHERE status = 'pending'").get().n, 2);
  assert.equal((await f.invoke('/api/automation/dispatch', { handler: f.newWorker() })).posts.length, 2);
});

test('lost stale claim cannot overwrite an explicitly reconciled state', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog()]);
  await f.schedule('first-blog');
  let release;
  let entered;
  const gate = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { entered = resolve; });
  f.setLinkedin(async () => {
    entered();
    await gate;
    return new Response(null, { status: 201, headers: { 'x-restli-id': 'urn:li:share:12345' } });
  });
  const original = f.dispatch();
  await started;
  f.setTime(NOW + 6 * 60 * 1000);
  await f.dispatch();
  assert.equal(f.db.row('first-blog').status, 'ambiguous');
  await f.invoke('/api/admin/reconcile/first-blog', {
    input: { resolution: 'posted', linkedinId: 'urn:li:share:99999' },
  });
  release();
  await original;
  assert.equal(f.db.row('first-blog').status, 'posted');
  assert.equal(f.db.row('first-blog').linkedin_id, 'urn:li:share:99999');
});

test('a claim that expires during canonical validation must not send a LinkedIn POST', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true' });
  await f.sync([blog()]);
  await f.schedule('first-blog');
  f.setCanonical(url => {
    f.setTime(NOW + 6 * 60 * 1000);
    return new Response(`<link rel="canonical" href="${url}">`,
      { headers: { 'Content-Type': 'text/html' } });
  });
  assert.equal((await f.dispatch()).posts[0].lastError, 'claim_lost');
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 0);
  assert.equal((await f.dispatch()).posts.length, 0);
  assert.equal(f.db.row('first-blog').status, 'ambiguous');
});

test('token expiry is rechecked between canonical validation and remote publishing', async t => {
  const f = fixture(t, { PUBLISH_ENABLED: 'true', LINKEDIN_TOKEN_EXPIRES_AT: '2026-10-03T12:00:01Z' });
  await f.sync([blog()]);
  await f.schedule('first-blog');
  f.setCanonical(url => {
    f.setTime(NOW + 1000);
    return new Response(`<link rel="canonical" href="${url}">`,
      { headers: { 'Content-Type': 'text/html' } });
  });
  assert.equal((await f.dispatch()).posts[0].lastError, 'linkedin_token_expired');
  assert.equal(f.db.row('first-blog').status, 'blocked');
  assert.equal(f.outgoing.filter(call => call.url === 'https://api.linkedin.com/rest/posts').length, 0);
});
