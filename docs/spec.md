# Personality Atlas 0.2 — Spec

Agreed with Ed, 16 Nov 2026.

## Purpose
A free, public, English-only Big Five personality site. It is a portfolio piece that has to prove **product and design polish**, with accuracy that holds up to expert review.

## Tests offered
| Name | Instrument | Items | Scores | Licence |
|---|---|---|---|---|
| Quick | IPIP Big-Five Factor Markers (Goldberg 1992), IPIP-50 | 50 | 5 domains | Public domain, ipip.ori.org |
| In-depth | IPIP-NEO-120 (Johnson 2014) | 120 | 5 domains + 30 facets | Public domain, ipip.ori.org |
| Standard | BFI-2 (Soto & John 2017) | 60 | — | **Not shipped.** Non-commercial only; added only if the authors give written permission. |

Items and keys come only from the official sources: the ipip.ori.org key for IPIP-50, and Johnson's OSF `IPIP-NEO-ItemKey.xls` for IPIP-NEO-120. Item wording is never edited.

## Who can take it
- **Ages 10 and up.** Under 10: a friendly "this test is for ages 10 and up" screen, with no test. Self-report is valid from about age 10 (Soto, John, Gosling & Potter 2008, JPSP 94, 718–737).
- **Ages 10–13:** use the In-depth test, with norms from the youngest band that has enough people. Their report carries a visible note that results at this age are less reliable.
- **About you (optional):** age band and sex. If given, compare with matched norms; otherwise with the whole sample. Age is asked when it is needed for the under-10 gate.

## Accuracy
- Percentiles come from **empirical norms**, never from the midpoint of the scale.
  - IPIP-50: Open-Source Psychometrics `BIG5` dataset, N = 19,719 (same 50 items; ages 13+; gender).
  - IPIP-NEO-120: Johnson's `IPIP120.dat`, N = 619,150 (age, sex).
- Norm groups are age band × sex, with a minimum cell size. Groups too small fall back to age band only, then to the whole sample. The report states which group was used and its N.
- Bands: Low < 30th percentile, Average 30–70, High > 70.
- A method page cites every source and states the caveats:
  - the data are online samples;
  - the BIG5 response labels were Disagree…Agree;
  - 10–13 norms;
  - this is not a clinical assessment.

## Report
- A summary chart of five percentile bars.
- Per domain: what the score suggests, strengths, watch-outs and tips. Facets with a short description each (In-depth only).
- The text is written fresh, in plain English, with "your answers suggest…" wording. Outcome claims are sourced only from: Soto 2019 (*Psych Science* 30:711), Ozer & Benet-Martínez 2006 (*Annu Rev Psych* 57:401), Roberts et al. 2007 (*Persp Psych Sci* 2:313) and Soto 2021.
- Ages 10–17 get gentler wording, with no "watch-outs" label.
- **Keep / share:**
  - "Save as PDF" uses the print stylesheet and runs on the device.
  - "Share image" is a canvas PNG made on the device, using navigator.share where available, otherwise a download.
  - Answers never leave the browser.

## Experience
- Apple-clean visuals: Flashcard Studio's tokens (SF font stack, soft surfaces, 7% borders, 14–24 px radii, one blue accent, dark mode).
- Choosing an answer moves to the next statement automatically. Keys 1–5 answer, Backspace goes back. Progress is saved in localStorage and offered for resume.
- WCAG AA contrast and keyboard-complete. Large tap targets suit older users.

## Release
- Version 0.2.0, MIT licence (code), README with screenshots, GitHub Pages.
- The repo goes public only after Ed confirms at that moment.
