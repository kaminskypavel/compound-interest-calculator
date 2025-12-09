import type { CalculatorInputs, YearlyData } from '../types';

export function calculateCompoundInterest(inputs: CalculatorInputs): YearlyData[] {
  const { initialInvestment, monthlyContribution, annualReturn, inflationRate, years } = inputs;

  const data: YearlyData[] = [];

  // Monthly rates
  const monthlyNominalRate = annualReturn / 100 / 12;

  // Use Fisher equation for real rate: (1 + nominal) / (1 + inflation) - 1
  // This is more accurate than the simple approximation (nominal - inflation)
  const annualRealRate = (1 + annualReturn / 100) / (1 + inflationRate / 100) - 1;
  const monthlyRealRate = annualRealRate / 12;

  for (let year = 0; year <= years; year++) {
    const months = year * 12;

    let nominalValue: number;
    let realValue: number;

    if (monthlyNominalRate === 0) {
      // No growth case - just sum of contributions
      nominalValue = initialInvestment + monthlyContribution * months;
    } else {
      // FV = P(1+r)^n + PMT × [((1+r)^n - 1) / r]
      const nominalGrowthFactor = Math.pow(1 + monthlyNominalRate, months);
      nominalValue =
        initialInvestment * nominalGrowthFactor +
        monthlyContribution * ((nominalGrowthFactor - 1) / monthlyNominalRate);
    }

    if (monthlyRealRate === 0) {
      realValue = initialInvestment + monthlyContribution * months;
    } else {
      const realGrowthFactor = Math.pow(1 + monthlyRealRate, months);
      realValue =
        initialInvestment * realGrowthFactor +
        monthlyContribution * ((realGrowthFactor - 1) / monthlyRealRate);
    }

    data.push({
      year,
      nominalValue: Math.round(nominalValue * 100) / 100,
      realValue: Math.round(realValue * 100) / 100,
    });
  }

  return data;
}

export function formatCurrency(value: number, currency: 'USD' | 'ILS' = 'USD'): string {
  const locale = currency === 'ILS' ? 'he-IL' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function generateColor(index: number): string {
  const colors = [
    '#00d4aa', // teal/accent
    '#5eb5ff', // sky blue
    '#a78bfa', // violet
    '#f472b6', // pink
    '#fbbf24', // amber
    '#34d399', // emerald
    '#fb923c', // orange
    '#818cf8', // indigo
    '#f87171', // rose
    '#2dd4bf', // cyan
  ];
  return colors[index % colors.length];
}
