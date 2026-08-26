import assert from "node:assert/strict";

import { GENRES, PARENT_OF, SUB_GENRES } from "@/constants/genres";
import { REGIONS } from "@/constants/regions";
import { CATALOG } from "@/data/catalog";
import { browseGroups, browseHref } from "@/lib/browse";
import { searchTracks } from "@/lib/search";
import { classify } from "@/lib/youtube/classify";
import { isSongLength, looksLikeSong, songsFirst } from "@/lib/youtube/song";
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

/**
 * **국내·해외 × 장르 열 칸이 전부 차 있다.**
 *
 * 둘러보기는 두 축을 곱해서 좁힌다(`RegionSwitch` × `GenreRail`). 한 칸이
 * 비면 `browseGroups` 가 그 칸을 통째로 떨어뜨려서 **색인에서 장르 줄이
 * 사라지고**, 이미 공유된 `/browse?region=kr&genre=electronic` 은 빈 안내문만
 * 남는 화면이 된다.
 *
 * **존재만 보는 단언으로는 못 지킨다.** 전에는 `region` 별로 곡이 있는지만
 * 봤는데(truthy 검사), 그건 한쪽이 1곡이어도 통과한다 — 정작 화면이 기대는
 * 것은 region 하나가 아니라 열 칸 각각이다. 아래 형제 단언과 같은 하한(4곡)을
 * 칸마다 건다. 곡을 새로 넣으면서 `region` 을 안 적으면 타입이 막지만,
 * 한쪽으로 몰리는 것은 타입이 못 잡는다.
 */
for (const region of REGIONS) {
  for (const genre of GENRES) {
    const count = CATALOG.filter(
      (track) => track.region === region.id && PARENT_OF[track.subGenre] === genre.id,
    ).length;
    assert.ok(
      count >= 4,
      `${region.label} ${genre.label} 이 ${count}곡이다 — 둘러보기에서 그 칸이 색인에 안 뜬다`,
    );
  }
}

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

/* 4. 둘러보기 — 좁히는 규칙 ────────────────────────────────
      `browseGroups`·`browseHref` 는 순수 함수라 화면을 안 열어도 여기서 다 본다.
      특히 `browseHref` 의 **`undefined`=유지 / `null`=해제** 규약은 틀려도
      타입이 안 잡는다: "장르 해제" 를 `undefined` 로 적으면 해제가 아니라
      유지가 되고, 누른 사람에게는 "칩을 눌렀는데 안 풀린다" 로만 보인다. */

const both = { region: "kr", genre: "rock" } as const;
assert.equal(browseHref(both, { genre: null }), "/browse?region=kr", "장르를 못 풀었다");
assert.equal(browseHref(both, { region: null }), "/browse?genre=rock", "지역을 못 풀었다");
// 안 넘긴 축은 그대로 물고 간다. 이게 깨지면 좁히려고 누른 것이 넓히는 결과가 된다
assert.equal(browseHref(both, {}), "/browse?region=kr&genre=rock", "안 넘긴 축이 지워졌다");
assert.equal(browseHref(both, { genre: "pop" }), "/browse?region=kr&genre=pop", "지역이 지워졌다");
// 다 풀면 맨 주소다. `?` 만 남은 주소는 같은 화면의 다른 이름이 된다
assert.equal(browseHref(both, { region: null, genre: null }), "/browse", "빈 물음표가 남았다");
assert.equal(
  browseHref({ region: null, genre: null }, { genre: "pop" }),
  "/browse?genre=pop",
  "아무것도 안 고른 상태에서 축을 못 켰다",
);

// 좁히지 않으면 카탈로그 전체다 — 그룹으로 묶는 사이에 곡이 새면 머리글의
// 수(서버)와 목록(클라이언트)이 어긋난다
assert.equal(
  browseGroups(null, null).reduce((sum, group) => sum + group.tracks.length, 0),
  CATALOG.length,
  "좁히지 않았는데 곡이 샜다",
);
// 장르를 고르면 그 칸 하나만 남는다
assert.deepEqual(
  browseGroups(null, "electronic").map((group) => group.genre),
  ["electronic"],
  "장르를 골랐는데 다른 칸이 남았다",
);
// 좁힌 결과는 실제로 그 region 만이다
assert.ok(
  browseGroups("kr", null).every((group) => group.tracks.every((track) => track.region === "kr")),
  "국내로 좁혔는데 해외 곡이 섞였다",
);
// 빈 칸은 떨어진다. "0곡" 헤더만 남는 자리가 생기지 않는다
assert.ok(
  browseGroups(null, null).every((group) => group.tracks.length > 0),
  "곡이 없는 칸이 목록에 남았다",
);

/* 5. 검색 ──────────────────────────────────────────────────
      `searchTracks` 도 순수 함수라 화면 없이 다 본다. 여기서 막고 싶은 것은
      **조용한 빈 결과**다 — 대소문자나 띄어쓰기 하나로 아무것도 안 나오면
      사용자에게는 "그 곡이 없다" 로만 보이고, 없는 것은 곡이 아니라 규칙이다. */

const idsOf = (tracks: readonly { id: string }[]) => tracks.map((track) => track.id);

// 빈 검색어는 빈 결과다. 전부 돌려주면 두 번째 둘러보기가 된다
assert.deepEqual(searchTracks(""), [], "빈 검색어에 결과가 나왔다");
assert.deepEqual(searchTracks("   "), [], "공백만 쳤는데 결과가 나왔다");

// 대소문자와 띄어쓰기를 안 가린다. 표기는 하나뿐인데 치는 방법은 여럿이다
const clairo = searchTracks("clairo");
assert.ok(clairo.length >= 2, `아티스트로 찾은 곡이 ${clairo.length}곡뿐이다`);
assert.deepEqual(idsOf(searchTracks("CLAIRO")), idsOf(clairo), "대문자로 치면 다른 결과가 나온다");
assert.deepEqual(idsOf(searchTracks(" Clairo ")), idsOf(clairo), "앞뒤 공백이 결과를 바꾼다");
assert.deepEqual(idsOf(searchTracks("cla iro")), idsOf(clairo), "가운데 공백이 결과를 바꾼다");
assert.ok(
  clairo.every((track) => track.artist === "Clairo"),
  "아티스트로 찾았는데 다른 사람의 곡이 섞였다",
);

// **제목이 아티스트보다 앞이다.** 친 그대로인 곡이 아래에 있으면 검색이
// 고장 난 것처럼 보인다
assert.equal(searchTracks("bags")[0].title, "Bags", "제목이 그대로 맞는 곡이 첫 줄이 아니다");
assert.equal(searchTracks("난춘")[0].artist, "새소년", "한글 제목으로 못 찾았다");

// 없는 말은 빈 결과다. 여기가 무너지면 검색이 아무거나 돌려준다
assert.deepEqual(searchTracks("zzzzz"), [], "없는 말에 결과가 나왔다");

// 찾은 곡은 전부 카탈로그의 곡이다 — 목록이 그리는 것이 곧 이 결과다
assert.ok(
  searchTracks("a").every((track) => CATALOG.includes(track)),
  "카탈로그에 없는 곡이 결과에 섞였다",
);

/* 6. 가수 질의 판정 ────────────────────────────────────────
      **틀리면 100 units 을 쓰고 엉뚱한 사람의 채널을 가수라고 세운다.**
      YouTube 에 물어보는 대신 결과의 쏠림으로 판정하는 자리라(`classify`),
      호출 없이 여기서 다 본다 — 실제 API 를 때리는 검사는 할당량을 먹는다. */

/** 표본 만들기. `[["ch1", 6], ["ch2", 4]]` → 채널별로 그만큼의 결과 */
const results = (...groups: readonly (readonly [string, string, number])[]) =>
  groups.flatMap(([channelId, channelTitle, count]) =>
    Array.from({ length: count }, () => ({ channelId, channelTitle })),
  );

// 한 채널로 몰리고 이름도 맞으면 가수다
assert.equal(
  classify("NewJeans", results(["ch1", "NewJeans", 7], ["ch2", "어떤 채널", 3])),
  "ch1",
  "가수 채널로 몰렸는데 못 알아봤다",
);
// 검색어가 채널명을 포함하는 방향도 본다 — `뉴진스 NewJeans` 같은 채널명
assert.equal(
  classify("뉴진스 NewJeans", results(["ch1", "뉴진스", 8], ["ch2", "x", 2])),
  "ch1",
  "채널명이 검색어의 일부일 때 못 알아봤다",
);
// 대소문자·공백·구두점은 안 가린다
assert.equal(classify("new jeans", results(["ch1", "NEWJEANS", 5])), "ch1", "표기 차이로 놓쳤다");

// **흩어지면 곡 제목이다.** 커버·리액션·라이브가 섞인 모양이다
assert.equal(
  classify("Ditto", results(["a", "A", 2], ["b", "B", 2], ["c", "C", 2], ["d", "D", 2])),
  null,
  "채널이 흩어졌는데 가수라고 판정했다",
);
// **몰렸어도 이름이 다르면 아니다.** 부지런한 리액션 채널이 상위를 먹을 수 있다
assert.equal(
  classify("아이유", results(["ch9", "노래 리액션 채널", 8], ["ch2", "x", 2])),
  null,
  "이름이 안 맞는 채널을 가수로 세웠다",
);
// 경계: 표본이 없거나 검색어가 비면 판정하지 않는다
assert.equal(classify("아무개", []), null, "빈 결과에서 채널을 골랐다");
assert.equal(classify("", results(["ch1", "무엇", 5])), null, "빈 검색어로 가수를 판정했다");
// 정확히 40% 는 통과한다(10개 중 4개). 경계가 어느 쪽인지 적어 둔다
assert.equal(
  classify("가수", results(["ch1", "가수", 4], ["b", "B", 3], ["c", "C", 3])),
  "ch1",
  "40% 경계에서 떨어졌다",
);
assert.equal(
  classify("가수", results(["ch1", "가수", 3], ["b", "B", 4], ["c", "C", 3])),
  null,
  "1등이 40% 미만인데 통과했다",
);

/* 7. 노래만 남기기 ─────────────────────────────────────────
      **여기서 잘못 버린 곡은 찾는 사람에게 없는 곡이 된다.** 검색이 고장 난
      것과 구별이 안 되므로, 통과시켜야 할 것을 통과시키는지가 막는 것보다
      중요하다 → `songsFirst` */

const song = (title: string, channel = "어떤 채널") => ({ title, channel });

// 노래가 아닌 것은 막는다
for (const bad of [
  "NewJeans - Ditto 안무 영상",
  "aespa 'Next Level' Dance Practice",
  "IU - Love wins all (Choreography ver.)",
  "블랙핑크 뚜두뚜두 직캠",
  "Ditto 교차편집 / stage mix",
  "[리액션] 뉴진스 신곡 처음 들어봄",
  "Attention - cover by 어떤사람",
  "Super Shy 노래방 karaoke",
  "OMG (Instrumental)",
  "NewJeans 데뷔 비하인드",
  "Ditto 티저 teaser",
  "아이유 인터뷰",
  "Ditto #shorts",
  "NewJeans full album 전곡 듣기",
  "잔잔한 플레이리스트 1시간",
]) {
  assert.equal(looksLikeSong(bad, "어떤 채널"), false, `노래가 아닌데 통과했다: ${bad}`);
}

// **노래는 통과해야 한다.** 단어 하나로 막으면 여기가 무너진다 —
// `Dance The Night` 의 dance, `Discover` 안의 cover
for (const good of [
  "NewJeans (뉴진스) 'Ditto' Official MV",
  "Dua Lipa - Dance The Night (Official Music Video)",
  "Discover - 어떤 밴드",
  "IU(아이유) _ 밤편지(Through the Night)",
  "aespa 에스파 'Next Level' M/V",
  "Ditto (Lyrics)",
  "Ditto (Remix)",
  "Live Forever - Oasis",
]) {
  assert.equal(looksLikeSong(good, "어떤 채널"), true, `노래인데 막혔다: ${good}`);
}

// 길이로 거른다. **모르는 것은 안 막는다**
assert.equal(isSongLength(undefined), true, "길이를 모른다고 막았다");
assert.equal(isSongLength(30), false, "30초짜리 쇼츠가 통과했다");
assert.equal(isSongLength(210), true, "3분 30초짜리 곡이 막혔다");
assert.equal(isSongLength(3600), false, "한 시간짜리가 통과했다");

// **음원이 앞에 온다.** `- Topic` 이 YouTube Music 이 파는 그 음원이다
assert.deepEqual(
  songsFirst([
    song("Ditto", "어떤 채널"),
    song("Ditto", "NewJeans - Topic"),
    song("Ditto", "HYBE LABELS"),
  ]).map((item) => item.channel),
  ["NewJeans - Topic", "어떤 채널", "HYBE LABELS"],
  "음원 채널이 앞에 안 왔다",
);

// **다 걸러졌으면 되돌린다.** 있는데 없다고 말하면 안 된다
assert.equal(
  songsFirst([song("Ditto 안무 영상"), song("Ditto 직캠")]).length,
  2,
  "전부 걸러졌는데 빈 목록을 줬다",
);

const kr = CATALOG.filter((track) => track.region === "kr").length;

console.log(
  `✓ 카탈로그 ${CATALOG.length}곡 · 하위 장르 ${Object.keys(perSubGenre).length}종 채움 · 국내 ${kr}곡 / 해외 ${CATALOG.length - kr}곡 · 지역×장르 10칸 · 좁히기·주소 10건 · 검색 11건 · 가수 판정 9건 · 노래 거르기 27건 · 다시 찾기 3판 · 길이 표기 ·` +
    ` 추천에 등장한 하위 장르 ${subGenresSeen.size}종`,
);
