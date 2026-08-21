import { create } from "zustand";

import type { CatalogTrack } from "@/types/music";

/** 큐에 담기려면 재생할 것이 있어야 한다 */
export type PlayableTrack = CatalogTrack & { youtubeId: string };

export function isPlayable(track: CatalogTrack): track is PlayableTrack {
  return typeof track.youtubeId === "string";
}

/**
 * 어느 목록에서 튼 것인가.
 *
 * **큐 내용으로는 목록을 식별할 수 없다.** 빠른 선곡은 재생하는 순간 그 곡을
 * 맨 앞으로 올리므로(`recordPlayed`) 목록이 비교 도중에 재정렬되고, 추천은
 * New Search 로 통째로 갈린다. 목록에 이름을 붙여야 "같은 목록의 같은 곡" 을
 * 판정할 수 있다.
 */
export type QueueId = "recommend" | "played";

type PlayerState = {
  /** 지금 큐가 어느 목록에서 왔는지. 비었으면 `null` */
  queueId: QueueId | null;
  queue: readonly PlayableTrack[];
  index: number;
  /** 플레이어가 실제로 소리를 내고 있는지. **YouTube 가 알려 준 사실만 적는다** */
  isPlaying: boolean;
  /** 임베드가 막힌 곡. 자동으로 넘기되 무한히 돌지 않게 기억해 둔다 */
  blocked: ReadonlySet<string>;

  play: (queueId: QueueId, queue: readonly PlayableTrack[], index: number) => void;
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
  queueId: null,
  queue: [],
  index: 0,
  isPlaying: false,
  blocked: new Set(),

  play: (queueId, queue, index) => {
    const current = get();
    const track = queue[index];
    if (!track) return;

    // **같은 목록의 지금 나는 곡**일 때만 토글이다.
    //
    // 곡 id 만 보면 추천과 빠른 선곡에 같은 곡이 있을 때 다른 목록에서 눌러도
    // 재생이 멈춘다 — 누른 사람은 "이 목록을 틀어 줘" 라고 한 건데 화면은
    // 조용해진다. 그래서 목록 신원을 같이 본다.
    //
    // **큐 내용을 비교하지 않는다.** 전에는 원소를 순서까지 맞춰 봤는데,
    // `recordPlayed` 가 재생 시작 순간 그 곡을 빠른 선곡 맨 앞으로 올려서
    // 비교 대상이 비교 도중에 재정렬됐다. 그러면 일시정지 아이콘이 떠 있는
    // 카드를 눌러도 첫 클릭에는 아무 일도 안 났다.
    //
    // 위치가 아니라 **곡**을 본다. 목록이 재정렬돼도 지금 나는 곡을 누른
    // 것은 언제나 일시정지다.
    if (queueId === current.queueId && currentTrack(current)?.id === track.id) {
      current.toggle();
      return;
    }

    // 막혔던 곡을 다시 고르면 한 번 더 시도한다. 그냥 무시하면 눌러도
    // 아무 일이 안 나는 카드가 된다. 또 막히면 onError 가 다시 표시한다.
    const blocked = new Set(current.blocked);
    blocked.delete(track.id);

    // 큐는 **누른 순간의 스냅숏**이다. 목록이 나중에 재정렬돼도 재생 순서는
    // 안 바뀐다 — 다음 곡이 무엇인지가 화면을 보는 사이에 달라지면 안 된다.
    set({ queueId, queue, index, isPlaying: true, blocked });
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

  close: () => set({ queueId: null, queue: [], index: 0, isPlaying: false }),
}));

/** 지금 트는 곡. 큐가 비었으면 `null` */
export function currentTrack(state: PlayerState): PlayableTrack | null {
  return state.queue[state.index] ?? null;
}

/**
 * 이 카드를 누르면 멈추는가. **아이콘이 이 값을 그린다.**
 *
 * 목록까지 같아야 참이다. 곡 id 만 보면 추천에서 튼 곡이 빠른 선곡에도 있을 때
 * 양쪽 다 일시정지 아이콘을 다는데, **빠른 선곡 쪽을 누르면 멈추지 않는다** —
 * 다른 목록이므로 "이 목록을 여기서부터 틀어 줘" 가 된다. 그러면 아이콘이
 * 클릭의 결과를 잘못 말한 셈이고, 사용자에게는 "눌러도 아무 일이 안 난다" 로
 * 보인다. 아이콘과 행동은 같은 조건에서 갈려야 한다.
 */
export function isSounding(state: PlayerState, queueId: QueueId, trackId: string): boolean {
  return state.isPlaying && state.queueId === queueId && currentTrack(state)?.id === trackId;
}
