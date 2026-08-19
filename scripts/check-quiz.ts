import assert from "node:assert/strict";

import { GENRES, PARENT_OF } from "@/constants/genres";
import { PERSONAS } from "@/constants/personas";
import { QUESTIONS } from "@/lib/quiz/questions";
import { computePreference, nightScore, resolvePersona } from "@/lib/quiz/scoring";
import type { PersonaId, SubGenre } from "@/types/music";
import type { QuizAnswers } from "@/types/quiz";

/**
 * 성향 검사 배점의 자체 점검. `pnpm check:quiz`
 *
 * 문항이나 배점을 고치면 여기부터 깨진다. 화면을 열어보고 아는 것보다 빠르다.
 */

/* 1. 문항 구성 ─────────────────────────────────────────────── */

const ids = QUESTIONS.map((q) => q.id);
assert.equal(new Set(ids).size, ids.length, "문항 id 가 중복이다");

for (let i = 1; i < QUESTIONS.length; i += 1) {
  assert.notEqual(
    QUESTIONS[i].axis,
    QUESTIONS[i - 1].axis,
    `${QUESTIONS[i].id}: 같은 축 문항이 연달아 있다 — 두 번 같은 걸 묻는 것처럼 읽힌다`,
  );
}

const perAxis = QUESTIONS.reduce<Record<string, number>>((acc, q) => {
  acc[q.axis] = (acc[q.axis] ?? 0) + 1;
  return acc;
}, {});
assert.deepEqual(
  perAxis,
  { genre: 4, timeOfDay: 2, energy: 2, valence: 2, dreamy: 2, explorer: 2 },
  "축별 문항 수가 설계와 다르다",
);

/* 2. 장르 문항 — 하위 장르 20종이 정확히 한 번씩 ───────────── */

const allSubGenres = GENRES.flatMap((g) => g.children.map((c) => c.id));
const usedSubGenres: SubGenre[] = [];

for (const question of QUESTIONS) {
  if (question.axis !== "genre") continue;
  const parents = question.options.map((o) => PARENT_OF[o.subGenre]);
  assert.equal(new Set(parents).size, 5, `${question.id}: 상위 5장르를 한 번씩 덮지 않는다`);
  usedSubGenres.push(...question.options.map((o) => o.subGenre));
}

assert.deepEqual(
  [...usedSubGenres].sort(),
  [...allSubGenres].sort(),
  "하위 장르가 빠졌거나 두 번 나온다",
);

/* 3. 시간대 문항 — 5칸을 한 번씩 ───────────────────────────── */

for (const question of QUESTIONS) {
  if (question.axis !== "timeOfDay") continue;
  assert.equal(new Set(question.options.map((o) => o.slot)).size, 5, `${question.id}: 시간대 5칸이 아니다`);
}

/* 4. 스칼라 문항 — 0/33/67/100 ─────────────────────────────── */

for (const question of QUESTIONS) {
  if (question.axis === "genre" || question.axis === "timeOfDay") continue;
  assert.deepEqual(
    question.options.map((o) => o.value),
    [100, 67, 33, 0],
    `${question.id}: 선택지 배점이 100→0 순서가 아니다`,
  );
}

/* 5. 점수 계산 ─────────────────────────────────────────────── */

const AT = "2026-08-18T00:00:00.000Z";

/** 모든 문항에서 index 번째 선택지를 고른 사람. 선택지가 모자라면 마지막 것 */
function uniform(index: number): QuizAnswers {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, Math.min(index, q.options.length - 1)]));
}

for (let i = 0; i < 5; i += 1) {
  const { axes } = computePreference(uniform(i), AT);
  const genreSum = Object.values(axes.genre).reduce((a, b) => a + b, 0);
  const timeSum = Object.values(axes.timeOfDay).reduce((a, b) => a + b, 0);
  assert.equal(genreSum, 100, `선택지 ${i}: 장르 비중 합이 ${genreSum} 이다`);
  assert.equal(timeSum, 100, `선택지 ${i}: 시간대 비중 합이 ${timeSum} 이다`);
}

// 답이 하나도 없어도 깨지지 않아야 한다 — 중간에 이탈한 결과를 읽을 수 있다
const empty = computePreference({}, AT);
assert.equal(
  Object.values(empty.axes.genre).reduce((a, b) => a + b, 0),
  100,
  "빈 답에서 장르 비중이 100 이 아니다",
);

// 같은 답이면 같은 결과. 랜덤 요소가 섞이면 여기서 걸린다
assert.deepEqual(computePreference(uniform(2), AT), computePreference(uniform(2), AT), "결과가 불안정하다");

/* 6. MOOD 파생 ─────────────────────────────────────────────── */

const dark = computePreference(
  { q02: 3, q11: 3, q08: 3, q12: 3, q05: 0, q13: 0 }, // 조용하고 어둡고 몽환적
  AT,
);
const ranked = (Object.entries(dark.moods) as [string, number][]).sort((a, b) => b[1] - a[1]);
assert.equal(ranked[0][0], "melancholic", `가장 높은 무드가 ${ranked[0][0]} 이다`);
assert.ok(
  ranked[0][1] - ranked[ranked.length - 1][1] > 30,
  `무드 점수가 ${ranked[0][1]}~${ranked[ranked.length - 1][1]} 로 평평하다 — MOOD_REACH 를 조정할 것`,
);

/* 7. 페르소나 — 5 유형이 전부 나올 수 있어야 한다 ──────────── */

const reached = new Set<PersonaId>();
for (const q03 of [0, 1, 2, 3, 4]) {
  for (const q06 of [0, 3]) {
    for (const energy of [0, 3]) {
      const preference = computePreference(
        { q03, q09: q03, q06, q14: q06, q02: energy, q11: energy, q08: energy, q12: energy },
        AT,
      );
      reached.add(preference.persona);
    }
  }
}
assert.equal(reached.size, 5, `도달 가능한 페르소나가 ${reached.size} 종뿐이다: ${[...reached].join(", ")}`);
assert.deepEqual([...reached].sort(), Object.keys(PERSONAS).sort(), "PERSONAS 와 판정 결과가 어긋난다");

// 밤 성향이 임계값을 넘으면 밤 유형으로 간다
const night = computePreference({ q03: 4, q09: 3, q06: 0, q14: 0 }, AT);
assert.ok(nightScore(night.axes.timeOfDay) >= 50, "새벽·밤을 골랐는데 밤 성향이 50 미만이다");
assert.equal(resolvePersona(night.axes), "dawn-explorer");

console.log(`✓ 문항 ${QUESTIONS.length}개 · 하위 장르 ${allSubGenres.length}종 · 페르소나 ${reached.size}종`);
