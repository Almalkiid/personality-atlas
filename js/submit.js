// "Send your results to the researcher" — the only place any data leaves the device, and only on Send.
import { h } from './dom.js';
import { ENDPOINT, CONSENT_VERSION, APP_VERSION } from './config.js';

const YOUTH = ['10-13', '14-17'];

export function buildPayload(result, state, form) {
  const domains = Object.fromEntries(result.domains.map(d => [d.id, { pct: d.percentile, raw: d.raw }]));
  return {
    v: APP_VERSION,
    instrument: result.instrument.id,
    name: form.name.trim(),
    email: form.email.trim(),
    adult: form.adult,
    ageBand: state.profile.band || '',
    sex: state.profile.sex || '',
    parentName: form.adult ? '' : form.parentName.trim(),
    parentEmail: form.adult ? '' : form.parentEmail.trim(),
    consent: form.consent,
    parentConsent: form.adult ? false : form.parentConsent,
    consentVersion: CONSENT_VERSION,
    normGroup: result.group.key,
    domains,
    facets: result.facets,
    answers: state.answers.slice(),
    website: form.website,
  };
}

async function post(payload) {
  const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'The server refused this result.');
}

export function renderSubmitCard(result, state) {
  const knownMinor = YOUTH.includes(state.profile.band);
  const knownAdult = !!state.profile.band && !knownMinor;
  let sending = false;

  const field = (label, input, hint) => h('label.field', h('span', label), input, hint ? h('span.small', hint) : null);
  const name = h('input.input', { type: 'text', name: 'name', autocomplete: 'name', maxlength: 100, required: true });
  const email = h('input.input', { type: 'email', name: 'email', autocomplete: 'email', maxlength: 200 });
  const website = h('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true', class: 'hp' });
  const consent = h('input', { type: 'checkbox', name: 'consent' });
  const ageYes = h('input', { type: 'radio', name: 'adult', value: 'yes', 'aria-label': 'Yes, 18 or over' });
  const ageNo = h('input', { type: 'radio', name: 'adult', value: 'no', 'aria-label': 'No, under 18' });
  const parentName = h('input.input', { type: 'text', name: 'parentName', autocomplete: 'off', maxlength: 100 });
  const parentEmail = h('input.input', { type: 'email', name: 'parentEmail', autocomplete: 'off', maxlength: 200 });
  const parentConsent = h('input', { type: 'checkbox', name: 'parentConsent' });
  const send = h('button.btn.btn-primary', { type: 'submit', disabled: true }, 'Send my results');
  const status = h('p.small', { role: 'status', 'aria-live': 'polite' });
  const raw = h('textarea.input', { readonly: true, rows: 6, 'aria-label': 'Your result record' });
  const rawBox = h('details.raw', { hidden: true }, h('summary', 'Copy your result record'), raw,
    h('button.btn', { type: 'button', onclick: () => navigator.clipboard?.writeText(raw.value) }, 'Copy'));

  const isAdult = () => knownAdult ? true : knownMinor ? false : ageYes.checked ? true : ageNo.checked ? false : null;
  const ageAsk = h('fieldset.field.plain-fieldset', { hidden: state.profile.band ? true : null },
    h('legend', { style: 'font-weight:600;margin-bottom:8px' }, 'Are you 18 or over?'),
    h('div.segmented', h('label', ageYes, h('span', 'Yes, 18 or over')), h('label', ageNo, h('span', 'No, under 18'))));
  const parentBlock = h('div.parent.stack', { hidden: true },
    h('p.note', h('strong', 'Under 18? '), 'A parent or guardian must agree before your results are sent.'),
    field("Parent or guardian's name", parentName),
    field("Parent or guardian's email (optional)", parentEmail),
    h('label.check', parentConsent, h('span', 'I am this person’s parent or guardian, and I agree to their name, answers and scores being sent to the Personality Atlas researcher.')));

  const read = () => ({ name: name.value, email: email.value, adult: isAdult(), consent: consent.checked, parentName: parentName.value, parentEmail: parentEmail.value, parentConsent: parentConsent.checked, website: website.value });
  const valid = f => f.name.trim() && f.consent && f.adult !== null && (f.adult || (f.parentName.trim() && f.parentConsent));
  const refresh = () => {
    const adult = isAdult();
    parentBlock.hidden = adult !== false;
    send.disabled = sending || !valid(read());
  };

  const form = h('form.stack', { novalidate: true, oninput: refresh, onchange: refresh, onsubmit: async e => {
    e.preventDefault();
    const f = read();
    if (sending || !valid(f)) return;
    sending = true; refresh();
    send.textContent = 'Sending…';
    status.textContent = '';
    const payload = buildPayload(result, state, f);
    raw.value = JSON.stringify(payload, null, 2);
    try {
      await post(payload);
      section.replaceChildren(h('h2', 'Sent ✓'), h('p.muted', 'Thank you. Your results have reached the researcher.'));
    } catch (err) {
      sending = false;
      send.textContent = 'Send my results';
      status.textContent = `Could not send: ${err.message === 'Failed to fetch' ? 'no connection to the server' : err.message}. Your results are safe on this page; try again, or copy the record below.`;
      status.className = 'small error';
      rawBox.hidden = false;
      refresh();
    }
  } },
    field('Your name', name),
    field('Email (optional)', email, 'Only if you’d like the researcher to be able to reply.'),
    website,
    ageAsk,
    parentBlock,
    h('label.check', consent, h('span', 'I agree to send my name, answers and scores to the Personality Atlas researcher.')),
    h('div.actions', send),
    status,
    rawBox);

  const section = h('section.card.submit-card.no-print.stack', { 'aria-labelledby': 'submit-h' },
    h('h2', { id: 'submit-h' }, 'Send your results to the researcher'),
    h('p.muted', 'Optional. If you send, the researcher receives your name, email (if given), age band, sex, your answers and your scores. They are kept privately for the researcher’s own insight and are not published or shared. Nothing is sent unless you press Send. To have your results removed later, contact the researcher.'),
    form);
  return section;
}
