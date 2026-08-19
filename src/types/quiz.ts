import type { SubGenre, TimeSlot } from "@/types/music";

/**
 * **한 문항은 한 축만 잰다.**
 *
 * 한 선택지가 여러 축에 점수를 뿌리면 문항 수를 줄일 수 있지만,
 * "이 82 는 어디서 나왔나" 에 답하려면 배점표를 통째로 따라가야 한다.
 * 축을 하나로 묶어두면 그 질문의 답이 문항 두 개로 끝난다.
 *
 * 대신 같은 축 문항이 연달아 나오지 않게 배열에서 섞어 둔다.
 */
export type QuizAxis = "genre" | "timeOfDay" | "energy" | "valence" | "dreamy" | "explorer";

/** 0~100 스칼라 축. 선택지 값의 평균이 축 점수가 된다 */
export type ScalarQuestion = {
  id: string;
  axis: "energy" | "valence" | "dreamy" | "explorer";
  prompt: string;
  options: readonly { label: string; value: number }[];
};

/** 하위 장르를 고르게 하고 상위 장르로 접는다 */
export type GenreQuestion = {
  id: string;
  axis: "genre";
  prompt: string;
  options: readonly { label: string; subGenre: SubGenre }[];
};

export type TimeQuestion = {
  id: string;
  axis: "timeOfDay";
  prompt: string;
  options: readonly { label: string; slot: TimeSlot }[];
};

export type QuizQuestion = ScalarQuestion | GenreQuestion | TimeQuestion;

/** questionId → 고른 선택지 index */
export type QuizAnswers = Record<string, number>;
