// Seed a fully answered test into localStorage and open its report.
export async function openReport(page, { instrumentId = 'ipip50', itemCount = 50, profile = {}, value = i => (i % 5) + 1 } = {}) {
  const answers = Array.from({ length: itemCount }, (_, i) => value(i));
  await page.goto('./');
  await page.evaluate(s => localStorage.setItem('personality-atlas:progress', JSON.stringify(s)),
    { instrumentId, itemCount, answers, index: itemCount - 1, profile, rerouted: false });
  await page.reload();
  await page.getByRole('button', { name: 'Resume' }).click();
  await page.getByRole('heading', { level: 1, name: 'Your personality profile' }).waitFor();
}
