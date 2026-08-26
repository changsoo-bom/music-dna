import { create } from "zustand";

import { PARENT_OF } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";
import type { CatalogTrack, Genre } from "@/types/music";

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
 *
 * **리스트는 이름 하나로 안 된다.** 저장된 리스트는 여럿이고 같은 곡이 여러
 * 리스트에 담기는 것이 이 기능의 정상 사용이라, 전부 `"library"` 로 두면
 * 첫 곡이 같은 두 리스트가 서로를 일시정지시킨다 — B를 틀려고 눌렀는데
 * A가 멈춘다. 그래서 리스트만 자기 id 를 달고 다닌다.
 *
 * **전체보기도 같은 이유로 둘이다.** 줄을 눌러 트는 큐는 화면 전체(`browse`)고,
 * 칸의 "전체 재생" 은 그 칸만(`browse:{genre}`)이다. 같은 이름을 쓰면 화면 첫
 * 곡이 나는 중에 그 칸의 전체 재생을 눌렀을 때 아래 `play` 의 토글 분기에
 * 걸려서 **재생 버튼이 정지를 한다** — 첫 곡이 겹치는 것은 우연이 아니라
 * 접힌 목록의 정상 상태다.
 */
export type QueueId =
  | "recommend"
  | "played"
  | "browse"
  | `browse:${Genre}`
  | `library:${string}`;

/**
 * 큐가 끝났을 때 이어 틀 곡을 카탈로그에서 고른다. **같은 종류에서 무작위로.**
 *
 * 점수로 고르지 않는다. 추천 목록(`recommend`)은 검사 결과에 맞는 곡을 순서
 * 있게 뽑는 일이고, 이건 **틀어 놓은 뒤의 시간**이다 — 여기서까지 최적해를
 * 고르면 매번 같은 곡이 이어지고 카탈로그가 커져도 안 넓어진다. 방금 들은
 * 곡과 같은 하위 장르라는 조건만 지키고 나머지는 운에 맡긴다.
 *
 * 좁은 쪽부터 본다: 같은 하위 장르 → 같은 상위 장르 → 카탈로그 전체.
 * 하위 장르당 곡이 아직 4~6곡이라(`src/data/catalog.ts`) 몇 곡만 들어도
 * 같은 칸이 마르는데, 그때 조용해지는 것보다 옆 칸으로 넓히는 쪽이 낫다.
 *
 * **들은 곡과 막힌 곡은 뺀다.** 그래서 카탈로그를 한 바퀴 돌면 후보가
 * 없어지고 `skip` 이 거기서 멈춘다 — 무한 반복이 아니라 끝이 있는 라디오다.
 * 자리를 뜬 사람의 스피커가 영원히 울지 않아야 한다는 판단은 그대로다.
 */
function radioPick(after: PlayableTrack, heard: ReadonlySet<string>): PlayableTrack | null {
  const pool = CATALOG.filter(isPlayable).filter((track) => !heard.has(track.id));
  const parent = PARENT_OF[after.subGenre];

  const sameSub = pool.filter((track) => track.subGenre === after.subGenre);
  const sameGenre = pool.filter((track) => PARENT_OF[track.subGenre] === parent);
  const from = sameSub.length ? sameSub : sameGenre.length ? sameGenre : pool;

  return from[Math.floor(Math.random() * from.length)] ?? null;
}

type PlayerState = {
  /** 지금 큐가 어느 목록에서 왔는지. 비었으면 `null` */
  queueId: QueueId | null;
  queue: readonly PlayableTrack[];
  index: number;
  /** 플레이어가 실제로 소리를 내고 있는지. **YouTube 가 알려 준 사실만 적는다** */
  isPlaying: boolean;
  /** 임베드가 막힌 곡. 자동으로 넘기되 무한히 돌지 않게 기억해 둔다 */
  blocked: ReadonlySet<string>;
  /**
   * 소리 크기 0~100 과 음소거.
   *
   * **여기 있는 이유는 바와 전체 화면이 같은 값을 봐야 해서다.** 한쪽에서
   * 줄인 소리가 다른 쪽 손잡이에 안 비치면 둘 중 하나는 거짓말을 한다.
   * 조작이 한 군데뿐이었다면 로컬 state 로 충분했다. → `.claude/rules/state.md`
   *
   * **음소거는 볼륨과 따로 둔다.** 볼륨을 0 으로 떨어뜨려 흉내 내면 풀 때
   * 돌아갈 자리를 어딘가에 또 적어야 하고, 그게 어긋나면 풀었는데 조용하다.
   * `volume` 을 손대지 않고 두면 돌아갈 자리가 곧 그 값이다.
   */
  volume: number;
  muted: boolean;

  play: (queueId: QueueId, queue: readonly PlayableTrack[], index: number) => void;
  toggle: () => void;
  skip: (direction: 1 | -1) => void;
  /** 플레이어 이벤트를 받아 적는다. 여기서만 `isPlaying` 이 바뀐다 */
  reportPlaying: (playing: boolean) => void;
  /** 이 곡은 이 사이트에서 못 튼다. 다음 곡으로 넘어간다 */
  reportBlocked: (id: string) => void;
  setVolume: (volume: number) => void;
  toggleMuted: () => void;
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
  volume: 100,
  muted: false,

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
   * 앞뒤로 넘긴다. 막힌 곡은 건너뛴다.
   *
   * **앞으로 가다 큐가 끝나면 카탈로그에서 한 곡 이어 붙인다**(`radioPick`).
   * 곡이 끝나서 온 것이든 ⏭ 를 눌러서 온 것이든 같다 — 마지막 곡에서
   * 다음을 눌렀을 때만 아무 일도 안 나면 버튼이 상황에 따라 다른 말을 한다.
   *
   * 뒤로는 안 잇는다. 뒤는 지나온 길이고, 없던 과거를 만들어 낼 수는 없다.
   */
  skip: (direction) => {
    const { queue, index, blocked } = get();
    for (let next = index + direction; next >= 0 && next < queue.length; next += direction) {
      if (!blocked.has(queue[next].id)) {
        set({ index: next, isPlaying: true });
        return;
      }
    }

    const current = queue[index];
    if (direction === 1 && current) {
      const heard = new Set([...queue.map((track) => track.id), ...blocked]);
      const next = radioPick(current, heard);
      // 이어 붙인 곡은 큐의 마지막이므로 새 index 는 붙이기 전 길이다
      if (next) {
        set({ queue: [...queue, next], index: queue.length, isPlaying: true });
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

  // 소리를 만지면 음소거는 풀린다. 끌어 놓고 왜 조용한지 찾게 하지 않는다
  setVolume: (volume) => set({ volume, muted: false }),

  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  // 소리 크기는 안 건드린다. 껐다 다시 트는 것이지 설정을 되돌리는 게 아니다
  close: () => set({ queueId: null, queue: [], index: 0, isPlaying: false }),
}));

/** 지금 트는 곡. 큐가 비었으면 `null` */
export function currentTrack(state: PlayerState): PlayableTrack | null {
  return state.queue[state.index] ?? null;
}

/**
 * **이 목록에서** 지금 소리를 내고 있는 곡의 id. 아니면 `null`.
 *
 * 목록까지 봐야 한다. 곡 id 만 보면 추천에서 튼 곡이 빠른 선곡에도 있을 때
 * 양쪽 다 일시정지 아이콘을 다는데, **빠른 선곡 쪽을 누르면 멈추지 않는다** —
 * 다른 목록이므로 "이 목록을 여기서부터 틀어 줘" 가 된다. 그러면 아이콘이
 * 클릭의 결과를 잘못 말한 셈이고, 사용자에게는 "눌러도 아무 일이 안 난다" 로
 * 보인다. 아이콘과 행동은 같은 조건에서 갈려야 한다.
 *
 * 목록 컴포넌트는 이걸 **구독 하나로** 받아서 줄마다 비교한다. 줄마다
 * 구독하면 아홉 줄이 아홉 번 깨어난다.
 */
export function soundingId(state: PlayerState, queueId: QueueId): string | null {
  if (!state.isPlaying || state.queueId !== queueId) return null;
  return currentTrack(state)?.id ?? null;
}

/**
 * 전체보기에서 지금 소리를 내고 있는 곡의 id. **큐가 둘이라 따로 있다** —
 * 줄을 눌러 튼 것(`browse`)과 칸의 전체 재생(`browse:{genre}`)은 서로 다른
 * 큐지만 **같은 화면이 튼 것**이라, 어느 쪽이든 그 줄에 표시가 붙어야 한다.
 * `soundingId` 로는 한 번에 한쪽만 볼 수 있다.
 */
export function browseSoundingId(state: PlayerState): string | null {
  const id = state.queueId;
  // **두 이름을 이름으로 부른다.** 접두사만 보면 언젠가 `"browse-history"` 같은
  // 이름이 조용히 걸리는데, 그때 잡아 줄 검사는 못 쓴다 — 아직 없는 이름은
  // 단언할 수가 없다. 이 저장소의 다른 자리가 전부 등가 비교인 이유와 같다
  if (!state.isPlaying || !(id === "browse" || id?.startsWith("browse:"))) return null;
  return currentTrack(state)?.id ?? null;
}

/**
 * 이 카드를 누르면 멈추는가. **아이콘이 이 값을 그린다.**
 *
 * 카드가 하나뿐인 자리(위성 재생 버튼)를 위한 것이고, 조건은 위와 **같은
 * 함수에서 나온다** — 전에는 목록 쪽이 같은 판정을 손으로 한 벌 더 갖고
 * 있어서, 토글 조건이 바뀌는 날 한쪽만 고쳐질 자리였다.
 */
export function isSounding(state: PlayerState, queueId: QueueId, trackId: string): boolean {
  return soundingId(state, queueId) === trackId;
}
