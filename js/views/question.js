import { h } from '../dom.js';

export const CHOICES = ['Very inaccurate', 'Moderately inaccurate', 'Neither accurate nor inaccurate', 'Moderately accurate', 'Very accurate'];
const ADVANCE_MS = 180;

export function render(root, ctx) {
  const inst = ctx.instrument;
  const s = ctx.state;
  const last = inst.items.length - 1;
  // Auto-advance is tied to the statement that was answered (pendingFrom), never to whatever is current when it fires.
  let timer = null;
  let pendingFrom = null;
  const cancel = () => { clearTimeout(timer); timer = null; pendingFrom = null; };
  const settle = () => { // complete a pending advance immediately (a second key press arrived first)
    if (pendingFrom === null) return;
    const from = pendingFrom;
    cancel();
    if (from < last) s.index = from + 1;
  };

  const persist = () => ctx.store.save({ instrumentId: inst.id, itemCount: inst.items.length, answers: s.answers, index: s.index, profile: s.profile, rerouted: s.rerouted });
  const back = () => { cancel(); if (s.index === 0) return ctx.go('about'); s.index -= 1; persist(); draw(); };
  const next = () => { cancel(); if (s.index < last) { s.index += 1; persist(); draw(); } };
  const choose = v => {
    settle();
    s.answers[s.index] = v;
    persist();
    draw(); // show the selection immediately
    pendingFrom = s.index;
    timer = setTimeout(() => {
      const from = pendingFrom;
      cancel();
      if (from !== s.index) return;
      if (from === last) {
        const missing = s.answers.findIndex(a => !a);
        if (missing === -1) return ctx.go('report');
        s.index = missing; persist(); return draw(); // a skipped statement: take the user straight to it
      }
      s.index = from + 1; persist(); draw();
    }, ADVANCE_MS);
  };

  function draw() {
    const item = inst.items[s.index];
    const n = inst.items.length;
    const answered = s.answers.filter(Boolean).length;
    root.replaceChildren(h('div',
      s.rerouted && s.index === 0 ? h('p.note', { style: 'margin-bottom:16px' }, h('strong', 'For ages 10–13 we use the In-depth test. '), 'It has research data for your age group, so your comparison is fairer.') : null,
      h('div.q-top', h('span.eyebrow', `Statement ${s.index + 1} of ${n}`), h('span.small', `${Math.round((answered / n) * 100)}%`)),
      h('div.progress', { role: 'progressbar', 'aria-label': 'Progress', 'aria-valuemin': 0, 'aria-valuemax': n, 'aria-valuenow': answered }, h('i', { style: `width:${(answered / n) * 100}%` })),
      h('div.card.q-card.fade-in',
        h('p.q-prompt', 'How accurately does this describe you?'),
        h('h1', item.text.replace(/\.$/, '')),
        h('div.choices', { role: 'radiogroup', 'aria-label': 'Your answer' },
          CHOICES.map((label, i) => h('button.choice', { type: 'button', role: 'radio', 'aria-checked': s.answers[s.index] === i + 1 ? 'true' : 'false', onclick: () => choose(i + 1) }, h('kbd', String(i + 1)), label)))),
      h('div.q-foot',
        h('button.btn.btn-ghost', { type: 'button', onclick: back }, '← Back'),
        h('span.small', 'Tip: press 1–5 to answer'),
        s.answers[s.index] && s.index < n - 1 ? h('button.btn.btn-ghost', { type: 'button', onclick: next }, 'Next →')
          : s.index === n - 1 && s.answers.every(Boolean) ? h('button.btn.btn-primary', { type: 'button', onclick: () => ctx.go('report') }, 'See results') : h('span'))));
    const title = root.querySelector('h1');
    title.setAttribute('tabindex', '-1');
    title.focus({ preventScroll: true });
  }

  const onKey = e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[1-5]$/.test(e.key)) { e.preventDefault(); choose(Number(e.key)); }
    else if (e.key === 'Backspace') { e.preventDefault(); back(); }
  };
  document.addEventListener('keydown', onKey);
  persist();
  draw();
  return () => { document.removeEventListener('keydown', onKey); cancel(); };
}
