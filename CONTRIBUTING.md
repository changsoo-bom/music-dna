# 기여하기

고쳐 주셔서 감사합니다. 이 문서는 **이 저장소에만 있는 규칙**을 적습니다.
일반적인 Git·GitHub 사용법은 적지 않습니다.

이 저장소는 개인 프로젝트입니다. 소스를 보고 고쳐 주는 것은 환영하지만,
**라이선스를 붙이지 않았으므로 가져다 쓰는 용도는 아닙니다.**

---

## 시작하기

Node 22 · pnpm 10 이 필요합니다. 버전은 `package.json` 의 `packageManager` 가 정합니다.

```bash
pnpm install
pnpm dev
```

**환경변수는 없어도 됩니다.** `YOUTUBE_API_KEY` 는 카탈로그 밖을 검색할 때만 쓰고,
없으면 그 기능만 꺼진 채로 앱이 정상으로 뜹니다. 필요하면 `.env.example` 을
`.env.local` 로 복사하세요. **`NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다** —
붙이는 순간 키가 클라이언트 번들에 실립니다.

## 올리기 전에

CI 가 도는 것과 같습니다. 하나라도 빨가면 PR 이 안 넘어갑니다.

```bash
pnpm typecheck && pnpm lint && pnpm check && pnpm build
```

`pnpm check` 는 검사 배점·카탈로그·재생 큐·보관함의 자체 점검입니다.
**이 저장소에서 가장 잘 깨지는 곳이라 `build` 보다 먼저 돌립니다.**

## 브랜치와 PR

`development` 에서 갈라서 `development` 로 보냅니다. `main` 은 릴리스만 받습니다.

```bash
git switch development && git pull
git switch -c feat/무엇을-하는지
```

커밋 메시지는 한국어로 `type(scope): 무엇을 하는지` 입니다 —
`feat` · `fix` · `refactor` · `docs` · `chore`. 본문에는 **왜 그렇게 했는지**를 적습니다.
무엇을 바꿨는지는 diff 가 이미 말합니다.

작게 보내 주세요. 관련 없는 정리가 섞이면 어디를 봐야 하는지가 흐려집니다.

---

## 이 저장소의 규칙

`.claude/rules/` 의 6개 문서가 실제 규칙입니다. **읽고 시작하는 편이 빠릅니다.**
아래는 특히 자주 걸리는 것만 추린 것입니다.

### 코드

- TypeScript strict. **`any` 금지** — 불가피하면 `unknown` + 타입 가드
- 타입은 `import type` 으로 가져옵니다
- **경로는 `@/` 별칭만. 상대 경로 `../` 금지**
- 컴포넌트만 PascalCase, 나머지 파일·폴더는 전부 kebab-case
- 레이어는 한 방향입니다: `types → schemas → lib → components → app`

### React

React Compiler 가 켜져 있습니다. 규칙을 어긴 채 `eslint-disable` 로 덮으면
**엉뚱한 곳에서 증상이 납니다.** 린트 에러가 나는 지점이 고칠 지점입니다.

- `useEffect` 안에서 `setState` 하지 않습니다
- `forwardRef` 를 쓰지 않습니다 — React 19 부터 `ref` 는 일반 prop 입니다
- `window.addEventListener("scroll")` 금지. `IntersectionObserver` 를 씁니다
- 애니메이션은 `transform` 과 `opacity` 만. `top`/`left`/`width`/`height` 는 안 됩니다
- **`"use client"` 는 실제로 상호작용하는 말단에만** 붙입니다

### 데이터

- 읽기는 서버 컴포넌트, 쓰기는 Server Action. Route Handler 를 새로 만들지 않습니다
- 필터·기간·정렬은 **`searchParams`** 로 받습니다. 클라이언트 state 로 들고 있지 않습니다
- 외부 API 호출은 `lib/` 를 거칩니다. 컴포넌트에서 직접 `fetch` 하지 않습니다
- **API 키는 서버 밖으로 나가지 않습니다.** 클라이언트 컴포넌트 props 로 넘기는 것도
  직렬화되어 HTML 에 실립니다

### 디자인

**`docs/design-reference.md` 를 먼저 읽어 주세요.** 토큰 값과 그 값인 이유가 거기 있습니다.
화면 원본은 `design/prototype.html` 입니다. 아래는 취향이 아니라 규칙입니다.

- **반경은 셋뿐입니다**: `rounded-btn`(20px) · `rounded-stadium`(40px) · `rounded-pill`(999px).
  **8~16px 중간값을 만들지 않습니다** — 중간 반경이 생기는 순간 시스템이 평범해집니다
- **그림자는 둘뿐입니다**: `shadow-lift` · `shadow-float`. 하드 드롭섀도우 금지
- `bg-white` 는 떠 있는 요소에만 씁니다. 페이지 캔버스는 `bg-canvas`
- **`--signal` / `--signal-lt` 는 예약색입니다.** 아이브로우 점·궤도 호·값을 그리는 자리 전용.
  마케팅 CTA 는 예외 없이 `bg-ink` 입니다
- **`--chart-1..5` 는 색각 이상 대비 검증을 통과한 조합이고 배열 순서까지가 검증 단위입니다.**
  색을 바꾸거나 6번째를 더하려면 검증을 다시 돌려야 합니다
- 단일 테마입니다. **`dark:` 접두사를 쓰지 않습니다**
- `tailwind.config.js` 를 만들지 않습니다. 토큰은 `globals.css` 의 `@theme inline` 에 있습니다

### 카탈로그에 곡을 더할 때

`src/data/catalog.ts` 입니다. 파일 맨 위 주석에 전체 규칙이 있습니다.

- **`youtubeId` 를 손으로 적지 않습니다.** 지어낸 id 는 재생도 썸네일도 안 되는 곡을
  조용히 섞어 넣습니다. `pnpm enrich` 가 채웁니다
- **검색 결과를 눈으로 확인하고 넣습니다.** 검색이 동명이곡이나 다른 아티스트의
  피처링곡을 집는 일이 실제로 자주 있습니다
- 레이블 채널(HYBE LABELS · 1theK · Atlantic 같은)은 넣지 않습니다. 아티스트 채널을 씁니다
- 하위 장르는 20종 중 하나를 **사람이 직접 고릅니다.** YouTube 는 장르를 주지 않습니다
- `pnpm check:catalog` 가 id·제목·`youtubeId` 중복과 장르 채움을 봅니다

---

## 손대지 않아도 되는 것

- `AGENTS.md` 의 상단 블록은 `next dev` 가 다시 씁니다. diff 에서 지워도 되살아납니다
- `.claude/` 와 `.bkit/` 은 작업 도구 설정입니다

## 새 의존성

**되도록 더하지 않습니다.** 지금 없는 것은 아직 필요하지 않아서 없습니다
(Zod · Zustand · TanStack Query 는 실제로 쓰는 시점에 들어왔습니다).
꼭 필요하면 PR 본문에 **왜 표준 라이브러리나 이미 있는 것으로 안 되는지**를 적어 주세요.

## 막히면

[이슈](https://github.com/changsoo-bom/music-dna/issues)로 물어봐 주세요.
고치기 전에 물어보는 편이 서로 빠릅니다.
