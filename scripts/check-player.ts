/**
 * 재생 큐 검증.
 *
 * 브라우저 없이 돌아간다 — 스토어는 순수 상태 전이고, YouTube 를 건드리는 건
 * `PlayerBar` 뿐이다. **여기서 막고 싶은 것은 조용한 오작동이다**: 다음 곡으로
 * 안 넘어가거나, 막힌 곡에서 무한히 돌거나, 마지막 곡 뒤에 처음으로 되감기는 것.
 * 셋 다 화면에는 "그냥 조용해진" 것으로만 보인다.
 */
import assert from "node:assert/strict";

import { PARENT_OF } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";
import { browseSoundingId, currentTrack, isSounding, usePlayerStore } from "@/lib/use-player-store";
import type { PlayableTrack } from "@/lib/use-player-store";

const QUEUE: PlayableTrack[] = ["a", "b", "c"].map((id) => ({
  id,
  title: id.toUpperCase(),
  artist: "누군가",
  region: "kr",
  subGenre: "kpop",
  youtubeId: `yt-${id}`,
}));

const store = usePlayerStore;
const reset = () =>
  store.setState({ queueId: null, queue: [], index: 0, isPlaying: false, blocked: new Set() });

// 고른 곡에서 시작한다
reset();
store.getState().play("recommend", QUEUE, 1);
assert.equal(currentTrack(store.getState())?.id, "b", "고른 곡이 아닌 것이 재생됐다");
assert.equal(store.getState().isPlaying, true, "재생이 시작되지 않았다");

// 같은 곡을 다시 누르면 멈춘다. 처음부터 다시 틀지 않는다
store.getState().play("recommend", QUEUE, 1);
assert.equal(store.getState().isPlaying, false, "같은 곡을 다시 눌렀는데 안 멈췄다");
assert.equal(store.getState().index, 1, "같은 곡을 다시 눌렀는데 위치가 움직였다");

// 앞뒤로 넘어간다
store.getState().skip(1);
assert.equal(currentTrack(store.getState())?.id, "c", "다음 곡으로 안 넘어갔다");
store.getState().skip(-1);
assert.equal(currentTrack(store.getState())?.id, "b", "이전 곡으로 안 넘어갔다");

/**
 * **큐가 끝나면 카탈로그에서 같은 종류로 이어진다.**
 *
 * 되감지 않는다 — 처음으로 돌아가면 들은 곡이 또 나온다. 이어 붙인 곡은
 * 큐의 맨 뒤에 오고 `index` 가 그 자리를 가리켜야 한다. 여기가 어긋나면
 * 화면은 새 곡 제목을 그리는데 소리는 옛 곡이 나거나 그 반대가 된다.
 */
reset();
store.getState().play("recommend", QUEUE, 2);
store.getState().skip(1);
assert.equal(store.getState().isPlaying, true, "마지막 곡 다음에 안 이어졌다");
assert.equal(store.getState().queue.length, 4, "이어 붙인 곡이 큐에 안 들어갔다");
assert.equal(store.getState().index, 3, "이어 붙였는데 위치가 마지막을 안 가리킨다");
const linked = currentTrack(store.getState());
assert.equal(linked?.subGenre, "kpop", "다른 하위 장르가 이어졌다");
assert.equal(["a", "b", "c"].includes(linked?.id ?? ""), false, "들은 곡이 다시 이어졌다");

// 같은 종류가 마르면 넓힌다. kpop 을 전부 들은 셈 치면 상위 장르(pop) 안에서 온다
reset();
store.getState().play("recommend", QUEUE, 2);
store.setState({
  blocked: new Set(CATALOG.filter((t) => t.subGenre === "kpop").map((t) => t.id)),
});
store.getState().skip(1);
assert.equal(store.getState().isPlaying, true, "같은 하위 장르가 말랐다고 멈췄다");
assert.equal(
  PARENT_OF[currentTrack(store.getState())!.subGenre],
  "pop",
  "하위 장르가 말랐을 때 상위 장르 밖에서 골랐다",
);

// **끝이 있는 라디오다.** 카탈로그를 한 바퀴 돌면 멈춘다 —
// 자리를 뜬 사람의 스피커가 영원히 울면 안 된다
reset();
store.getState().play("recommend", QUEUE, 2);
store.setState({ blocked: new Set(CATALOG.map((t) => t.id)) });
store.getState().skip(1);
assert.equal(store.getState().isPlaying, false, "고를 곡이 없는데 재생 중이다");

// 뒤로는 안 잇는다. 없던 과거를 만들어 낼 수는 없다
reset();
store.getState().play("recommend", QUEUE, 0);
store.getState().skip(-1);
assert.equal(store.getState().isPlaying, false, "첫 곡 이전에도 재생 중이다");

// 임베드가 막힌 곡은 건너뛴다
reset();
store.getState().play("recommend", QUEUE, 0);
store.getState().reportBlocked("b");
assert.equal(currentTrack(store.getState())?.id, "c", "막힌 곡을 건너뛰지 않았다");

// 뒤가 전부 막혔으면 큐를 빠져나가 카탈로그로 잇는다.
// 여기서 무한히 돌면 브라우저가 굳는다
reset();
store.getState().play("recommend", QUEUE, 0);
store.setState({ blocked: new Set(["b", "c"]) });
store.getState().skip(1);
assert.equal(store.getState().queue.length, 4, "막힌 곡만 남았는데 안 이어졌다");
assert.equal(store.getState().isPlaying, true, "막힌 곡을 지나 이어졌는데 안 튼다");

// 다른 목록에서 같은 곡을 눌러도 멈추지 않는다.
// 곡 id 만 비교하면 추천 목록과 빠른 선곡에 같은 곡이 있을 때
// 재생하려고 누른 것이 정지가 된다 — 화면에서는 "안 눌린다" 로 보인다.
reset();
store.getState().play("recommend", QUEUE, 0);
const otherList = [QUEUE[0], QUEUE[2]];
store.getState().play("played", otherList, 0);
assert.equal(store.getState().isPlaying, true, "다른 목록에서 같은 곡을 눌렀는데 멈췄다");
assert.equal(store.getState().queue.length, 2, "큐가 누른 목록으로 바뀌지 않았다");

// 같은 목록의 같은 곡은 토글이다
store.getState().play("played", otherList, 0);
assert.equal(store.getState().isPlaying, false, "같은 목록의 같은 곡이 토글되지 않았다");

// **전체보기는 큐가 둘이다** — 줄을 눌러 트는 화면 전체(`browse`)와 칸의
// 전체 재생(`browse:{genre}`). 한때 둘이 같은 이름을 써서, 화면 첫 곡이 나는
// 중에 그 칸의 전체 재생을 누르면 위 토글 분기에 걸려 **재생 삼각형이 그려진
// 버튼이 정지를 했다.** 첫 곡이 겹치는 것은 우연이 아니라 접힌 목록의 정상
// 상태라 늘 그랬다 → `BrowseList`
reset();
store.getState().play("browse", QUEUE, 0);
store.getState().play("browse:pop", [QUEUE[0], QUEUE[1]], 0);
assert.equal(store.getState().isPlaying, true, "칸의 전체 재생이 정지를 했다");
assert.equal(store.getState().queueId, "browse:pop", "큐 이름이 그 칸으로 안 바뀌었다");
assert.equal(store.getState().queue.length, 2, "큐가 화면 전체로 남았다 — 칸 밖의 곡이 이어진다");

// 어느 쪽으로 틀었든 목록의 그 줄에 표시가 붙는다. `soundingId` 는 이름이
// 정확히 같아야 해서 둘 중 한쪽만 본다
assert.equal(browseSoundingId(store.getState()), "a", "칸 전체 재생 중인데 표시가 안 붙는다");
store.getState().play("browse", QUEUE, 1);
assert.equal(browseSoundingId(store.getState()), "b", "줄 클릭으로 튼 곡에 표시가 안 붙는다");
store.getState().toggle();
assert.equal(browseSoundingId(store.getState()), null, "멈췄는데 표시가 남았다");

// 막혔던 곡을 다시 고르면 한 번 더 시도한다.
// 영영 무시하면 눌러도 아무 일이 안 나는 카드가 된다.
reset();
store.getState().play("recommend", QUEUE, 0);
store.getState().reportBlocked("b");
store.getState().play("recommend", QUEUE, 1);
assert.equal(currentTrack(store.getState())?.id, "b", "막혔던 곡을 다시 고를 수 없다");
assert.equal(store.getState().blocked.has("b"), false, "다시 고른 곡이 막힌 채로 남았다");
assert.equal(store.getState().isPlaying, true, "다시 고른 곡이 재생되지 않았다");

/**
 * **목록이 재정렬돼도 일시정지는 첫 클릭에 먹는다.**
 *
 * 빠른 선곡은 곡을 트는 순간 그 곡을 맨 앞으로 올린다(`recordPlayed`).
 * 큐 내용을 순서까지 비교하던 시절에는 비교 대상이 비교 도중에 재정렬돼서
 * 토글 판정이 빗나갔고, **일시정지 아이콘이 떠 있는 카드를 눌러도 첫 클릭에는
 * 아무 일이 안 났다.** 눈에 보이는 변화가 전혀 없으니 "안 눌린다" 로만 보인다.
 */
reset();
const played = [QUEUE[0], QUEUE[1], QUEUE[2]];
store.getState().play("played", played, 2); // 맨 뒤의 c 를 튼다
const reordered = [QUEUE[2], QUEUE[0], QUEUE[1]]; // recordPlayed 가 c 를 앞으로 올린다
assert.equal(
  isSounding(store.getState(), "played", "c"),
  true,
  "재정렬된 목록에서 지금 나는 곡이 일시정지 아이콘을 안 달았다",
);
store.getState().play("played", reordered, 0); // 재정렬된 목록에서 같은 곡을 누른다
assert.equal(
  store.getState().isPlaying,
  false,
  "목록이 재정렬된 뒤 같은 곡을 눌렀는데 첫 클릭에 안 멈췄다",
);

/**
 * **아이콘은 클릭의 결과를 말해야 한다.**
 *
 * 추천에서 튼 곡이 빠른 선곡에도 있으면, 곡 id 만 보는 아이콘은 양쪽 다
 * 일시정지를 단다. 그런데 빠른 선곡 쪽을 누르면 멈추는 게 아니라 그 목록으로
 * 옮겨 탄다 — 소리는 그대로고 화면도 그대로라 "눌러도 아무 일이 안 난다" 다.
 * 아이콘과 행동이 같은 조건에서 갈려야 한다.
 */
reset();
store.getState().play("recommend", QUEUE, 0);
assert.equal(isSounding(store.getState(), "recommend", "a"), true, "튼 목록에서 아이콘이 틀렸다");
assert.equal(
  isSounding(store.getState(), "played", "a"),
  false,
  "다른 목록의 같은 곡이 일시정지 아이콘을 달았다 — 눌러도 안 멈추는데",
);
// 멈춰 있으면 재생 아이콘이다. 이 단언이 없으면 `!isPlaying` 가드를 지워도
// 아무것도 안 깨지는데, 그러면 멈춘 줄이 일시정지 기호를 달고 커버가
// 계속 어둡게 덮인 채로 남는다.
store.getState().toggle();
assert.equal(
  isSounding(store.getState(), "recommend", "a"),
  false,
  "멈춰 있는 곡이 일시정지 아이콘을 달았다",
);

console.log(
  `✓ 재생 큐 — 시작·토글·앞뒤·큐 끝에서 이어잇기·막힌 곡 건너뛰기·목록 전환·전체보기 두 큐·재정렬 후 토글·아이콘 일치`,
);
