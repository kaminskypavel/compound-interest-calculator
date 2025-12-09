import type { Scenario } from '../types';
import { formatCurrency } from '../utils/calculations';
import { useI18nStore } from '../stores/i18nStore';

interface Props {
  scenarios: Scenario[];
  onRemove: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onClear: () => void;
}

export function ScenarioList({ scenarios, onRemove, onToggleVisibility, onClear }: Props) {
  const { t } = useI18nStore();

  if (scenarios.length === 0) {
    return null;
  }

  return (
    <div className="scenario-list">
      <div className="scenario-header">
        <div className="scenario-count">
          <h3 className="scenario-title">{t.scenarios}</h3>
          <span className="scenario-badge">{scenarios.length}</span>
        </div>
        <button onClick={onClear} className="btn-ghost">
          {t.clearAll}
        </button>
      </div>

      <div className="scenarios">
        {scenarios.map((scenario) => {
          const finalYear = scenario.yearlyData[scenario.yearlyData.length - 1];
          const monthlyContribution = scenario.inputs.monthlyContribution ?? 0;
          const totalContributions = scenario.inputs.initialInvestment +
            monthlyContribution * scenario.inputs.years * 12;
          const growth = ((finalYear.nominalValue / totalContributions - 1) * 100).toFixed(0);
          return (
            <div key={scenario.id} className="scenario-card">
              <div
                className="scenario-color-bar"
                style={{ backgroundColor: scenario.color }}
              />
              <div className="scenario-card-content">
                <div className="scenario-card-header">
                  <div className="scenario-name">{scenario.name}</div>
                  <div className="scenario-card-actions">
                    <button
                      onClick={() => onToggleVisibility(scenario.id)}
                      className={`btn-visibility ${scenario.visible ? '' : 'hidden'}`}
                      aria-label={scenario.visible ? 'Hide from chart' : 'Show on chart'}
                    >
                      {scenario.visible ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => onRemove(scenario.id)}
                      className="btn-remove"
                      aria-label="Remove scenario"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="scenario-params">
                  <div className="scenario-param">
                    <span className="param-label">{t.initialInvestment}</span>
                    <span className="param-value">{formatCurrency(scenario.inputs.initialInvestment, t.currency)}</span>
                  </div>
                  <div className="scenario-param">
                    <span className="param-label">{t.monthlyContribution}</span>
                    <span className="param-value">{formatCurrency(monthlyContribution, t.currency)}{t.perMonth}</span>
                  </div>
                  <div className="scenario-param">
                    <span className="param-label">{t.annualReturn}</span>
                    <span className="param-value">{scenario.inputs.annualReturn}%</span>
                  </div>
                  <div className="scenario-param">
                    <span className="param-label">{t.inflationRate}</span>
                    <span className="param-value">{scenario.inputs.inflationRate}%</span>
                  </div>
                  <div className="scenario-param">
                    <span className="param-label">{t.timeHorizon}</span>
                    <span className="param-value">{scenario.inputs.years} {t.years}</span>
                  </div>
                </div>

                <div className="scenario-divider" />

                <div className="scenario-results">
                  <div className="scenario-result">
                    <span className="result-label">{t.nominal}</span>
                    <span className="result-value nominal">{formatCurrency(finalYear.nominalValue, t.currency)}</span>
                  </div>
                  <div className="scenario-result">
                    <span className="result-label">{t.real}</span>
                    <span className="result-value real">{formatCurrency(finalYear.realValue, t.currency)}</span>
                  </div>
                  <div className="scenario-result growth">
                    <span className="result-label">{t.growth}</span>
                    <span className="result-value">+{growth}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
