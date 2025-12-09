import { useState } from 'react';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultsChart } from './components/ResultsChart';
import { ScenarioList } from './components/ScenarioList';
import type { CalculatorInputs, Scenario } from './types';
import { calculateCompoundInterest, generateColor } from './utils/calculations';
import './App.css';

type DisplayMode = 'nominal' | 'real' | 'both';

function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');

  const handleCalculate = (inputs: CalculatorInputs, name: string) => {
    const yearlyData = calculateCompoundInterest(inputs);
    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      name,
      inputs,
      yearlyData,
      color: generateColor(scenarios.length),
    };
    setScenarios((prev) => [...prev, newScenario]);
  };

  const handleRemove = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClear = () => {
    setScenarios([]);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-text">Compound</span>
          <span className="logo-accent">Growth</span>
        </div>
        <span className="header-tagline">Investment Calculator</span>
      </header>

      <main className="main">
        <aside className="sidebar">
          <CalculatorForm onCalculate={handleCalculate} />

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
            onRemove={handleRemove}
            onClear={handleClear}
          />
        </aside>

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
