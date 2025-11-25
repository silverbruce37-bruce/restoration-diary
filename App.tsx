import React, { useState, useEffect } from 'react';
import { getDailyReading } from './constants';
import { ActiveTab, DailyReading } from './types';
import BibleReading from './components/BibleReading';
import FaithDiary from './components/FaithDiary';
import EvangelismMission from './components/EvangelismMission';
import { useLanguage } from './i18n';
import Spinner from './components/common/Spinner';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('reading');
  const [passage, setPassage] = useState<string>('');
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      setIsCheckingApiKey(true);
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setApiKeySelected(true);
      } else if (import.meta.env.VITE_GEMINI_API_KEY) {
        setApiKeySelected(true);
      }
      setIsCheckingApiKey(false);
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKeySelected(true);
    }
  };

  const today = new Date();
  const dailyReading: DailyReading = getDailyReading(today, language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('appName');
  }, [language, t]);

  const todayDateString = today.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const readingRef = `${dailyReading[0].book} ${dailyReading[0].chapter}-${dailyReading[1].chapter}${language === 'ko' ? '장' : ''}`;

  const storageKey = today.toISOString().split('T')[0];

  const NavButton = ({ tab, label }: { tab: ActiveTab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-3 px-2 text-sm md:text-base font-semibold transition-all duration-300 rounded-t-lg ${
        activeTab === tab
          ? 'bg-stone-800 text-amber-400 border-b-2 border-amber-500'
          : 'bg-amber-900/40 text-amber-200 hover:bg-amber-800/40'
      }`}
    >
      {label}
    </button>
  );

  const LanguageButton = ({ lang, label }: { lang: 'ko' | 'en'; label: string }) => (
    <button
      onClick={() => setLanguage(lang)}
      className={`px-3 py-1 text-xs rounded-md transition-colors ${
        language === lang
          ? 'bg-amber-200 text-amber-900 font-bold'
          : 'bg-transparent text-amber-200 hover:bg-amber-800/50'
      }`}
    >
      {label}
    </button>
  );

  if (isCheckingApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950 flex items-center justify-center">
        <Spinner message={t('loading')} />
      </div>
    );
  }

  if (!apiKeySelected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950 flex items-center justify-center text-center text-amber-200 p-4">
        <div className="max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-amber-100 mb-4">{t('apiKeyRequiredTitle')}</h1>
          <p className="mb-6 text-amber-200/80">{t('apiKeyRequiredMessage')}</p>
          <button
            onClick={handleSelectApiKey}
            className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg shadow-amber-900/50"
          >
            {t('selectApiKeyButton')}
          </button>
          <p
            className="text-xs text-amber-400/60 mt-4"
            dangerouslySetInnerHTML={{ __html: t('billingInfoLink') }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950 font-sans text-amber-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white shadow-xl sticky top-0 z-10 border-b border-amber-700/50">
        <div className="container mx-auto px-4 pt-4 pb-2 text-center relative">
          {/* Brand */}
          <div className="absolute top-3 left-4">
            <span className="font-bold text-amber-200 tracking-widest text-xs uppercase">
              에스라-느헤미야
            </span>
          </div>

          {/* Language Toggle */}
          <div className="absolute top-2 right-2 flex space-x-1 border border-amber-600/50 rounded-lg p-0.5 bg-amber-900/30">
            <LanguageButton lang="ko" label={t('korean')} />
            <LanguageButton lang="en" label={t('english')} />
          </div>

          {/* Main Title */}
          <p className="text-sm md:text-base text-amber-300">{t('headerSubtitle')}</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 tracking-wider bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 text-transparent bg-clip-text">
            {t('headerTitle')}
          </h1>

          {/* Date & Reading */}
          <p className="mt-4 text-amber-300/80">{todayDateString}</p>
          <p className="mt-1 font-semibold text-lg text-amber-200">
            {t('todaysWord')}: {readingRef}
          </p>
        </div>

        {/* Navigation */}
        <nav className="container mx-auto px-2 md:px-4 flex justify-around mt-4">
          <NavButton tab="reading" label={t('navReading')} />
          <NavButton tab="diary" label={t('navDiary')} />
          <NavButton tab="mission" label={t('navMission')} />
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6">
        {activeTab === 'reading' && (
          <BibleReading reading={dailyReading} onPassageLoaded={setPassage} />
        )}
        {activeTab === 'diary' && <FaithDiary storageKey={`diary-${storageKey}`} />}
        {activeTab === 'mission' &&
          (passage ? (
            <EvangelismMission passage={passage} storageKey={`mission-${storageKey}`} />
          ) : (
            <div className="text-center p-8 bg-stone-800/50 rounded-2xl border border-amber-800/30">
              <p className="text-amber-200/60">{t('readingFirst')}</p>
            </div>
          ))}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-amber-500/60 border-t border-amber-900/30">
        <p>{t('footer', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
};

export default App;
