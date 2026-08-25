/**
 * Local Storage 키. 스키마를 바꾸면 버전을 올린다 —
 * 옛 값이 남아 있는 브라우저에서 화면이 깨진다.
 */
const NAMESPACE = "musicdna";
const VERSION = "v1";

export const STORAGE_KEYS = {
  /** 성향 검사 결과 */
  preference: `${NAMESPACE}:musicPreference:${VERSION}`,
  /** 보관함 — 사람이 직접 담은 곡 */
  library: `${NAMESPACE}:libraryTracks:${VERSION}`,
  /** 내 플레이리스트 */
  playlist: `${NAMESPACE}:playlistTracks:${VERSION}`,
  /** 사람이 만든 리스트 — 이름 있는 목록들 */
  playlists: `${NAMESPACE}:playlists:${VERSION}`,
} as const;
