import assert from "node:assert/strict";

import { GENRES, PARENT_OF, SUB_GENRES } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";
import { QUESTIONS } from "@/lib/quiz/questions";
import { computePreference } from "@/lib/quiz/scoring";
import { recommend, trackMood } from "@/lib/report/recommend";
import type { Genre, SubGenre } from "@/types/music";

/**
 * 곡 카탈로그와 추천의 자체 점검. `pnpm check:catalog`
 *
 * 카탈로그는 **손으로 쓰는 데이터**라 반드시 틀린다. 오타 하나로 곡이
 * 차트에서 조용히 사라지거나, 특정 취향에게 추천이 한 장르로만 몰린다.
 */

const AT = "2026-08-18T00:00:00.000Z";

/* 1. 카탈로그 무결성 ───────────────────────────────────────── */

const ids = CATALOG.map((t) => t.id);
assert.equal(new Set(ids).size, ids.length, "곡 id 가 중복이다 — 키가 겹치면 조용히 덮인다");

const titles = CATALOG.map((t) => `${t.artist} — ${t.title}`);
assert.equal(new Set(titles).size, titles.length, `같은 곡이 두 번 들어갔다: ${titles.length}`);

for (const track of CATALOG) {
  assert.ok(SUB_GENRES[track.subGenre], `${track.id}: 정해진 20종 밖의 subGenre "${track.subGenre}"`);

  const mood = trackMood(track);
  for (const [axis, value] of Object.entries(mood)) {
    assert.ok(
      value >= 0 && value <= 100,
      `${track.id} "${track.title}": ${axis} 가 ${value} 다 — 거리 계산이 망가진다`,
    );
  }

  // 보강이 끝났으므로 이제 전부 있어야 한다. 빠진 곡은 커버도 재생도 안 된다
  assert.ok(track.youtubeId, `${track.id} "${track.title}": youtubeId 가 없다 — pnpm enrich 를 돌릴 것`);
  assert.match(track.youtubeId, /^[\w-]{11}$/, `${track.id}: youtubeId 가 11자 형식이 아니다`);
  assert.ok(track.duration && track.duration > 30, `${track.id}: duration 이 ${track.duration} 이다`);
}

// 같은 영상을 두 곡이 가리키면 검색이 엉뚱한 걸 집었다는 뜻이다
const videoIds = CATALOG.map((t) => t.youtubeId);
assert.equal(new Set(videoIds).size, videoIds.length, "두 곡이 같은 youtubeId 를 가리킨다");

/* 2. 분포 — 빈 칸이 있으면 그 취향에게 줄 곡이 없다 ────────── */

const perSubGenre = CATALOG.reduce<Record<string, number>>((acc, t) => {
  acc[t.subGenre] = (acc[t.subGenre] ?? 0) + 1;
  return acc;
}, {});

const allSubGenres = GENRES.flatMap((g) => g.children.map((c) => c.id));
const empty = allSubGenres.filter((id) => !perSubGenre[id]);
assert.deepEqual(empty, [], `곡이 하나도 없는 하위 장르: ${empty.join(", ")}`);

const perGenre = CATALOG.reduce<Record<string, number>>((acc, t) => {
  const parent = PARENT_OF[t.subGenre];
  acc[parent] = (acc[parent] ?? 0) + 1;
  return acc;
}, {});
for (const genre of GENRES) {
  assert.ok(
    perGenre[genre.id] >= 4,
    `${genre.label} 이 ${perGenre[genre.id] ?? 0}곡뿐이다 — 그 장르 1순위인 사람에게 줄 게 없다`,
  );
}

/* 3. 추천 — 어떤 취향에도 결과가 나오고, 한 장르로만 몰리지 않는다 ── */

/** 문항마다 index 번째를 고른 사람 */
function persona(index: number) {
  return computePreference(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, [index]])),
    AT,
  );
}

const genresSeen = new Set<Genre>();
const subGenresSeen = new Set<SubGenre>();

for (let i = 0; i < 5; i += 1) {
  const preference = persona(i);
  const picks = recommend(preference);

  assert.equal(picks.length, 6, `선택지 ${i}: 추천이 ${picks.length}개다`);
  assert.equal(new Set(picks.map((p) => p.track.id)).size, 6, `선택지 ${i}: 같은 곡이 두 번 나왔다`);

  for (const pick of picks) {
    assert.ok(pick.reasons.length >= 2, `${pick.track.id}: 이유가 ${pick.reasons.length}줄이다`);
    genresSeen.add(PARENT_OF[pick.track.subGenre]);
    subGenresSeen.add(pick.track.subGenre);
  }

  // 한 장르가 목록을 다 먹으면 "새로운 음악 발견" 이 성립하지 않는다
  const topGenreCount = picks.filter(
    (p) => PARENT_OF[p.track.subGenre] === PARENT_OF[picks[0].track.subGenre],
  ).length;
  assert.ok(topGenreCount <= 3, `선택지 ${i}: 한 장르가 ${topGenreCount}칸을 먹었다 — 장르당 상한이 안 먹었다`);

  // 점수는 내림차순이어야 한다
  const scores = picks.map((p) => p.score);
  assert.deepEqual([...scores].sort((a, b) => b - a), scores, `선택지 ${i}: 정렬이 깨졌다`);
}

assert.equal(genresSeen.size, 5, `추천에 한 번도 안 나온 장르가 있다: ${[...genresSeen].join(", ")}`);

// 같은 답이면 같은 추천. 동점일 때 id 로 깨므로 결정적이어야 한다
assert.deepEqual(recommend(persona(2)), recommend(persona(2)), "추천이 불안정하다");

// 이미 고른 곡은 빠진다
const excluded = recommend(persona(0), 6, [recommend(persona(0))[0].track.id]);
assert.ok(
  !excluded.some((p) => p.track.id === recommend(persona(0))[0].track.id),
  "제외한 곡이 다시 추천됐다",
);

console.log(
  `✓ 카탈로그 ${CATALOG.length}곡 · 하위 장르 ${Object.keys(perSubGenre).length}종 채움 ·` +
    ` 추천에 등장한 하위 장르 ${subGenresSeen.size}종`,
);
