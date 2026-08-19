import { z } from "zod";

import { QUESTIONS } from "@/lib/quiz/questions";
import { computePreference } from "@/lib/quiz/scoring";
import type { MusicPreference } from "@/types/music";

/**
 * Local Storage 는 **신뢰 경계 밖**이다. 사용자가 직접 고칠 수 있고,
 * 이전 버전 앱이 쓴 값일 수도 있다.
 *
 * **점수는 검증하지 않는다. 답만 받아서 다시 계산한다.**
 * `answers` 를 저장하는 이유가 그거였다 — 배점을 고쳐도 재검사를 안 시켜도 된다.
 * 저장된 `axes`·`moods`·`persona` 를 믿으면 배점을 고친 뒤에도 옛 결과가 남는다.
 */
const storedSchema = z.object({
  version: z.literal(1),
  answers: z.record(z.string(), z.array(z.int().nonnegative())),
  computedAt: z.string().min(1),
});

/**
 * 답이 **지금의 문항**에 맞는지 본다.
 *
 * 문항이나 선택지가 줄면 저장된 index 가 범위를 벗어난다. 그대로 계산하면
 * 예외도 경고도 없이 "당신은 모든 장르를 똑같이 듣습니다" 라는 결과가 나온다 —
 * 조용히 틀린 화면이 제일 나쁘다. 하나라도 어긋나면 통째로 버리고 재검사로 보낸다.
 */
function matchesCurrentQuestions(answers: Record<string, number[]>): boolean {
  return Object.entries(answers).every(([id, picks]) => {
    const question = QUESTIONS.find((q) => q.id === id);
    if (!question) return false;
    return picks.every((index) => index < question.options.length);
  });
}

/** 못 읽거나 어긋나면 `null`. 호출부는 검사를 아직 안 한 것과 똑같이 다루면 된다 */
export function parsePreference(raw: string | null): MusicPreference | null {
  if (!raw) return null;

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }

  const parsed = storedSchema.safeParse(json);
  if (!parsed.success) return null;
  if (!matchesCurrentQuestions(parsed.data.answers)) return null;

  return computePreference(parsed.data.answers, parsed.data.computedAt);
}
