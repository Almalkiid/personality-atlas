// Raw scale scores. Live answers are 1–5 on the item's own wording; minus-keyed items are flipped (6 − v).
export function scoreAnswers(instrument, answers) {
  const { items } = instrument;
  if (!Array.isArray(answers) || answers.length !== items.length) throw new Error('Answer every statement first.');
  if (!answers.every(v => Number.isInteger(v) && v >= 1 && v <= 5)) throw new Error('Answers must be whole numbers from 1 to 5.');
  const domains = {};
  const facets = {};
  const add = (bag, key, value) => {
    const s = (bag[key] ??= { raw: 0, min: 0, max: 0 });
    s.raw += value; s.min += 1; s.max += 5;
  };
  items.forEach((item, i) => {
    const v = item.keyed === 'minus' ? 6 - answers[i] : answers[i];
    add(domains, item.domain, v);
    if (item.facet) add(facets, item.domain + item.facet, v);
  });
  return Object.keys(facets).length ? { domains, facets } : { domains };
}
