import { useEffect } from 'react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultsChart } from './components/ResultsChart';
import { ScenarioList } from './components/ScenarioList';
import { useScenarioStore } from './stores/scenarioStore';
import { useI18nStore } from './stores/i18nStore';
import './App.css';

const displayModes = ['nominal', 'real', 'both'] as const;

function App() {
  // URL-synced display mode with nuqs
  const [displayMode, setDisplayMode] = useQueryState(
    'mode',
    parseAsStringLiteral(displayModes).withDefault('nominal')
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

  // i18n
  const { language, setLanguage, t } = useI18nStore();
  const isRTL = language === 'he';

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
    alert(t.linkCopied);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <div className={`app dark ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">{t.logoText}</span>
            <span className="logo-accent">{t.logoAccent}</span>
          </div>
          <div className="header-actions">
            <button onClick={toggleLanguage} className="btn-lang" title={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}>
              <img
                src={`${import.meta.env.BASE_URL}flags/${language === 'en' ? 'us' : 'il'}.svg`}
                alt={language === 'en' ? 'English' : 'עברית'}
                className="flag-icon"
              />
            </button>
            {scenarios.length > 0 && (
              <>
                <button onClick={handleClear} className="btn-reset">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t.reset}
                </button>
                <button onClick={copyShareLink} className="btn-share">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16,6 12,2 8,6" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t.share}
                </button>
              </>
            )}
            <span className="header-tagline">{t.tagline}</span>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="form-section">
          <CalculatorForm onCalculate={addScenario} />
        </section>

        <section className="options-section">
          <div className="display-options">
            <div className="display-options-title">{t.displayMode}</div>
            <div className="segmented-toggle">
              <button
                type="button"
                className={`toggle-btn ${displayMode === 'nominal' ? 'active' : ''}`}
                onClick={() => setDisplayMode('nominal')}
              >
                {t.nominal}
              </button>
              <button
                type="button"
                className={`toggle-btn ${displayMode === 'real' ? 'active' : ''}`}
                onClick={() => setDisplayMode('real')}
              >
                {t.real}
              </button>
              <button
                type="button"
                className={`toggle-btn ${displayMode === 'both' ? 'active' : ''}`}
                onClick={() => setDisplayMode('both')}
              >
                {t.both}
              </button>
            </div>
          </div>
        </section>

        {scenarios.length > 0 && (
          <ScenarioList
            scenarios={scenarios}
            onRemove={removeScenario}
            onClear={handleClear}
          />
        )}

        <section className="chart-section">
          <ResultsChart
            scenarios={scenarios}
            showReal={displayMode === 'real' || displayMode === 'both'}
            showNominal={displayMode === 'nominal' || displayMode === 'both'}
          />
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <span className="footer-text">
            Developed with <span className="footer-heart">♥</span> by{' '}
            <a href="https://www.pavel-kaminsky.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              Pavel "PK" Kaminsky
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
