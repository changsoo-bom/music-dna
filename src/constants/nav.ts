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
 * 검사하러 가는 길과 검사를 마치고 결과로 오는 길은 둘 다 진행이라
 * `NAV_FORWARD` 다. 결과를 안 받고 검사에서 빠져나오는 것만 되돌아가는 길이다.
 */
export const NAV_FORWARD = ["nav-forward"];

/** 검사를 중간에 그만두고 홈으로. 이 사이트에서 뒤로 가는 유일한 길이다 */
export const NAV_BACK = ["nav-back"];
