import test from 'node:test';
import assert from 'node:assert/strict';

test('UI loads safely, schedules same-origin JSON, blocks duplicates, and locks on auth failure', async () => {
  class Node {
    constructor(tag = '') {
      this.tag = tag;
      this.children = [];
      this.value = '';
      this.textContent = '';
      this.events = {};
    }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    addEventListener(name, callback) { this.events[name] = callback; }
    querySelectorAll(tag) {
      return this.children.flatMap(node => node instanceof Node
        ? [...(node.tag === tag ? [node] : []), ...node.querySelectorAll(tag)] : []);
    }
    focus() {}
    set innerHTML(value) { throw new Error(`Unsafe HTML assignment: ${value}`); }
  }
  const ids = ['notice', 'refresh', 'configuration', 'blogs', 'blog', 'editor', 'editor-fields',
    'caption', 'zone', 'due', 'save', 'cancel', 'duplicate-warning', 'preview', 'preview-link',
    'time-preview', 'posts'];
  const nodes = Object.fromEntries(ids.map(id => [id, new Node()]));
  nodes.zone.value = 'UTC';
  const state = {
    blogs: [{ slug: 'example', title: '<script>untrusted</script>', url: 'javascript:alert(1)', excerpt: 'Example excerpt' }],
    posts: [],
    configuration: { publishingEnabled: false, autoSchedule: false, tokenConfigured: false, versionConfigured: true, organizationConfigured: true },
  };
  const calls = [];
  const confirmations = [];
  let denied = false;
  const originals = Object.fromEntries(['document', 'Option', 'location', 'window', 'fetch'].map(key => [key, globalThis[key]]));
  globalThis.document = {
    getElementById: id => nodes[id],
    createElement: tag => new Node(tag),
    createTextNode: text => text,
  };
  globalThis.Option = class extends Node {
    constructor(text, value) { super('option'); this.textContent = text; this.value = value; }
  };
  globalThis.location = { origin: 'https://admin.example' };
  globalThis.window = { confirm: message => { confirmations.push(message); return true; }, prompt: () => '' };
  globalThis.fetch = async (path, options) => {
    calls.push({ path, options });
    if (denied) return { status: 403, ok: false };
    if (path === '/api/admin/schedule') state.posts.push({ ...JSON.parse(options.body), status: 'pending' });
    if (path.startsWith('/api/admin/reconcile/')) {
      state.posts[0].status = JSON.parse(options.body).resolution;
    }
    if (options.method === 'PATCH') Object.assign(state.posts[0], JSON.parse(options.body));
    if (options.method === 'DELETE') state.posts[0].status = 'cancelled';
    return { status: 200, ok: true, json: async () => options.method === 'GET' ? state : { ok: true } };
  };
  const settle = () => new Promise(resolve => setImmediate(resolve));
  try {
    await import('../admin/admin/linkedin/admin.js?ui-smoke');
    await settle();
    assert.equal(nodes['editor-fields'].disabled, false, 'Blog selection must be available after loading');
    assert.equal(nodes.save.disabled, true);
    assert.match(nodes.notice.textContent, /loaded/);
    assert.ok(nodes.configuration.children.some(item => /Automatic scheduling.*disabled/.test(item.textContent)));
    nodes.blog.value = 'example';
    nodes.blog.events.change();
    assert.equal(nodes.save.disabled, false);
    assert.match(nodes.preview.textContent, /<script>untrusted<\/script>/);
    assert.equal(nodes['preview-link'].children[0].textContent, 'Invalid blog URL');
    nodes.due.value = '2099-07-15T10:30';
    nodes.editor.events.submit({ preventDefault() {} });
    await settle();
    const mutation = calls.find(call => call.options.method === 'POST');
    assert.equal(mutation.path, '/api/admin/schedule');
    assert.equal(mutation.options.credentials, 'same-origin');
    assert.deepEqual(mutation.options.headers, { 'Content-Type': 'application/json', 'X-Admin-Request': '1' });
    assert.equal(JSON.parse(mutation.options.body).dueAt, '2099-07-15T10:30:00.000Z');
    assert.equal(nodes.save.textContent, 'Save changes');
    state.posts[0].status = 'posted';
    nodes.refresh.events.click();
    await settle();
    assert.equal(nodes.save.disabled, true, 'Posted slug cannot be scheduled twice');
    state.posts[0].status = 'ambiguous';
    nodes.refresh.events.click();
    await settle();
    const retry = nodes.posts.querySelectorAll('button').find(button => button.textContent.includes('duplicate risk'));
    assert.ok(retry, 'Ambiguous posts expose explicit reconciliation');
    await retry.events.click();
    await settle();
    assert.match(confirmations.at(-1), /DUPLICATE POST RISK/);
    const reconciliation = calls.find(call => call.path.startsWith('/api/admin/reconcile/'));
    assert.deepEqual(JSON.parse(reconciliation.options.body), { resolution: 'retry' });
    assert.equal(nodes.save.textContent, 'Save changes');
    state.posts[0].status = 'blocked';
    nodes.refresh.events.click();
    await settle();
    const blockedActions = nodes.posts.querySelectorAll('button');
    assert.equal(blockedActions.length, 2, 'Blocked posts expose edit/cancel selection and retry, but not posted reconciliation');
    assert.ok(blockedActions.some(button => button.textContent === 'Select to edit / reschedule / cancel'));
    assert.equal(nodes.save.disabled, false, 'Blocked post can be edited after configuration recovery');
    assert.equal(nodes.cancel.hidden, false, 'Blocked post can be canceled');
    assert.match(nodes['duplicate-warning'].textContent, /Fix backend configuration before rescheduling/);
    const blockedRetry = blockedActions.find(button => button.textContent === 'Retry blocked post after recovery');
    assert.ok(blockedRetry);
    await blockedRetry.events.click();
    await settle();
    assert.match(confirmations.at(-1), /cause.*fixed/);
    assert.match(nodes.notice.textContent, /Blocked post explicitly returned to retry/);
    assert.equal(nodes.save.textContent, 'Save changes');
    state.posts[0].status = 'blocked';
    nodes.refresh.events.click();
    await settle();
    nodes.caption.value = 'Recovery caption after configuration correction';
    nodes.editor.events.submit({ preventDefault() {} });
    await settle();
    const blockedEdit = calls.find(call => call.options.method === 'PATCH');
    assert.equal(blockedEdit.path, '/api/admin/posts/example');
    assert.deepEqual(JSON.parse(blockedEdit.options.body), {
      caption: 'Recovery caption after configuration correction',
      dueAt: '2099-07-15T10:30:00.000Z',
    });
    nodes.cancel.events.click();
    await settle();
    const blockedCancel = calls.find(call => call.options.method === 'DELETE');
    assert.equal(blockedCancel.path, '/api/admin/posts/example');
    assert.deepEqual(JSON.parse(blockedCancel.options.body), {});
    assert.equal(nodes.save.disabled, true, 'Canceled blocked record keeps lifetime slug protection');
    assert.equal(nodes.cancel.hidden, true);
    denied = true;
    nodes.refresh.events.click();
    await settle();
    assert.equal(nodes['editor-fields'].disabled, true);
    assert.equal(nodes.preview.textContent, '');
    assert.match(nodes.notice.textContent, /401\/403/);
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
