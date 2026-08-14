@AGENTS.md

# Music DNA

스트리밍 재생 기록을 장르·템포·분위기·시간대로 분해해 한 장의 리포트로 보여주는 서비스.
결과는 "새벽형 감성 탐험가" 같은 페르소나 문장과 차트로 제시된다.

## 스택

Next.js 16 (App Router · Turbopack · React Compiler) · React 19.2 · TypeScript strict ·
Tailwind CSS v4 · pnpm

Zod · Zustand · TanStack Query · Prisma 는 **아직 설치하지 않았다.**
실제로 쓰는 시점에 추가한다 — 규칙 문서는 이미 그 스택을 전제로 쓰여 있다.

## 규칙

`.claude/rules/` 의 6개 문서가 glob 매칭으로 자동 첨부된다.
원본은 vault(`개발-공통규칙`)에 있고, 이 프로젝트에 맞게 조정한 사본이다.
**공통 규칙이 바뀌면 vault를 먼저 고치고 여기로 내린다.**

| 파일 | 내용 |
|---|---|
| `coding-conventions.md` | strict, `any` 금지, `import type`, 네이밍, import 순서, `@/` 별칭 |
| `structure.md` | `src/` 레이어링, 도메인→기능 2단계, 컴포넌트 접미사, `"use client"` 경계 |
| `data.md` | 읽기=서버 컴포넌트 / 쓰기=Server Action, 토큰 서버 격리, 외부 API 실패 국소화 |
| `state.md` | 서버 데이터 vs `searchParams` vs Zustand vs TanStack Query |
| `react.md` | React 19 패턴, Compiler 린트, 스크롤 이벤트 금지, 애니메이션 제약 |
| `styling.md` | Tailwind v4 `@theme inline`, 반경·그림자·예약색 제약 |

## 디자인

**`docs/design-reference.md` 를 먼저 읽는다.** 토큰 값과 그 값인 이유가 거기 있다.
화면 원본은 `design/prototype.html` — 의존성 없는 단일 HTML 이고, 실제 구현의 기준이다.

특히 주의할 두 가지:

1. **`--chart-1..5` 는 색각 이상 대비 검증을 통과한 조합이고 배열 순서까지가 검증 단위다.**
   색을 바꾸거나 6번째를 추가하려면 `dataviz` 스킬의 `validate_palette.js` 를 다시 돌려야 한다
2. **`--signal` / `--signal-lt` 는 예약색이다.** 아이브로우 점과 궤도 호 전용.
   마케팅 CTA 는 예외 없이 `bg-ink`

## 외부 API 경계

Spotify Web API. **아직 연동 전이고 화면은 목업 데이터로 돈다.**

연동할 때 정해야 할 것:

- OAuth 는 Authorization Code + PKCE. 콜백만 Route Handler 로 두고(`app/api/auth/`),
  나머지 쓰기는 Server Action
- **access/refresh 토큰은 서버 밖으로 나가지 않는다.** 클라이언트 컴포넌트 props 로 넘기는 것도
  직렬화되어 HTML 에 실린다
- 앨범 아트 호스트 `i.scdn.co` 를 `next.config.ts` 의 `images.remotePatterns` 에 추가
- 응답은 `lib/spotify/` 에서 Zod 로 검증한다. `as` 단언 금지
- Spotify 가 죽어도 페이지 전체가 죽지 않게, 외부 데이터 서브트리에 `error.tsx` 를 둔다

환경변수는 `.env.example` 참고.

## 명령

```bash
pnpm dev        # 개발 서버
pnpm build      # 프로덕션 빌드
pnpm lint       # ESLint (React Compiler 규칙 포함)
pnpm typecheck  # tsc --noEmit
```

## 스킬

`.claude/skills/` 에 프로젝트 스킬 4개(`next-best-practices`,
`vercel-react-best-practices`, `web-design-guidelines`, `agent-browser`)가 들어 있다.
`design-taste-frontend` · `frontend-design` · `dataviz` 는 사용자·플러그인 전역이라
여기에 복사하지 않는다.
