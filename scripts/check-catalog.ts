import assert from "node:assert/strict";

import { GENRES, PARENT_OF, SUB_GENRES } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";
import { QUESTIONS } from "@/lib/quiz/questions";
import { computePreference } from "@/lib/quiz/scoring";
import { maxPerGenre, nextExclusions, recommend, trackMood } from "@/lib/report/recommend";
import { PLAYED_LIMIT, parsePlayed } from "@/lib/schemas/played";
import { formatDuration } from "@/lib/format";
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

  assert.equal(picks.length, 5, `선택지 ${i}: 추천이 ${picks.length}개다`);
  assert.equal(new Set(picks.map((p) => p.track.id)).size, 5, `선택지 ${i}: 같은 곡이 두 번 나왔다`);

  for (const pick of picks) {
    assert.ok(pick.reasons.length >= 2, `${pick.track.id}: 이유가 ${pick.reasons.length}줄이다`);
    assert.ok(
      pick.moodMatch >= 0 && pick.moodMatch <= 100,
      `${pick.track.id}: moodMatch 가 ${pick.moodMatch} 다 — 궤도 호가 한 바퀴를 넘거나 음수가 된다`,
    );
    genresSeen.add(PARENT_OF[pick.track.subGenre]);
    subGenresSeen.add(pick.track.subGenre);
  }

  // 한 장르가 목록을 다 먹으면 "새로운 음악 발견" 이 성립하지 않는다.
  //
  // **전체 장르에서 최대를 센다.** 전에는 `picks[0]` 과 같은 장르만 셌는데,
  // `recommend` 의 백필은 `perGenre` 를 무시하고 채우므로 상한을 넘치는 건
  // 보통 1위 장르가 아니다 — `[pop, rock, rock, rock, rock]` 이면 1 로 세고
  // 통과했다. **상한 장치가 존재하는 이유인 그 불변식이 무방비였다.**
  const perGenre = new Map<string, number>();
  for (const p of picks) {
    const genre = PARENT_OF[p.track.subGenre];
    perGenre.set(genre, (perGenre.get(genre) ?? 0) + 1);
  }
  const [worstGenre, topGenreCount] = [...perGenre.entries()].reduce((a, b) => (b[1] > a[1] ? b : a));
  // **상한 자체와 비교한다.** `<= 3` 은 실제 상한(탐험 성향 50 이상이면 2)보다
  // 한 칸 느슨해서, 페르소나 다섯 중 셋에서는 위반이 나도 통과했다.
  // 진짜 불변식에 묶어 두면 백필이 상한을 넘기는 순간 여기서 걸린다.
  const cap = maxPerGenre(preference.axes.explorer);
  assert.ok(
    topGenreCount <= cap,
    `선택지 ${i}: ${worstGenre} 가 ${topGenreCount}칸을 먹었다 — 상한은 ${cap} 이다`,
  );

  // 점수는 내림차순이어야 한다
  const scores = picks.map((p) => p.score);
  assert.deepEqual([...scores].sort((a, b) => b - a), scores, `선택지 ${i}: 정렬이 깨졌다`);
}

assert.equal(genresSeen.size, 5, `추천에 한 번도 안 나온 장르가 있다: ${[...genresSeen].join(", ")}`);

// 같은 답이면 같은 추천. 동점일 때 id 로 깨므로 결정적이어야 한다
assert.deepEqual(recommend(persona(2)), recommend(persona(2)), "추천이 불안정하다");

// 이미 고른 곡은 빠진다
const excluded = recommend(persona(0), 5, [recommend(persona(0))[0].track.id]);
assert.ok(
  !excluded.some((p) => p.track.id === recommend(persona(0))[0].track.id),
  "제외한 곡이 다시 추천됐다",
);




// 다시 찾기 — 같은 곡이 두 판 연속으로 나오지 않는다.
// 제외를 안 넘기거나 backfill 이 도로 채우면 눌러도 목록이 그대로인데,
// 화면에서는 "버튼이 안 눌렸나" 로만 보인다.
{
  const preference = persona(0);
  let seen: readonly string[] = [];
  const rounds: string[][] = [];
  for (let round = 0; round < 3; round++) {
    const picks = recommend(preference, 5, seen);
    assert.equal(picks.length, 5, `${round}번째 다시 찾기에서 ${picks.length}곡만 나왔다`);
    const ids = picks.map((p) => p.track.id);
    if (round > 0) {
      const repeated = ids.filter((id) => rounds[round - 1].includes(id));
      assert.deepEqual(repeated, [], `다시 찾기에 직전 판의 곡이 남았다: ${repeated.join()}`);
    }
    rounds.push(ids);
    seen = nextExclusions(seen, ids);
  }

  // 카탈로그를 한 바퀴 돌면 처음으로 돌아간다. 안 그러면 5곡을 못 채운다.
  const almostAll = CATALOG.slice(0, CATALOG.length - 4).map((t) => t.id);
  assert.deepEqual(nextExclusions(almostAll, []), [], "남은 곡이 모자란데 제외가 안 비워졌다");
  assert.equal(new Set(nextExclusions(["t001"], ["t001", "t002"])).size, 2, "제외에 중복이 남았다");
}

// 최근 재생 — Local Storage 는 신뢰 경계 밖이다
assert.deepEqual(parsePlayed(null), [], "값이 없는데 목록이 나왔다");
assert.deepEqual(parsePlayed("{"), [], "깨진 JSON 에서 목록이 나왔다");
assert.deepEqual(parsePlayed('{"id":"t001"}'), [], "배열이 아닌 값을 받아들였다");
assert.deepEqual(parsePlayed('[1,2]'), [], "숫자 배열을 받아들였다");
assert.deepEqual(parsePlayed('["없는곡"]'), [], "카탈로그에 없는 id 가 살아남았다");
assert.deepEqual(
  parsePlayed(JSON.stringify(["없는곡", CATALOG[0].id])).map((t) => t.id),
  [CATALOG[0].id],
  "성한 id 까지 같이 버렸다",
);
assert.equal(
  parsePlayed(JSON.stringify(CATALOG.map((t) => t.id))).length,
  PLAYED_LIMIT,
  "최근 재생이 상한을 넘었다",
);
// 중복이 살아남으면 `MyPlaylist` 의 `key={track.id}` 가 겹친다.
// React 가 줄을 못 짝지어서 재생 표시가 엉뚱한 줄에 붙는다.
assert.deepEqual(
  parsePlayed(JSON.stringify([CATALOG[0].id, CATALOG[1].id, CATALOG[0].id])).map((t) => t.id),
  [CATALOG[0].id, CATALOG[1].id],
  "중복 id 가 살아남았다 — 앞선 것만 남아야 한다(목록이 최근 순이다)",
);
// 상한만큼 자르는 일은 **없는 id 를 걸러낸 뒤**여야 한다.
// 순서가 반대면 죽은 id 가 자리를 먹어서 성한 곡이 목록에서 빠진다.
assert.equal(
  parsePlayed(JSON.stringify([...Array(PLAYED_LIMIT).fill("없는곡"), CATALOG[0].id])).length,
  1,
  "없는 id 가 상한 자리를 먹었다",
);

// 곡 길이 표기. 화면에 글로 나가는 값이라 초 단위가 틀리면 그냥 틀려 보인다.
assert.equal(formatDuration(undefined), "", "길이가 없는데 0:00 을 그렸다");
assert.equal(formatDuration(0), "", "0초를 길이로 그렸다");
assert.equal(formatDuration(7), "0:07", "한 자리 초에 0 을 안 채웠다");
assert.equal(formatDuration(227), "3:47", "분·초 환산이 틀렸다");
assert.equal(formatDuration(600), "10:00", "정확히 나누어떨어지는 값이 틀렸다");
// 쓸 수 없는 값은 그리지 않는다. 남은 시간을 넣고 싶어지는 날
// (`getDuration() - getCurrentTime()` 은 음수를 흘린다) `-1:-5` 가 화면에 뜬다.
assert.equal(formatDuration(-5), "", "음수를 길이로 그렸다");
assert.equal(formatDuration(Number.POSITIVE_INFINITY), "", "무한대를 길이로 그렸다");
assert.equal(formatDuration(Number.NaN), "", "NaN 을 길이로 그렸다");
// 카탈로그의 모든 길이가 사람이 읽을 수 있는 모양으로 나와야 한다
for (const track of CATALOG) {
  assert.match(
    formatDuration(track.duration),
    /^\d+:[0-5]\d$/,
    `${track.id}: 길이 표기가 ${formatDuration(track.duration)} 다`,
  );
}

console.log(
  `✓ 카탈로그 ${CATALOG.length}곡 · 하위 장르 ${Object.keys(perSubGenre).length}종 채움 · 다시 찾기 3판 · 길이 표기 ·` +
    ` 추천에 등장한 하위 장르 ${subGenresSeen.size}종`,
);
