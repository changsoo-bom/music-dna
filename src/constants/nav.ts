/**
 * 페이지 전환 타입.
 *
 * `<Link transitionTypes>` / `router.push(..., { transitionTypes })` 로 실어
 * 보내면 `page.tsx` 의 `<ViewTransition>` 이 받아서 `.nav-forward` 클래스를
 * 붙이고, 애니메이션은 `globals.css` 의 `::view-transition-*` 규칙이 그린다.
 *
 * **문자열을 세 곳에 손으로 적지 않으려고 상수로 둔다.** 오타가 나면 에러가
 * 나는 게 아니라 애니메이션이 조용히 안 돌고, 그건 아무 데서도 안 잡힌다.
 *
 * 앞으로 가는 방향 하나뿐이다 — 검사하러 가는 길과 검사를 마치고 결과로
 * 오는 길, 둘 다 진행이다. 뒤로 미는 자리가 생기면 그때 추가한다.
 */
export const NAV_FORWARD = ["nav-forward"];
