export const FITOHERB_FOUNDATION_YEAR = 1997;
export const FITOHERB_ANNIVERSARY_MONTH = 11;
export const FITOHERB_ANNIVERSARY_DAY = 1;

export function calculateFitoherbYears(referenceDate: Date = new Date()): number {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;
  const day = referenceDate.getDate();

  const hasReachedAnniversary =
    month > FITOHERB_ANNIVERSARY_MONTH ||
    (month === FITOHERB_ANNIVERSARY_MONTH && day >= FITOHERB_ANNIVERSARY_DAY);

  const years = year - FITOHERB_FOUNDATION_YEAR - (hasReachedAnniversary ? 0 : 1);

  return Math.max(0, years);
}
