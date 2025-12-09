import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'en' | 'he';

interface TranslationStrings {
  logoText: string;
  logoAccent: string;
  tagline: string;
  share: string;
  reset: string;
  linkCopied: string;
  scenarioName: string;
  scenarioNamePlaceholder: string;
  required: string;
  expected: string;
  initialInvestment: string;
  annualReturn: string;
  inflationRate: string;
  timeHorizon: string;
  years: string;
  addScenario: string;
  random: string;
  nameRequired: string;
  mustBePositive: string;
  displayMode: string;
  nominal: string;
  real: string;
  both: string;
  scenarios: string;
  clearAll: string;
  finalNominal: string;
  finalReal: string;
  growth: string;
  portfolioGrowth: string;
  visualizeTrajectories: string;
  noScenariosYet: string;
  addFirstScenario: string;
  scenariosCompared: (count: number, years: number) => string;
  exporting: string;
  png: string;
  randomNames: string[];
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    // Header
    logoText: 'Compound',
    logoAccent: 'Growth',
    tagline: 'Investment Calculator',
    share: 'Share',
    reset: 'Reset',
    linkCopied: 'Link copied to clipboard!',

    // Form
    scenarioName: 'Scenario Name',
    scenarioNamePlaceholder: 'e.g., Conservative Portfolio',
    required: 'required',
    expected: 'expected',
    initialInvestment: 'Initial Investment',
    annualReturn: 'Annual Return',
    inflationRate: 'Inflation Rate',
    timeHorizon: 'Time Horizon',
    years: 'yrs',
    addScenario: 'Add Scenario',
    random: 'Random',
    nameRequired: 'Name is required',
    mustBePositive: 'Must be positive',

    // Display Mode
    displayMode: 'Display Mode',
    nominal: 'Nominal',
    real: 'Real',
    both: 'Both',

    // Scenario List
    scenarios: 'Scenarios',
    clearAll: 'Clear all',
    finalNominal: 'Final (Nominal)',
    finalReal: 'Final (Real)',
    growth: 'Growth',

    // Chart
    portfolioGrowth: 'Portfolio Growth',
    visualizeTrajectories: 'Visualize your investment trajectories',
    noScenariosYet: 'No scenarios yet',
    addFirstScenario: 'Add your first investment scenario using the form above to see growth projections',
    scenariosCompared: (count: number, years: number) =>
      `${count} scenario${count !== 1 ? 's' : ''} compared over ${years} years`,
    exporting: 'Exporting...',
    png: 'PNG',

    // Random scenario names
    randomNames: [
      'Conservative', 'Aggressive', 'Balanced', 'Growth', 'Income',
      'S&P 500', 'Tech Heavy', 'Bonds Mix', 'Real Estate', 'International',
      'Retirement', 'College Fund', 'Emergency', 'Vacation', 'House Down Payment'
    ],
  },
  he: {
    // Header
    logoText: 'ריבית',
    logoAccent: 'דריבית',
    tagline: 'מחשבון השקעות',
    share: 'שתף',
    reset: 'איפוס',
    linkCopied: 'הקישור הועתק!',

    // Form
    scenarioName: 'שם התרחיש',
    scenarioNamePlaceholder: 'לדוגמה: תיק סולידי',
    required: 'חובה',
    expected: 'צפוי',
    initialInvestment: 'השקעה ראשונית',
    annualReturn: 'תשואה שנתית',
    inflationRate: 'שיעור אינפלציה',
    timeHorizon: 'טווח זמן',
    years: 'שנים',
    addScenario: 'הוסף תרחיש',
    random: 'אקראי',
    nameRequired: 'נדרש שם',
    mustBePositive: 'חייב להיות חיובי',

    // Display Mode
    displayMode: 'מצב תצוגה',
    nominal: 'נומינלי',
    real: 'ריאלי',
    both: 'שניהם',

    // Scenario List
    scenarios: 'תרחישים',
    clearAll: 'נקה הכל',
    finalNominal: 'סופי (נומינלי)',
    finalReal: 'סופי (ריאלי)',
    growth: 'צמיחה',

    // Chart
    portfolioGrowth: 'צמיחת תיק ההשקעות',
    visualizeTrajectories: 'צפה במסלולי ההשקעה שלך',
    noScenariosYet: 'אין תרחישים עדיין',
    addFirstScenario: 'הוסף את תרחיש ההשקעה הראשון שלך באמצעות הטופס למעלה כדי לראות תחזיות צמיחה',
    scenariosCompared: (count: number, years: number) =>
      `${count} תרחיש${count !== 1 ? 'ים' : ''} בהשוואה על פני ${years} שנים`,
    exporting: 'מייצא...',
    png: 'PNG',

    // Random scenario names
    randomNames: [
      'סולידי', 'אגרסיבי', 'מאוזן', 'צמיחה', 'הכנסה',
      'S&P 500', 'טכנולוגיה', 'אגרות חוב', 'נדל"ן', 'בינלאומי',
      'פנסיה', 'קרן לימודים', 'חירום', 'חופשה', 'מקדמה לדירה'
    ],
  },
};

export type Translations = TranslationStrings;

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',
      t: translations.en,

      setLanguage: (language: Language) => {
        set({
          language,
          t: translations[language],
        });
      },
    }),
    {
      name: 'compound-calculator-i18n',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          state.t = translations[state.language];
        }
      },
    }
  )
);
