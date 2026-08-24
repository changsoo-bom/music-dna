"use client";

import { useSyncExternalStore } from "react";

import { SAME_TAB, readStoredValue } from "@/lib/stored-value";

/**
 * 읽기·쓰기 함수는 `@/lib/stored-value` 로 내려갔다. 훅만 여기 남는다 —
 * `lib/` 이 `hooks/` 를 가져오면 레이어 방향이 뒤집히고, `"use client"` 가
 * 붙은 이 파일에 매달린 lib 모듈은 서버에서 못 쓰게 된다.
 */

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SAME_TAB, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SAME_TAB, onChange);
  };
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
