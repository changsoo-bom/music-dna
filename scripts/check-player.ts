/**
 * 재생 큐 검증.
 *
 * 브라우저 없이 돌아간다 — 스토어는 순수 상태 전이고, YouTube 를 건드리는 건
 * `PlayerBar` 뿐이다. **여기서 막고 싶은 것은 조용한 오작동이다**: 다음 곡으로
 * 안 넘어가거나, 막힌 곡에서 무한히 돌거나, 마지막 곡 뒤에 처음으로 되감기는 것.
 * 셋 다 화면에는 "그냥 조용해진" 것으로만 보인다.
 */
import assert from "node:assert/strict";

import { currentTrack, shuffled, usePlayerStore } from "@/lib/use-player-store";
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
  store.setState({ queue: [], index: 0, isPlaying: false, blocked: new Set() });

// 고른 곡에서 시작한다
reset();
store.getState().play(QUEUE, 1);
assert.equal(currentTrack(store.getState())?.id, "b", "고른 곡이 아닌 것이 재생됐다");
assert.equal(store.getState().isPlaying, true, "재생이 시작되지 않았다");

// 같은 곡을 다시 누르면 멈춘다. 처음부터 다시 틀지 않는다
store.getState().play(QUEUE, 1);
assert.equal(store.getState().isPlaying, false, "같은 곡을 다시 눌렀는데 안 멈췄다");
assert.equal(store.getState().index, 1, "같은 곡을 다시 눌렀는데 위치가 움직였다");

// 앞뒤로 넘어간다
store.getState().skip(1);
assert.equal(currentTrack(store.getState())?.id, "c", "다음 곡으로 안 넘어갔다");
store.getState().skip(-1);
assert.equal(currentTrack(store.getState())?.id, "b", "이전 곡으로 안 넘어갔다");

// 끝에 닿으면 멈춘다. 되감지 않는다 — 자리를 뜬 뒤에도 계속 돌면 안 된다
reset();
store.getState().play(QUEUE, 2);
store.getState().skip(1);
assert.equal(store.getState().isPlaying, false, "마지막 곡 다음에도 재생 중이다");
assert.equal(currentTrack(store.getState())?.id, "c", "마지막 곡에서 위치가 움직였다");

reset();
store.getState().play(QUEUE, 0);
store.getState().skip(-1);
assert.equal(store.getState().isPlaying, false, "첫 곡 이전에도 재생 중이다");

// 임베드가 막힌 곡은 건너뛴다
reset();
store.getState().play(QUEUE, 0);
store.getState().reportBlocked("b");
assert.equal(currentTrack(store.getState())?.id, "c", "막힌 곡을 건너뛰지 않았다");

// 뒤가 전부 막혔으면 멈춘다. 여기서 무한히 돌면 브라우저가 굳는다
reset();
store.getState().play(QUEUE, 0);
store.setState({ blocked: new Set(["b", "c"]) });
store.getState().skip(1);
assert.equal(store.getState().isPlaying, false, "갈 곳이 없는데 재생 중이다");

// 셔플 — 곡이 사라지거나 늘지 않고, 실제로 섞인다.
// Fisher-Yates 를 잘못 쓰면 (i+1 대신 length 를 쓰는 흔한 실수) 순열이 편향되는데
// 화면에서는 "왜 늘 비슷한 순서지" 정도로만 느껴져서 눈치채기 어렵다.
const ids = (list: readonly PlayableTrack[]) => list.map((t) => t.id);
const orders = new Set<string>();
for (let i = 0; i < 200; i++) {
  const mixed = shuffled(QUEUE);
  assert.deepEqual([...ids(mixed)].sort(), [...ids(QUEUE)].sort(), "셔플이 곡을 잃거나 만들었다");
  orders.add(ids(mixed).join(","));
}
assert.ok(orders.size > 1, "셔플이 항상 같은 순서를 준다");
// 3곡의 순열은 6가지다. 200번이면 전부 나와야 한다 — 안 나오면 편향이다.
assert.equal(orders.size, 6, `순열이 ${orders.size}가지만 나왔다`);

// 셔플 재생은 토글이 아니다. 이미 그 곡을 틀고 있어도 처음부터 다시 시작한다
reset();
store.getState().play(QUEUE, 0);
store.getState().playShuffled(QUEUE);
assert.equal(store.getState().isPlaying, true, "셔플 재생이 재생을 멈췄다");
assert.equal(store.getState().index, 0, "셔플 재생이 처음부터 시작하지 않았다");
console.log(`✓ 재생 큐 — 시작·토글·앞뒤·끝 정지·막힌 곡 건너뛰기·셔플 6순열`);
