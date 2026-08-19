import assert from "node:assert/strict";

import { PERSONAS } from "@/constants/personas";
import { QUESTIONS } from "@/lib/quiz/questions";
import { computePreference, nightScore, resolvePersona } from "@/lib/quiz/scoring";
import type { Mood, PersonaId } from "@/types/music";
import type { QuizAnswers } from "@/types/quiz";

/**
 * 성향 검사 배점의 자체 점검. `pnpm check:quiz`
 *
 * 문항이 5개뿐이라 **문항 하나가 축 전체를 감당한다.** 선택지 좌표를 한 칸만
 * 옮겨도 도달 못 하는 무드나 페르소나가 생긴다. 화면 열어보고 아는 것보다 빠르다.
 */

const AT = "2026-08-18T00:00:00.000Z";

/* 1. 문항 구성 ─────────────────────────────────────────────── */

const ids = QUESTIONS.map((q) => q.id);
assert.equal(new Set(ids).size, ids.length, "문항 id 가 중복이다");
assert.equal(QUESTIONS.length, 5, `문항이 ${QUESTIONS.length}개다 — 5개를 넘기면 이탈이 붙는다`);

for (const question of QUESTIONS) {
  assert.equal(question.options.length, 5, `${question.id}: 선택지가 5개가 아니다`);
  const labels = question.options.map((o) => o.label);
  assert.equal(new Set(labels).size, labels.length, `${question.id}: 선택지 문구가 중복이다`);
}

const perAxis = QUESTIONS.reduce<Record<string, number>>((acc, q) => {
  acc[q.axis] = (acc[q.axis] ?? 0) + 1;
  return acc;
}, {});
assert.deepEqual(
  perAxis,
  { genre: 1, timeOfDay: 1, mood: 2, explorer: 1 },
  "축별 문항 수가 설계와 다르다",
);

/* 2. 각 문항이 축을 통째로 덮나 ────────────────────────────── */

for (const question of QUESTIONS) {
  if (question.axis === "genre") {
    assert.equal(
      new Set(question.options.map((o) => o.genre)).size,
      5,
      `${question.id}: 상위 5장르가 한 번씩 있지 않다 — 빠진 장르는 영원히 안 뽑힌다`,
    );
  }
  if (question.axis === "timeOfDay") {
    assert.equal(new Set(question.options.map((o) => o.slot)).size, 5, `${question.id}: 시간대 5칸이 아니다`);
  }
  if (question.axis === "explorer") {
    assert.deepEqual(
      question.options.map((o) => o.value),
      [100, 75, 50, 25, 0],
      `${question.id}: 눈금이 100→0 5단계가 아니다`,
    );
  }
  if (question.axis === "mood") {
    for (const option of question.options) {
      for (const [axis, value] of Object.entries(option.mood)) {
        assert.ok(value >= 0 && value <= 100, `${question.id} "${option.label}": ${axis} 가 ${value} 다`);
      }
    }
  }
}

/* 3. 점수 계산 ─────────────────────────────────────────────── */

/** 모든 문항에서 index 번째 선택지를 고른 사람 */
function uniform(index: number): QuizAnswers {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, [index]]));
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

/* 4. 순위 배점 ─────────────────────────────────────────────── */

const one = computePreference({ q1: [1] }, AT).axes.genre;
assert.equal(one.rock, 100, `한 장르만 골랐는데 ${one.rock}% 다 — 고른 만큼만 점수가 가야 한다`);

const three = computePreference({ q1: [1, 4, 0] }, AT).axes.genre;
assert.ok(three.rock > three.electronic, "1위가 2위보다 낮다");
assert.ok(three.electronic > three.pop, "2위가 3위보다 낮다");
assert.ok(three.rock >= 60, `1위가 ${three.rock}% 뿐이다 — 3개를 고르면 평평해진다`);
assert.equal(three.hiphop, 0, "안 고른 장르에 점수가 갔다");

// 4개 이상 골라도 상위 3개만 반영한다
assert.deepEqual(computePreference({ q1: [1, 4, 0, 2, 3] }, AT).axes.genre, three, "4위 이하가 반영됐다");

/* 5. MOOD — 7종이 전부 1위로 올라올 수 있어야 한다 ─────────── */

const q3 = QUESTIONS[2];
const q4 = QUESTIONS[3];
const topMoods = new Set<Mood>();

for (let a = 0; a < q3.options.length; a += 1) {
  for (let b = 0; b < q4.options.length; b += 1) {
    const { moods } = computePreference({ q3: [a], q4: [b] }, AT);
    const ranked = (Object.entries(moods) as [Mood, number][]).sort((x, y) => y[1] - x[1]);
    topMoods.add(ranked[0][0]);
    assert.ok(
      ranked[0][1] - ranked[6][1] > 25,
      `q3[${a}]·q4[${b}]: 무드가 ${ranked[6][1]}~${ranked[0][1]} 로 평평하다 — MOOD_REACH 를 조정할 것`,
    );
  }
}

assert.equal(
  topMoods.size,
  7,
  `1위로 올라올 수 있는 무드가 ${topMoods.size}종뿐이다: ${[...topMoods].join(", ")}` +
    " — 선택지 좌표가 한쪽에 몰려 있다",
);

/* 6. 페르소나 — 5 유형이 전부 나올 수 있어야 한다 ──────────── */

const reached = new Set<PersonaId>();
for (let time = 0; time < 5; time += 1) {
  for (const explorer of [0, 4]) {
    for (let mood = 0; mood < 5; mood += 1) {
      reached.add(computePreference({ q2: [time], q5: [explorer], q3: [mood], q4: [mood] }, AT).persona);
    }
  }
}
assert.equal(reached.size, 5, `도달 가능한 페르소나가 ${reached.size} 종뿐이다: ${[...reached].join(", ")}`);
assert.deepEqual([...reached].sort(), Object.keys(PERSONAS).sort(), "PERSONAS 와 판정 결과가 어긋난다");

// 새벽을 고르면 밤 성향이 임계값을 넘는다
const night = computePreference({ q2: [4], q5: [0], q3: [3], q4: [4] }, AT);
assert.ok(nightScore(night.axes.timeOfDay) >= 50, "새벽을 골랐는데 밤 성향이 50 미만이다");
assert.equal(resolvePersona(night.axes), "dawn-explorer");

console.log(
  `✓ 문항 ${QUESTIONS.length}개 · 무드 1위 ${topMoods.size}종 도달 · 페르소나 ${reached.size}종 도달`,
);
