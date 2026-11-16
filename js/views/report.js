import { h } from '../dom.js';
export function render(root) {
  root.append(h('div.stack', h('h1', 'Your personality profile')));
}
