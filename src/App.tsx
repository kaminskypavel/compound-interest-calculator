import { useEffect } from 'react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultsChart } from './components/ResultsChart';
import { ScenarioList } from './components/ScenarioList';
import { useScenarioStore } from './stores/scenarioStore';
import './App.css';

const displayModes = ['nominal', 'real', 'both'] as const;

function App() {
  // URL-synced display mode with nuqs
  const [displayMode, setDisplayMode] = useQueryState(
    'mode',
    parseAsStringLiteral(displayModes).withDefault('both')
  );

  // URL-synced scenarios data
  const [scenariosParam, setScenariosParam] = useQueryState('s');

  // Zustand store for scenarios
  const {
    scenarios,
    addScenario,
    removeScenario,
    clearScenarios,
    getSerializedScenarios,
    loadSerializedScenarios,
  } = useScenarioStore();

  // Load scenarios from URL on mount
  useEffect(() => {
    if (scenariosParam && scenarios.length === 0) {
      loadSerializedScenarios(scenariosParam);
    }
  }, []);

  // Sync scenarios to URL when they change
  useEffect(() => {
    const serialized = getSerializedScenarios();
    if (serialized !== scenariosParam) {
      setScenariosParam(serialized || null);
    }
  }, [scenarios]);

  const handleClear = () => {
    clearScenarios();
    setScenariosParam(null);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="app dark">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">Compound</span>
            <span className="logo-accent">Growth</span>
          </div>
          <div className="header-actions">
            {scenarios.length > 0 && (
              <button onClick={copyShareLink} className="btn-share">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16,6 12,2 8,6" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Share
              </button>
            )}
            <span className="header-tagline">Investment Calculator</span>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="form-section">
          <CalculatorForm onCalculate={addScenario} />
        </section>

        <section className="options-section">
          <div className="display-options">
            <div className="display-options-title">Display Mode</div>
            <div className="segmented-toggle">
              <button
                type="button"
                className={`toggle-btn ${displayMode === 'nominal' ? 'active' : ''}`}
                onClick={() => setDisplayMode('nominal')}
              >
                Nominal
              </button>
              <button
                type="button"
                className={`toggle-btn ${displayMode === 'both' ? 'active' : ''}`}
                onClick={() => setDisplayMode('both')}
              >
                Both
              </button>
              <button
                type="button"
                className={`toggle-btn ${displayMode === 'real' ? 'active' : ''}`}
                onClick={() => setDisplayMode('real')}
              >
                Real
              </button>
            </div>
          </div>

          <ScenarioList
            scenarios={scenarios}
            onRemove={removeScenario}
            onClear={handleClear}
          />
        </section>

        <section className="chart-section">
          <ResultsChart
            scenarios={scenarios}
            showReal={displayMode === 'real' || displayMode === 'both'}
            showNominal={displayMode === 'nominal' || displayMode === 'both'}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
