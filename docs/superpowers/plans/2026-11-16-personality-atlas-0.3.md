# Personality Atlas 0.3 Implementation Plan — named results to Ed's Google Sheet

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use `- [ ]`.

**Goal:** After seeing their report, a person can choose to send their named result to Ed's private Google Sheet. Name is required and email optional. Under-18s can send only with a parent's consent. The four deferred 0.2 minors are also fixed.

**Architecture:**
- **Server:** a container-bound Apps Script on a new Google Sheet ("Personality Atlas — Results"), deployed as a web app (`ANYONE_ANONYMOUS`, `USER_DEPLOYING`). This copies the Edison Practice Papers pattern.
- **`doPost`:** validates the payload, then `appendRow`s under `LockService`, and returns `{ok}` or `{ok:false,error}`.
- **Client:** a submit card at the end of the report. It POSTs `text/plain` JSON to the `/exec` URL kept in `js/config.js`.

**Spec (decisions by Ed, 16 Nov 2026):**
- Named results.
- Name mandatory, email optional.
- Under 18: parent consent required (parent name required, parent email optional).
- Storage: private Google Sheet.
- Purpose: personal insight only, not published.
- The test itself still runs fully on the device. Data leaves only on an explicit "Send".

## Global Constraints
- Nothing is sent without the visitor pressing **Send**, with the consent box ticked.
- If no age band was given, the form asks "Are you 18 or over?" (yes/no) before sending.
- Under-18s (band `10-13`/`14-17`, or "No"): the parent's name and the parent consent tick are required.
- Server rejects: missing name, or a name over 100 characters; email over 200 characters; an invalid instrument; an answer count ≠ the item count; answers not 1–5; a missing consent; a minor without a parent; any filled honeypot field `website`; a body over 20 kB.
- Sheet columns, in order: `received_at, app_version, instrument, name, email, adult, age_band, sex, parent_name, parent_email, consent_version, norm_group, E_pct, A_pct, C_pct, N_pct, O_pct, E_raw, A_raw, C_raw, N_raw, O_raw, facets_pct_json, answers`
- `CONSENT_VERSION = '2026-11-16'`
- The site copy changes from "never leave this device" to "stay on this device unless you choose to send them".
- Version `0.3.0` (new feature).
- Commits as Almalkiid noreply.
- No AI attribution.

## Review Focus
1. **Double-click Send:** must produce one row. → Task 2 e2e `send twice creates one submission`
2. **A network failure:** must show the error and a copyable record, with nothing lost. → Task 2 e2e `failed send shows copyable record`
3. **A minor without parent consent:** blocked on the client AND the server. → Task 1 test `validate rejects minor without parent`; Task 2 e2e
4. **Large or hostile input:** server-side length checks; the sheet stores text only (prefix `'` when a value starts with `=+-@`, against formula injection). → Task 1 test `cell values are formula-safe`
5. **Email optional:** an empty string is accepted. → Task 1 test

---

### Task 1: Server validation + Apps Script project
**Files:** create `server/Code.js`, `server/appsscript.json`, `server/validate.js` (pure; shared by the Node tests and the Apps Script copy), `tests/validate.test.mjs`
- [ ] RED tests:
  - `validate accepts a complete adult record`;
  - `email optional`;
  - `rejects missing name`;
  - `rejects minor without parent`;
  - `rejects wrong answer count`;
  - `rejects honeypot`;
  - `cell values are formula-safe` (a name `=HYPERLINK(...)` is stored as `'=HYPERLINK(...)`);
  - `row has the 24 columns in order`.
- [ ] Implement `validateSubmission(p, itemCounts) -> {ok, error?}` and `toRow(p, now) -> string[]`. These go in `server/validate.js` as plain functions with no `import`/`export`, so the file can be pushed to Apps Script as-is. Node tests load it through `vm`.
- [ ] `Code.js`: `doPost(e)` → size check → parse → validate → `LockService.getScriptLock().waitLock(10000)` → `appendRow(toRow)`. Header row on first use. `doGet` returns `{ok:true, service:'personality-atlas'}` (health check).
- [ ] Create the Sheet + bound script with `clasp create --type sheets`, push, and deploy. Record the `/exec` URL. Smoke-test with curl: the GET health check; a POST of a test record, read back and then deleted.
- [ ] Commit.

### Task 2: Submit card in the report
**Files:** create `js/config.js` (`ENDPOINT`, `CONSENT_VERSION`), `js/submit.js`, `tests/e2e/submit.spec.mjs`; modify `js/views/report.js`, `css/styles.css`
- [ ] RED e2e tests. The endpoint is stubbed with `page.route`; no real sheet writes in the tests.
  - `adult sends name only`: the payload has name, empty email, adult true, 50 answers, and percentiles.
  - `send disabled until name and consent`;
  - `minor must give parent name and parent consent`: band 14-17;
  - `no age → asks 18 or over`;
  - `send twice creates one submission`;
  - `failed send shows copyable record`.
- [ ] Implement the card:
  - title "Send your results to the researcher";
  - one-paragraph plain notice: what is sent (name, optional email, age band, sex, answers, scores), why (the researcher's personal insight; not published or shared), and that it can't be deleted from here, so the visitor should contact the researcher to remove it;
  - fields, the consent checkbox, the parent block when the visitor is a minor, the honeypot, Send.
  - States: idle, sending, sent ✓ (the form is replaced), and error (with a `<details>` holding the raw JSON and a Copy button).
- [ ] Commit.

### Task 3: Privacy copy + deferred 0.2 minors
**Files:** modify `index.html`, `js/views/home.js`, `js/views/method.js`, `js/store.js`, `js/views/report.js`, `js/views/home.js`; tests in `tests/store.test.mjs`, `tests/e2e/flow.spec.mjs`
- [ ] RED tests:
  - `stale index or bad answer values are discarded` (store);
  - `report does not paint over another view` (navigate to #method before the norms resolve, using a delayed route);
  - `starting another test asks before discarding progress`;
  - `facet at p=50 shows neither extreme`: the average text is "About as common as typical".
- [ ] Implement:
  - The store validates `index` and the answer values.
  - The report gets a `cancelled` flag that the cleanup sets.
  - Home asks `confirm`-style through an inline card, not `window.confirm`.
  - Facet text: below 30 low, above 70 high, otherwise "Typical for your comparison group".
  - Privacy wording on home, footer and the Method page.
- [ ] Commit.

### Task 4: Release
- [ ] Full suite.
- [ ] Real-browser check of the send flow against the REAL endpoint with one test record, then delete that row.
- [ ] Bump to `0.3.0`, update the README Privacy section, merge to `main`, tag, release.
- [ ] Verify live: run a Quick test on GitHub Pages, send one record, confirm the row appears in the Sheet, delete the test row.
