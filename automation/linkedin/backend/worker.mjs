const SITE_ORIGIN = 'https://bluetick-health.co.za';
const MAX_BODY = 256 * 1024;
const MAX_DISPATCH = 5;
const LEASE_MS = 5 * 60 * 1000;
const RETRY_MS = 15 * 60 * 1000;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UTC_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
  }
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

function object(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !allowed.includes(key))) {
    throw new HttpError(400, 'invalid_input');
  }
  return value;
}

function text(value, max, allowEmpty = false) {
  if (typeof value !== 'string' || value.length > max ||
      (!allowEmpty && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) {
    throw new HttpError(400, 'invalid_input');
  }
  return value;
}

function slug(value) {
  if (typeof value !== 'string' || value.length > 100 || !SLUG.test(value)) {
    throw new HttpError(400, 'invalid_slug');
  }
  return value;
}

function utcDate(value) {
  if (typeof value !== 'string' || !UTC_DATE.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new HttpError(400, 'invalid_due_at');
  }
  const normalized = new Date(value).toISOString();
  if (normalized.slice(0, 19) !== value.slice(0, 19)) {
    throw new HttpError(400, 'invalid_due_at');
  }
  return normalized;
}

function futureDueAt(value, currentTime) {
  const dueAt = utcDate(value);
  if (Date.parse(dueAt) <= currentTime) throw new HttpError(400, 'due_at_must_be_future');
  return dueAt;
}

async function limitedText(response, limit) {
  const length = response.headers.get('Content-Length');
  if (length && (!/^\d+$/.test(length) || Number(length) > limit)) {
    throw new HttpError(413, 'body_too_large');
  }
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new HttpError(413, 'body_too_large');
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

async function body(request) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('Content-Type') || '')) {
    throw new HttpError(415, 'json_required');
  }
  try {
    return JSON.parse(await limitedText(request, MAX_BODY));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'invalid_json');
  }
}

function cookieJWT(request) {
  const matches = (request.headers.get('Cookie') || '').split(';')
    .map(part => part.trim()).filter(part => part.startsWith('CF_Authorization='));
  if (matches.length > 1) throw new HttpError(401, 'ambiguous_authentication');
  return matches.length ? matches[0].slice('CF_Authorization='.length) : null;
}

function decodePart(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new HttpError(401, 'invalid_access_token');
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function sameSecret(left, right) {
  const encode = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encode.encode(left)),
    crypto.subtle.digest('SHA-256', encode.encode(right)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < x.length; i++) difference |= x[i] ^ y[i];
  return difference === 0;
}

async function tokenFingerprint(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function configuration(env) {
  let expiresAt = null;
  try {
    expiresAt = utcDate(env.LINKEDIN_TOKEN_EXPIRES_AT);
  } catch { /* An absent/invalid expiry is never considered configured. */ }
  return {
    autoSchedule: env.AUTO_SCHEDULE === 'true',
    publishingEnabled: env.PUBLISH_ENABLED === 'true',
    tokenExpiresAt: expiresAt,
    tokenConfigured: typeof env.LINKEDIN_ACCESS_TOKEN === 'string' &&
      !!env.LINKEDIN_ACCESS_TOKEN.trim() && !/[\r\n]/.test(env.LINKEDIN_ACCESS_TOKEN),
    versionConfigured: typeof env.LINKEDIN_VERSION === 'string' &&
      /^\d{4}(?:0[1-9]|1[0-2])$/.test(env.LINKEDIN_VERSION),
    organizationConfigured: typeof env.LINKEDIN_ORGANIZATION_URN === 'string' &&
      /^urn:li:organization:[1-9]\d{0,19}$/.test(env.LINKEDIN_ORGANIZATION_URN),
  };
}

function postView(row) {
  return {
    slug: row.slug, caption: row.caption, dueAt: row.due_at, status: row.status,
    lastError: row.last_error, linkedinId: row.linkedin_id,
  };
}

function statement(env, sql, ...bindings) {
  return env.DB.prepare(sql).bind(...bindings);
}

function requireDB(env) {
  if (!env.DB?.prepare || !env.DB?.batch) throw new HttpError(503, 'database_not_configured');
}

// Reject conflicting canonicals and ignore apparent tags in comments/raw-text elements.
function canonicalMatches(html, expected) {
  const canonicals = [];
  const rawTextEnd = {
    script: /<\/script\s*>/gi, style: /<\/style\s*>/gi,
    textarea: /<\/textarea\s*>/gi, title: /<\/title\s*>/gi,
  };
  let position = 0;
  for (;;) {
    const start = html.indexOf('<', position);
    if (start === -1) break;
    if (html.startsWith('<!--', start)) {
      const end = html.indexOf('-->', start + 4);
      if (end === -1) break;
      position = end + 3;
      continue;
    }
    if (html[start + 1] === '!' || html[start + 1] === '?') {
      const end = html.indexOf('>', start + 2);
      if (end === -1) break;
      position = end + 1;
      continue;
    }
    const match = html.slice(start).match(/^<\/?[a-z][a-z0-9:-]*(?:[^"'<>]|"[^"]*"|'[^']*')*>/i);
    if (!match) {
      position = start + 1;
      continue;
    }
    const tag = match[0];
    position = start + tag.length;
    const name = tag.match(/^<([a-z][a-z0-9:-]*)/i)?.[1].toLowerCase();
    if (Object.hasOwn(rawTextEnd, name)) {
      const endPattern = rawTextEnd[name];
      endPattern.lastIndex = position;
      const end = endPattern.exec(html);
      if (!end) break;
      position = endPattern.lastIndex;
      continue;
    }
    if (name !== 'link') continue;
    const attributes = {};
    const contents = tag.slice(5, -1);
    for (const match of contents.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      const name = match[1].toLowerCase();
      if (Object.hasOwn(attributes, name)) return false;
      attributes[name] = match[2] ?? match[3] ?? match[4] ?? '';
    }
    if ((attributes.rel || '').toLowerCase().split(/\s+/).includes('canonical')) {
      try {
        canonicals.push(new URL(attributes.href, expected).href);
      } catch {
        return false;
      }
    }
  }
  return canonicals.length === 1 && canonicals[0] === expected;
}

export function createWorker({ fetch: fetchImpl = globalThis.fetch, now = () => Date.now(),
  log = event => console.log(JSON.stringify(event)) } = {}) {
  const keyCache = new Map();

  async function authenticateAdmin(request, env) {
    const team = env.ACCESS_TEAM_DOMAIN;
    const audience = env.ACCESS_AUD;
    const emails = (env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase());
    if (typeof team !== 'string' ||
        !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.cloudflareaccess\.com$/.test(team) ||
        typeof audience !== 'string' || !audience.trim() ||
        !emails.length || emails.some(email => email.includes('*') ||
          !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(email))) {
      throw new HttpError(503, 'admin_auth_not_configured');
    }
    const header = request.headers.get('Cf-Access-Jwt-Assertion');
    const cookie = cookieJWT(request);
    if (request.headers.has('Authorization') || (header !== null && cookie !== null && header !== cookie)) {
      throw new HttpError(401, 'ambiguous_authentication');
    }
    const token = header ?? cookie;
    if (!token || token.length > 16384) throw new HttpError(401, 'access_token_required');
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error();
      const decoder = new TextDecoder('utf-8', { fatal: true });
      const headerValue = JSON.parse(decoder.decode(decodePart(parts[0])));
      const claims = JSON.parse(decoder.decode(decodePart(parts[1])));
      if (!headerValue || headerValue.alg !== 'RS256' || headerValue.crit !== undefined ||
          typeof headerValue.kid !== 'string' ||
          !headerValue.kid || headerValue.kid.length > 256) throw new Error();
      const issuer = `https://${team}`;
      const seconds = now() / 1000;
      if (!claims || claims.iss !== issuer ||
          !(claims.aud === audience || (Array.isArray(claims.aud) && claims.aud.includes(audience))) ||
          typeof claims.exp !== 'number' || !Number.isFinite(claims.exp) || claims.exp <= seconds ||
          (claims.nbf !== undefined && (typeof claims.nbf !== 'number' ||
            !Number.isFinite(claims.nbf) || claims.nbf > seconds))) throw new Error();
      let cached = keyCache.get(issuer);
      if (!cached || cached.expires <= now()) {
        const response = await fetchImpl(`${issuer}/cdn-cgi/access/certs`, {
          redirect: 'error', signal: AbortSignal.timeout(10000),
        });
        if (response.status !== 200) throw new Error();
        const jwks = JSON.parse(await limitedText(response, 64 * 1024));
        if (!Array.isArray(jwks.keys) || jwks.keys.length > 20) throw new Error();
        const keys = new Map();
        for (const key of jwks.keys) {
          if (key.kty !== 'RSA' || typeof key.kid !== 'string' ||
              (key.alg && key.alg !== 'RS256') || (key.use && key.use !== 'sig') ||
              typeof key.n !== 'string' || typeof key.e !== 'string') continue;
          if (keys.has(key.kid)) throw new Error();
          keys.set(key.kid, await crypto.subtle.importKey('jwk',
            { kty: 'RSA', n: key.n, e: key.e, alg: 'RS256', ext: true },
            { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']));
        }
        cached = { keys, expires: now() + 5 * 60 * 1000 };
        keyCache.set(issuer, cached);
      }
      const key = cached.keys.get(headerValue.kid);
      if (!key || !await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key,
        decodePart(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`))) throw new Error();
      if (typeof claims.email !== 'string' || !emails.includes(claims.email.toLowerCase())) {
        throw new HttpError(403, 'admin_not_allowed');
      }
    } catch (error) {
      if (error instanceof HttpError && error.status === 403) throw error;
      throw new HttpError(401, 'invalid_access_token');
    }
  }

  async function authenticateAutomation(request, env) {
    if (typeof env.AUTOMATION_SECRET !== 'string' || env.AUTOMATION_SECRET.length < 32) {
      throw new HttpError(503, 'automation_auth_not_configured');
    }
    if (request.headers.has('Cf-Access-Jwt-Assertion') || cookieJWT(request) !== null) {
      throw new HttpError(401, 'ambiguous_authentication');
    }
    const authorization = request.headers.get('Authorization') || '';
    if (authorization.length > 4096 || !authorization.startsWith('Bearer ') ||
        !await sameSecret(authorization.slice(7), env.AUTOMATION_SECRET)) {
      throw new HttpError(401, 'automation_token_required');
    }
  }

  async function state(env) {
    const results = await env.DB.batch([
      statement(env, 'SELECT slug, title, url, excerpt FROM blogs WHERE active = 1 ORDER BY slug'),
      statement(env, 'SELECT * FROM posts ORDER BY due_at, slug'),
    ]);
    return json({
      blogs: results[0].results, posts: results[1].results.map(postView),
      configuration: configuration(env),
    });
  }

  async function sync(input, env) {
    object(input, ['blogs', 'baseline']);
    if (!Array.isArray(input.blogs) || input.blogs.length > 1000 ||
        (input.baseline !== undefined && typeof input.baseline !== 'boolean')) {
      throw new HttpError(400, 'invalid_catalog');
    }
    const slugs = new Set();
    const blogs = input.blogs.map(value => {
      object(value, ['slug', 'title', 'url', 'excerpt']);
      const id = slug(value.slug);
      if (slugs.has(id) || value.url !== `${SITE_ORIGIN}/blog/${id}/`) {
        throw new HttpError(400, 'invalid_catalog');
      }
      slugs.add(id);
      return { slug: id, title: text(value.title, 300), url: value.url,
        excerpt: text(value.excerpt, 2000, true) };
    });
    const data = JSON.stringify(blogs);
    const timestamp = new Date(now()).toISOString();
    // D1 batch is one transaction. Baseline detection and seen/queue inserts cannot interleave.
    const results = await env.DB.batch([
      statement(env, 'UPDATE blogs SET active = 0'),
      statement(env, `INSERT INTO blogs (slug, title, url, excerpt, active)
        SELECT json_extract(value, '$.slug'), json_extract(value, '$.title'),
          json_extract(value, '$.url'), json_extract(value, '$.excerpt'), 1
        FROM json_each(?) WHERE 1
        ON CONFLICT(slug) DO UPDATE SET title = excluded.title, url = excluded.url,
          excerpt = excluded.excerpt, active = 1`, data),
      statement(env, `INSERT OR IGNORE INTO posts
        (slug, caption, due_at, status, created_at, updated_at)
        SELECT json_extract(value, '$.slug'),
          json_extract(value, '$.title') || char(10) || char(10) ||
          json_extract(value, '$.excerpt') || char(10) || char(10) || json_extract(value, '$.url'),
          ?, 'pending', ?, ?
        FROM json_each(?)
        WHERE ? = 1 AND EXISTS (SELECT 1 FROM metadata WHERE key = 'initialized')
          AND NOT EXISTS (SELECT 1 FROM seen_slugs
            WHERE slug = json_extract(value, '$.slug'))`,
      timestamp, timestamp, timestamp, data, env.AUTO_SCHEDULE === 'true' ? 1 : 0),
      statement(env, `INSERT OR IGNORE INTO seen_slugs (slug, first_seen_at)
        SELECT json_extract(value, '$.slug'), ? FROM json_each(?)`, timestamp, data),
      statement(env, "INSERT OR IGNORE INTO metadata (key, value) VALUES ('initialized', ?)", timestamp),
    ]);
    return json({ initialized: true, baselineApplied: results[4].meta.changes === 1,
      queued: results[2].meta.changes, automaticScheduling: env.AUTO_SCHEDULE === 'true' });
  }

  async function schedule(input, env) {
    object(input, ['slug', 'caption', 'dueAt']);
    const id = slug(input.slug);
    const caption = text(input.caption, 3000);
    const due = futureDueAt(input.dueAt, now());
    const timestamp = new Date(now()).toISOString();
    const result = await statement(env, `INSERT OR IGNORE INTO posts
      (slug, caption, due_at, status, created_at, updated_at)
      SELECT slug, ?, ?, 'pending', ?, ? FROM blogs WHERE slug = ? AND active = 1
      RETURNING *`, caption, due, timestamp, timestamp, id).all();
    if (!result.results.length) throw new HttpError(409, 'unknown_blog_or_post_exists');
    return json({ post: postView(result.results[0]) }, 201);
  }

  async function mutate(id, method, input, env) {
    const timestamp = new Date(now()).toISOString();
    let result;
    if (method === 'DELETE') {
      object(input, []);
      result = await statement(env, `UPDATE posts SET status = 'cancelled',
        last_error = NULL, claim_id = NULL, lease_until = NULL, updated_at = ?
        WHERE slug = ? AND status IN ('pending', 'retry', 'blocked')
        RETURNING *`, timestamp, id).all();
    } else {
      object(input, ['caption', 'dueAt']);
      const caption = text(input.caption, 3000);
      const due = futureDueAt(input.dueAt, now());
      result = await statement(env, `UPDATE posts SET caption = ?, due_at = ?,
        status = 'pending', last_error = NULL, claim_id = NULL, lease_until = NULL, updated_at = ?
        WHERE slug = ? AND status IN ('pending', 'retry', 'blocked') RETURNING *`,
      caption, due, timestamp, id).all();
    }
    if (!result.results.length) throw new HttpError(409, 'post_not_editable');
    return json({ post: postView(result.results[0]) });
  }

  async function reconcile(id, input, env) {
    object(input, ['resolution', 'linkedinId']);
    if (!['posted', 'retry'].includes(input.resolution)) throw new HttpError(400, 'invalid_resolution');
    if (input.linkedinId !== undefined && (input.resolution !== 'posted' ||
        typeof input.linkedinId !== 'string' ||
        !/^urn:li:(?:share|ugcPost):\d{1,30}$/.test(input.linkedinId))) {
      throw new HttpError(400, 'invalid_linkedin_id');
    }
    const timestamp = new Date(now()).toISOString();
    const result = await statement(env, `UPDATE posts SET status = ?, linkedin_id = ?,
      last_error = NULL, claim_id = NULL, lease_until = NULL, updated_at = ?
      WHERE slug = ? AND (status = 'ambiguous' OR (status = 'blocked' AND ? = 'retry'))
      RETURNING *`, input.resolution, input.linkedinId ?? null, timestamp, id, input.resolution).all();
    if (!result.results.length) throw new HttpError(409, 'post_not_reconcilable');
    return json({ post: postView(result.results[0]) });
  }

  async function finish(env, row, status, error, linkedinId = null, dueAt = row.due_at) {
    const currentTime = now();
    const timestamp = new Date(currentTime).toISOString();
    const result = await statement(env, `UPDATE posts SET status = ?, last_error = ?,
      linkedin_id = ?, due_at = ?, claim_id = NULL, lease_until = NULL, updated_at = ?
      WHERE slug = ? AND claim_id = ? AND status = 'publishing' AND lease_until > ? RETURNING *`,
    status, error, linkedinId, dueAt, timestamp, row.slug, row.claim_id, currentTime).all();
    if (!result.results.length) {
      await statement(env, `UPDATE posts SET status = 'ambiguous',
        last_error = 'publishing_lease_expired', updated_at = ?
        WHERE slug = ? AND claim_id = ? AND status = 'publishing' AND lease_until <= ?`,
      timestamp, row.slug, row.claim_id, currentTime).run();
    }
    log({ event: 'linkedin_outcome', slug: row.slug,
      status: result.results.length ? status : 'claim_lost',
      error: result.results.length ? error : 'claim_lost' });
    return result.results.length ? postView(result.results[0]) :
      { slug: row.slug, status: 'ambiguous', lastError: 'claim_lost' };
  }

  async function publish(env, row) {
    let canonicalOK = false;
    try {
      const response = await fetchImpl(row.url, {
        redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { Accept: 'text/html' },
      });
      canonicalOK = response.status === 200 &&
        /^text\/html(?:;|$)/i.test(response.headers.get('Content-Type') || '') &&
        canonicalMatches(await limitedText(response, 1024 * 1024), row.url);
    } catch { /* No POST has happened: a canonical failure is safe to retry. */ }
    if (!canonicalOK) return finish(env, row, 'retry', 'canonical_unavailable', null,
      new Date(now() + RETRY_MS).toISOString());

    const lease = await statement(env, `UPDATE posts SET lease_until = ?
      WHERE slug = ? AND claim_id = ? AND status = 'publishing' AND lease_until > ?
      RETURNING slug`, now() + LEASE_MS, row.slug, row.claim_id, now()).all();
    if (!lease.results.length) return finish(env, row, 'ambiguous', 'claim_lost');
    const fingerprint = await tokenFingerprint(env.LINKEDIN_ACCESS_TOKEN);
    const rejectedToken = await statement(env,
      "SELECT value FROM metadata WHERE key = 'rejected_token_fingerprint'").first();
    if (rejectedToken?.value === fingerprint) {
      return { ...await finish(env, row, 'blocked', 'linkedin_token_rejected'), stopReason: 'token_rejected' };
    }
    const cooldown = await rateLimitUntil(env);
    if (cooldown) {
      return { ...await finish(env, row, 'retry', 'linkedin_rate_limited', null, cooldown),
        stopReason: 'rate_limited', resumeAt: cooldown };
    }
    if (Date.parse(env.LINKEDIN_TOKEN_EXPIRES_AT) <= now()) {
      return { ...await finish(env, row, 'blocked', 'linkedin_token_expired'), stopReason: 'token_expired' };
    }
    let response;
    try {
      response = await fetchImpl('https://api.linkedin.com/rest/posts', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: ['Bearer', env.LINKEDIN_ACCESS_TOKEN].join(' '),
          'Content-Type': 'application/json',
          'LinkedIn-Version': env.LINKEDIN_VERSION,
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: env.LINKEDIN_ORGANIZATION_URN,
          commentary: row.caption,
          visibility: 'PUBLIC',
          distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [],
            thirdPartyDistributionChannels: [] },
          content: { article: { source: row.url, title: row.title } },
          lifecycleState: 'PUBLISHED',
          isReshareDisabledByAuthor: false,
        }),
      });
    } catch {
      return finish(env, row, 'ambiguous', 'linkedin_network_or_timeout');
    }
    const status = response.status;
    const id = response.headers.get('x-restli-id');
    // Remote bodies can contain credentials or private details; neither read nor log them.
    await response.body?.cancel().catch(() => {});
    if (status === 201 && id && /^urn:li:(?:share|ugcPost):\d{1,30}$/.test(id)) {
      return finish(env, row, 'posted', null, id);
    }
    if (status === 401) {
      await statement(env, `INSERT INTO metadata (key, value) VALUES ('rejected_token_fingerprint', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      await tokenFingerprint(env.LINKEDIN_ACCESS_TOKEN)).run();
      return { ...await finish(env, row, 'blocked', 'linkedin_token_rejected'), stopReason: 'token_rejected' };
    }
    if (status === 429) {
      const value = response.headers.get('Retry-After') || '';
      const seconds = /^\d+$/.test(value) ? Number(value) : NaN;
      const date = Date.parse(value);
      let delay = RETRY_MS;
      if (Number.isSafeInteger(seconds) &&
          Number.isFinite(new Date(now() + seconds * 1000).getTime())) delay = seconds * 1000;
      else if (Number.isFinite(date)) delay = Math.max(0, date - now());
      const resumeAt = new Date(now() + delay).toISOString();
      await statement(env, `INSERT INTO metadata (key, value) VALUES ('rate_limit_until', ?)
        ON CONFLICT(key) DO UPDATE SET value =
          CASE WHEN excluded.value > metadata.value THEN excluded.value ELSE metadata.value END`,
      resumeAt).run();
      return { ...await finish(env, row, 'retry', 'linkedin_rate_limited', null, resumeAt),
        stopReason: 'rate_limited', resumeAt };
    }
    if ([400, 403, 404, 405, 413, 414, 415, 422].includes(status)) {
      return finish(env, row, 'blocked', `linkedin_http_${status}`);
    }
    return finish(env, row, 'ambiguous', status === 201 ?
      'linkedin_missing_or_invalid_id' : `linkedin_uncertain_http_${status}`);
  }

  async function releaseUnattempted(env, rows, resumeAt = null) {
    if (!rows.length) return;
    const timestamp = new Date(now()).toISOString();
    await env.DB.batch(rows.map(row => statement(env, `UPDATE posts SET
      status = ?, due_at = CASE WHEN ? IS NOT NULL AND due_at < ? THEN ? ELSE due_at END,
      last_error = ?, claim_id = NULL, lease_until = NULL, updated_at = ?
      WHERE slug = ? AND claim_id = ? AND status = 'publishing' AND lease_until > ?`,
    resumeAt ? 'retry' : 'pending', resumeAt, resumeAt, resumeAt,
    resumeAt ? 'linkedin_rate_limited' : null, timestamp, row.slug, row.claim_id, now())));
  }

  async function rateLimitUntil(env) {
    const row = await statement(env, "SELECT value FROM metadata WHERE key = 'rate_limit_until'").first();
    return row && Date.parse(row.value) > now() ? row.value : null;
  }

  async function dispatch(input, env) {
    object(input, []);
    const config = configuration(env);
    const timestamp = new Date(now()).toISOString();
    await statement(env, `UPDATE posts SET status = 'ambiguous', last_error = 'publishing_lease_expired',
      updated_at = ? WHERE status = 'publishing' AND (lease_until IS NULL OR lease_until <= ?)`,
    timestamp, now()).run();
    if (!config.publishingEnabled) {
      const preview = await statement(env, `SELECT p.*, b.title, b.url FROM posts p
        JOIN blogs b ON b.slug = p.slug WHERE p.status IN ('pending', 'retry') AND p.due_at <= ?
        ORDER BY p.due_at, p.slug LIMIT ?`, timestamp, MAX_DISPATCH).all();
      return json({ dryRun: true, posts: preview.results.map(row => ({
        ...postView(row), url: row.url, title: row.title,
      })) });
    }
    if (!config.tokenConfigured || !config.tokenExpiresAt ||
        Date.parse(config.tokenExpiresAt) <= now() || !config.versionConfigured ||
        !config.organizationConfigured) {
      throw new HttpError(503, 'publishing_configuration_invalid');
    }
    const rejectedToken = await statement(env,
      "SELECT value FROM metadata WHERE key = 'rejected_token_fingerprint'").first();
    if (rejectedToken?.value === await tokenFingerprint(env.LINKEDIN_ACCESS_TOKEN)) {
      throw new HttpError(503, 'linkedin_token_rejected');
    }
    const cooldown = await rateLimitUntil(env);
    if (cooldown) return json({ dryRun: false, posts: [], rateLimitedUntil: cooldown });
    const claims = await env.DB.batch(Array.from({ length: MAX_DISPATCH }, () =>
      statement(env, `UPDATE posts SET status = 'publishing', claim_id = ?,
        lease_until = ?, updated_at = ?
        WHERE slug = (SELECT slug FROM posts WHERE status IN ('pending', 'retry')
          AND due_at <= ? ORDER BY due_at, slug LIMIT 1)
          AND status IN ('pending', 'retry') RETURNING *`,
      crypto.randomUUID(), now() + LEASE_MS, timestamp, timestamp)));
    const rows = claims.flatMap(claim => claim.results);
    const results = [];
    let rateLimitedUntil = null;
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const globalCooldown = await rateLimitUntil(env);
      if (globalCooldown) {
        await releaseUnattempted(env, rows.slice(index), globalCooldown);
        rateLimitedUntil = globalCooldown;
        break;
      }
      const blog = await statement(env, 'SELECT title, url, active FROM blogs WHERE slug = ?', row.slug).first();
      if (!blog || blog.active !== 1 || blog.url !== `${SITE_ORIGIN}/blog/${row.slug}/`) {
        results.push(await finish(env, row, 'blocked', 'invalid_catalog_url'));
        continue;
      }
      const { stopReason, resumeAt, ...post } = await publish(env, { ...row, ...blog });
      results.push(post);
      if (stopReason) {
        await releaseUnattempted(env, rows.slice(index + 1), resumeAt);
        rateLimitedUntil = resumeAt ?? null;
        break;
      }
    }
    return json({ dryRun: false, posts: results,
      ...(rateLimitedUntil ? { rateLimitedUntil } : {}) });
  }

  return {
    async fetch(request, env) {
      try {
        const url = new URL(request.url);
        const path = url.pathname;
        const isAdmin = path.startsWith('/api/admin/') || path === '/admin/linkedin' ||
          path.startsWith('/admin/linkedin/');
        const isAutomation = path.startsWith('/api/automation/');
        if (!isAdmin && !isAutomation) return json({ error: 'not_found' }, 404);
        if (isAdmin) await authenticateAdmin(request, env);
        else await authenticateAutomation(request, env);
        if (path === '/admin/linkedin' || path.startsWith('/admin/linkedin/')) {
          if (!['GET', 'HEAD'].includes(request.method)) throw new HttpError(405, 'method_not_allowed');
          if (!env.ASSETS?.fetch) throw new HttpError(503, 'assets_not_configured');
          if (path === '/admin/linkedin') {
            return new Response(null, { status: 308,
              headers: { Location: '/admin/linkedin/', 'Cache-Control': 'no-store' } });
          }
          const asset = await env.ASSETS.fetch(request);
          const headers = new Headers(asset.headers);
          headers.set('Cache-Control', 'no-store');
          headers.set('X-Content-Type-Options', 'nosniff');
          headers.set('Referrer-Policy', 'no-referrer');
          headers.set('Content-Security-Policy',
            "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; " +
            "connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
          return new Response(asset.body, { status: asset.status, headers });
        }
        requireDB(env);
        if (path === '/api/admin/state' && request.method === 'GET') return await state(env);
        if (isAdmin && !['POST', 'PATCH', 'DELETE'].includes(request.method)) {
          throw new HttpError(405, 'method_not_allowed');
        }
        if (isAutomation && request.method !== 'POST') throw new HttpError(405, 'method_not_allowed');
        if (isAdmin && (request.headers.get('Origin') !== url.origin ||
            request.headers.get('X-Admin-Request') !== '1')) {
          throw new HttpError(403, 'same_origin_request_required');
        }
        const input = await body(request);
        if (path === '/api/admin/schedule' && request.method === 'POST') return await schedule(input, env);
        const edit = path.match(/^\/api\/admin\/posts\/([^/]+)$/);
        if (edit && ['PATCH', 'DELETE'].includes(request.method)) {
          return await mutate(slug(edit[1]), request.method, input, env);
        }
        const reconciliation = path.match(/^\/api\/admin\/reconcile\/([^/]+)$/);
        if (reconciliation && request.method === 'POST') {
          return await reconcile(slug(reconciliation[1]), input, env);
        }
        if (path === '/api/automation/sync') return await sync(input, env);
        if (path === '/api/automation/dispatch') return await dispatch(input, env);
        return json({ error: 'not_found' }, 404);
      } catch (error) {
        if (error instanceof HttpError) return json({ error: error.message }, error.status);
        log({ event: 'worker_internal_error' });
        return json({ error: 'internal_error' }, 500);
      }
    },
  };
}

export default createWorker();
