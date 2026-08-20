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
  /** 순서를 섞어서 처음부터 튼다. 누를 때마다 다른 순서여야 한다 */
  playShuffled: (queue: readonly PlayableTrack[]) => void;
  toggle: () => void;
  skip: (direction: 1 | -1) => void;
  /** 플레이어 이벤트를 받아 적는다. 여기서만 `isPlaying` 이 바뀐다 */
  reportPlaying: (playing: boolean) => void;
  /** 이 곡은 이 사이트에서 못 튼다. 다음 곡으로 넘어간다 */
  reportBlocked: (id: string) => void;
  close: () => void;
};

/**
 * Fisher–Yates. `sort(() => Math.random() - 0.5)` 를 쓰지 않는다 —
 * 짧아 보이지만 **비교 함수가 일관적이지 않아 순열이 고르게 안 나온다.**
 * 다섯 곡이면 편향이 눈에 보인다.
 */
export function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

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
    // 이미 그 곡이면 껐다 켜는 토글로 쓴다. 같은 버튼을 두 번 누르는 사람은
    // 처음부터 다시 듣고 싶은 게 아니라 멈추고 싶은 것이다.
    if (current.queue[current.index]?.id === queue[index]?.id) {
      current.toggle();
      return;
    }
    set({ queue, index, isPlaying: true });
  },

  // `play` 와 달리 토글하지 않는다. 셔플은 "같은 것을 다시" 가 아니라
  // **매번 새 순서**를 뜻하므로, 누르면 항상 처음부터 다시 시작한다.
  playShuffled: (queue) => set({ queue: shuffled(queue), index: 0, isPlaying: true }),

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
