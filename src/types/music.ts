/** 차트 카테고리 슬롯. globals.css 의 --chart-1..5 와 1:1 대응한다. */
export type ChartSlot = 1 | 2 | 3 | 4 | 5;

/* ── 장르 ─────────────────────────────────────────────────────────
   상위 5종 = 차트 5색. 하위 장르가 실제 분류 해상도를 담당한다.
   목록은 @/constants/genres 에 있다.                              */

export type Genre = "pop" | "rock" | "hiphop" | "rnb" | "electronic";

export type SubGenre =
  | "kpop" | "ballad" | "indie-pop" | "city-pop"
  | "indie-rock" | "modern-rock" | "shoegaze" | "punk"
  | "boombap" | "trap" | "melodic-rap" | "lofi-hiphop"
  | "neo-soul" | "alt-rnb" | "funk" | "slow-jam"
  | "house" | "ambient" | "synth-pop" | "dnb";

export type SubGenreNode = {
  id: SubGenre;
  label: string;
  ko: string;
  /** 걸쳐 있는 다른 상위 장르. 추천의 인접성 계산이 쓴다 */
  near?: Genre;
  /** 이 하위 장르의 기본 좌표. 카탈로그에 곡을 넣을 때 여기서 출발해 조정한다 */
  mood: MoodVector;
};

export type GenreNode = {
  id: Genre;
  slot: ChartSlot;
  label: string;
  ko: string;
  children: readonly SubGenreNode[];
};

/* ── 성향 검사가 재는 축 ──────────────────────────────────────── */

export type TimeSlot = "morning" | "afternoon" | "evening" | "night" | "dawn";

/** MOOD 화면의 7종. 축에서 파생되는 값이지 직접 묻는 값이 아니다 */
export type Mood =
  | "melancholic" | "dreamy" | "energetic" | "romantic"
  | "chill" | "dark" | "happy";

/**
 * 분위기를 3축 좌표로 표현한다. **사용자와 곡이 같은 공간에 놓인다.**
 * 덕분에 MOOD 7종 파생도, 추천 매칭도 거리 계산 하나로 끝난다 —
 * 라벨끼리 이어붙이는 매핑표가 필요 없다.
 */
export type MoodVector = {
  /** 0~100. 차분함 ↔ 격렬함 */
  energy: number;
  /** 0~100. 어두움 ↔ 밝음 */
  valence: number;
  /** 0~100. 또렷함 ↔ 몽환적 */
  dreamy: number;
};

export type PreferenceAxes = MoodVector & {
  /** 합이 100 */
  genre: Record<Genre, number>;
  /** 합이 100 */
  timeOfDay: Record<TimeSlot, number>;
  /** 0~100. 익숙한 것 반복 ↔ 새로운 것 발견 */
  explorer: number;
};

export type PersonaId =
  | "dawn-explorer"
  | "deep-diver"
  | "genre-collector"
  | "daylight-charger"
  | "hype-player";

/**
 * Local Storage `musicdna:musicPreference:v1` 의 내용.
 *
 * `answers` 를 같이 저장한다 — 점수만 저장하면 문항이나 배점을 고칠 때
 * 재검사를 시키는 것 말고 방법이 없다. 답이 남아 있으면 다시 계산하면 된다.
 */
export type MusicPreference = {
  version: 1;
  /** questionId → 고른 선택지 index 배열. 순위 문항 때문에 배열로 통일했다 */
  answers: Record<string, readonly number[]>;
  axes: PreferenceAxes;
  /** 0~100. axes 에서 파생 */
  moods: Record<Mood, number>;
  persona: PersonaId;
  computedAt: string;
};

/* ── 곡 카탈로그 ──────────────────────────────────────────────── */

export type CatalogTrack = {
  id: string;
  title: string;
  artist: string;
  subGenre: SubGenre;
  /**
   * 하위 장르 기본 좌표에서 **달라지는 축만** 적는다.
   * 40곡 × 3개를 전부 손으로 적으면 대부분이 기본값의 복사본이 되고,
   * 그러면 어느 값이 실제 판단인지 구별할 수 없다. 비어 있으면 기본값 그대로다.
   */
  mood?: Partial<MoodVector>;
  /**
   * 아래 둘은 `videos.list` 보강 전까지 비어 있다.
   * 없는 값을 지어내면 재생되지 않는 곡이 카탈로그에 조용히 섞인다.
   */
  youtubeId?: string;
  /** 초 */
  duration?: number;
};

/** 사용자가 고르거나 플레이리스트에 담은 곡. 시각은 처음부터 넣는다 */
export type SavedTrack = {
  trackId: string;
  savedAt: string;
};

/* ── 리스트 ───────────────────────────────────────────────────── */

/**
 * 사람이 만든 곡 목록. 이름은 만든 날짜에서 나오고 바꿀 수 있다.
 * 담긴 곡은 id 로만 갖는다 — 카탈로그가 곡 정보의 주인이다.
 */
export type Playlist = {
  id: string;
  name: string;
  /** `2026-08-25`. 그날의 지역 날짜다 */
  createdAt: string;
  trackIds: string[];
};
