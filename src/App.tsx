import { useState } from 'react';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultsChart } from './components/ResultsChart';
import { ScenarioList } from './components/ScenarioList';
import type { CalculatorInputs, Scenario } from './types';
import { calculateCompoundInterest, generateColor } from './utils/calculations';
import './App.css';

function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showReal, setShowReal] = useState(true);
  const [showNominal, setShowNominal] = useState(true);

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
            <div className="display-options-title">Display Options</div>
            <div className="toggle-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={showNominal}
                  onChange={(e) => setShowNominal(e.target.checked)}
                />
                <span className="toggle-text">
                  Nominal Returns
                  <span className="toggle-text-sub">before inflation</span>
                </span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={showReal}
                  onChange={(e) => setShowReal(e.target.checked)}
                />
                <span className="toggle-text">
                  Real Returns
                  <span className="toggle-text-sub">inflation-adjusted</span>
                </span>
              </label>
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
            showReal={showReal}
            showNominal={showNominal}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
