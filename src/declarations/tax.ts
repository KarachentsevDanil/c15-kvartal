// Третя група ФОП: єдиний податок 5 % і військовий збір 1 % від доходу за квартал.
const SINGLE_TAX_PERCENT = 5;
const MILITARY_LEVY_PERCENT = 1;

export function calculateTaxKopecks(incomeKopecks: number): number {
  const percentOf = (percent: number) => Math.round((incomeKopecks * percent) / 100);

  return percentOf(SINGLE_TAX_PERCENT) + percentOf(MILITARY_LEVY_PERCENT);
}
