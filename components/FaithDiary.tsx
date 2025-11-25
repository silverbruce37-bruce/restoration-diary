import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { DiaryEntry, SavedDiaryEntry } from '../types';

interface FaithDiaryProps {
  storageKey: string;
}

const FaithDiary: React.FC<FaithDiaryProps> = ({ storageKey }) => {
  const { t } = useLanguage();
  const [diary, setDiary] = useState<DiaryEntry>({
    repentance: '',
    resolve: '',
    dream: '',
  });
  const [savedEntries, setSavedEntries] = useState<SavedDiaryEntry[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedEntries(parsed);
        if (parsed.length > 0) {
          setDiary(parsed[parsed.length - 1].content);
        }
      } catch (e) {
        console.error('Error loading diary:', e);
      }
    }
  }, [storageKey]);

  const handleSave = () => {
    const newEntry: SavedDiaryEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      content: diary,
    };
    
    const updated = [...savedEntries, newEntry];
    setSavedEntries(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleChange = (field: keyof DiaryEntry) => (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDiary(prev => ({ ...prev, [field]: e.target.value }));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <h2 className="text-2xl font-bold text-amber-400 mb-6">{t('diaryTitle')}</h2>
        
        <div className="space-y-6">
          {/* Repentance */}
          <div>
            <label className="block text-amber-300 font-semibold mb-2">
              {t('repentanceLabel')}
            </label>
            <textarea
              value={diary.repentance}
              onChange={handleChange('repentance')}
              placeholder={t('repentancePlaceholder')}
              className="w-full h-32 bg-stone-900/50 border border-amber-800/30 rounded-xl p-4 text-amber-100 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
            />
          </div>

          {/* Resolve */}
          <div>
            <label className="block text-amber-300 font-semibold mb-2">
              {t('resolveLabel')}
            </label>
            <textarea
              value={diary.resolve}
              onChange={handleChange('resolve')}
              placeholder={t('resolvePlaceholder')}
              className="w-full h-32 bg-stone-900/50 border border-amber-800/30 rounded-xl p-4 text-amber-100 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
            />
          </div>

          {/* Dream/Vision */}
          <div>
            <label className="block text-amber-300 font-semibold mb-2">
              {t('dreamLabel')}
            </label>
            <textarea
              value={diary.dream}
              onChange={handleChange('dream')}
              placeholder={t('dreamPlaceholder')}
              className="w-full h-32 bg-stone-900/50 border border-amber-800/30 rounded-xl p-4 text-amber-100 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!diary.repentance && !diary.resolve && !diary.dream}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              isSaved
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isSaved ? t('saved') : t('saveDiaryButton')}
          </button>
        </div>
      </div>

      {/* Saved Entries */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <h3 className="text-xl font-bold text-amber-400 mb-4">{t('todaysRecord')}</h3>
        
        {savedEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-amber-200/60">{t('noRecords')}</p>
            <p className="text-amber-200/40 text-sm mt-2">{t('noRecordsHint')}</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {savedEntries.slice().reverse().map((entry) => (
              <div
                key={entry.id}
                className="bg-stone-900/50 rounded-xl p-4 border border-amber-800/20"
              >
                <p className="text-amber-500/70 text-xs mb-3">
                  {t('savedAt', { time: formatTime(entry.timestamp) })}
                </p>
                
                {entry.content.repentance && (
                  <div className="mb-3">
                    <span className="text-amber-400 text-sm font-semibold">{t('repentanceLabel')}</span>
                    <p className="text-amber-100/80 text-sm mt-1 whitespace-pre-wrap">
                      {entry.content.repentance}
                    </p>
                  </div>
                )}
                
                {entry.content.resolve && (
                  <div className="mb-3">
                    <span className="text-amber-400 text-sm font-semibold">{t('resolveLabel')}</span>
                    <p className="text-amber-100/80 text-sm mt-1 whitespace-pre-wrap">
                      {entry.content.resolve}
                    </p>
                  </div>
                )}
                
                {entry.content.dream && (
                  <div>
                    <span className="text-amber-400 text-sm font-semibold">{t('dreamLabel')}</span>
                    <p className="text-amber-100/80 text-sm mt-1 whitespace-pre-wrap">
                      {entry.content.dream}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaithDiary;
