# Personality Atlas 0.2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the 0.10 IPIP-50 page into a research-grade, Apple-clean Big Five site. It offers two public-domain tests with empirical age- and sex-matched percentiles, a full sourced report, and a PDF and share image made on the device.

**Architecture:**
- Static site, no build step, native ES modules, zero runtime dependencies. Served by GitHub Pages; locally by `python3 -m http.server`.
- Norm tables are precomputed once from the raw research datasets by `scripts/build-norms.mjs`. Only the resulting JSON summaries are committed, never the raw data.
- Pure logic (`js/scoring.js`, `js/norms.js`) is unit-tested with `node:test`. The UI is tested end-to-end with Playwright, using the cached Chromium.

**Tech Stack:** HTML, CSS, vanilla JS (ES2022 modules), Node 22 `node:test`, `@playwright/test` (dev only), Python 3 + `xlrd` (one-time key extraction).

**Spec:** `docs/spec.md`

## Global Constraints
- Item wording is copied verbatim from the official sources; never edited.
- No runtime dependencies, no analytics, no network calls after page load. Answers never leave the browser.
- Raw datasets (`IPIP120.dat`, `BIG5/data.csv`) are never committed; they are listed in `.gitignore` under `raw/`.
- Bands: Low < 30, Average 30–70 (inclusive), High > 70 (percentile).
- Minimum norm cell size: 500. Fallback order: age band × sex → age band → all.
- Age bands: `10-13`, `14-17`, `18-24`, `25-34`, `35-44`, `45-54`, `55-64`, `65+`. Under 10 is gated out.
- Version `0.2.0`. Licence MIT (code). Design tokens copied from `~/Projects Apps/flashcard-studio/styles.css` `.fs-studio` / `.theme-dark .fs-studio`.
- Report wording: "your answers suggest…". Outcome claims only from the four sources in the spec. Ages 10–17: gentle variant, no "watch-outs" label.

## Review Focus
1. **Reverse-keyed items:** the IPIP-120 raw data are already reverse-recoded, but live answers are not. Scoring live answers must flip `minus` items, while norm building must NOT flip again. → Task 4 test `norms raw data not double-reversed`.
2. **Neuroticism direction across tests and data:** both tests report N as Neuroticism. Norms for both must be built in that same direction. → Task 4 test `ipip50 N direction matches app` (an all-calm answer pattern lands below the 10th percentile on N).
3. **Missing answers (0) in the raw data:** cases with any 0 are excluded, and the exclusion counts are recorded in the norms JSON `meta`. → Task 4.
4. **Resume after refresh with a different test or a changed item count:** discard stale saved progress, don't crash. → Task 5 test `stale progress is discarded`.
5. **Age not given, or under 10:** no age skips matching; under 10 blocks the start. Age 10–13 forces In-depth plus the caution. → Task 5 e2e tests.

---

### Task 1: Project shell and design system

**Files:**
- Create: `package.json`, `.gitignore`, `css/styles.css`, `tests/smoke.test.mjs`
- Modify: `index.html` (rewrite as a module shell)

- [ ] **Step 1:** Create `package.json`: `"type":"module"`, version `0.2.0`, scripts `test` = `node --test tests/`, `e2e` = `playwright test`, `serve` = `python3 -m http.server 8765`. Dev dependency `@playwright/test`, pinned to the version whose Chromium is already cached.
- [ ] **Step 2:** `css/styles.css`:
  - `:root` tokens copied verbatim from the Flashcard Studio `.fs-studio` block, with the `--fs-` prefix renamed to `--pa-`.
  - The dark set goes under `@media (prefers-color-scheme: dark)`.
  - Layout: centred 680 px column, 16 px side gutter on phones, cards on `--pa-surface`, buttons at least 48 px tall.
  - `@media print` rules hide controls (used in Task 8).
- [ ] **Step 3:** `index.html`:
  - header wordmark;
  - `<main id="app">` (focus target);
  - footer link "Method & sources";
  - `<script type="module" src="js/app.js">`.
- [ ] **Step 4:** Run `npm test`. Expected: the smoke test passes, asserting that `package.json` version is `0.2.0`.
- [ ] **Step 5:** Commit `chore: project shell and Flashcard Studio design tokens`.

### Task 2: Instrument definitions and scoring

**Files:**
- Create: `js/instruments/ipip50.js` (from the existing `items.js`), `js/scoring.js`, `tests/scoring.test.mjs`
- Delete: `items.js`

**Interfaces — Produces:**
- `Instrument = { id:'ipip50'|'ipipneo120', name, minutes, items:[{id, text, domain:'E'|'A'|'C'|'N'|'O', facet?:number, keyed:'plus'|'minus'}], domains:[{id, name}], facets?:[{domain, facet, name}] }`
- `scoreAnswers(instrument, answers:number[]) -> { domains: {E:{raw,min,max},…}, facets?: {'E1':{raw,min,max},…} }`. It throws on an incomplete or out-of-range answer set and flips `minus` items as `6-v`.
- Reporting direction: both tests report domain `N` = Neuroticism (high = more easily upset), because the IPIP-NEO-120 and its facets are keyed that way. The IPIP-50's official Emotional Stability key is therefore stored inverted (every ES item's `keyed` flipped). This is an exact transform (N raw = 60 − ES raw), and the Method page states it.

- [ ] **Step 1:** Write failing tests:
  - `ipip50 has 10 items per domain`;
  - `ipip50 key matches official`: per-domain plus/minus counts E 5/5, A 6/4, C 6/4, O 7/3, and N 8/2 (= official ES 2/8 inverted);
  - `all-5 answers give E raw 30` (5×5 + 5×1);
  - `incomplete answers throw`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: instrument model and scoring`.

### Task 3: IPIP-NEO-120 official key

**Files:**
- Create: `scripts/extract_neo120_key.py`, `js/instruments/ipipneo120.js` (generated, committed), `tests/neo120.test.mjs`

- [ ] **Step 1:** Download `IPIP-NEO-ItemKey.xls` (https://osf.io/download/yk3fd/) and the IPIP-NEO-120 Scoring Tool (https://osf.io/download/qza3d/) into `raw/`.
- [ ] **Step 2:** The script uses xlrd to read the item text, keying, facet, and the item's position in `IPIP120.dat` order (I1–I120). It writes `ipipneo120.js` with the 30 facet names as Johnson labels them.
- [ ] **Step 3:** Write tests:
  - `120 items, 24 per domain, 4 per facet`;
  - `item order matches IPIP120.dat I1..I120`;
  - `text and keying agree with the alheimsins cross-check copy` (a fixture snapshot of the 120 English items in `tests/fixtures/`). Any disagreement is investigated against Johnson (2014) Table 1, never auto-resolved.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: IPIP-NEO-120 items from Johnson's official key`.

### Task 4: Empirical norms

**Files:**
- Create: `scripts/build-norms.mjs`, `data/norms-ipip50.json`, `data/norms-ipipneo120.json`, `js/norms.js`, `tests/norms.test.mjs`

**Interfaces — Produces:**
- Norms JSON: `{ meta:{source, citation, nTotal, excluded:{missing, ageOutOfRange}, bands, minCell}, groups:{ "<band>|<sex>": { n, scales:{ "<scaleId>": { min, counts:number[] } } } } }`. Here `sex` ∈ `m|f|any` and band ∈ the bands or `all`. `counts[i]` is the number of people with raw score `min+i`.
- `percentile(scale:{min,counts}, raw) -> number`, using the mid-rank (below + ½·equal) / N × 100, rounded to an integer and clamped to 1–99.
- `pickGroup(norms, {band?, sex?}) -> { key, n, fallback:boolean }`, following the fallback order in Global Constraints.
- `band(percentile) -> 'low'|'average'|'high'`.

- [ ] **Step 1:** Write tests:
  - `percentile of median is ~50` (synthetic counts);
  - `pickGroup falls back when n<500`;
  - `band cut points 29→low, 30→average, 70→average, 71→high`;
  - `norms raw data not double-reversed` (for a known record in `IPIP120.dat`, the script's sum equals the hand sum of its stored values);
  - `ipip50 N direction matches app` (scoring an all-calm answer pattern lands below the 10th percentile on N).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** `build-norms.mjs`:
  - **`IPIP120.dat`:** parse with the fixed-width layout from DAT120.doc (SEX col 7, AGE 8–9, I1 at col 32). Exclude any case with an item = 0 or age < 10. Sum the stored values per facet and domain with no reversal. Build all age band × sex groups, plus band-only and `all|any`.
  - **`BIG5/data.csv`:** tab-separated. Map E1..O10 onto the IPIP-50 items by text match against `ipip50.js`, failing hard on any unmatched item. Apply the official keying (these raw values are not reversed). Exclude any 0 or age outside 13–99. Gender: 1 → m, 2 → f, 3 or 0 → `any` only.
  - Record exclusions and the cell `n`s in `meta`.
  - Print a summary table: cell `n` per band × sex, and how many cells fall back.
- [ ] **Step 4:** Run `node scripts/build-norms.mjs`, then `npm test`. Expected: PASS. Check the printed cell table: report the actual Ns of the `10-13` and `65+` cells to Ed.
- [ ] **Step 5:** Commit `feat: empirical norm tables from Johnson 2014 and OSPP BIG5`, including the JSON only.

### Task 5: Flow — home, test picker, about you, questions

**Files:**
- Create: `js/app.js`, `js/views/home.js`, `js/views/about.js`, `js/views/question.js`, `js/store.js`, `tests/store.test.mjs`, `tests/e2e/flow.spec.mjs`, `playwright.config.mjs`

**Interfaces — Produces:**
- `store.load(instrumentId) -> {answers, index} | null`. It returns null and clears the save when the saved item count ≠ the instrument's item count.
- `store.save(instrumentId, state)` and `store.clear(instrumentId)`, all wrapped in try/catch.
- Views are `render(root, ctx)` functions; `ctx = {instrument, profile:{band?, sex?}, go(viewName, patch)}`.

- [ ] **Step 1:** Write the unit test `stale progress is discarded`. Write e2e tests:
  - `under 10 sees the age gate and cannot start`;
  - `10-13 is routed to In-depth with caution flag`;
  - `key 3 answers and auto-advances`;
  - `refresh offers resume at the same statement`;
  - `skipping about-you still reaches results`, which answers all 50 via keys.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement:
  - The home screen shows two test cards: Quick (≈6 min) and In-depth (≈15 min).
  - About you: an optional age band select (including "Under 10") and sex (Female / Male / Prefer not to say), with a single "Continue".
  - Questions: one statement per screen, 5 large choices, auto-advance after 180 ms, keys 1–5, Backspace or a Back button, a slim progress bar, and a focus-managed `h1`.
- [ ] **Step 4:** Run `npm test && npm run e2e`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: test picker, optional profile, fast question flow with resume`.

### Task 6: Report content (sourced)

**Files:**
- Create: `js/content/report-text.js`, `js/content/sources.js`, `tests/content.test.mjs`

**Interfaces — Produces:**
- `sources = { soto2019:{citation, url}, ozer2006:{…}, roberts2007:{…}, soto2021:{…}, johnson2014:{…}, goldberg1992:{…}, soto2008:{…}, ospp:{…} }`
- `reportText[domain] = { name, oneLine, bands:{low,average,high}:{adult, youth}, strengths:{low,high}, watchOuts:{low,high}, tips:{low,high}, outcomes:[{text, source:'soto2019'|…}], facets:{ <n>:{name, low, high} } }`

- [ ] **Step 1:** Write tests:
  - `every domain has all bands for adult and youth`;
  - `every outcomes entry cites a known source key`;
  - `no text contains 'neurotic', 'disorder', 'diagnos'`;
  - `all 30 facets have text`.
- [ ] **Step 2:** Write the content:
  - Pull each outcome claim from the source text itself. Download and read the Soto 2019 PDF before writing; claims not found in a source are dropped.
  - Facet descriptions are written fresh from the facet definitions in Johnson (2014). Do not copy the alheimsins/IPIP-NEO narrative text.
- [ ] **Step 3:** Run `npm test`. Expected: PASS.
- [ ] **Step 4:** Commit `feat: sourced report content`.

### Task 7: Report view and Method page

**Files:**
- Create: `js/views/report.js`, `js/views/method.js`, `tests/e2e/report.spec.mjs`

- [ ] **Step 1:** Write e2e tests:
  - `report shows 5 domain percentiles and the norm group with N`;
  - `in-depth report shows 30 facets`;
  - `youth report shows the reliability note and no 'Watch-outs' label`;
  - `method page lists every source with a link`.
- [ ] **Step 2:** Implement the report:
  - **Hero:** "Your personality profile", test name, date, and the norm group line, e.g. "Compared with 41,203 women aged 25–34".
  - **Summary chart:** an SVG of five horizontal bars on 0–100, with the 30–70 average zone shaded and the percentile at the end of each bar.
  - **One card per domain:** percentile, band chip, text, strengths, watch-outs (adult only), tips, facet mini-bars, and an "In research" line with its citation.
  - **Method page:** instruments, norm datasets with N, the percentile method, cut points, caveats, and the full source list.
- [ ] **Step 3:** Run `npm run e2e`. Expected: PASS.
- [ ] **Step 4:** Commit `feat: report and method pages`.

### Task 8: Save as PDF and share image

**Files:**
- Create: `js/share-card.js`, `tests/e2e/share.spec.mjs`
- Modify: `css/styles.css` (`@media print`), `js/views/report.js` (buttons)

**Interfaces — Produces:**
- `renderCard(result, {theme:'light'}) -> Promise<Blob>`: a 1080×1350 PNG with the wordmark, the five bars and percentiles, the test name and the date. No answers or profile data are printed beyond the norm group label.

- [ ] **Step 1:** Write e2e tests:
  - `share image downloads a 1080x1350 png`;
  - `print media hides buttons and shows all cards expanded`, using `page.emulateMedia({media:'print'})`.
- [ ] **Step 2:** Implement:
  - The PDF button calls `window.print()`. The print CSS gives A4, white background, avoids page breaks inside cards, and adds a footer with the source line.
  - The share button calls `navigator.share({files})` when it is supported, otherwise downloads `personality-atlas.png`.
- [ ] **Step 3:** Run `npm run e2e`. Expected: PASS.
- [ ] **Step 4:** Commit `feat: on-device PDF and share image`.

### Task 9: Real-browser verification, docs and release prep

**Files:**
- Create: `LICENSE` (MIT), `docs/screenshots/*.png`, `docs/bfi2-permission-email.md`
- Modify: `README.md`

- [ ] **Step 1:** Serve locally and run the full flow in real Chromium, light and dark, at desktop 1280 px and phone 390 px. Save the screenshots into `docs/screenshots/`. Fix any visual defect found, re-running the tests after each fix.
- [ ] **Step 2:** Hand-verify the numbers once: compute one known answer pattern by hand (raw sum → counts lookup) and check that it equals the percentile shown on screen.
- [ ] **Step 3:** Rewrite the README:
  - what it is, with screenshots;
  - the two tests;
  - accuracy and method in brief, plus sources;
  - privacy;
  - how to run it locally.
- [ ] **Step 4:** Draft `docs/bfi2-permission-email.md`, addressed to Soto & John (ucbpersonalitylab@gmail.com) for Ed to review and send. It is never sent by an agent.
- [ ] **Step 5:** Run `npm test && npm run e2e`. Expected: all pass. Commit `docs: README, licence, screenshots, BFI-2 permission draft`.
- [ ] **Step 6:** Whole-branch review by one fresh reviewer, then fix every Critical/Important finding.

### Task 10: Publish (Ed confirms first)
- [ ] Merge to `main`, tag `0.2.0`, publish the GitHub release.
- [ ] **Ask Ed**, then make the repo public and enable Pages (source `main`, `/`).
- [ ] Open the live URL in the browser and repeat a short full run. Report the link.
