/**
 * 재생 큐 검증.
 *
 * 브라우저 없이 돌아간다 — 스토어는 순수 상태 전이고, YouTube 를 건드리는 건
 * `PlayerBar` 뿐이다. **여기서 막고 싶은 것은 조용한 오작동이다**: 다음 곡으로
 * 안 넘어가거나, 막힌 곡에서 무한히 돌거나, 마지막 곡 뒤에 처음으로 되감기는 것.
 * 셋 다 화면에는 "그냥 조용해진" 것으로만 보인다.
 */
import assert from "node:assert/strict";

import { currentTrack, usePlayerStore } from "@/lib/use-player-store";
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

// 다른 목록에서 같은 곡을 눌러도 멈추지 않는다.
// 곡 id 만 비교하면 추천 목록과 빠른 선곡에 같은 곡이 있을 때
// 재생하려고 누른 것이 정지가 된다 — 화면에서는 "안 눌린다" 로 보인다.
reset();
store.getState().play(QUEUE, 0);
const otherList = [QUEUE[0], QUEUE[2]];
store.getState().play(otherList, 0);
assert.equal(store.getState().isPlaying, true, "다른 목록에서 같은 곡을 눌렀는데 멈췄다");
assert.equal(store.getState().queue.length, 2, "큐가 누른 목록으로 바뀌지 않았다");

// 같은 목록의 같은 곡은 토글이다
store.getState().play(otherList, 0);
assert.equal(store.getState().isPlaying, false, "같은 목록의 같은 곡이 토글되지 않았다");

// 막혔던 곡을 다시 고르면 한 번 더 시도한다.
// 영영 무시하면 눌러도 아무 일이 안 나는 카드가 된다.
reset();
store.getState().play(QUEUE, 0);
store.getState().reportBlocked("b");
store.getState().play(QUEUE, 1);
assert.equal(currentTrack(store.getState())?.id, "b", "막혔던 곡을 다시 고를 수 없다");
assert.equal(store.getState().blocked.has("b"), false, "다시 고른 곡이 막힌 채로 남았다");
assert.equal(store.getState().isPlaying, true, "다시 고른 곡이 재생되지 않았다");

console.log(`✓ 재생 큐 — 시작·토글·앞뒤·끝 정지·막힌 곡 건너뛰기·목록 전환`);
