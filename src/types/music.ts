/** 차트 카테고리 슬롯. globals.css 의 --chart-1..5 와 1:1 대응한다. */
export type ChartSlot = 1 | 2 | 3 | 4 | 5;

export type Genre = {
  name: string;
  slot: ChartSlot;
  /** 재생 시간 기준 점유율(%). 5개 합이 100 이 되도록 정규화된 값 */
  share: number;
  hours: number;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  slot: ChartSlot;
  bpm: number;
  /** 0~1. 밝은 정도 */
  valence: number;
  /** 0~1. 격렬한 정도 */
  energy: number;
};

export type Recommendation = Track & {
  coverUrl: string;
  genre: string;
  /** 이 곡을 고른 근거. 반드시 리포트 지표에서 파생된 문장이어야 한다 */
  reason: string;
};

export type TopArtist = {
  name: string;
  imageUrl: string;
  hours: number;
  genre: string;
  /** "최다 재생", "새벽 전용" 처럼 이 아티스트가 왜 눈에 띄는지 */
  note: string;
};

/** 0시부터 23시까지 24칸. 각 값은 전체 재생 대비 % */
export type HourlyPlays = readonly number[];

export type GenreDrift = {
  slot: ChartSlot;
  /** 최근 6개월 점유율(%), 오래된 달부터 */
  monthly: number[];
};

export type PersonaAxis = {
  label: string;
  /** 0~100 */
  score: number;
};

export type Report = {
  persona: string;
  summary: string;
  axes: PersonaAxis[];
  genres: Genre[];
  hourly: HourlyPlays;
  tracks: Track[];
  drift: GenreDrift[];
  artists: TopArtist[];
  recommendations: Recommendation[];
  totalArtists: number;
  totalMinutes: number;
};
