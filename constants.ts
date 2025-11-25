import { Reading, DailyReading } from './types';
import { Language } from './i18n';

// 에스라-느헤미야 시대 관련 성경 (하나님의 경륜 관점에서 배열)
// 역사적 순서: 고레스 칙령 → 1차 귀환 → 성전 재건 → 2차 귀환 → 성벽 재건 → 개혁
export const RESTORATION_BOOKS = [
  // 학개서 - 성전 재건 촉구 (BC 520년)
  { book: { ko: '학개', en: 'Haggai' }, chapters: 2 },
  // 스가랴서 - 성전 재건과 메시아 예언 (BC 520-518년)
  { book: { ko: '스가랴', en: 'Zechariah' }, chapters: 14 },
  // 에스라서 - 포로 귀환과 성전 완공 (BC 538-458년)
  { book: { ko: '에스라', en: 'Ezra' }, chapters: 10 },
  // 에스더서 - 바사 제국에서의 유대인 구원 (BC 483-473년)
  { book: { ko: '에스더', en: 'Esther' }, chapters: 10 },
  // 느헤미야서 - 성벽 재건과 공동체 회복 (BC 445년 이후)
  { book: { ko: '느헤미야', en: 'Nehemiah' }, chapters: 13 },
  // 말라기서 - 최후의 선지자, 언약 갱신 (BC 430년경)
  { book: { ko: '말라기', en: 'Malachi' }, chapters: 4 },
];

type ReadingPlanItem = {
  book: { ko: string; en: string };
  chapter: number;
}

const generateReadingPlan = (): ReadingPlanItem[] => {
  const plan: ReadingPlanItem[] = [];
  RESTORATION_BOOKS.forEach(({ book, chapters }) => {
    for (let i = 1; i <= chapters; i++) {
      plan.push({ book, chapter: i });
    }
  });
  return plan;
};

export const readingPlan = generateReadingPlan();
const totalChapters = readingPlan.length; // 53장

// 시작일 설정 - 오늘 날짜 기준으로 시작
const SCHEDULE_START_DATE = new Date(2025, 0, 1); // 2025년 1월 1일 시작
SCHEDULE_START_DATE.setHours(0, 0, 0, 0);

export const getDailyReading = (date: Date, language: Language): DailyReading => {
  const oneDay = 1000 * 60 * 60 * 24;

  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);

  let dayOfSchedule = Math.floor((currentDate.getTime() - SCHEDULE_START_DATE.getTime()) / oneDay);

  if (dayOfSchedule < 0) {
    dayOfSchedule = 0;
  }

  const startIndex = (dayOfSchedule * 2) % totalChapters;

  const firstChapterItem = readingPlan[startIndex];
  const secondChapterItem = readingPlan[(startIndex + 1) % totalChapters];

  return [
    { book: firstChapterItem.book[language], chapter: firstChapterItem.chapter },
    { book: secondChapterItem.book[language], chapter: secondChapterItem.chapter },
  ];
};

export interface ScheduleItem {
  day: number;
  reading: string;
}

export const getFullSchedule = (language: Language): ScheduleItem[] => {
  const schedule: ScheduleItem[] = [];
  const totalDays = Math.ceil(readingPlan.length / 2);

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const startIndex = dayIndex * 2;
    const firstChapter = readingPlan[startIndex];
    const secondChapter = readingPlan[startIndex + 1];

    let readingText: string;

    const firstBookName = firstChapter.book[language];

    if (!secondChapter) {
      readingText = language === 'ko' ? `${firstBookName} ${firstChapter.chapter}장` : `${firstBookName} ${firstChapter.chapter}`;
    } else {
      const secondBookName = secondChapter.book[language];
      if (firstBookName === secondBookName) {
        readingText = language === 'ko'
          ? `${firstBookName} ${firstChapter.chapter}-${secondChapter.chapter}장`
          : `${firstBookName} ${firstChapter.chapter}-${secondChapter.chapter}`;
      } else {
        const firstReading = language === 'ko' ? `${firstBookName} ${firstChapter.chapter}장` : `${firstBookName} ${firstChapter.chapter}`;
        const secondReading = language === 'ko' ? `${secondBookName} ${secondChapter.chapter}장` : `${secondBookName} ${secondChapter.chapter}`;
        readingText = `${firstReading} & ${secondReading}`;
      }
    }

    schedule.push({
      day: dayIndex + 1,
      reading: readingText,
    });
  }
  return schedule;
};

// 에스라-느헤미야 시대 역사적 배경 정보
export const HISTORICAL_CONTEXT = {
  ko: {
    title: "에스라-느헤미야 시대의 역사적 배경",
    periods: [
      { year: "BC 586년", event: "예루살렘 함락, 바벨론 포로" },
      { year: "BC 538년", event: "고레스 칙령, 1차 귀환 (스룹바벨)" },
      { year: "BC 520-516년", event: "성전 재건 (학개, 스가랴 활동)" },
      { year: "BC 483-473년", event: "에스더의 이야기" },
      { year: "BC 458년", event: "2차 귀환 (에스라)" },
      { year: "BC 445년", event: "3차 귀환 (느헤미야), 성벽 재건" },
      { year: "BC 430년경", event: "말라기 선지자 활동" },
    ]
  },
  en: {
    title: "Historical Background of the Ezra-Nehemiah Period",
    periods: [
      { year: "586 BC", event: "Fall of Jerusalem, Babylonian Exile" },
      { year: "538 BC", event: "Cyrus's Decree, First Return (Zerubbabel)" },
      { year: "520-516 BC", event: "Temple Reconstruction (Haggai, Zechariah)" },
      { year: "483-473 BC", event: "Story of Esther" },
      { year: "458 BC", event: "Second Return (Ezra)" },
      { year: "445 BC", event: "Third Return (Nehemiah), Wall Rebuilding" },
      { year: "430 BC", event: "Prophet Malachi's Ministry" },
    ]
  }
};

export const MOCK_DATA = {
  ko: {
    passage: `[에스라 1장]
1. 바사 왕 고레스 원년에 여호와께서 예레미야의 입을 통하여 하신 말씀을 이루게 하시려고 바사 왕 고레스의 마음을 감동시키시매 그가 온 나라에 공포도 하고 조서도 내려 이르되
2. 바사 왕 고레스는 말하노니 하늘의 하나님 여호와께서 세상 모든 나라를 내게 주셨고 나에게 명령하사 유다 예루살렘에 성전을 건축하라 하셨나니
3. 이스라엘의 하나님은 참 신이시라 너희 중에 그의 백성 된 자는 다 유다 예루살렘으로 올라가서 이스라엘의 하나님 여호와의 성전을 건축하라 그는 예루살렘에 계신 하나님이시라

(이것은 예시 데이터입니다. 실제 성경 본문을 보려면 API 키를 설정하세요.)`,
    meditationGuide: `[묵상 가이드 (예시)]
1. 핵심 메시지: 하나님은 이방 왕의 마음까지도 움직이셔서 약속을 성취하시는 역사의 주관자이십니다.
2. 당시 의미: 절망 속에 있던 포로민들에게 하나님의 약속이 여전히 유효함을 보여주었습니다.
3. 적용점: 우리 삶의 회복도 전적으로 하나님의 주권 아래 있음을 신뢰해야 합니다.
4. 질문: 내 삶에서 무너진 성전(예배)을 회복하기 위해 결단해야 할 것은 무엇입니까?`,
    intention: `[하나님의 경륜 (예시)]
하나님께서는 70년의 포로 생활이 끝날 것이라는 예레미야의 예언을 정확한 때에 성취하셨습니다. 고레스를 통해 성전 재건을 명하신 것은 단순한 건물의 복구가 아니라, 하나님과 백성 사이의 언약 관계 회복을 의미합니다.`,
    context: `[역사적 배경 (예시)]
BC 538년, 페르시아(바사) 제국의 창건자 고레스 대왕이 칙령을 내립니다. 이는 바벨론 정책과는 달리 피정복민의 종교와 관습을 존중하는 유화 정책의 일환이었습니다.`,
    tips: `[전도 팁 (예시)]
1. 회복의 하나님을 소개하세요.
2. 절망적인 상황에서도 희망을 주시는 분임을 전하세요.`,
    prayer: `[기도문 (예시)]
하나님 아버지, 역사의 주관자 되심을 찬양합니다. 우리 삶의 무너진 곳을 수축하여 주시고, 주님의 영광을 다시 보게 하옵소서. 예수님의 이름으로 기도합니다. 아멘.`
  },
  en: {
    passage: `[Ezra 1]
1. In the first year of Cyrus king of Persia, in order to fulfill the word of the Lord spoken by Jeremiah, the Lord moved the heart of Cyrus king of Persia to make a proclamation throughout his realm and also to put it in writing:
2. "This is what Cyrus king of Persia says: 'The Lord, the God of heaven, has given me all the kingdoms of the earth and has appointed me to build a temple for him at Jerusalem in Judah.
3. Any of his people among you may go up to Jerusalem in Judah and build the temple of the Lord, the God of Israel, the God who is in Jerusalem, and may their God be with them.

(This is mock data. Set your API key to see the actual Bible passage.)`,
    meditationGuide: `[Meditation Guide (Sample)]
1. Key Message: God is the sovereign of history who moves even the hearts of pagan kings to fulfill His promises.
2. Meaning then: It showed the exiles that God's promises were still valid amidst despair.
3. Application: We must trust that the restoration of our lives is entirely under God's sovereignty.
4. Question: What decision must I make to restore the ruined temple (worship) in my life?`,
    intention: `[God's Providence (Sample)]
God fulfilled Jeremiah's prophecy that the 70 years of exile would end at the exact time. Commanding the rebuilding of the temple through Cyrus meant not just restoring a building, but restoring the covenant relationship between God and His people.`,
    context: `[Historical Background (Sample)]
In 538 BC, Cyrus the Great, founder of the Persian Empire, issued a decree. This was part of an appeasement policy that respected the religion and customs of conquered peoples, unlike the Babylonian policy.`,
    tips: `[Evangelism Tips (Sample)]
1. Introduce the God of restoration.
2. Share that He gives hope even in desperate situations.`,
    prayer: `[Prayer (Sample)]
Father God, we praise You as the Sovereign of history. Repair the broken places in our lives and let us see Your glory again. In Jesus' name, Amen.`
  }
};
