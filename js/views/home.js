import { h } from '../dom.js';

export function render(root, ctx) {
  const saved = ctx.store.peek();
  const savedInst = saved && ctx.instruments[saved.instrumentId];
  const resume = savedInst && ctx.store.load(savedInst) && saved.answers.some(v => v);
  const card = inst => h('button.card.test-card', { type: 'button', onclick: () => { ctx.store.clear(); ctx.go('about', { instrumentId: inst.id, profile: {}, answers: Array(inst.items.length).fill(null), index: 0, rerouted: false }); } },
    h('div.meta', h('span.chip', `${inst.items.length} statements`), h('span.chip', `About ${inst.minutes} min`)),
    h('h2', `${inst.name} test`),
    h('p.muted', inst.id === 'ipip50'
      ? 'Your five broad traits, compared with people like you. The classic 50-item IPIP marker set.'
      : 'Your five traits and the 30 facets beneath them. Johnson’s IPIP-NEO-120, used in research worldwide.'),
    h('span.go', 'Start →'));

  root.append(h('div.fade-in',
    h('section.hero.stack',
      h('p.eyebrow', 'Big Five personality assessment'),
      h('h1', 'Understand how you think, feel and act.'),
      h('p.lede', 'A research-grade personality profile, compared with hundreds of thousands of real people. Free, private, and it never leaves your device.')),
    resume ? h('div.card.stack', { style: 'margin-bottom:16px' },
      h('h2', 'Welcome back'),
      h('p.muted', `You have a ${savedInst.name} test in progress: ${saved.answers.filter(Boolean).length} of ${savedInst.items.length} answered.`),
      h('div.actions',
        h('button.btn.btn-primary', { type: 'button', onclick: () => ctx.go(saved.answers.every(Boolean) ? 'report' : 'question', { instrumentId: saved.instrumentId, profile: saved.profile ?? {}, answers: saved.answers, index: saved.index, rerouted: !!saved.rerouted }) }, 'Resume'),
        h('button.btn.btn-ghost', { type: 'button', onclick: () => { ctx.store.clear(); ctx.go('home'); } }, 'Start over'))) : null,
    h('div.test-grid', card(ctx.instruments.ipip50), card(ctx.instruments.ipipneo120)),
    h('div.trust',
      h('div', h('strong', 'Research-based'), 'Public-domain questionnaires from the International Personality Item Pool.'),
      h('div', h('strong', 'Real comparisons'), 'Percentiles from published datasets, matched to your age and sex if you choose.'),
      h('div', h('strong', 'Private by design'), 'No accounts, no tracking. Your answers stay in this browser.'))));
}
