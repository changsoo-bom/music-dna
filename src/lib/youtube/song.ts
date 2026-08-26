/**
 * **YouTube 결과에서 노래만 남긴다.**
 *
 * `videoCategoryId=10`(음악)으로는 안 걸러진다 — 안무 영상도, 직캠도, 리액션도
 * 전부 음악 카테고리로 올라온다. 카테고리는 "무엇에 관한 영상인가" 지
 * "노래인가" 가 아니다.
 *
 * YouTube Music 이 깨끗한 것은 다른 목록을 보기 때문이다. 자동 생성되는
 * **`{아티스트} - Topic` 채널**에 음원만 따로 올라가 있고(Art Track), 그쪽
 * 앱은 그것을 판다. Data API 로는 그 목록을 직접 못 받지만, **채널 이름으로
 * 알아볼 수는 있다** — 그래서 여기서는 거르고 나서 그 순서로 세운다.
 *
 * 비용은 0 이다. 이미 받아 온 결과를 걸러 내는 일이라 호출이 안 늘어난다.
 */

/** 제목에 이게 들어 있으면 노래가 아니다. **구절로 본다** */
const NOT_SONG = [
  // 춤
  "안무", "choreograph", "dance practice", "댄스 연습", "연습 영상", "퍼포먼스 영상",
  // 무대·팬 촬영
  "직캠", "fancam", "교차편집", "stage mix", "무대 모음",
  // 남이 부르거나 반응한 것
  "리액션", "reaction", "cover by", "커버곡", "노래방", "karaoke",
  // 음원이 아닌 것
  "instrumental", "inst ver", "mr 제거", "가사 없",
  // 곡이 아닌 영상
  "메이킹", "making film", "비하인드", "behind the", "티저", "teaser", "예고편",
  "브이로그", "vlog", "인터뷰", "interview", "리뷰", "review", "해석",
  "#shorts", "shorts)", "쇼츠",
  // 통짜·반복
  "full album", "전곡", "1시간", "1 hour", "10 hours", "playlist", "플레이리스트",
] as const;

/**
 * 채널 이름으로 아는 것. **`- Topic` 이 YouTube Music 이 파는 그 음원이다.**
 * VEVO·Official 이 그다음이고, 나머지는 순서만 뒤로 간다(버리지는 않는다 —
 * 아티스트가 자기 채널에 음원을 올리는 경우가 흔하다).
 */
function channelRank(channelTitle: string): number {
  const name = channelTitle.toLowerCase();
  if (name.endsWith("- topic") || name.endsWith("- 토픽")) return 0;
  if (name.includes("vevo")) return 1;
  if (name.includes("official") || name.includes("오피셜")) return 2;
  return 3;
}

/** 노래 길이로 볼 만한가. 초 단위 */
export const SONG_MIN = 60;
export const SONG_MAX = 12 * 60;

export function isSongLength(duration: number | undefined): boolean {
  // 길이를 모르면 막지 않는다. 여기서 거르는 것은 **아는 것 중 아닌 것**이다
  if (duration === undefined) return true;
  return duration >= SONG_MIN && duration <= SONG_MAX;
}

/**
 * 제목·채널만 보고 노래인지 판정한다.
 *
 * **애매하면 통과시킨다.** 놓친 안무 영상 하나는 목록에서 눈에 거슬리는
 * 정도지만, 잘못 버린 노래는 **찾는 사람에게 없는 곡이 된다** — 검색이
 * 고장 난 것과 구별이 안 된다. 그래서 구절이 분명한 것만 막는다.
 *
 * 단어 하나로 안 막는 이유가 여기 있다: `cover` 는 `discover` 안에 있고,
 * `dance` 는 `Dance The Night` 같은 곡 제목이다. `cover by` · `dance practice`
 * 처럼 붙어 있을 때만 뜻이 정해진다.
 */
export function looksLikeSong(title: string, channelTitle: string): boolean {
  const haystack = `${title} ${channelTitle}`.toLowerCase();
  return !NOT_SONG.some((phrase) => haystack.includes(phrase));
}

/**
 * 노래만 남기고 **음원이 먼저 오게** 세운다.
 *
 * **다 걸러졌으면 거른 것을 되돌린다.** 검색 결과가 통째로 안무 영상인 경우가
 * 있는데(그 곡의 음원이 YouTube 에 없을 때), 그때 빈 목록을 주면 화면이
 * "찾는 곡이 없습니다" 라고 말한다 — 있는데 없다고 하는 셈이다.
 * 100 units 을 쓰고 빈 화면을 보여 줄 이유도 없다.
 */
export function songsFirst<T extends { title: string; channel: string; duration?: number }>(
  items: readonly T[],
): T[] {
  const songs = items.filter(
    (item) => looksLikeSong(item.title, item.channel) && isSongLength(item.duration),
  );
  const kept = songs.length > 0 ? songs : [...items];

  // 동점은 받아 온 순서 그대로다 — 그게 YouTube 가 매긴 관련도다.
  // `sort` 가 안정 정렬이라 손댈 것이 없다
  return kept.sort((a, b) => channelRank(a.channel) - channelRank(b.channel));
}
