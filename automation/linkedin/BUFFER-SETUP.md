# Buffer blog sharing — setup in your browser

Nothing is published by installing this change. No Cloudflare account, domain,
Wrangler, local CLI, or custom admin service is needed. Your public website is
unchanged; Buffer's dashboard is the scheduling interface.

## 1. Connect and identify your LinkedIn Page

1. In Buffer, connect the **LinkedIn company Page**, not your personal profile.
   Confirm the Page name/avatar and your permission to manage it.
2. Open Buffer **Settings → Organization** for the selected organization and
   **Settings → Channels** for the connected Page. Copy the organization and
   channel IDs if shown. A Page's dashboard URL may expose its channel/profile
   ID; use the actual ID, not the Page name or a LinkedIn organization URN.
3. If the dashboard hides the IDs, use Buffer's browser-based developer API
   explorer, linked from [Buffer's developer docs](https://buffer.com/developers).
   Run the read-only `account { organizations { id name } }` query, then
   `channels(input: { organizationId: "YOUR_ORGANIZATION_ID" }) { id name service }`.
   Match the organization and LinkedIn Page by name. Do not run `createPost`.
   Never paste an API key into chat, a GitHub issue, a URL, or a repository file.
   If no explorer is available in your account, ask Buffer support to identify
   these two non-secret IDs from your dashboard rather than guessing.

Use a **new, unexposed** Buffer API key. Revoke any key previously shared in chat.
In GitHub repository **Settings → Secrets and variables → Actions**, store the
key only as the repository secret `BUFFER_API_KEY` (already added if you completed
the earlier setup). No other service credentials are needed: Actions supplies
its own short-lived `GITHUB_TOKEN`.

## 2. Configure GitHub repository variables

Under **Secrets and variables → Actions → Variables**, add:

| Variable | Value |
| --- | --- |
| `BUFFER_ORGANIZATION_ID` | Organization ID from Buffer |
| `BUFFER_CHANNEL_ID` | Connected LinkedIn company Page's channel ID |
| `BUFFER_LINKEDIN_PAGE_CONFIRMED` | `true`, only after checking the company Page |
| `BUFFER_ENABLED` | `true` to allow this workflow to run |
| `BUFFER_LIVE_ENABLED` | Leave unset or `false` while reviewing previews |
| `BUFFER_RECONCILIATION_ENABLED` | Optional `true` for daily reconciliation |

Leave `BUFFER_ENABLED` unset to disable everything. Live posting requires an
explicit manual **live** selection or `BUFFER_LIVE_ENABLED=true` for automatic
runs. Keep that variable false until you have reviewed this PR and the previews.
The workflow only accepts this repository's successful main-branch Pages push
deployments, or manual runs on **main**. Scheduled runs are opt-in and once daily.

## 3. Preview, then initialize (no old-post backfill)

After merging, go to **Actions → Buffer blog queue → Run workflow**, select
**main**, and choose **dry-run**. Inspect the summary. Preview never creates a
Buffer post or writes the ledger. Dry-run can read state, and live URL validation
only contacts the fixed website origin without following redirects.

Next, run **initialize** once. It creates the isolated `buffer-ledger` branch,
containing only `ledger.json`, and marks **all current blog slugs as seen**.
It does not contact Buffer or queue any old blogs. Repeated initialization
does not reset existing state. If a live run encounters a missing ledger, it
only initializes the baseline and exits; it does not post.

Preview again after adding and deploying a genuinely new blog slug. Changes to
the title, excerpt, or body of a known slug do not queue it again. If satisfied,
manually choose **live**, or set `BUFFER_LIVE_ENABLED=true` to queue new blogs
after subsequent successful deployments. Buffer's `automatic` scheduling and
`addToQueue` mode use the schedule configured for your channel in Buffer.

## Safety and recovery

- Captions are plain-text title + excerpt + canonical blog URL, at most 3,000
  characters. Each URL must return successful HTML with the exact canonical
  link on `https://bluetick-health.co.za`; redirects are rejected.
- The ledger binds live processing to one organization/channel. Changing those
  variables is not a migration: automation fails closed on a target mismatch.
- Actions concurrency plus non-force Git ref updates prevent competing runs
  from owning the same intent. An intent is committed **before** `createPost`.
- Authentication failures, rate limits, and a full free-plan queue (10 waiting
  posts per channel) stop processing safely. Rate limits persist a cooldown;
  pending work is reconsidered by a later deployment/manual/daily run.
- Timeouts, unknown mutation errors, and crashes after submitting a mutation
  are **ambiguous**. `intent` or `ambiguous` entries are never automatically
  resubmitted. A state failure always stops submission; it never silently starts
  over or relies on an Actions cache/artifact.

For an uncertain outcome:

1. Disable `BUFFER_LIVE_ENABLED`. Inspect `buffer-ledger/ledger.json` in GitHub.
   Find the affected slug and target IDs. Do not delete the ledger or change
   its statuses by hand.
2. In Buffer, inspect **queue, drafts, and sent/history** for that exact blog URL
   and Page. An empty queue alone does **not** prove the post was never created.
3. Run the workflow on main with **reconcile**, the exact **slug**, and check the
   confirmation box. Choose:
   - **queued**: supply the Buffer **post ID**. The read-only posts query must
     verify that post and its saved caption hash before recording it as queued.
   - **skip**: suppress this slug permanently when already handled manually or
     when you do not want to share it.
   - **retry**: only after positively confirming no matching queued, draft, or
     sent post exists. This changes it to pending; it does **not** submit a post.
     A separate live run is required.
4. For failed queued reconciliation (for example, the API no longer returns an
   old sent post), use **skip** after checking Buffer history. Never use retry
   simply because a read query returned no results.

Protect the `buffer-ledger` branch from deletion and keep its history. If it is
lost, missing state deliberately re-baselines current blogs, never backfills.
Restore it from known good Git history if you need pending/ambiguous recovery.
Repository rules must allow Actions to update this branch; no PAT is needed.
Permission/ruleset errors are reported safely without response bodies or tokens.

To stop automation, set `BUFFER_ENABLED=false` (or disable the workflow in
Actions). Posts already in Buffer remain there: remove/cancel them in Buffer.
Deleting GitHub configuration does not cancel Buffer posts.

## Review checks

Mock tests make no external requests. The separate **Buffer mock-only regression
tests** workflow runs `node --test automation/linkedin/*.test.mjs`, the existing
website build, and lint. Public-file SHA-256 fixtures verify the website and
Pages workflow remain byte-for-byte identical. No extra npm packages are added.
