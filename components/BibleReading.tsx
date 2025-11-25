import React, { useState, useEffect, useCallback } from 'react';
import { DailyReading } from '../types';
import { getFullSchedule, HISTORICAL_CONTEXT, readingPlan, MOCK_DATA } from '../constants';
import { useLanguage } from '../i18n';
import Spinner from './common/Spinner';
import { GoogleGenAI } from '@google/genai';

interface BibleReadingProps {
  reading: DailyReading;
  onPassageLoaded: (passage: string) => void;
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

const BibleReading: React.FC<BibleReadingProps> = ({ reading, onPassageLoaded }) => {
  const { language, t } = useLanguage();
  const [passage, setPassage] = useState<string>('');
  const [meditationGuide, setMeditationGuide] = useState<string>('');
  const [intention, setIntention] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [isGeneratingIntention, setIsGeneratingIntention] = useState(false);
  const [isGeneratingContext, setIsGeneratingContext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const readingRef = `${reading[0].book} ${reading[0].chapter}-${reading[1].chapter}`;
  const totalDays = Math.ceil(readingPlan.length / 2);

  const today = new Date();
  const startDate = new Date(2025, 0, 1);
  const dayDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = (dayDiff % totalDays) + 1;

  const fetchPassage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = getApiKey();
      if (!apiKey || apiKey === 'your_api_key_here') {
        // Use mock data if no API key
        const mockPassage = MOCK_DATA[language].passage;
        setPassage(mockPassage);
        onPassageLoaded(mockPassage);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const langInstruction = language === 'ko' ? '한국어로' : 'in English';

      const prompt = `${reading[0].book} ${reading[0].chapter}장과 ${reading[1].chapter}장의 전체 본문을 ${langInstruction} 제공해 주세요. 
성경 본문만 제공하고 다른 설명은 추가하지 마세요. 각 절 번호를 포함해 주세요.
형식: 
[장 번호]장
1. (본문)
2. (본문)
...`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const text = response.text || '';
      setPassage(text);
      onPassageLoaded(text);
    } catch (err: any) {
      console.error('Error fetching passage:', err);
      // Fallback to mock data on error
      const mockPassage = MOCK_DATA[language].passage;
      setPassage(mockPassage);
      onPassageLoaded(mockPassage);
    } finally {
      setIsLoading(false);
    }
  }, [reading, language, t, onPassageLoaded]);

  const generateMeditationGuide = useCallback(async () => {
    if (!passage) return;
    setIsGeneratingGuide(true);

    try {
      const apiKey = getApiKey();
      if (!apiKey || apiKey === 'your_api_key_here') {
        setMeditationGuide(MOCK_DATA[language].meditationGuide);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const langInstruction = language === 'ko' ? '한국어로' : 'in English';

      const prompt = `다음 성경 본문에 대한 묵상 가이드를 ${langInstruction} 작성해 주세요.
본문: ${readingRef}

이 본문은 에스라-느헤미야 시대의 말씀으로, 포로귀환 시대의 회복과 재건을 다룹니다.
하나님의 경륜(섭리) 관점에서:
1. 이 말씀이 전하는 핵심 메시지
2. 당시 백성들에게 주는 의미
3. 오늘날 우리에게 주는 적용점
4. 회복과 재건의 관점에서 묵상할 질문 2-3가지

간결하고 깊이 있게 작성해 주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      setMeditationGuide(response.text || '');
    } catch (err) {
      console.error('Error generating guide:', err);
      setMeditationGuide(MOCK_DATA[language].meditationGuide);
    } finally {
      setIsGeneratingGuide(false);
    }
  }, [passage, readingRef, language]);

  const generateIntention = useCallback(async () => {
    if (!passage) return;
    setIsGeneratingIntention(true);

    try {
      const apiKey = getApiKey();
      if (!apiKey || apiKey === 'your_api_key_here') {
        setIntention(MOCK_DATA[language].intention);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const langInstruction = language === 'ko' ? '한국어로' : 'in English';

      const prompt = `다음 성경 본문에서 하나님의 뜻과 경륜을 ${langInstruction} 분석해 주세요.
본문: ${readingRef}

에스라-느헤미야 시대의 맥락에서:
1. 하나님께서 이 말씀을 통해 전하고자 하신 핵심 의도
2. 이스라엘 회복 계획 안에서 이 사건/말씀의 위치
3. 메시아적 관점에서의 의미 (해당되는 경우)

300자 내외로 작성해 주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      setIntention(response.text || '');
    } catch (err) {
      console.error('Error generating intention:', err);
      setIntention(MOCK_DATA[language].intention);
    } finally {
      setIsGeneratingIntention(false);
    }
  }, [passage, readingRef, language]);

  const generateContext = useCallback(async () => {
    if (!passage) return;
    setIsGeneratingContext(true);

    try {
      const apiKey = getApiKey();
      if (!apiKey || apiKey === 'your_api_key_here') {
        setContext(MOCK_DATA[language].context);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const langInstruction = language === 'ko' ? '한국어로' : 'in English';

      const prompt = `다음 성경 본문의 역사적 배경을 ${langInstruction} 설명해 주세요.
본문: ${readingRef}

다음 항목을 포함해 주세요:
1. 시대적 배경 (연도, 바사/페르시아 제국 상황)
2. 지리적 배경 (예루살렘, 바벨론, 수산 등)
3. 등장인물과 그들의 역할
4. 당시 유대인 공동체의 상황

300자 내외로 작성해 주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      setContext(response.text || '');
    } catch (err) {
      console.error('Error generating context:', err);
      setContext(MOCK_DATA[language].context);
    } finally {
      setIsGeneratingContext(false);
    }
  }, [passage, readingRef, language]);

  useEffect(() => {
    fetchPassage();
  }, [fetchPassage]);

  useEffect(() => {
    if (passage && !meditationGuide) {
      generateMeditationGuide();
    }
  }, [passage, meditationGuide, generateMeditationGuide]);

  const handleCopy = async () => {
    try {
      const textToCopy = `${readingRef}\n\n${passage}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert(t('copyFailed'));
    }
  };

  const schedule = getFullSchedule(language);
  const historicalContext = HISTORICAL_CONTEXT[language];

  if (isLoading) {
    return (
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <Spinner message={t('loadingPassage')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 rounded-2xl p-6 border border-red-700/50 text-center">
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchPassage}
          className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reading Schedule */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-400">{t('readingPlanTitle')}</h2>
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="text-sm text-amber-300 hover:text-amber-200 transition-colors"
          >
            {showSchedule ? t('hideButton') : t('showAllButton')}
          </button>
        </div>

        <p className="text-amber-200/80 text-sm mb-4">
          {t('readingPlanInfo', { totalDays, currentDay })}
        </p>

        {showSchedule && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-2">
            {schedule.map((item) => (
              <div
                key={item.day}
                className={`p-2 rounded-lg text-xs ${item.day === currentDay
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-stone-700/50 text-amber-200/70'
                  }`}
              >
                <span className="font-semibold">{t('day', { day: item.day })}</span>
                <br />
                {item.reading}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Timeline */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-400">{t('historicalContextTitle')}</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-amber-300 hover:text-amber-200 transition-colors"
          >
            {showHistory ? t('hideHistory') : t('showHistory')}
          </button>
        </div>

        {showHistory && (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-600/30"></div>
            <div className="space-y-4">
              {historicalContext.periods.map((period, idx) => (
                <div key={idx} className="flex items-start pl-10 relative">
                  <div className="absolute left-2.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-stone-800"></div>
                  <div>
                    <span className="text-amber-400 font-bold text-sm">{period.year}</span>
                    <p className="text-amber-200/80 text-sm">{period.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Today's Passage */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-400">{t('todaysPassage')}</h2>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${copied
                ? 'bg-green-600 text-white'
                : 'bg-amber-600/20 text-amber-300 hover:bg-amber-600/40'
              }`}
          >
            {copied ? t('copied') : t('copyButton')}
          </button>
        </div>

        <p className="text-lg font-semibold text-amber-300 mb-4">{readingRef}</p>

        <div className="prose prose-invert prose-amber max-w-none">
          <div className="text-amber-100/90 leading-relaxed whitespace-pre-wrap text-base">
            {passage}
          </div>
        </div>
      </div>

      {/* God's Providence */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <h2 className="text-xl font-bold text-amber-400 mb-4">{t('lordsWill')}</h2>
        {isGeneratingIntention ? (
          <Spinner message={t('analyzingIntent')} />
        ) : intention ? (
          <div className="text-amber-200/90 leading-relaxed whitespace-pre-wrap">
            {intention}
          </div>
        ) : (
          <button
            onClick={generateIntention}
            className="w-full py-3 bg-amber-600/20 text-amber-300 rounded-lg hover:bg-amber-600/40 transition-colors"
          >
            {t('analyzingIntent')}
          </button>
        )}
      </div>

      {/* Meditation Guide */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <h2 className="text-xl font-bold text-amber-400 mb-4">{t('meditationGuide')}</h2>
        {isGeneratingGuide ? (
          <Spinner message={t('generatingGuide')} />
        ) : meditationGuide ? (
          <div className="text-amber-200/90 leading-relaxed whitespace-pre-wrap">
            {meditationGuide}
          </div>
        ) : (
          <button
            onClick={generateMeditationGuide}
            className="w-full py-3 bg-amber-600/20 text-amber-300 rounded-lg hover:bg-amber-600/40 transition-colors"
          >
            {t('generatingGuide')}
          </button>
        )}
      </div>

      {/* Historical Background */}
      <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-800/30">
        <h2 className="text-xl font-bold text-amber-400 mb-4">{t('timeAndPlace')}</h2>
        {isGeneratingContext ? (
          <Spinner message={t('generatingBg')} />
        ) : context ? (
          <div className="text-amber-200/90 leading-relaxed whitespace-pre-wrap">
            {context}
          </div>
        ) : (
          <button
            onClick={generateContext}
            className="w-full py-3 bg-amber-600/20 text-amber-300 rounded-lg hover:bg-amber-600/40 transition-colors"
          >
            {t('generatingBg')}
          </button>
        )}
      </div>
    </div>
  );
};

export default BibleReading;
