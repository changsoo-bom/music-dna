/**
 * 궤도 호의 둘레. `globals.css` 의 `.orbit` 과 같은 r=76 에서 나온다.
 *
 * 2·pi·76 = 477.5. `stroke-dasharray` 와 `stroke-dashoffset` 이 둘 다 이 값을
 * 기준으로 계산되므로 **호를 그리는 자리가 전부 같은 수를 봐야 한다** —
 * 바와 전체 화면이 각자 적으면 반지름을 바꾸는 날 한쪽만 고쳐진다.
 *
 * 크기와는 무관하다. SVG 가 `viewBox` 로 그려져서 화면에서 52px 이든
 * 320px 이든 내부 좌표는 그대로다.
 */
export const ORBIT_CIRCUMFERENCE = 477.5;
