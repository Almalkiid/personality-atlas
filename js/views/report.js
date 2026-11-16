import { h } from '../dom.js';
import { scoreAnswers } from '../scoring.js';
import { percentile, pickGroup, band } from '../norms.js';
import { reportText } from '../content/report-text.js';
import { sources } from '../content/sources.js';
import { loadNorms } from '../data.js';
import { renderCard } from '../share-card.js';
import { renderSubmitCard } from '../submit.js';

const ORDER = ['E', 'A', 'C', 'N', 'O'];
const BAND_LABEL = { low: 'Low', average: 'Average', high: 'High' };
const fmt = n => n.toLocaleString('en-US');

export function groupLabel(key, n) {
  const [b, s] = key.split('|');
  const who = s === 'f' ? 'women' : s === 'm' ? 'men' : 'people';
  const age = b === 'all' ? 'of all ages' : b === '65+' ? 'aged 65 and over' : `aged ${b.replace('-', '–')}`;
  return `Compared with ${fmt(n)} ${who} ${age}`;
}

export function computeResult(inst, answers, profile, norms) {
  const raw = scoreAnswers(inst, answers);
  const group = pickGroup(norms, profile);
  const scales = norms.groups[group.key].scales;
  const domains = ORDER.map(id => {
    const p = percentile(scales[id], raw.domains[id].raw);
    return { id, raw: raw.domains[id].raw, percentile: p, band: band(p) };
  });
  const facets = raw.facets ? Object.fromEntries(Object.entries(raw.facets).map(([k, v]) => [k, percentile(scales[k], v.raw)])) : null;
  return { instrument: inst, group, domains, facets, date: new Date() };
}

const bar = (p, color, cls = '') => h(`div.bar-track${cls}`, h('span.avg'), h('span.fill', { style: `width:${p}%;background:${color}` }));

export function render(root, ctx) {
  const inst = ctx.instrument;
  const { answers, profile } = ctx.state;
  const youth = profile.band === '10-13' || profile.band === '14-17';
  root.append(h('p.muted', 'Calculating your profile…'));

  loadNorms(inst.id).then(norms => {
    const result = computeResult(inst, answers, profile, norms);
    ctx.state.result = result;
    const dateText = result.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const domainName = id => reportText[id].name;

    const summary = h('section.card.summary', { 'aria-label': 'Summary' },
      h('div.bars', result.domains.map(d => h('div.bar-row',
        h('span.label', domainName(d.id)),
        bar(d.percentile, `var(--pa-${d.id})`),
        h('span.pct', String(d.percentile))))),
      h('div.legend', h('span', 'Lower'), h('span', 'Typical range (30–70)'), h('span', 'Higher')));

    const cards = result.domains.map(d => {
      const t = reportText[d.id];
      const side = d.band === 'average' ? null : d.band;
      const list = (title, items) => h('div', h('h3', title), h('ul', items.map(x => h('li', x))));
      return h('section.card.domain-card', { 'aria-labelledby': `h-${d.id}` },
        h('div.domain-head',
          h('div', h('h2', { id: `h-${d.id}` }, t.name), h('p.small', t.alias ? `${t.oneLine} (${t.alias})` : t.oneLine)),
          h('div.score', h('div.big', String(d.percentile), h('small', 'percentile')), h(`span.chip.chip-${d.band}`, BAND_LABEL[d.band]))),
        bar(d.percentile, `var(--pa-${d.id})`),
        h('p.lead', t.bands[d.band][youth ? 'youth' : 'adult']),
        side ? h('div.cols',
          list('Strengths', t.strengths[side]),
          list(youth ? 'Worth knowing' : 'Watch-outs', t.watchOuts[side]),
          list('Tips', t.tips[side])) : h('div.cols',
          list('Strengths', [t.strengths.low[0], t.strengths.high[0]]),
          list('Tips', [t.tips.low[0], t.tips.high[0]])),
        result.facets ? h('div.facets', h('h3.eyebrow', 'Facets'), inst.facets.filter(f => f.domain === d.id).map(f => {
          const p = result.facets[f.domain + f.facet];
          const ft = t.facets[f.facet];
          return h('div.facet', h('span.name', ft.name), bar(p, `var(--pa-${d.id})`), h('span.pct', String(p)), h('span.desc', p < 50 ? ft.low : ft.high));
        })) : null,
        h('p.research', h('strong', 'In research: '), t.outcomes.map(o => o.text).join(' '), ' ', h('cite', `(Soto, 2019; average correlations r = ${Math.min(...t.outcomes.map(o => o.r)).toFixed(2)}–${Math.max(...t.outcomes.map(o => o.r)).toFixed(2)}.) These are tendencies across many people, not predictions about you.`)));
    });

    const actions = h('div.sticky-actions.no-print',
      h('button.btn.btn-primary', { type: 'button', onclick: () => window.print() }, 'Save as PDF'),
      h('button.btn', { type: 'button', onclick: () => shareImage(result) }, 'Share image'));

    root.replaceChildren(h('div.fade-in',
      h('header.report-hero.stack',
        h('p.eyebrow', `${inst.name} test · ${inst.fullName} · ${dateText}`),
        h('h1', 'Your personality profile'),
        h('p.lede', `${groupLabel(result.group.key, result.group.n)}.${result.group.fallback ? ' There wasn’t enough research data for your exact group, so we used the closest larger one.' : ''}`),
        profile.band === '10-13' ? h('p.note', h('strong', 'A note for ages 10–13. '), 'Personality questionnaires are less reliable at this age: answers change more as you grow, and some statements are harder to judge. Treat this as a fun snapshot, not a final answer. (Soto et al., 2008)') : null,
        h('p.small', 'Percentiles show where you sit among the comparison group: 70 means you scored higher than about 70% of them. Scores between 30 and 70 are typical.')),
      summary,
      cards,
      renderSubmitCard(result, ctx.state),
      h('div.actions.no-print', { style: 'margin-top:24px;justify-content:space-between' },
        h('p.small', 'This is not a clinical assessment. ', h('a', { href: '#method' }, 'How this works and sources →')),
        h('button.btn.btn-ghost', { type: 'button', onclick: () => { ctx.store.clear(); ctx.go('home'); } }, 'Start again')),
      h('p.print-only.small', `Personality Atlas · ${sources.ipip.url} · Results computed on this device.`),
      actions));
    const title = root.querySelector('h1');
    title.setAttribute('tabindex', '-1');
    title.focus({ preventScroll: true });
  }).catch(err => {
    root.replaceChildren(h('div.stack', h('h1', 'Something went wrong'), h('p.muted', `We couldn’t load the comparison data (${err.message}). Please refresh the page; your answers are saved.`)));
  });
}

async function shareImage(result) {
  const blob = await renderCard(result);
  const file = new File([blob], 'personality-atlas.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'My Personality Atlas profile' }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'personality-atlas.png';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
