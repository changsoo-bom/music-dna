import type { Genre, GenreNode, SubGenre, SubGenreNode } from "@/types/music";

/**
 * 장르 분류는 2단이다.
 *
 * 상위 5종은 `--chart-1..5` 에 1:1 로 박힌다. **늘리지 않는다** —
 * 크림 배경에서 6번째 색은 색각 대비 검증이 깨진다 (docs/design-reference.md).
 * 실제 분류의 해상도는 하위 장르가 담당하고, 차트로 올라갈 때 상위로 접힌다.
 *
 * `near` — 그 하위 장르가 걸쳐 있는 다른 상위 장르.
 * 성향 검사는 상위 장르만 묻기 때문에 여기서는 쓰지 않고,
 * 추천의 인접성 계산이 쓴다 — 로파이 힙합을 고른 사람에게 Electronic 을 열어 준다.
 *
 * `mood` — 이 하위 장르의 기본 좌표(energy·valence·dreamy).
 * 카탈로그에 곡을 넣을 때 여기서 출발해 곡별로 손본다.
 * 손보지 않아도 값이 비지 않는다는 게 이 기본값의 목적이다.
 */
export const GENRES: readonly GenreNode[] = [
  {
    id: "pop",
    slot: 1,
    label: "Pop",
    ko: "팝",
    children: [
      { id: "kpop", label: "K-Pop", ko: "케이팝", mood: { energy: 78, valence: 82, dreamy: 25 } },
      { id: "ballad", label: "Ballad", ko: "발라드", near: "rnb", mood: { energy: 25, valence: 30, dreamy: 45 } },
      { id: "indie-pop", label: "Indie Pop", ko: "인디팝", near: "rock", mood: { energy: 55, valence: 68, dreamy: 55 } },
      { id: "city-pop", label: "City Pop", ko: "시티팝", near: "rnb", mood: { energy: 55, valence: 78, dreamy: 50 } },
    ],
  },
  {
    id: "rock",
    slot: 2,
    label: "Rock",
    ko: "록",
    children: [
      { id: "indie-rock", label: "Indie Rock", ko: "인디록", mood: { energy: 68, valence: 55, dreamy: 40 } },
      { id: "modern-rock", label: "Modern Rock", ko: "모던록", mood: { energy: 78, valence: 55, dreamy: 25 } },
      { id: "shoegaze", label: "Shoegaze", ko: "슈게이즈", near: "electronic", mood: { energy: 55, valence: 30, dreamy: 92 } },
      { id: "punk", label: "Punk", ko: "펑크·개러지", mood: { energy: 92, valence: 45, dreamy: 12 } },
    ],
  },
  {
    id: "hiphop",
    slot: 3,
    label: "Hip-hop",
    ko: "힙합",
    children: [
      { id: "boombap", label: "Boom Bap", ko: "붐뱁", mood: { energy: 62, valence: 50, dreamy: 25 } },
      { id: "trap", label: "Trap", ko: "트랩", mood: { energy: 80, valence: 35, dreamy: 30 } },
      { id: "melodic-rap", label: "Melodic Rap", ko: "멜로딕 랩", near: "rnb", mood: { energy: 58, valence: 48, dreamy: 50 } },
      { id: "lofi-hiphop", label: "Lo-fi", ko: "로파이 힙합", near: "electronic", mood: { energy: 25, valence: 52, dreamy: 68 } },
    ],
  },
  {
    id: "rnb",
    slot: 4,
    label: "R&B",
    ko: "알앤비",
    children: [
      { id: "neo-soul", label: "Neo Soul", ko: "네오소울", mood: { energy: 42, valence: 62, dreamy: 45 } },
      { id: "alt-rnb", label: "Alt R&B", ko: "얼터너티브 R&B", near: "electronic", mood: { energy: 45, valence: 32, dreamy: 72 } },
      { id: "funk", label: "Funk", ko: "펑크·소울", near: "pop", mood: { energy: 82, valence: 85, dreamy: 15 } },
      { id: "slow-jam", label: "Slow Jam", ko: "슬로우잼", mood: { energy: 28, valence: 58, dreamy: 50 } },
    ],
  },
  {
    id: "electronic",
    slot: 5,
    label: "Electronic",
    ko: "일렉트로닉",
    children: [
      { id: "house", label: "House", ko: "하우스", mood: { energy: 78, valence: 72, dreamy: 35 } },
      { id: "ambient", label: "Ambient", ko: "앰비언트·칠웨이브", mood: { energy: 15, valence: 45, dreamy: 95 } },
      { id: "synth-pop", label: "Synth Pop", ko: "신스팝", near: "pop", mood: { energy: 70, valence: 75, dreamy: 45 } },
      { id: "dnb", label: "Drum & Bass", ko: "드럼앤베이스", near: "hiphop", mood: { energy: 90, valence: 50, dreamy: 35 } },
    ],
  },
];

/** 하위 장르 → 상위 장르. 카탈로그를 차트로 접을 때 쓴다. */
export const PARENT_OF: Readonly<Record<SubGenre, Genre>> = Object.fromEntries(
  GENRES.flatMap((g) => g.children.map((c) => [c.id, g.id])),
) as Record<SubGenre, Genre>;

export const SUB_GENRES: Readonly<Record<SubGenre, SubGenreNode>> = Object.fromEntries(
  GENRES.flatMap((g) => g.children.map((c) => [c.id, c])),
) as Record<SubGenre, SubGenreNode>;
