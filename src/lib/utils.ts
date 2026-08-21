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

/**
 * 화면에 들어오면 한 번 올라온다. `<section ref={revealOnScroll}>` 로 쓴다.
 *
 * **`scroll` 이벤트가 아니라 `IntersectionObserver` 다.** 스크롤 이벤트는 매
 * 프레임 실행되고 배칭이 없다. → `.claude/rules/react.md`
 *
 * CSS 스크롤 주도 애니메이션(`animation-timeline: view()`)도 후보였지만
 * 그건 진행률이 스크롤 위치에 **묶인다** — 올려다보면 되감기고, 내리는
 * 속도에 따라 빨라졌다 느려진다. 여기서 원하는 건 들어온 순간 한 번
 * 재생되고 끝나는 것이라 관찰자가 맞다.
 *
 * state 를 안 쓴다. 관찰자 콜백에서 `setState` 하면 섹션 하나가 보일 때마다
 * 트리가 다시 그려지고, `useEffect` 안의 `setState` 는 React Compiler 규칙과
 * 부딪힌다. 속성만 바꾸고 CSS 가 받는다.
 *
 * 숨기는 것도 여기서 켠다(`data-reveal=""`). CSS 에 `opacity: 0` 을 그냥 두면
 * **JS 가 안 뜨는 순간 페이지가 통째로 빈 화면이 된다.** 이 함수가 돌았다는
 * 것은 하이드레이션이 됐다는 뜻이고, 그때만 숨긴다.
 *
 * 한 번 보이면 관찰을 끊는다. 되감기지 않는다 — 다시 올려다볼 때마다 내용이
 * 사라졌다 나타나면 읽던 자리를 잃는다.
 *
 * 아래쪽 20% 를 잘라 낸다. 화면 맨 아래 한 줄이 걸친 것만으로 시작하면
 * 애니메이션이 시야 밖에서 끝나 버려서 아무것도 못 본다. 더 자르고 싶어도
 * 여기가 한계다 — 잘라 낸 만큼 화면 아래쪽이 죽은 구간이 되고, 페이지
 * 맨 끝 섹션이 그 구간에만 걸리면 영영 안 나타난다.
 */
export function revealOnScroll(el: HTMLElement | null) {
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  el.dataset.reveal = "";

  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      el.dataset.reveal = "in";
      io.disconnect();
    },
    { rootMargin: "0px 0px -20% 0px" },
  );
  io.observe(el);

  return () => io.disconnect();
}

