import assert from "node:assert/strict";

import { PERSONAS } from "@/constants/personas";
import { QUESTIONS } from "@/lib/quiz/questions";
import { computePreference, nightScore, RANK_WEIGHTS, resolvePersona } from "@/lib/quiz/scoring";
import { decodePreferenceCookie } from "@/lib/preference-cookie";
import { parsePreference } from "@/lib/schemas/preference";
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

// maxPicks 와 가중치 개수가 어긋나면 UI 는 선택을 받는데 점수는 0 이 된다.
// 사용자는 자기가 반영 안 되는 답을 고르고 있다는 걸 알 방법이 없다.
const rankQuestion = QUESTIONS[0];
assert.equal(rankQuestion.axis, "genre");
if (rankQuestion.axis === "genre") {
  assert.equal(
    rankQuestion.maxPicks,
    RANK_WEIGHTS.length,
    `maxPicks(${rankQuestion.maxPicks}) 와 RANK_WEIGHTS(${RANK_WEIGHTS.length}) 가 다르다`,
  );
}

const one = computePreference({ q1: [1] }, AT).axes.genre;
assert.equal(one.rock, 100, `한 장르만 골랐는데 ${one.rock}% 다 — 고른 만큼만 점수가 가야 한다`);

const three = computePreference({ q1: [1, 4, 0] }, AT).axes.genre;
assert.ok(three.rock > three.electronic, "1위가 2위보다 낮다");
assert.ok(three.electronic > three.pop, "2위가 3위보다 낮다");
assert.ok(three.rock >= 60, `1위가 ${three.rock}% 뿐이다 — 3개를 고르면 평평해진다`);
assert.equal(three.hiphop, 0, "안 고른 장르에 점수가 갔다");

// 4개 이상 골라도 상위 3개만 반영한다
assert.deepEqual(computePreference({ q1: [1, 4, 0, 2, 3] }, AT).axes.genre, three, "4위 이하가 반영됐다");

/**
 * 최대잔여법이 실제로 도는 경로를 검사한다.
 *
 * uniform·빈 답은 나머지 배분 루프를 거의 안 탄다 — uniform 은 가중치가
 * [5,0,0,0,0] 이라 short = 0 이고, 빈 답은 total === 0 분기로 빠진다.
 * short > 0 이 나오는 건 다중 선택뿐이므로 순열 전체를 돈다.
 */
for (const first of [0, 1, 2, 3, 4]) {
  for (const second of [0, 1, 2, 3, 4]) {
    for (const third of [0, 1, 2, 3, 4]) {
      if (first === second || second === third || first === third) continue;
      const { genre } = computePreference({ q1: [first, second, third] }, AT).axes;
      const sum = Object.values(genre).reduce((a, b) => a + b, 0);
      assert.equal(sum, 100, `q1=[${first},${second},${third}] 의 장르 비중 합이 ${sum} 이다`);
    }
  }
}

/**
 * `computePreference` 자체는 범위 밖 index 를 **조용히 균등 분포로** 만든다.
 * 예외도 경고도 없이 "당신은 모든 장르를 똑같이 듣습니다" 가 나온다.
 *
 * 이건 여기서 막지 않는다. 막는 곳은 `parsePreference` 다 (아래 7번) —
 * 계산 함수는 순수하게 두고, 신뢰 경계에서 거른다.
 */
assert.deepEqual(
  computePreference({ q1: [99] }, AT).axes.genre,
  { pop: 20, rock: 20, hiphop: 20, rnb: 20, electronic: 20 },
  "범위 밖 index 의 동작이 바뀌었다 — 의도한 변경이면 이 단언을 갱신할 것",
);

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

// mood 두 문항에 같은 index 만 넣으면 25개 혼합 조합이 도달성 검사를 안 거친다
const reached = new Set<PersonaId>();
for (let time = 0; time < 5; time += 1) {
  for (const explorer of [0, 2, 4]) {
    for (let a = 0; a < 5; a += 1) {
      for (let b = 0; b < 5; b += 1) {
        reached.add(computePreference({ q2: [time], q5: [explorer], q3: [a], q4: [b] }, AT).persona);
      }
    }
  }
}
assert.equal(reached.size, 5, `도달 가능한 페르소나가 ${reached.size} 종뿐이다: ${[...reached].join(", ")}`);
assert.deepEqual([...reached].sort(), Object.keys(PERSONAS).sort(), "PERSONAS 와 판정 결과가 어긋난다");

/**
 * 밤 성향의 눈금.
 *
 * 전에는 `night + dawn` 을 그냥 더해서 `0 · 20 · 80` 세 값뿐이었다.
 * 20 과 80 사이가 비어 있으면 임계값 50 은 21~80 어디에 놔도 판정이 같은,
 * **조정할 수 없는 손잡이**다. 화면의 `80%` 도 백분율의 외양만 갖게 된다.
 */
const nightValues = new Set<number>();
for (let time = 0; time < 5; time += 1) {
  nightValues.add(nightScore(computePreference({ q2: [time] }, AT).axes.timeOfDay));
}
assert.equal(
  nightValues.size,
  5,
  `nightScore 가 ${nightValues.size}값뿐이다: {${[...nightValues].sort((a, b) => a - b).join(", ")}}` +
    " — 임계값을 옮겨도 판정이 안 바뀐다",
);

// 새벽·밤은 임계값 위, 한낮은 아래. 저녁은 경계 근처라 임계값 조정의 손잡이가 된다
const dawnAxes = computePreference({ q2: [4], q5: [0], q3: [3], q4: [4] }, AT).axes;
assert.ok(nightScore(dawnAxes.timeOfDay) >= 50, "새벽을 골랐는데 밤 성향이 50 미만이다");
assert.equal(resolvePersona(dawnAxes), "dawn-explorer");
assert.ok(
  nightScore(computePreference({ q2: [1] }, AT).axes.timeOfDay) < 50,
  "한낮을 골랐는데 밤 성향이 50 이상이다",
);

console.log(
  `✓ 문항 ${QUESTIONS.length}개 · 무드 1위 ${topMoods.size}종 도달 · 페르소나 ${reached.size}종 도달`,
);

/* 7. Local Storage 읽기 — 신뢰 경계 ────────────────────────── */

/**
 * 저장된 값은 사용자가 고칠 수 있고 이전 버전 앱이 쓴 것일 수도 있다.
 * 하나라도 어긋나면 **통째로 버리고 재검사로 보낸다.** 반쯤 맞는 결과가 제일 나쁘다.
 */
const good = computePreference({ q1: [1, 4], q2: [4], q3: [3], q4: [4], q5: [1] }, AT);
const roundTrip = parsePreference(JSON.stringify(good));
assert.deepEqual(roundTrip, good, "정상적으로 저장한 값을 다시 못 읽는다");

// 점수가 아니라 답을 저장하는 이유 — 배점을 고쳐도 재검사를 안 시켜도 된다.
// 저장된 점수는 무시하고 답에서 다시 계산해야 한다.
const tampered = { ...good, persona: "hype-player", axes: { ...good.axes, explorer: 999 } };
assert.deepEqual(
  parsePreference(JSON.stringify(tampered)),
  good,
  "저장된 점수를 그대로 믿었다 — 답에서 다시 계산해야 한다",
);

const rejected: [string, unknown][] = [
  ["범위 밖 index", { ...good, answers: { ...good.answers, q1: [99] } }],
  ["없는 문항 id", { ...good, answers: { ...good.answers, q9: [0] } }],
  ["옛 스키마 버전", { ...good, version: 0 }],
  ["음수 index", { ...good, answers: { ...good.answers, q2: [-1] } }],
  ["answers 가 배열이 아님", { ...good, answers: { q1: 1 } }],
  ["computedAt 없음", { ...good, computedAt: "" }],

  // **답이 비면 모든 축이 기본값으로 평평해진다.** 그대로 통과시키면
  // 정보량이 0인 사람이 페르소나를 배정받고, 추천은 모든 곡의 장르 점수가
  // 100 이 되어 96/95/94/93/93 이라는 근거 없는 확신을 그린다.
  // 조작만의 문제가 아니다 — **문항을 하나 늘리는 날 옛 저장값이 여기로 온다.**
  ["답이 통째로 없음", { ...good, answers: {} }],
  ["문항 하나만 답함", { ...good, answers: { q1: [0] } }],
  ["한 문항이 빈 배열", { ...good, answers: { ...good.answers, q3: [] } }],
  // 화면에서는 만들 수 없다(`toggleRank` 가 막는다). 통과하면 가중치
  // 5+2+1 이 한 장르에 몰려 100% 가 된다.
  ["같은 선택지를 중복 순위", { ...good, answers: { ...good.answers, q1: [0, 0, 0] } }],
];
for (const [label, value] of rejected) {
  assert.equal(parsePreference(JSON.stringify(value)), null, `${label}: 걸러지지 않았다`);
}

assert.equal(parsePreference("{ 깨진 json"), null, "깨진 JSON 이 걸러지지 않았다");
assert.equal(parsePreference("null"), null, "null 리터럴이 걸러지지 않았다");
assert.equal(parsePreference(null), null, "값이 없을 때 null 이 아니다");

console.log(`✓ 저장값 검증 — 정상 왕복 · 변조 무시 · 거부 ${rejected.length + 3}종`);

// 쿠키 왕복. 서버가 첫 화면을 그리려면 이 경로가 성해야 한다 —
// 여기가 깨지면 증상은 "가끔 빈 화면이 번쩍인다" 로만 나타나고,
// 그건 눈으로 잡기 어렵다. → src/lib/preference-cookie.ts
const cookieRaw = JSON.stringify({
  version: good.version,
  answers: good.answers,
  computedAt: good.computedAt,
});
assert.deepEqual(
  parsePreference(decodePreferenceCookie(encodeURIComponent(cookieRaw))),
  good,
  "쿠키를 거친 값을 다시 못 읽는다",
);
// 런타임이 이미 디코드해서 줬을 때. 한 번 더 돌려도 같은 값이어야 한다.
assert.deepEqual(
  parsePreference(decodePreferenceCookie(cookieRaw)),
  good,
  "이미 디코드된 쿠키 값에서 한 번 더 디코드해서 깨졌다",
);
// 사용자가 직접 고칠 수 있는 값이다. 던지지 않고 걸러져야 한다.
assert.equal(parsePreference(decodePreferenceCookie("%")), null, "깨진 퍼센트 인코딩이 던졌다");
assert.equal(decodePreferenceCookie(undefined), null, "쿠키가 없을 때 null 이 아니다");

console.log("✓ 쿠키 왕복 — 인코딩 · 이중 디코딩 · 깨진 입력");
