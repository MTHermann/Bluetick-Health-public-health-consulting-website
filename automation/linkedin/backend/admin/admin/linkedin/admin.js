const editableStatuses = new Set(['pending', 'retry', 'blocked']);
const ambiguousStatuses = new Set(['ambiguous']);

function dateParts(date, zone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function formatWallTime(instant, zone) {
  const date = new Date(instant);
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid scheduled timestamp.');
  return dateParts(date, zone);
}

export function wallTimeToInstant(value, zone = 'UTC', now = Date.now()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error('Enter a complete date and time.');
  const [, year, month, day, hour, minute] = match.map(Number);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new Error('Invalid date or time.');
  }
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  if (new Date(wall).toISOString().slice(0, 16) !== value) throw new Error('Invalid calendar date.');
  const candidates = new Set();
  // Sample offsets on both sides of a transition, then round-trip each candidate.
  for (let hours = -36; hours <= 36; hours += 3) {
    const sample = wall + hours * 3600000;
    const sampleWall = dateParts(new Date(sample), zone);
    const offset = Date.parse(`${sampleWall}:00Z`) - sample;
    const candidate = wall - offset;
    if (dateParts(new Date(candidate), zone) === value) candidates.add(candidate);
  }
  if (!candidates.size) throw new Error('This local time does not exist due to a daylight-saving transition. Choose another time or UTC.');
  if (candidates.size > 1) throw new Error('This local time repeats during a daylight-saving transition. Select UTC for precision.');
  const instant = [...candidates][0];
  if (instant <= now) throw new Error('The scheduled time must be in the future.');
  return new Date(instant).toISOString();
}

if (typeof document !== 'undefined') initialize();

function initialize() {
  const $ = id => document.getElementById(id);
  let state = null;
  let busy = false;
  let previousZone = 'UTC';
  let originalDueAt = null;
  let originalWallTime = null;
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (localZone && localZone !== 'UTC') {
    $('zone').append(new Option(`Browser local (${localZone})`, localZone));
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = String(text);
    if (className) node.className = className;
    return node;
  }

  function safeLink(url, title) {
    try {
      const parsed = new URL(url, location.origin);
      if (!['http:', 'https:'].includes(parsed.protocol)) return element('span', 'Invalid blog URL');
      const link = element('a', title || parsed.href);
      link.href = parsed.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      return link;
    } catch {
      return element('span', 'Invalid blog URL');
    }
  }

  function notice(message, kind = '') {
    $('notice').textContent = message;
    $('notice').className = kind;
  }

  function selectedPost() {
    return state?.posts.find(post => post.slug === $('blog').value);
  }

  function updateControls() {
    $('refresh').disabled = busy;
    $('editor-fields').disabled = busy || !state;
    const post = selectedPost();
    const editable = post && editableStatuses.has(post.status);
    $('save').disabled = busy || !state || !$('blog').value || Boolean(post && !editable);
    $('save').textContent = editable ? 'Save changes' : 'Schedule post';
    $('cancel').hidden = !editable;
    $('duplicate-warning').textContent = post
      ? editable
        ? post.status === 'blocked'
          ? 'This post is blocked. Fix backend configuration before rescheduling (for example, renew the token or correct permissions). Saving edits the existing record; it does not create another post.'
          : `This slug already has a ${post.status} post. Saving edits that record; it does not create another post.`
        : `Scheduling blocked: this slug already has a ${post.status} record. Resolve ambiguous outcomes below; do not create a duplicate.`
      : '';
    for (const button of $('posts').querySelectorAll('button')) button.disabled = busy || !state;
  }

  async function api(path, method = 'GET', data) {
    const options = { method, credentials: 'same-origin', cache: 'no-store' };
    if (method !== 'GET') {
      options.headers = { 'Content-Type': 'application/json', 'X-Admin-Request': '1' };
      options.body = JSON.stringify(data ?? {});
    }
    const response = await fetch(path, options);
    if (response.status === 401 || response.status === 403) {
      state = null;
      $('configuration').replaceChildren();
      $('blogs').replaceChildren();
      $('posts').replaceChildren();
      $('blog').replaceChildren();
      $('caption').value = '';
      $('due').value = '';
      $('preview').textContent = '';
      $('preview-link').replaceChildren();
      $('time-preview').textContent = '';
      throw new Error('Administrator access is unavailable (401/403). Sign in through the protected same-origin access gateway, then refresh. Ask the operator to configure access if needed. Never enter tokens here.');
    }
    let body;
    try { body = await response.json(); } catch { body = null; }
    if (!response.ok) {
      const detail = typeof body?.error === 'string' ? ` ${body.error}` : '';
      throw new Error(`Request failed (${response.status}).${detail} If no backend is configured, deploy/configure the protected Worker and its ASSETS binding; this UI cannot publish by itself.`);
    }
    return body;
  }

  async function load() {
    state = null;
    const next = await api('/api/admin/state');
    if (!next || !Array.isArray(next.blogs) || !Array.isArray(next.posts) || !next.configuration) {
      throw new Error('Admin API unavailable or not configured: expected the protected Worker state endpoint, not a static HTML fallback.');
    }
    state = next;
    render();
  }

  async function action(callback, success) {
    if (busy) return;
    busy = true;
    updateControls();
    notice('Working…');
    try {
      await callback();
      notice(success, 'success');
    } catch (error) {
      notice(error.message || 'Request failed. Refresh state before trying again.', 'error');
    } finally {
      busy = false;
      updateControls();
    }
  }

  function renderConfiguration() {
    const config = state.configuration;
    const list = $('configuration');
    list.replaceChildren();
    list.append(element('li', config.publishingEnabled
      ? 'Publishing is enabled.'
      : 'Publishing disabled / dry-run: schedules will not be published while publishing is disabled.',
    config.publishingEnabled ? '' : 'warning'));
    list.append(element('li', config.autoSchedule
      ? 'Automatic scheduling of newly discovered blogs is enabled.'
      : 'Automatic scheduling of newly discovered blogs is disabled; use this form to schedule manually.'));
    for (const [key, name] of [
      ['tokenConfigured', 'LinkedIn token'], ['versionConfigured', 'LinkedIn API version'],
      ['organizationConfigured', 'LinkedIn organization'],
    ]) list.append(element('li', `${name}: ${config[key] ? 'configured' : 'NOT configured'}`, config[key] ? '' : 'warning'));
    const expiry = new Date(config.tokenExpiresAt || '');
    if (!Number.isFinite(expiry.getTime())) {
      list.append(element('li', 'Token expiry is unknown; verify it with the operator.', 'warning'));
    } else {
      const remaining = expiry.getTime() - Date.now();
      list.append(element('li', `Token expires: ${expiry.toISOString()}${remaining <= 0 ? ' — EXPIRED' : remaining < 7 * 86400000 ? ' — expires within 7 days' : ''}`,
        remaining < 7 * 86400000 ? 'warning' : ''));
    }
  }

  function render() {
    const previousSlug = $('blog').value;
    renderConfiguration();
    $('blogs').replaceChildren();
    $('blog').replaceChildren(new Option('Choose a blog', ''));
    for (const blog of state.blogs) {
      const item = element('li');
      item.append(element('strong', blog.title), document.createTextNode(' — '), safeLink(blog.url));
      $('blogs').append(item);
      $('blog').append(new Option(blog.title || blog.slug, blog.slug));
    }
    if (!state.blogs.length) $('blogs').append(element('li', 'No blogs available. Check backend blog discovery/configuration.'));
    for (const post of state.posts) {
      if (!state.blogs.some(blog => blog.slug === post.slug)) $('blog').append(new Option(`${post.slug} (existing record)`, post.slug));
    }
    $('blog').value = previousSlug;
    $('posts').replaceChildren();
    for (const post of [...state.posts].sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))) {
      const item = element('article', undefined, 'post');
      const blog = state.blogs.find(blog => blog.slug === post.slug);
      item.append(element('h3', blog?.title || post.slug));
      item.append(element('p', `Slug: ${post.slug} · Status: ${post.status}`));
      item.append(element('p', `Scheduled (UTC): ${post.dueAt || 'Not set'}`));
      item.append(element('pre', post.caption || ''));
      if (post.lastError) item.append(element('p', `Last error: ${post.lastError}`, 'error'));
      if (post.linkedinId) item.append(element('p', `LinkedIn ID: ${post.linkedinId}`));
      if (editableStatuses.has(post.status)) {
        const edit = element('button', 'Select to edit / reschedule / cancel');
        edit.type = 'button';
        edit.addEventListener('click', () => {
          $('blog').value = post.slug;
          selectBlog();
          $('caption').focus();
        });
        item.append(edit);
      }
      if (ambiguousStatuses.has(post.status) || post.status === 'blocked') {
        if (ambiguousStatuses.has(post.status)) {
          const resolvePosted = element('button', 'Resolve as already posted');
          resolvePosted.type = 'button';
          resolvePosted.addEventListener('click', () => reconcile(post, 'posted'));
          item.append(resolvePosted);
        }
        const resolveRetry = element('button', post.status === 'blocked'
          ? 'Retry blocked post after recovery'
          : 'Resolve as retry — duplicate risk');
        resolveRetry.type = 'button';
        resolveRetry.addEventListener('click', () => reconcile(post, 'retry'));
        item.append(resolveRetry);
      }
      $('posts').append(item);
    }
    if (!state.posts.length) $('posts').append(element('p', 'No scheduled posts or history.'));
    selectBlog();
  }

  function selectBlog() {
    const blog = state?.blogs.find(blog => blog.slug === $('blog').value);
    const post = selectedPost();
    $('caption').value = post?.caption ?? (blog ? `${blog.title}\n\n${blog.excerpt || ''}\n\n${blog.url}` : '');
    originalDueAt = post?.dueAt || null;
    try { $('due').value = originalDueAt ? formatWallTime(originalDueAt, $('zone').value) : ''; }
    catch { $('due').value = ''; }
    originalWallTime = $('due').value;
    updatePreview();
    updateTimePreview();
    updateControls();
  }

  function updatePreview() {
    $('preview').textContent = $('caption').value;
    const blog = state?.blogs.find(blog => blog.slug === $('blog').value);
    $('preview-link').replaceChildren();
    if (blog) $('preview-link').append(safeLink(blog.url, 'Open blog preview (new tab)'));
  }

  function dueInstant() {
    // Preserve stored seconds when editing only a caption; changed wall times are minute precision.
    if (originalDueAt && $('due').value === originalWallTime) {
      wallTimeToInstant($('due').value, $('zone').value, -Infinity);
      if (new Date(originalDueAt).getTime() <= Date.now()) throw new Error('The scheduled time must be in the future.');
      return originalDueAt;
    }
    return wallTimeToInstant($('due').value, $('zone').value);
  }

  function updateTimePreview() {
    try {
      $('time-preview').textContent = $('due').value ? `Will schedule at ${dueInstant()} (UTC).` : '';
      $('time-preview').className = '';
    } catch (error) {
      $('time-preview').textContent = error.message;
      $('time-preview').className = 'warning';
    }
  }

  async function reconcile(post, resolution) {
    const warning = post.status === 'blocked'
      ? 'Retry this blocked post? Confirm the cause shown in its last error has been fixed (for example, the operator renewed the token or repaired the source link). Verify the LinkedIn feed first to avoid a duplicate. This explicitly returns the post to the retry queue.'
      : resolution === 'retry'
      ? 'DUPLICATE POST RISK: LinkedIn may already have published this post. Verify the organization feed first. Retry can publish the same content twice. Explicitly authorize a retry?'
      : 'Confirm you verified this post is already published on LinkedIn. This will mark it posted and prevent retrying.';
    if (!window.confirm(warning)) return;
    const data = { resolution };
    if (resolution === 'posted') {
      const id = window.prompt('Verified LinkedIn post ID (optional): urn:li:share:<digits> or urn:li:ugcPost:<digits>. Leave blank if unavailable.', post.linkedinId || '');
      if (id === null) return;
      if (id.trim()) {
        if (!/^urn:li:(share|ugcPost):\d+$/.test(id.trim())) {
          notice('Enter a LinkedIn post URN (urn:li:share:<digits> or urn:li:ugcPost:<digits>), or leave it blank.', 'error');
          return;
        }
        data.linkedinId = id.trim();
      }
    }
    await action(async () => {
      await api(`/api/admin/reconcile/${encodeURIComponent(post.slug)}`, 'POST', data);
      await load();
    }, post.status === 'blocked' ? 'Blocked post explicitly returned to retry. State refreshed.' : 'Ambiguous outcome explicitly resolved. State refreshed.');
  }

  $('blog').addEventListener('change', selectBlog);
  $('caption').addEventListener('input', updatePreview);
  $('due').addEventListener('input', updateTimePreview);
  $('zone').addEventListener('change', () => {
    try {
      if ($('due').value) {
        const instant = wallTimeToInstant($('due').value, previousZone, -Infinity);
        $('due').value = formatWallTime(instant, $('zone').value);
        if (originalDueAt) originalWallTime = formatWallTime(originalDueAt, $('zone').value);
      }
    } catch (error) {
      // Keep the entered wall time so an ambiguous local value can be entered precisely in UTC.
      notice(`${error.message} Re-enter the intended time in the selected zone.`, 'error');
      originalDueAt = null;
    }
    previousZone = $('zone').value;
    updateTimePreview();
  });
  $('editor').addEventListener('submit', event => {
    event.preventDefault();
    if (!state || busy) return;
    const slug = $('blog').value;
    const post = selectedPost();
    if (post && !editableStatuses.has(post.status)) return notice('Duplicate scheduling blocked for this slug.', 'error');
    const caption = $('caption').value.trim();
    if (!slug || !caption) return notice('Choose a blog and enter a nonempty caption.', 'error');
    let dueAt;
    try { dueAt = dueInstant(); } catch (error) { return notice(error.message, 'error'); }
    action(async () => {
      await api(post ? `/api/admin/posts/${encodeURIComponent(slug)}` : '/api/admin/schedule',
        post ? 'PATCH' : 'POST', post ? { caption, dueAt } : { slug, caption, dueAt });
      await load();
    }, 'Post saved. Persistent state refreshed.');
  });
  $('cancel').addEventListener('click', () => {
    const post = selectedPost();
    if (!post || !editableStatuses.has(post.status) || !window.confirm(`Cancel the ${post.status} post for "${post.slug}"?`)) return;
    action(async () => {
      await api(`/api/admin/posts/${encodeURIComponent(post.slug)}`, 'DELETE');
      await load();
    }, 'Post canceled. State refreshed.');
  });
  $('refresh').addEventListener('click', () => action(load, 'State refreshed.'));
  action(load, 'State loaded.');
}
