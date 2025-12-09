import type { Scenario } from '../types';
import { formatCurrency } from '../utils/calculations';

interface Props {
  scenarios: Scenario[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function ScenarioList({ scenarios, onRemove, onClear }: Props) {
  if (scenarios.length === 0) {
    return null;
  }

  return (
    <div className="scenario-list">
      <div className="scenario-header">
        <div className="scenario-count">
          <h3 className="scenario-title">Scenarios</h3>
          <span className="scenario-badge">{scenarios.length}</span>
        </div>
        <button onClick={onClear} className="btn-ghost">
          Clear All
        </button>
      </div>

      <div className="scenarios">
        {scenarios.map((scenario) => {
          const finalYear = scenario.yearlyData[scenario.yearlyData.length - 1];
          return (
            <div key={scenario.id} className="scenario-card">
              <div
                className="scenario-color-bar"
                style={{ backgroundColor: scenario.color }}
              />
              <div className="scenario-content">
                <div className="scenario-name">{scenario.name}</div>
                <div className="scenario-params">
                  <span className="scenario-param">
                    {formatCurrency(scenario.inputs.initialInvestment)}
                  </span>
                  <span className="scenario-param">
                    {scenario.inputs.annualReturn}% return
                  </span>
                  <span className="scenario-param">
                    {scenario.inputs.inflationRate}% infl.
                  </span>
                  <span className="scenario-param">
                    {scenario.inputs.years}y
                  </span>
                </div>
                <div className="scenario-results">
                  <div className="scenario-result">
                    <span className="scenario-result-label">Nominal</span>
                    <span className="scenario-result-value nominal">
                      {formatCurrency(finalYear.nominalValue)}
                    </span>
                  </div>
                  <div className="scenario-result">
                    <span className="scenario-result-label">Real</span>
                    <span className="scenario-result-value real">
                      {formatCurrency(finalYear.realValue)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemove(scenario.id)}
                className="btn-remove"
                aria-label="Remove scenario"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
