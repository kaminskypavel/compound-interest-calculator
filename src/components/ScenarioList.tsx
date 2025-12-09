import type { Scenario } from '../types';
import { formatCurrency } from '../utils/calculations';
import { useI18nStore } from '../stores/i18nStore';
import type { Translations } from '../stores/i18nStore';

interface Props {
  scenarios: Scenario[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function ScenarioList({ scenarios, onRemove, onClear }: Props) {
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
          const growth = ((finalYear.nominalValue / scenario.inputs.initialInvestment - 1) * 100).toFixed(0);
          return (
            <div key={scenario.id} className="scenario-card">
              <div
                className="scenario-color-bar"
                style={{ backgroundColor: scenario.color }}
              />
              <div className="scenario-card-content">
                <div className="scenario-card-header">
                  <div className="scenario-name">{scenario.name}</div>
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

                <div className="scenario-params">
                  <div className="scenario-param">
                    <span className="param-label">{t.initialInvestment}</span>
                    <span className="param-value">{formatCurrency(scenario.inputs.initialInvestment, t.currency)}</span>
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
