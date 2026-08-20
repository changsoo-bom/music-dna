import { create } from "zustand";

import type { CatalogTrack } from "@/types/music";

/** 큐에 담기려면 재생할 것이 있어야 한다 */
export type PlayableTrack = CatalogTrack & { youtubeId: string };

export function isPlayable(track: CatalogTrack): track is PlayableTrack {
  return typeof track.youtubeId === "string";
}

type PlayerState = {
  queue: readonly PlayableTrack[];
  index: number;
  /** 플레이어가 실제로 소리를 내고 있는지. **YouTube 가 알려 준 사실만 적는다** */
  isPlaying: boolean;
  /** 임베드가 막힌 곡. 자동으로 넘기되 무한히 돌지 않게 기억해 둔다 */
  blocked: ReadonlySet<string>;

  play: (queue: readonly PlayableTrack[], index: number) => void;
  toggle: () => void;
  skip: (direction: 1 | -1) => void;
  /** 플레이어 이벤트를 받아 적는다. 여기서만 `isPlaying` 이 바뀐다 */
  reportPlaying: (playing: boolean) => void;
  /** 이 곡은 이 사이트에서 못 튼다. 다음 곡으로 넘어간다 */
  reportBlocked: (id: string) => void;
  close: () => void;
};

/**
 * 재생 상태.
 *
 * **서버 데이터가 아니라서 여기 산다.** 추천 목록 자체는 서버에서 계산되고
 * 스토어에 복사하지 않는다 — 스토어가 들고 있는 건 "지금 무엇을 트는가" 뿐이고,
 * 그건 서버가 알 수 없는 값이다. → `.claude/rules/state.md`
 *
 * 카드의 재생 버튼과 화면 아래 바가 서로 다른 서브트리에 있어서 전역이 필요하다.
 * 한 컴포넌트 안이었으면 로컬 state 로 충분했을 것이다.
 */
export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  index: 0,
  isPlaying: false,
  blocked: new Set(),

  play: (queue, index) => {
    const current = get();
    const track = queue[index];
    if (!track) return;

    // **같은 목록의 같은 곡**일 때만 토글이다. 곡 id 만 보면, 추천 목록과
    // 빠른 선곡에 같은 곡이 있을 때 다른 목록에서 눌러도 재생이 멈춘다 —
    // 누른 사람은 "이 목록을 틀어 줘" 라고 한 건데 화면은 조용해진다.
    const sameQueue =
      current.queue.length === queue.length &&
      current.queue.every((item, i) => item.id === queue[i].id);
    if (sameQueue && current.index === index) {
      current.toggle();
      return;
    }

    // 막혔던 곡을 다시 고르면 한 번 더 시도한다. 그냥 무시하면 눌러도
    // 아무 일이 안 나는 카드가 된다. 또 막히면 onError 가 다시 표시한다.
    const blocked = new Set(current.blocked);
    blocked.delete(track.id);

    set({ queue, index, isPlaying: true, blocked });
  },

  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),

  /**
   * 앞뒤로 넘긴다. 막힌 곡은 건너뛰고, 끝에 닿으면 멈춘다.
   *
   * 반복 재생을 넣지 않는다 — 다섯 곡짜리 목록이 조용해지지 않으면
   * 사람이 자리를 뜬 뒤에도 계속 돈다.
   */
  skip: (direction) => {
    const { queue, index, blocked } = get();
    for (let next = index + direction; next >= 0 && next < queue.length; next += direction) {
      if (!blocked.has(queue[next].id)) {
        set({ index: next, isPlaying: true });
        return;
      }
    }
    set({ isPlaying: false });
  },

  reportPlaying: (playing) => set({ isPlaying: playing }),

  reportBlocked: (id) => {
    set((s) => ({ blocked: new Set(s.blocked).add(id) }));
    get().skip(1);
  },

  close: () => set({ queue: [], index: 0, isPlaying: false }),
}));

/** 지금 트는 곡. 큐가 비었으면 `null` */
export function currentTrack(state: PlayerState): PlayableTrack | null {
  return state.queue[state.index] ?? null;
}
