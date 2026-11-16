import { ipip50 } from './instruments/ipip50.js';
import { ipipneo120 } from './instruments/ipipneo120.js';
import { store } from './store.js';
import * as home from './views/home.js';
import * as about from './views/about.js';
import * as gate from './views/gate.js';
import * as question from './views/question.js';
import * as report from './views/report.js';
import * as method from './views/method.js';

export const INSTRUMENTS = { ipip50, ipipneo120 };
const views = { home, about, gate, question, report, method };
const root = document.getElementById('app');

const ctx = {
  instruments: INSTRUMENTS,
  store,
  state: { instrumentId: null, profile: {}, answers: [], index: 0, rerouted: false },
  get instrument() { return INSTRUMENTS[this.state.instrumentId]; },
  go(name, patch = {}) {
    Object.assign(ctx.state, patch);
    if (name !== 'method' && location.hash === '#method') history.replaceState(null, '', location.pathname);
    render(name);
  },
};

let cleanup = null;
function render(name) {
  if (cleanup) { cleanup(); cleanup = null; }
  root.replaceChildren();
  window.scrollTo(0, 0);
  cleanup = views[name].render(root, ctx) || null;
  const h1 = root.querySelector('h1');
  if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
}

window.addEventListener('hashchange', () => render(location.hash === '#method' ? 'method' : 'home'));
render(location.hash === '#method' ? 'method' : 'home');
