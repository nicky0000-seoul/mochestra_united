// 감정 목록 (홈 버튼·히스토리·통계가 함께 사용)
// 순서 = 통계 도넛의 조각 순서. 색은 styles/emotions.css 의 CSS 변수
export interface Emotion {
  name: string;
  emoji: string;
  color: string;
}

export const EMOTIONS: Emotion[] = [
  { name: '기쁨', emoji: '😊', color: 'var(--emo-joy)' },
  { name: '평온', emoji: '😌', color: 'var(--emo-calm)' },
  { name: '슬픔', emoji: '😢', color: 'var(--emo-sad)' },
  { name: '분노', emoji: '😠', color: 'var(--emo-anger)' },
  { name: '우울', emoji: '😔', color: 'var(--emo-depress)' },
  { name: '외로움', emoji: '😞', color: 'var(--emo-lonely)' },
];

// 감정을 고르지 않고 시작한 대화
export const NEUTRAL_EMOTION: Emotion = { name: '일반', emoji: '💬', color: 'var(--emo-neutral)' };

// 도넛에서 '일반'은 우울과 외로움 사이에 둠 (이웃 조각 대비 검증 순서)
export const CHART_ORDER = ['기쁨', '평온', '슬픔', '분노', '우울', '일반', '외로움'];

export function findEmotion(name?: string): Emotion {
  return EMOTIONS.find((e) => e.name === name) ?? NEUTRAL_EMOTION;
}
