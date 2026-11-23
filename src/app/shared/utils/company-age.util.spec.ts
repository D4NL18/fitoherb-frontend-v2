import {
  calculateFitoherbYears,
  FITOHERB_ANNIVERSARY_DAY,
  FITOHERB_ANNIVERSARY_MONTH,
  FITOHERB_FOUNDATION_YEAR,
} from './company-age.util';

describe('calculateFitoherbYears', () => {
  it('should expose foundation constants', () => {
    expect(FITOHERB_FOUNDATION_YEAR).toBe(1997);
    expect(FITOHERB_ANNIVERSARY_MONTH).toBe(11);
    expect(FITOHERB_ANNIVERSARY_DAY).toBe(1);
  });

  it('should return 28 on 31/10/2026 (one day before 29th anniversary)', () => {
    expect(calculateFitoherbYears(new Date(2026, 9, 31))).toBe(28);
  });

  it('should return 29 on 01/11/2026 (exact 29th anniversary)', () => {
    expect(calculateFitoherbYears(new Date(2026, 10, 1))).toBe(29);
  });

  it('should return 29 on 23/11/2026 (after 29th anniversary)', () => {
    expect(calculateFitoherbYears(new Date(2026, 10, 23))).toBe(29);
  });

  it('should return 29 on 31/10/2027 (one day before 30th anniversary)', () => {
    expect(calculateFitoherbYears(new Date(2027, 9, 31))).toBe(29);
  });

  it('should return 30 on 01/11/2027 (exact 30th anniversary)', () => {
    expect(calculateFitoherbYears(new Date(2027, 10, 1))).toBe(30);
  });

  it('should return 0 for dates before foundation', () => {
    expect(calculateFitoherbYears(new Date(1997, 9, 31))).toBe(0);
    expect(calculateFitoherbYears(new Date(1990, 0, 1))).toBe(0);
  });

  it('should return a non-negative integer when called with default referenceDate', () => {
    const years = calculateFitoherbYears();
    expect(Number.isInteger(years)).toBeTrue();
    expect(years).toBeGreaterThanOrEqual(0);
  });
});
