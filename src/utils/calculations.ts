import type { CalculatorInputs, YearlyData } from '../types';

export function calculateCompoundInterest(inputs: CalculatorInputs): YearlyData[] {
  const { initialInvestment, annualReturn, inflationRate, years } = inputs;

  const nominalRate = annualReturn / 100;
  const inflation = inflationRate / 100;

  // Real return rate using Fisher equation: (1 + nominal) / (1 + inflation) - 1
  const realRate = (1 + nominalRate) / (1 + inflation) - 1;

  const data: YearlyData[] = [];

  for (let year = 0; year <= years; year++) {
    const nominalValue = initialInvestment * Math.pow(1 + nominalRate, year);
    const realValue = initialInvestment * Math.pow(1 + realRate, year);

    data.push({
      year,
      nominalValue: Math.round(nominalValue * 100) / 100,
      realValue: Math.round(realValue * 100) / 100,
    });
  }

  return data;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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
