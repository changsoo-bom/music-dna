/**
 * 마운트될 때 한 번 포커스를 준다. `<h1 ref={focusOnMount} tabIndex={-1}>` 로 쓴다.
 *
 * **모듈 스코프에 두는 게 핵심이다.** 인라인 화살표(`ref={(el) => el?.focus()}`)로
 * 쓰면 렌더마다 새 함수가 되어 React 가 ref 를 detach/attach 하고, 그때마다
 * 포커스가 제목으로 회수된다 — 선택지를 누를 때마다 포커스가 튀고,
 * 라디오 화살표 키 이동이 한 칸마다 끊긴다.
 *
 * React Compiler 가 클로저 없는 화살표를 모듈 스코프로 끌어올려 주긴 한다.
 * 다만 그건 **컴파일러가 이 컴포넌트에서 bail out 하지 않는다는 전제**다.
 * 전제가 깨지면 증상이 엉뚱한 곳(키보드 조작)에서 나온다. 여기서 못 박는다.
 */
export function focusOnMount(el: HTMLElement | null) {
  el?.focus();
}
