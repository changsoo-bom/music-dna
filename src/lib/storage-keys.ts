/**
 * Local Storage 키. 스키마를 바꾸면 버전을 올린다 —
 * 옛 값이 남아 있는 브라우저에서 화면이 깨진다.
 */
const NAMESPACE = "musicdna";
const VERSION = "v1";

export const STORAGE_KEYS = {
  /** 성향 검사 결과 */
  preference: `${NAMESPACE}:musicPreference:${VERSION}`,
  /** 사용자가 고른 음악 */
  selected: `${NAMESPACE}:selectedTracks:${VERSION}`,
  /** 내 플레이리스트 */
  playlist: `${NAMESPACE}:playlistTracks:${VERSION}`,
} as const;
