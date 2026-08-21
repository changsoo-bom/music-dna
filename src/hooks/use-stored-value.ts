"use client";

import { useSyncExternalStore } from "react";

/**
 * 같은 탭에서 쓴 값을 알리는 신호.
 *
 * **`storage` 이벤트는 쓴 탭에는 안 온다.** 다른 탭에 알리라고 있는 것이라
 * 이걸로만 구독하면 방금 내가 저장한 값이 화면에 안 나타난다.
 * 쓰기를 `writeStoredValue` 하나로 모으고 여기서 직접 알린다.
 */
const SAME_TAB = "musicdna:stored-value";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SAME_TAB, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SAME_TAB, onChange);
  };
}

/**
 * Local Storage 에 쓰고 같은 탭에 알린다.
 *
 * 읽기와 한 파일에 둔다 — 신호 이름이 둘 사이의 계약이고, 떨어져 있으면
 * 한쪽만 고쳐서 화면이 조용히 안 갱신되는 일이 생긴다.
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
 * Local Storage 값을 읽는다. 없으면 `null`.
 *
 * `useEffect` 안에서 읽어 `setState` 하면 React Compiler 의 set-state-in-effect
 * 규칙에 걸리고, 서버가 그린 마크업과도 어긋난다. `useSyncExternalStore` 는
 * 서버 스냅샷을 따로 받으므로 두 문제를 같이 푼다.
 *
 * `serverValue` 는 **서버가 이미 알고 있던 같은 값**이다(쿠키에서 온다).
 * 세 번째 인자는 서버 렌더와 **하이드레이션 렌더 양쪽**에서 쓰이므로 두 번 다
 * 같은 값이어야 한다 — 그래서 여기서 읽지 않고 밖에서 받는다.
 * 안 넘기면 예전처럼 `null` 로 그리고 하이드레이션 직후 값이 나타난다.
 * → `src/lib/preference-cookie.ts`
 */
export function useStoredValue(key: string, serverValue: string | null = null): string | null {
  return useSyncExternalStore(subscribe, () => readStoredValue(key), () => serverValue);
}

/**
 * Local Storage 를 읽는다. **접근 자체가 막혀 있으면 `null`.**
 *
 * `setItem` 은 이미 감싸 뒀는데(`QuizFlow`) 읽기는 안 감싸고 있었다.
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
