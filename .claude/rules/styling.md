---
globs:
  - "src/**/*.css"
  - "src/**/*.tsx"
---
### Tailwind CSS v4

**색상·반경·그림자 토큰의 실제 값과 그 근거는 `docs/design-reference.md`에 있다.**
여기는 작성 규칙만 다룬다.

- **`tailwind.config.js`를 쓰지 않는다.** 전역 토큰은 `src/app/globals.css`의 `@theme inline`에 정의
- 커스텀 색상은 CSS 변수로 정의하고 `@theme inline`으로 등록
- Sass 미사용. `.scss` 파일이나 `styles/` 디렉터리를 두지 않는다
- 폰트는 `next/font`로만 로드한다. 별도 `@font-face` 금지

#### 클래스 작성 순서

**레이아웃 → 크기 → 간격 → 타이포그래피 → 색상 → 기타**

```tsx
className="flex items-center w-full h-12 px-5 text-base font-medium text-canvas bg-ink rounded-btn transition-colors"
```

#### 이 프로젝트의 디자인 시스템 제약

Mastercard 계열 디자인 언어를 따른다. 아래는 취향이 아니라 규칙이다.

- **배경에 순백(`bg-white`)을 페이지 캔버스로 쓰지 않는다.** 캔버스는 `bg-canvas`,
  종이 위의 종이는 `bg-lifted`. `bg-white`는 네비 필·칩·위성 버튼처럼 떠 있는 요소에만
- **반경은 셋뿐이다**: `rounded-btn`(20px) · `rounded-stadium`(40px) · `rounded-pill`(999px) · `rounded-full`(원)
  **8~16px 중간값을 만들지 않는다.** 중간 반경이 생기는 순간 시스템이 일반적으로 보인다
- **그림자는 둘뿐이다**: `shadow-lift`(떠 있는 네비·칩) · `shadow-float`(스타디움 프레임·카드)
  하드 드롭섀도우 금지
- **`--signal`·`--signal-lt`는 예약색이다.** 아이브로우 점, 궤도 호,
  그리고 **값을 그리는 자리**(지표 막대·오각형 차트)에 쓴다.
  **마케팅 CTA에는 쓰지 않는다** — 쓰면 동의·법적 액션 색과 구별이 사라진다.
  주 CTA는 항상 `bg-ink`. 금지의 핵심은 "버튼에 쓰지 마라" 지 "데이터에 쓰지 마라" 가 아니다
- **`--chart-*`는 차트 전용.** UI 강조색으로 끌어다 쓰지 않는다
- 본문 weight 는 **450**. 400으로 낮추면 시스템의 톤이 무너진다
- 헤드라인은 `letter-spacing: -0.02em`. `globals.css` 에서 h1~h3 에 이미 걸려 있다
- 대문자 변환은 **14px 아이브로우 라벨에만**. 그보다 큰 텍스트에 `uppercase` 금지

#### 단일 테마

이 페이지는 크림 캔버스 단일 테마다. 섹션이 중간에 반전되지 않는다.
푸터의 잉크 블랙 배경은 시스템이 규정한 세 번째 표면이지 테마 전환이 아니다.
**`dark:` 접두사를 쓰지 않는다.**
