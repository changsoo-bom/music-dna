/** 차트 카테고리 슬롯. globals.css 의 --chart-1..5 와 1:1 대응한다. */
export type ChartSlot = 1 | 2 | 3 | 4 | 5;

/* ── 장르 ─────────────────────────────────────────────────────────
   상위 5종 = 차트 5색. 하위 장르가 실제 분류 해상도를 담당한다.
   목록은 @/constants/genres 에 있다.                              */

export type Genre = "pop" | "rock" | "hiphop" | "rnb" | "electronic";

/**
 * 국내 곡인가 아닌가. **장르와 다른 축이다** — K-Pop 은 하위 장르지만
 * 국내 발라드·인디록·힙합은 저마다 다른 장르에 흩어져 있어서, 장르만으로는
 * "한국 노래" 를 못 고른다. 둘러보기가 이 둘을 겹쳐서 좁힌다.
 *
 * **둘로만 가른다.** 나라별로 쪼개면 곡 하나에 국적이 여럿인 경우
 * (한국에서 활동하는 일본 가수, 국제 공동작업)를 매번 판정해야 하는데,
 * 화면이 묻는 것은 거기까지가 아니다.
 *
 * **국적이 아니라 주 활동 시장으로 가른다.** 경계 사례가 말없이 갈리면
 * 국내 탭에 두 기준이 섞이는데 타입도 검증 스크립트도 그걸 못 잡는다.
 * YUKIKA(일본 국적·국내 활동)는 `kr`, Peggy Gou(한국 국적·해외 활동)는
 * `intl` 이다 — 화면이 묻는 것은 "내가 아는 이름인가" 지 여권이 아니다.
 */
export type Region = "kr" | "intl";

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
  /** 국내인가 해외인가. 둘러보기의 첫 번째 탭 줄이 이 값으로 나뉜다 */
  region: Region;
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

/**
 * **카탈로그 밖에서 온 곡.** 검색이 YouTube 에서 주워 온 것이라 장르도 지역도
 * 없다 — 그건 사람이 카탈로그에 적어 넣는 값이고, API 는 안 준다.
 *
 * `id` 는 `yt:{videoId}` 다. 카탈로그 id(`t001`)와 절대 안 겹치는 모양이어야
 * 한다 — 겹치면 저장소에 남은 id 가 어느 쪽 곡인지 알 수 없고, 목록의 `key`
 * 도 부딪힌다.
 *
 * **보관함에 못 담는다.** 리스트는 id 만 저장하고 읽을 때 카탈로그에서 되찾는데
 * (`toTracks`), 여기 곡은 카탈로그에 없어서 조용히 사라진다. 담기 버튼을 아예
 * 안 그리는 이유다 → `SearchList`
 */
export type RemoteTrack = {
  id: `yt:${string}`;
  title: string;
  artist: string;
  youtubeId: string;
  /** 초 */
  duration?: number;
};

/**
 * 화면이 곡으로 그릴 수 있는 것. **줄 하나를 그리는 데 필요한 것은 둘이 같다** —
 * 커버·제목·아티스트·길이. 다른 것은 장르와 지역인데, 그건 목록을 묶고 좁히는
 * 쪽이 쓰지 줄이 쓰지 않는다 → `TrackRow`
 */
export type AnyTrack = CatalogTrack | RemoteTrack;

/**
 * 검색이 찾아낸 가수. **YouTube 채널이 주는 것이 전부다** — 앨범도 데뷔년도도
 * 없다. 있는 것만 그리고 없는 것은 지어내지 않는다.
 */
export type RemoteArtist = {
  channelId: string;
  name: string;
  /** 채널 설명의 첫 줄. 없을 수 있다 */
  about: string;
  thumbnail?: string;
  subscribers?: number;
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
