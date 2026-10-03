import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const workflow = await readFile(new URL('../../.github/workflows/buffer-posts.yml', import.meta.url), 'utf8')
const tests = await readFile(new URL('../../.github/workflows/buffer-tests.yml', import.meta.url), 'utf8')

test('deployment trigger is restricted to successful trusted main Pages push deployments', () => {
  for (const guard of [
    'workflows: ["Deploy website to GitHub Pages"]', 'types: [completed]', 'branches: [main]',
    "github.repository_id == '1244513897'", "github.event.workflow_run.conclusion == 'success'",
    "github.event.workflow_run.event == 'push'", "github.event.workflow_run.head_branch == 'main'",
    'github.event.workflow_run.head_repository.id == 1244513897', 'ref: main',
  ]) assert.ok(workflow.includes(guard), guard)
})

test('disabled default, explicit live/manual gates, daily optional reconciliation and shared serialization', () => {
  for (const guard of [
    "vars.BUFFER_ENABLED == 'true'", 'default: dry-run', 'default: false',
    "github.ref == 'refs/heads/main'", "vars.BUFFER_LIVE_ENABLED == 'true'",
    "vars.BUFFER_RECONCILIATION_ENABLED == 'true'", 'cron: "17 7 * * *"',
    'group: buffer-blog-ledger', 'cancel-in-progress: false', 'timeout-minutes: 10',
  ]) assert.ok(workflow.includes(guard), guard)
})

test('credentials are environment-only and no event payload is interpolated into executable shell', () => {
  assert.ok(workflow.includes('BUFFER_API_KEY: ${{ secrets.BUFFER_API_KEY }}'))
  assert.ok(workflow.includes('GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}'))
  assert.ok(workflow.includes('persist-credentials: false'))
  assert.match(workflow, /run: node automation\/linkedin\/run\.mjs\n\s+env:/)
  assert.doesNotMatch(workflow, /run:.*\$\{\{/)
  assert.doesNotMatch(workflow, /pull_request_target|wrangler|LINKEDIN_ACCESS_TOKEN|curl|echo/)
  assert.ok(workflow.includes('contents: write'))
})

test('PR checks use mocks with read-only permissions and no Buffer credentials', () => {
  assert.ok(tests.includes('pull_request:'))
  assert.ok(tests.includes('node --test automation/linkedin/*.test.mjs'))
  assert.ok(tests.includes('contents: read'))
  assert.doesNotMatch(tests, /contents: write|secrets\.|run\.mjs|backend\//)
})
