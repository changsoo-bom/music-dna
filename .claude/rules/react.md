---
globs:
  - "src/**/*.tsx"
---
### React 19 · React Compiler

`next.config.ts`에 `reactCompiler: true`가 켜져 있다.

#### set-state-in-effect 금지

`useEffect` 안에서 `setState` 하지 않는다. Compiler의 자동 메모이제이션과 충돌한다.

| 상황 | 대안 |
|------|------|
| 읽기 전용 데이터 | state 대신 **파생 값으로 직접 계산** |
| 로컬 편집 state 필요 | 부모에서 **`key` prop으로 리마운트 제어** |

**`eslint-disable`로 덮지 않는다.** Compiler는 "이 컴포넌트는 규칙을 지킨다"를 전제로
최적화를 넣는다. 규칙을 어긴 채 disable하면 잘못된 전제로 최적화하고, 증상은 엉뚱한 곳에서 나온다.
**린트 에러가 나는 지점이 고칠 지점이다.**

#### forwardRef 사용하지 않는다

React 19부터 ref는 일반 prop이다.

```tsx
function InputBox({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <input ref={ref} {...props} />;
}
```

#### ref cleanup

ref 콜백에서 cleanup을 반환하면 언마운트 시 자동 정리된다.
차트 진입 애니메이션의 `IntersectionObserver`는 이 방식으로 붙인다.

```tsx
<div ref={(el) => {
  const io = new IntersectionObserver(onEnter);
  if (el) io.observe(el);
  return () => io.disconnect();
}} />
```

#### use() + Suspense

Server → Client 로 Promise를 넘겨 스트리밍할 때 쓴다. 초기 렌더 데이터는 서버에서 직접 await.

#### 스크롤 이벤트

**`window.addEventListener("scroll")` 금지.** 매 프레임 실행되고 배칭이 없다.
`IntersectionObserver`, CSS scroll-driven animation(`animation-timeline`) 중에서 고른다.

#### 애니메이션

- `transform` 과 `opacity` 만 애니메이션한다. `top`/`left`/`width`/`height` 는 금지
- `prefers-reduced-motion` 은 `globals.css` 에서 전역 차단된다. 개별 컴포넌트에서
  JS로 모션을 만들 때는 `matchMedia("(prefers-reduced-motion: reduce)")` 를 직접 확인한다

#### 이미지

`next/image`로 감싼다. 외부 호스트는 `next.config.ts`의 `images.remotePatterns`에 등록돼 있어야 한다.
