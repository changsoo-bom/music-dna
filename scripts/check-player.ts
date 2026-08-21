/**
 * 재생 큐 검증.
 *
 * 브라우저 없이 돌아간다 — 스토어는 순수 상태 전이고, YouTube 를 건드리는 건
 * `PlayerBar` 뿐이다. **여기서 막고 싶은 것은 조용한 오작동이다**: 다음 곡으로
 * 안 넘어가거나, 막힌 곡에서 무한히 돌거나, 마지막 곡 뒤에 처음으로 되감기는 것.
 * 셋 다 화면에는 "그냥 조용해진" 것으로만 보인다.
 */
import assert from "node:assert/strict";

import { currentTrack, isSounding, usePlayerStore } from "@/lib/use-player-store";
import type { PlayableTrack } from "@/lib/use-player-store";

const QUEUE: PlayableTrack[] = ["a", "b", "c"].map((id) => ({
  id,
  title: id.toUpperCase(),
  artist: "누군가",
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

// 끝에 닿으면 멈춘다. 되감지 않는다 — 자리를 뜬 뒤에도 계속 돌면 안 된다
reset();
store.getState().play("recommend", QUEUE, 2);
store.getState().skip(1);
assert.equal(store.getState().isPlaying, false, "마지막 곡 다음에도 재생 중이다");
assert.equal(currentTrack(store.getState())?.id, "c", "마지막 곡에서 위치가 움직였다");

reset();
store.getState().play("recommend", QUEUE, 0);
store.getState().skip(-1);
assert.equal(store.getState().isPlaying, false, "첫 곡 이전에도 재생 중이다");

// 임베드가 막힌 곡은 건너뛴다
reset();
store.getState().play("recommend", QUEUE, 0);
store.getState().reportBlocked("b");
assert.equal(currentTrack(store.getState())?.id, "c", "막힌 곡을 건너뛰지 않았다");

// 뒤가 전부 막혔으면 멈춘다. 여기서 무한히 돌면 브라우저가 굳는다
reset();
store.getState().play("recommend", QUEUE, 0);
store.setState({ blocked: new Set(["b", "c"]) });
store.getState().skip(1);
assert.equal(store.getState().isPlaying, false, "갈 곳이 없는데 재생 중이다");

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

console.log(
  `✓ 재생 큐 — 시작·토글·앞뒤·끝 정지·막힌 곡 건너뛰기·목록 전환·재정렬 후 토글·아이콘 일치`,
);
