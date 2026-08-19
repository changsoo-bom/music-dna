import type { Genre, MoodVector, TimeSlot } from "@/types/music";

/**
 * 5문항. 축 하나에 문항 하나꼴이라 **문항 하나가 축 전체를 감당해야 한다.**
 *
 * - 장르는 5방향 분포다. 하나만 고르게 하면 한 칸이 100% 가 되므로 순위로 받는다
 * - energy·valence·dreamy 는 원래 한 좌표계다. 따로 묻지 않고 좌표를 고르게 한다
 * - 시간대는 이웃 칸에 점수를 흘려 5단계를 만든다
 */
export type QuizAxis = "genre" | "timeOfDay" | "mood" | "explorer";

/** 1~3위를 순서대로 고른다. 순위가 곧 가중치 */
export type RankQuestion = {
  id: string;
  axis: "genre";
  prompt: string;
  /** 몇 개까지 고를 수 있는지 화면에 알려 준다 */
  hint: string;
  maxPicks: number;
  options: readonly { label: string; sub: string; genre: Genre }[];
};

export type TimeQuestion = {
  id: string;
  axis: "timeOfDay";
  prompt: string;
  options: readonly { label: string; slot: TimeSlot }[];
};

/**
 * 선택지가 곧 분위기 공간의 한 점이다.
 *
 * energy·valence·dreamy 를 따로 묻지 않는 건 문항을 아끼려는 것만이 아니다 —
 * "지금 뭐가 나오면 좋겠어요" 에 대한 답은 애초에 세 개의 독립된 값이 아니라
 * 그 공간의 좌표 하나다. 고른 좌표들의 평균이 사용자 좌표가 된다.
 */
export type MoodQuestion = {
  id: string;
  axis: "mood";
  prompt: string;
  options: readonly { label: string; mood: MoodVector }[];
};

/** 0~100 스칼라. 고른 값이 그대로 축 점수가 된다 */
export type ScalarQuestion = {
  id: string;
  axis: "explorer";
  prompt: string;
  options: readonly { label: string; value: number }[];
};

export type QuizQuestion = RankQuestion | TimeQuestion | MoodQuestion | ScalarQuestion;

/**
 * questionId → 고른 선택지 index 배열.
 *
 * 순위 문항만 여러 개이고 나머지는 길이 1 이지만 **모양을 하나로 통일한다.**
 * 저장·복원·되돌리기가 전부 같은 코드로 끝난다.
 */
export type QuizAnswers = Record<string, readonly number[]>;
