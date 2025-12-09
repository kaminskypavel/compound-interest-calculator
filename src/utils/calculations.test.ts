import { describe, test, expect } from 'bun:test';
import { calculateCompoundInterest, formatCurrency, generateColor } from './calculations';
import type { CalculatorInputs } from '../types';

describe('calculateCompoundInterest', () => {
  test('should return correct number of data points', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 7,
      inflationRate: 3,
      years: 10,
    };

    const result = calculateCompoundInterest(inputs);
    // Should have years + 1 data points (year 0 through year 10)
    expect(result).toHaveLength(11);
  });

  test('year 0 should equal initial investment for both nominal and real', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 7,
      inflationRate: 3,
      years: 5,
    };

    const result = calculateCompoundInterest(inputs);
    expect(result[0].year).toBe(0);
    expect(result[0].nominalValue).toBe(10000);
    expect(result[0].realValue).toBe(10000);
  });

  test('nominal value should compound correctly', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 10, // 10% annual return
      inflationRate: 0,
      years: 3,
    };

    const result = calculateCompoundInterest(inputs);

    // Year 0: 10000
    // Year 1: 10000 * 1.10 = 11000
    // Year 2: 10000 * 1.10^2 = 12100
    // Year 3: 10000 * 1.10^3 = 13310
    expect(result[0].nominalValue).toBe(10000);
    expect(result[1].nominalValue).toBe(11000);
    expect(result[2].nominalValue).toBe(12100);
    expect(result[3].nominalValue).toBe(13310);
  });

  test('real value should use (nominal - inflation) as real rate', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 10, // 10% nominal
      inflationRate: 3, // 3% inflation
      years: 1,
    };

    const result = calculateCompoundInterest(inputs);

    // Real rate = 10% - 3% = 7%
    // Year 1 real value = 10000 * 1.07 = 10700
    expect(result[1].realValue).toBe(10700);
  });

  test('real value should compound at (nominal - inflation) rate', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 10, // 10% nominal
      inflationRate: 3, // 3% inflation
      years: 3,
    };

    const result = calculateCompoundInterest(inputs);

    // Real rate = 7%
    // Year 0: 10000
    // Year 1: 10000 * 1.07 = 10700
    // Year 2: 10000 * 1.07^2 = 11449
    // Year 3: 10000 * 1.07^3 = 12250.43
    expect(result[0].realValue).toBe(10000);
    expect(result[1].realValue).toBe(10700);
    expect(result[2].realValue).toBe(11449);
    expect(result[3].realValue).toBeCloseTo(12250.43, 0);
  });

  test('real value should be less than nominal when inflation > 0', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 7,
      inflationRate: 3,
      years: 10,
    };

    const result = calculateCompoundInterest(inputs);

    // After year 0, real value should always be less than nominal
    for (let i = 1; i < result.length; i++) {
      expect(result[i].realValue).toBeLessThan(result[i].nominalValue);
    }
  });

  test('real value should decrease when inflation > nominal return', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 5, // 5% return
      inflationRate: 10, // 10% inflation (higher than return)
      years: 5,
    };

    const result = calculateCompoundInterest(inputs);

    // Real rate = 5% - 10% = -5% (negative)
    // Real value should decrease each year
    for (let i = 1; i < result.length; i++) {
      expect(result[i].realValue).toBeLessThan(result[i - 1].realValue);
    }

    // But nominal should still grow
    for (let i = 1; i < result.length; i++) {
      expect(result[i].nominalValue).toBeGreaterThan(result[i - 1].nominalValue);
    }
  });

  test('real value should equal nominal when inflation is 0', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 7,
      inflationRate: 0,
      years: 5,
    };

    const result = calculateCompoundInterest(inputs);

    for (let i = 0; i < result.length; i++) {
      expect(result[i].realValue).toBeCloseTo(result[i].nominalValue, 2);
    }
  });

  test('should handle zero return rate', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 0,
      inflationRate: 3,
      years: 5,
    };

    const result = calculateCompoundInterest(inputs);

    // Nominal stays same (0% return)
    for (const point of result) {
      expect(point.nominalValue).toBe(10000);
    }

    // Real decreases due to inflation (real rate = 0% - 3% = -3%)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].realValue).toBeLessThan(result[i - 1].realValue);
    }
  });

  test('should handle large numbers correctly', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 1000000,
      annualReturn: 12,
      inflationRate: 2,
      years: 30,
    };

    const result = calculateCompoundInterest(inputs);

    // After 30 years at 12% nominal: 1M * (1.12)^30 ≈ $29.96M
    const expectedNominal = 1000000 * Math.pow(1.12, 30);
    expect(result[30].nominalValue).toBeCloseTo(expectedNominal, 0);

    // Real rate = 12% - 2% = 10%
    // After 30 years at 10% real: 1M * (1.10)^30 ≈ $17.45M
    const expectedReal = 1000000 * Math.pow(1.10, 30);
    expect(result[30].realValue).toBeCloseTo(expectedReal, 0);
  });

  test('specific case: 10% return with 32% inflation should show declining real value', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 100022,
      annualReturn: 10,
      inflationRate: 32,
      years: 7,
    };

    const result = calculateCompoundInterest(inputs);

    // Real rate = 10% - 32% = -22%
    const realRate = 0.10 - 0.32;
    expect(realRate).toBe(-0.22);

    // Real value should decrease each year because real rate is negative
    for (let i = 1; i < result.length; i++) {
      expect(result[i].realValue).toBeLessThan(result[i - 1].realValue);
    }

    // But nominal should still grow at 10%
    for (let i = 1; i < result.length; i++) {
      expect(result[i].nominalValue).toBeGreaterThan(result[i - 1].nominalValue);
    }

    // Verify specific year 7 values
    const expectedNominalYear7 = 100022 * Math.pow(1.10, 7);
    const expectedRealYear7 = 100022 * Math.pow(1 + realRate, 7);

    expect(result[7].nominalValue).toBeCloseTo(expectedNominalYear7, 0);
    expect(result[7].realValue).toBeCloseTo(expectedRealYear7, 0);
  });

  test('real value should grow when return > inflation', () => {
    const inputs: CalculatorInputs = {
      initialInvestment: 10000,
      annualReturn: 10,
      inflationRate: 3,
      years: 5,
    };

    const result = calculateCompoundInterest(inputs);

    // Real rate = 10% - 3% = 7% (positive)
    // Real value should increase each year
    for (let i = 1; i < result.length; i++) {
      expect(result[i].realValue).toBeGreaterThan(result[i - 1].realValue);
    }
  });
});

describe('formatCurrency', () => {
  test('should format positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1000000)).toBe('$1,000,000');
    expect(formatCurrency(123456789)).toBe('$123,456,789');
  });

  test('should round to whole numbers', () => {
    expect(formatCurrency(1000.49)).toBe('$1,000');
    expect(formatCurrency(1000.50)).toBe('$1,001');
  });

  test('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  test('should handle small numbers', () => {
    expect(formatCurrency(1)).toBe('$1');
    expect(formatCurrency(99)).toBe('$99');
  });
});

describe('generateColor', () => {
  test('should return valid hex color', () => {
    const color = generateColor(0);
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('should return different colors for different indices', () => {
    const colors = new Set();
    for (let i = 0; i < 10; i++) {
      colors.add(generateColor(i));
    }
    // Should have 10 unique colors
    expect(colors.size).toBe(10);
  });

  test('should cycle colors after 10', () => {
    expect(generateColor(0)).toBe(generateColor(10));
    expect(generateColor(1)).toBe(generateColor(11));
    expect(generateColor(5)).toBe(generateColor(15));
  });

  test('first color should be accent teal', () => {
    expect(generateColor(0)).toBe('#00d4aa');
  });
});
