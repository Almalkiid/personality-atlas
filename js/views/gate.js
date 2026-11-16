import { h } from '../dom.js';

export function render(root, ctx) {
  root.append(h('div.fade-in.stack',
    h('p.eyebrow', 'Personality Atlas'),
    h('h1', 'This test is for ages 10 and up'),
    h('p.lede', 'Research shows that children can describe their own personality reliably from about age 10. Come back when you’re a little older. We’ll be here!'),
    h('p.small', 'Source: Soto, John, Gosling & Potter (2008), Journal of Personality and Social Psychology, 94, 718–737.'),
    h('div.actions', h('button.btn', { type: 'button', onclick: () => ctx.go('home') }, 'Back to start'))));
}
