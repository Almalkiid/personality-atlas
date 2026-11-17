import { h } from '../dom.js';

export function render(root, ctx) {
  const saved = ctx.store.peek();
  const savedInst = saved && ctx.instruments[saved.instrumentId];
  const resume = savedInst && ctx.store.load(savedInst) && saved.answers.some(v => v);
  const start = inst => { ctx.store.clear(); ctx.go('about', { instrumentId: inst.id, profile: {}, answers: Array(inst.items.length).fill(null), index: 0, rerouted: false }); };
  // Starting a new test while one is in progress asks first (inline, never window.confirm).
  const askThenStart = inst => {
    if (!resume) return start(inst);
    const slot = root.querySelector('#confirm-slot');
    slot.replaceChildren(h('div.card.stack', { style: 'margin-bottom:16px', role: 'alertdialog', 'aria-labelledby': 'confirm-h' },
      h('h2', { id: 'confirm-h' }, 'You have a test in progress'),
      h('p.muted', `Starting the ${inst.name} test will discard your ${savedInst.name} answers so far.`),
      h('div.actions',
        h('button.btn.btn-primary', { type: 'button', onclick: () => start(inst) }, 'Discard and start'),
        h('button.btn', { type: 'button', onclick: () => slot.replaceChildren() }, 'Keep my progress'))));
    slot.querySelector('button').focus();
  };
  const quick = inst => inst.id === 'ipip50';
  // Decorative mini chart: five trait bars; the In-depth card splits each bar into its six facets.
  const bars = inst => h('div.mini-bars' + (quick(inst) ? '' : '.faceted'), { 'aria-hidden': 'true' },
    ['E', 'A', 'C', 'N', 'O'].map((k, i) => h('span', { style: `--h:${[55, 85, 40, 70, 100][i]}%;--c:var(--pa-${k})` })));
  const card = inst => h('button.card.test-card', { type: 'button', onclick: () => askThenStart(inst) },
    h('div.test-top',
      h('div.count', h('span.num', String(inst.items.length)), h('span.unit', 'statements')),
      h('span.chip', `${inst.minutes} min`)),
    bars(inst),
    h('div.test-text',
      h('h2', `${inst.name} test`),
      h('p.muted', quick(inst) ? 'Your five core traits.' : 'Your five traits and the 30 facets beneath them.')),
    h('span.go' + (quick(inst) ? '.go-primary' : ''), 'Start', h('span.arrow', { 'aria-hidden': 'true' }, '→')));

  root.append(h('div.fade-in',
    h('section.hero.stack',
      h('p.eyebrow', h('span.eyebrow-dot', { 'aria-hidden': 'true' }), 'Big Five personality assessment'),
      h('h1', 'Understand how you ', h('span.grad', 'think, feel and act.')),
      h('ul.pills', ['Free', 'No sign-up', 'Private'].map(t => h('li', t)))),
    h('div', { id: 'confirm-slot' }),
    resume ? h('div.card.stack', { style: 'margin-bottom:16px' },
      h('h2', 'Welcome back'),
      h('p.muted', `You have a ${savedInst.name} test in progress: ${saved.answers.filter(Boolean).length} of ${savedInst.items.length} answered.`),
      h('div.actions',
        h('button.btn.btn-primary', { type: 'button', onclick: () => ctx.go(saved.answers.every(Boolean) ? 'report' : 'question', { instrumentId: saved.instrumentId, profile: saved.profile ?? {}, answers: saved.answers, index: saved.index, rerouted: !!saved.rerouted }) }, 'Resume'),
        h('button.btn.btn-ghost', { type: 'button', onclick: () => { ctx.store.clear(); ctx.go('home'); } }, 'Start over'))) : null,
    h('div.test-grid', card(ctx.instruments.ipip50), card(ctx.instruments.ipipneo120))));
}
