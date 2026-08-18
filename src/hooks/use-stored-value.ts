"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/**
 * Local Storage 값을 읽는다. 없으면 `null`.
 *
 * `useEffect` 안에서 읽어 `setState` 하면 React Compiler 의 set-state-in-effect
 * 규칙에 걸리고, 서버가 그린 마크업과도 어긋난다. `useSyncExternalStore` 는
 * 서버 스냅샷을 따로 받으므로 두 문제를 같이 푼다 — 서버는 항상 `null` 로 그리고
 * 하이드레이션 직후 실제 값으로 넘어간다.
 */
export function useStoredValue(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key),
    () => null,
  );
}
