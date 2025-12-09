export interface CalculatorInputs {
  initialInvestment: number;
  annualReturn: number; // percentage (e.g., 7 for 7%)
  inflationRate: number; // percentage (e.g., 3 for 3%)
  years: number;
}

export interface YearlyData {
  year: number;
  nominalValue: number;
  realValue: number;
}

export interface Scenario {
  id: string;
  name: string;
  inputs: CalculatorInputs;
  yearlyData: YearlyData[];
  color: string;
}
