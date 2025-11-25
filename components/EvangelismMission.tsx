import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../i18n';
import { SavedPlanEntry } from '../types';
import { MOCK_DATA } from '../constants';
import Spinner from './common/Spinner';
import { GoogleGenAI } from '@google/genai';

interface EvangelismMissionProps {
  passage: string;
  storageKey: string;
}

const getApiKey = (): string => {
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  return '';
};

const EvangelismMission: React.FC<EvangelismMissionProps> = ({ passage, storageKey }) => {
  const { language, t } = useLanguage();
  const [plan, setPlan] = useState('');
  const [savedPlans, setSavedPlans] = useState<SavedPlanEntry[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [tips, setTips] = useState<string>('');
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [prayer, setPrayer] = useState<string>('');
  const [isGeneratingPrayer, setIsGeneratingPrayer] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedPlans(parsed);
        if (parsed.length > 0) {
          setPlan(parsed[parsed.length - 1].content);
        }
      } catch (e) {
        console.error('Error loading plans:', e);
      }
    }
  }, [storageKey]);

  const generateTips = useCallback(async () => {
    setIsGeneratingTips(true);
    try {
      const apiKey = getApiKey();
      if (!apiKey || apiKey === 'your_api_key_here') {
        setTips(MOCK_DATA[language].tips);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const langInstruction = language === 'ko' ? '한국어로' : 'in English';

      const prompt = `오늘의 성경 본문을 바탕으로 전도 팁을 ${langInstruction} 제공해 주세요.

본문: ${passage.substring(0, 500)}...

에스라-느헤미야 시대의 맥락에서:
1. 이 말씀에서 발견할 수 있는 복음의 핵심 메시지
2. 포로에서 돌아온 백성들의 이야기를 통해 전할 수 있는 회복의 복음
3. 현대인들에게 이 이야기를 전할 때 연결점 2-3가지
4. 구체적인 대화 시작 예시 1-2가지

실제로 사용할 수 있는 실용적인 팁을 제공해 주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      setTips(response.text || '');
    } catch (err) {
      console.error('Error generating tips:', err);
      setTips(MOCK_DATA[language].tips);
    } finally {
      setIsGeneratingTips(false);
    }
  }, [passage, language, t]);

  const generatePrayer = useCallback(async () => {
    setIsGeneratingPrayer(true);
    try {
      const apiKey = getApiKey();
      if (!apiKey || apiKey === 'your_api_key_here') {
        setPrayer(MOCK_DATA[language].prayer);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const langInstruction = language === 'ko' ? '한국어로' : 'in English';

      const prompt = `오늘의 성경 본문을 바탕으로 기도문을 ${langInstruction} 작성해 주세요.

본문: ${passage.substring(0, 500)}...

에스라의 회개 기도(에스라 9장)와 느헤미야의 간구(느헤미야 1장)의 스타일을 참고하여:
1. 하나님의 신실하심을 찬양
2. 우리의 부족함을 고백
3. 회복과 재건을 위한 간구
4. 전도와 선교를 위한 기도

진심 어린 기도문을 작성해 주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      setPrayer(response.text || '');
    } catch (err) {
      console.error('Error generating prayer:', err);
      setPrayer(MOCK_DATA[language].prayer);
    } finally {
      setIsGeneratingPrayer(false);
    }
  }, [passage, language, t]);

  const handleSave = () => {
    const newEntry: SavedPlanEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      content: plan,
    };

    const updated = [...savedPlans, newEntry];
    setSavedPlans(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Evangelism Tips */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <h2 className="text-xl font-bold text-amber-400 mb-4">{t('evangelismTraining')}</h2>

        {isGeneratingTips ? (
          <Spinner message={t('generatingTips')} />
        ) : tips ? (
          <div className="text-amber-200/90 leading-relaxed whitespace-pre-wrap">
            {tips}
          </div>
        ) : (
          <button
            onClick={generateTips}
            className="w-full py-3 bg-amber-600/20 text-amber-300 rounded-lg hover:bg-amber-600/40 transition-colors"
          >
            {t('generatingTips')}
          </button>
        )}
      </div>

      {/* Prayer Training */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <h2 className="text-xl font-bold text-amber-400 mb-4">{t('prayerTraining')}</h2>
        <p className="text-amber-200/60 text-sm mb-4">{t('prayerPrompt')}</p>

        {isGeneratingPrayer ? (
          <Spinner message={t('generatingPrayer')} />
        ) : prayer ? (
          <div className="text-amber-200/90 leading-relaxed whitespace-pre-wrap bg-stone-900/50 rounded-xl p-4 border border-amber-800/20">
            {prayer}
          </div>
        ) : (
          <button
            onClick={generatePrayer}
            className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-500 transition-all font-semibold"
          >
            {t('generatePrayerButton')}
          </button>
        )}
      </div>

      {/* Mission Plan */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <h2 className="text-xl font-bold text-amber-400 mb-4">{t('myMissionPlan')}</h2>

        <textarea
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder={t('missionPlanPlaceholder')}
          className="w-full h-40 bg-stone-900/50 border border-amber-800/30 rounded-xl p-4 text-amber-100 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none mb-4"
        />

        <button
          onClick={handleSave}
          disabled={!plan.trim()}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${isSaved
              ? 'bg-green-600 text-white'
              : 'bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
        >
          {isSaved ? t('saved') : t('savePlanButton')}
        </button>
      </div>

      {/* Saved Plans */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <h3 className="text-xl font-bold text-amber-400 mb-4">{t('myRecords')}</h3>

        {savedPlans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-amber-200/60">{t('noPlans')}</p>
            <p className="text-amber-200/40 text-sm mt-2">{t('noPlansHint')}</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {savedPlans.slice().reverse().map((entry) => (
              <div
                key={entry.id}
                className="bg-stone-900/50 rounded-xl p-4 border border-amber-800/20"
              >
                <p className="text-amber-500/70 text-xs mb-2">
                  {t('savedAt', { time: formatTime(entry.timestamp) })}
                </p>
                <p className="text-amber-100/80 text-sm whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvangelismMission;
