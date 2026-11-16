import { h } from '../dom.js';
import { BANDS } from '../norms.js';

const AGE_OPTIONS = [['under10', 'Under 10'], ...BANDS.map(b => [b, b.replace('-', '–')]), ['', 'Prefer not to say']];
const SEX_OPTIONS = [['f', 'Female'], ['m', 'Male'], ['', 'Prefer not to say']];

const group = (name, legend, options, current) => h('fieldset.field.plain-fieldset',
  h('legend', { style: 'font-weight:600;margin-bottom:8px' }, legend),
  h('div.segmented', options.map(([value, label]) => h('label',
    h('input', { type: 'radio', name, value, 'aria-label': label, checked: (current ?? '') === value }),
    h('span', label)))));

export function render(root, ctx) {
  const inst = ctx.instrument;
  const form = h('form.card.stack', { onsubmit: e => {
    e.preventDefault();
    const fd = new FormData(form);
    const band = fd.get('age') || undefined;
    const sex = fd.get('sex') || undefined;
    if (band === 'under10') return ctx.go('gate');
    let { instrumentId } = ctx.state;
    let rerouted = false;
    if (band === '10-13' && instrumentId !== 'ipipneo120') { instrumentId = 'ipipneo120'; rerouted = true; }
    const n = ctx.instruments[instrumentId].items.length;
    ctx.go('question', { instrumentId, rerouted, profile: { band, sex }, answers: Array(n).fill(null), index: 0 });
  } },
    group('age', 'Your age', AGE_OPTIONS, ctx.state.profile.band),
    group('sex', 'Sex', SEX_OPTIONS, ctx.state.profile.sex),
    h('p.small', 'Optional. Used only to compare you with people of the same age and sex. Nothing is sent anywhere.'),
    h('div.actions', h('button.btn.btn-primary', { type: 'submit' }, 'Begin'), h('button.btn.btn-ghost', { type: 'button', onclick: () => ctx.go('home') }, 'Back')));
  root.append(h('div.fade-in.stack',
    h('p.eyebrow', `${inst.name} test · ${inst.items.length} statements`),
    h('h1', 'A little about you'),
    h('p.lede', 'People differ a little by age and sex. Tell us yours for a fairer comparison, or skip it.'),
    form));
}
