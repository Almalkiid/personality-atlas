import { h } from '../dom.js';
import { sources } from '../content/sources.js';
import { loadNorms } from '../data.js';

const fmt = n => n.toLocaleString('en-US');
const cite = key => h('a', { href: sources[key].url, target: '_blank', rel: 'noopener' }, sources[key].citation);

export function render(root, ctx) {
  const nNeo = h('span', '…'), nB5 = h('span', '…');
  loadNorms('ipipneo120').then(n => { nNeo.textContent = fmt(n.meta.nTotal); }).catch(() => {});
  loadNorms('ipip50').then(n => { nB5.textContent = fmt(n.meta.nTotal); }).catch(() => {});
  root.append(h('article.method.fade-in.stack',
    h('p.eyebrow', 'Personality Atlas'),
    h('h1', 'Method & sources'),
    h('p.lede', 'Everything this site measures and compares comes from published, peer-reviewed or openly documented research.'),
    h('h2', 'The questionnaires'),
    h('ul',
      h('li', h('strong', 'Quick (50 statements). '), 'The IPIP Big-Five Factor Markers by Lewis Goldberg. Items and scoring key are copied unchanged from the International Personality Item Pool, which places them in the public domain.'),
      h('li', h('strong', 'In-depth (120 statements). '), 'John A. Johnson’s IPIP-NEO-120. It measures the five domains and 30 facets (four statements each). Items and key are taken from Johnson’s official item key.')),
    h('p', 'Both use the same five answer options, from “Very inaccurate” to “Very accurate”. Reverse-worded statements are flipped before adding up. The Quick test’s official “Emotional Stability” scale is reported as its mirror image, Neuroticism (exactly 60 minus the stability score), so both tests describe the same direction.'),
    h('h2', 'How you are compared'),
    h('ul',
      h('li', 'In-depth: ', nNeo, ' people from Johnson’s research dataset who answered all 120 statements (619,150 took part; those who skipped any statement were left out, because this site also asks you to answer every one).'),
      h('li', 'Quick: ', nB5, ' people aged 13 and over from the Open-Source Psychometrics Project’s dataset for the same 50 statements. That site used “Disagree … Agree” labels rather than “Inaccurate … Accurate”.')),
    h('p', 'If you share your age and sex, you are compared with people of the same age band and sex. A group needs at least 500 people; otherwise we use your age band, then (for ages 10–13) the 14–17 group, then everyone of your sex, then everyone. The report always says which group was used.'),
    h('p', 'Your percentile is the share of the comparison group who scored lower than you, plus half of those who scored the same. Below 30 is shown as Low, 30–70 as Average, above 70 as High.'),
    h('h2', 'What the report text is based on'),
    h('p', 'The “In research” lines come only from associations that replicated in Christopher Soto’s large, preregistered Life Outcomes of Personality Replication Project. They are average tendencies across many people (correlations of roughly 0.15–0.55), not predictions about any one person.'),
    h('h2', 'Limits'),
    h('ul',
      h('li', 'This is not a clinical assessment and cannot diagnose anything.'),
      h('li', 'Both comparison datasets were collected online and are not perfectly representative of any country.'),
      h('li', 'Self-reports are less reliable before the mid-teens; ages 10–13 see a note in their report. Under 10s are not tested.'),
      h('li', 'Your results reflect how you see yourself today. Personality changes gradually across life.')),
    h('h2', 'Privacy'),
    h('p', 'There are no accounts, cookies or analytics. Your answers are stored only in this browser so you can resume, and are deleted when you choose “Start again”. At the end of the report you may choose to send your name (required), email (optional), age band, sex, answers and scores to the researcher’s private spreadsheet. Nothing is sent unless you press Send; under-18s need a parent or guardian’s consent. The results are used only for the researcher’s own insight and are not published or shared.'),
    h('h2', 'Sources'),
    h('ol', Object.keys(sources).map(k => h('li', cite(k)))),
    h('div.actions', h('button.btn', { type: 'button', onclick: () => ctx.go('home') }, '← Back to start'))));
}
