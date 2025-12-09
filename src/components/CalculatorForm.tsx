import { useState } from 'react';
import type { CalculatorInputs } from '../types';

interface Props {
  onCalculate: (inputs: CalculatorInputs, name: string) => void;
}

export function CalculatorForm({ onCalculate }: Props) {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    initialInvestment: 10000,
    annualReturn: 7,
    inflationRate: 3,
    years: 30,
  });
  const [scenarioName, setScenarioName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = scenarioName.trim() || `$${inputs.initialInvestment.toLocaleString()} @ ${inputs.annualReturn}%`;
    onCalculate(inputs, name);
    setScenarioName('');
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({ ...prev, [field]: numValue }));
  };

  return (
    <form onSubmit={handleSubmit} className="calculator-form">
      <div className="form-header">
        <h2 className="form-title">New Scenario</h2>
        <p className="form-subtitle">Configure your investment parameters</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="scenarioName">
            Scenario Name
            <span className="form-label-hint">optional</span>
          </label>
          <input
            type="text"
            id="scenarioName"
            className="form-input"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="e.g., Conservative Portfolio"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="initialInvestment">
            Initial Investment
          </label>
          <div className="form-input-with-prefix">
            <span className="form-input-prefix">$</span>
            <input
              type="number"
              id="initialInvestment"
              className="form-input"
              value={inputs.initialInvestment}
              onChange={(e) => handleInputChange('initialInvestment', e.target.value)}
              min="0"
              step="any"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="annualReturn">
            Annual Return
            <span className="form-label-hint">expected</span>
          </label>
          <div className="form-input-with-suffix">
            <input
              type="number"
              id="annualReturn"
              className="form-input"
              value={inputs.annualReturn}
              onChange={(e) => handleInputChange('annualReturn', e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
            <span className="form-input-suffix">%</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inflationRate">
            Inflation Rate
            <span className="form-label-hint">expected</span>
          </label>
          <div className="form-input-with-suffix">
            <input
              type="number"
              id="inflationRate"
              className="form-input"
              value={inputs.inflationRate}
              onChange={(e) => handleInputChange('inflationRate', e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
            <span className="form-input-suffix">%</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="years">
            Time Horizon
          </label>
          <div className="form-input-with-suffix">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="years"
              className="form-input"
              value={inputs.years}
              onChange={(e) => handleInputChange('years', e.target.value)}
            />
            <span className="form-input-suffix">yrs</span>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary">
        Add Scenario
      </button>
    </form>
  );
}
