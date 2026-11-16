// Share image: a 1080×1350 PNG drawn on the device. It shows only the five percentiles,
// the test name and the comparison group — never individual answers.
import { reportText } from './content/report-text.js';
import { groupLabel } from './views/report.js';

const W = 1080, H = 1350;
const C = { bg: '#f4f6f9', surface: '#ffffff', text: '#0f172a', text2: '#475569', text3: '#94a3b8', track: '#eef1f5', avg: 'rgba(15,23,42,0.08)',
  E: '#f76b15', A: '#1a9d55', C: '#2563eb', N: '#7c3aed', O: '#0d9488' };
const FONT = '-apple-system, "SF Pro Display", system-ui, "Segoe UI", Roboto, sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function renderCard(result) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.shadowColor = 'rgba(15,23,42,0.10)'; ctx.shadowBlur = 48; ctx.shadowOffsetY = 16;
  roundRect(ctx, 64, 64, W - 128, H - 128, 48); ctx.fillStyle = C.surface; ctx.fill();
  ctx.restore();

  // Wordmark with the five-colour mark.
  const mx = 128, my = 140;
  const grad = ctx.createConicGradient(Math.PI * 7 / 6, mx + 18, my + 18);
  ['E', 'A', 'C', 'N', 'O', 'E'].forEach((k, i) => grad.addColorStop(i / 5, C[k]));
  roundRect(ctx, mx, my, 36, 36, 11); ctx.fillStyle = grad; ctx.fill();
  ctx.fillStyle = C.text; ctx.font = `600 34px ${FONT}`; ctx.textBaseline = 'middle';
  ctx.fillText('Personality Atlas', mx + 56, my + 19);

  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 76px ${FONT}`; ctx.fillStyle = C.text;
  ctx.fillText('My personality', 128, 330);
  ctx.fillText('profile', 128, 420);
  ctx.font = `400 30px ${FONT}`; ctx.fillStyle = C.text2;
  ctx.fillText(`Big Five · ${result.instrument.name} test`, 128, 480);
  ctx.font = `400 26px ${FONT}`; ctx.fillStyle = C.text3;
  ctx.fillText(groupLabel(result.group.key, result.group.n), 128, 522);

  // Bars.
  const x0 = 128, barW = W - 256, top = 610, step = 118;
  result.domains.forEach((d, i) => {
    const y = top + i * step;
    ctx.font = `600 32px ${FONT}`; ctx.fillStyle = C.text;
    ctx.fillText(reportText[d.id].name, x0, y);
    ctx.font = `700 40px ${FONT}`; ctx.textAlign = 'right';
    ctx.fillText(String(d.percentile), x0 + barW, y + 2);
    ctx.textAlign = 'left';
    const by = y + 24;
    roundRect(ctx, x0, by, barW, 20, 10); ctx.fillStyle = C.track; ctx.fill();
    ctx.save(); roundRect(ctx, x0, by, barW, 20, 10); ctx.clip();
    ctx.fillStyle = C.avg; ctx.fillRect(x0 + barW * 0.3, by, barW * 0.4, 20);
    ctx.fillStyle = C[d.id]; ctx.fillRect(x0, by, Math.max(20, barW * d.percentile / 100), 20);
    ctx.restore();
  });

  ctx.font = `400 24px ${FONT}`; ctx.fillStyle = C.text3;
  ctx.fillText('Percentiles · typical range 30–70 · computed privately on my device', 128, H - 128);

  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'));
}
