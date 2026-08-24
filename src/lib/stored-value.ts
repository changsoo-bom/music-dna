/**
 * Local Storage 읽기·쓰기와 그 사이의 신호.
 *
 * **`lib/` 에 있다.** `hooks/` 는 프레젠테이션 쪽이고 레이어는
 * `types → schemas → lib → components → app` 한 방향이다. 여기 있던 함수를
 * `lib/library.ts` 나 `lib/played-tracks.ts` 가 부르면 방향이 뒤집힌다
 * → `.claude/rules/structure.md`
 *
 * 실질적인 대가도 있었다. `hooks/use-stored-value.ts` 는 `"use client"` 파일이라,
 * 거기서 읽기 함수를 가져오는 lib 모듈은 **서버에서 영영 못 쓴다.**
 * 여기는 지시문이 없으므로 양쪽 다 된다.
 *
 * 구독(`useStoredValue`)은 React 훅이라 그대로 `hooks/` 에 남는다.
 * 신호 이름이 읽기·쓰기·구독 셋의 계약인데, 그 이름을 여기서 내보내
 * 훅이 가져다 쓴다 — 한쪽만 고쳐서 화면이 조용히 안 갱신되는 일은 그대로 막힌다.
 */

/**
 * 같은 탭에서 쓴 값을 알리는 신호.
 *
 * **`storage` 이벤트는 쓴 탭에는 안 온다.** 다른 탭에 알리라고 있는 것이라
 * 이걸로만 구독하면 방금 내가 저장한 값이 화면에 안 나타난다.
 * 쓰기를 `writeStoredValue` 하나로 모으고 여기서 직접 알린다.
 */
export const SAME_TAB = "musicdna:stored-value";

/**
 * Local Storage 에 쓰고 같은 탭에 알린다.
 *
 * 사생활 보호 모드나 사이트 데이터 차단에서 `setItem` 은 던진다.
 * **저장이 안 되는 것은 이 앱에서 치명적이지 않으므로 삼킨다** — 이번 세션에
 * 안 남을 뿐이고, 이걸로 재생을 막을 이유는 없다.
 */
export function writeStoredValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(SAME_TAB));
}

/**
 * Local Storage 를 읽는다. **접근 자체가 막혀 있으면 `null`.**
 *
 * 사이트 데이터를 차단한 브라우저나 `allow-same-origin` 없는 iframe 에서는
 * `localStorage` 에 손대는 것만으로 SecurityError 가 난다. 이 함수는
 * `getSnapshot` 안에서 도므로 **렌더 도중에** 던지고, 그러면 화면이 통째로
 * 죽는다 — 검사 결과가 없는 것과 똑같이 다루면 되는 상황인데.
 *
 * 던지지 않고 `null` 을 돌려준다. 호출부는 "저장된 게 없다" 로 읽는다.
 */
export function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
