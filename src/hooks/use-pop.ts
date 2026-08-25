"use client";

import { useCallback, useState } from "react";

/**
 * 창을 여닫는 상태. **여는 신호와 화면에 남아 있는 것을 나눈다.**
 *
 * 하나로 두면 닫는 동안 트리거 버튼이 죽는다. `<dialog>` 의 `close` 이벤트는
 * 나가는 전환이 **시작될 때** 오는데, 그 자리에서 곧바로 언마운트하면 CSS 가
 * 그려 둔 닫히는 모습이 한 프레임도 안 보인다. 그래서 전환이 끝날 때까지
 * 살려 두는데, 그동안 `open` 도 같이 `true` 로 남겨 두면 — 이미 화면에서
 * 사라진 창을 다시 열려고 버튼을 눌러도 state 가 같은 값이라 리렌더가 안
 * 일어나고 `showModal()` 도 안 불린다. **누른 사람에게는 아무 일도 안 난다.**
 *
 * `open` 은 누르는 즉시 꺼지고 `mounted` 만 늦게 꺼진다. 닫히는 중에 다시
 * 열면 `open` 이 `true` 로 돌아가면서 같은 요소가 그대로 다시 열린다 —
 * 애니메이션도 이어서 되감긴다.
 *
 * 콜백은 `useCallback` 으로 고정한다. `<Pop>` 이 이걸 effect 의존성으로
 * 쓰므로, 렌더마다 새 함수가 오면 닫히는 타이머가 매번 처음부터 다시 선다.
 */
export type PopState = {
  /** `<dialog>` 가 열려 있어야 하는가 */
  open: boolean;
  /** 아직 DOM 에 있어야 하는가 (닫히는 전환 중 포함) */
  mounted: boolean;
  show: () => void;
  /** `<dialog>` 의 `close` 에서 부른다 */
  beginClose: () => void;
  /** 닫히는 전환이 끝났을 때 */
  end: () => void;
};

export function usePop(): PopState {
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");

  return {
    open: phase === "open",
    mounted: phase !== "closed",
    show: useCallback(() => setPhase("open"), []),
    beginClose: useCallback(() => setPhase((p) => (p === "open" ? "closing" : p)), []),
    end: useCallback(() => setPhase((p) => (p === "closing" ? "closed" : p)), []),
  };
}
