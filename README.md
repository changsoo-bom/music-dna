# MUSIC DNA

다섯 문항으로 음악 취향을 재고, 그 취향에 맞는 곡을 찾아 사이트 안에서 들려준다.

계정이 없다. 스트리밍 연동도 없다. **다섯 번 고르면 그때부터 쓸 수 있고**, 결과는
브라우저에만 남는다.

```
검사(5문항) → 좌표 4축 → 페르소나 + 추천 5곡 → 듣기 · 담기 · 더 찾기
```

---

## 무엇을 하는가

| 화면 | 주소 | 하는 일 |
|---|---|---|
| 홈 | `/` | 검사 전에는 소개, 검사 후에는 리포트 — 페르소나·지표·추천 5곡 |
| 검사 | `/quiz` | 5문항. 답이 에너지·밝기·몽환·탐험 네 축의 좌표가 된다 |
| 둘러보기 | `/browse` | 카탈로그를 국내/해외 × 장르로 좁혀 본다 |
| 검색 | `/search` | 곡·아티스트를 찾는다. 카탈로그 먼저, 없으면 YouTube |
| 보관함 | `/library` | 담은 곡. 이름 있는 리스트로 나눌 수 있다 |

재생기는 레이아웃에 살아 있어서 **화면을 옮겨도 소리가 안 끊긴다.**

## 이 저장소의 판단 몇 가지

**취향은 서버에 안 보낸다.** 검사 결과·재생 이력·리스트가 전부 Local Storage 다.
계정이 없으니 기기를 바꾸면 사라지는데, 그것이 이 서비스가 아무것도 안 묻고 시작할
수 있는 이유다.

**할당량이 검색 기능의 설계를 정했다.** YouTube `search.list` 는 한 번에 100 units 고
하루 한도가 10,000 이라 **사이트 전체가 하루 100번**이다. 그래서 카탈로그(178곡)에서
먼저 찾고, 세 곡도 못 찾았을 때만 밖에 나간다. 나갈 때도 검색은 한 번뿐이고, 가수인지
곡 제목인지는 **결과가 한 채널로 몰리는지**를 보고 판단한다 — 따로 물으면 한 질의에
200 units 이 든다.

**밖이 죽어도 안이 안 죽는다.** 외부 호출은 예외를 던지지 않고 상태를 돌려주고
(`off` / `quota` / `failed`), 화면이 그 사정을 한 줄로 구별해서 말한다. 다시 눌러
소용 있는 실패와 소용없는 실패가 같은 얼굴이면 안 된다.

**장르는 사람이 적는다.** YouTube 는 장르를 안 주고(`videoCategoryId` 는 Music 하나뿐),
Spotify 태그는 세분화가 심해 어차피 묶는 표가 필요했다. 그래서 카탈로그에 하위 장르
20종 중 하나를 직접 적는다.

**순수 로직에는 검사가 붙는다.** 문항·배점, 카탈로그 무결성과 분포, 검색·가수 판정·
노래 거르기, 재생 큐 전이, 리스트 저장을 `scripts/` 의 단언이 지킨다. 프레임워크 없이
`node:assert` 다.

## 시작하기

```bash
pnpm install
cp .env.example .env.local   # 키 없이도 뜬다
pnpm dev                     # http://localhost:3000
```

`YOUTUBE_API_KEY` 가 없으면 **카탈로그 검색만 되고** 밖에서 찾아오는 것이 꺼진다.
화면이 "YouTube 검색은 아직 켜져 있지 않습니다" 라고 말한다. 나머지는 전부 돈다.

키를 넣을 때 **`NEXT_PUBLIC_` 접두사를 붙이지 않는다.** 붙는 순간 클라이언트 번들에
실려서 누구나 꺼내 쓴다. 자세한 것은 `.env.example` 에 적혀 있다.

## 명령

| 명령 | 하는 일 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint (React Compiler 규칙 포함) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check` | 자체 점검 넷 — 문항 · 카탈로그 · 재생 · 보관함 |
| `pnpm enrich` | 카탈로그의 `youtubeId`·`duration` 을 채운다. 로컬 전용이고 할당량을 쓴다 |

**커밋 전에 `typecheck` · `lint` · `check` · `build` 넷이 초록이어야 한다.** CI 가 같은
것을 돈다.

## 구조

레이어를 세로로 통과한다. **각 단계는 아래 단계만 안다.**

```
types → schemas → lib → components → app(route)
```

```
src/
├── app/          라우팅만 — (site) 껍데기, quiz 는 그 밖
├── components/   ui · common · quiz · report · browse · search · library · player
├── lib/          youtube(외부 API) · quiz(문항·배점) · report(지표) · schemas
├── data/         카탈로그 178곡 — 저장소에 커밋된 데이터
├── types/        도메인 타입
└── constants/    장르 분류 · 페르소나 문구
scripts/          커밋 전 검증 (pnpm check)
```

`app/` 은 조립만 한다. 외부 API 는 `lib/` 을 경유하고, `"use client"` 는 실제로
상호작용하는 말단에만 붙는다.

## 스택

Next.js 16 (App Router · Turbopack · React Compiler) · React 19.2 · TypeScript strict ·
Tailwind CSS v4 · Zod 4 · Zustand 5 · pnpm 10

폰트는 Sofia Sans(라틴) + Pretendard(한글) 둘뿐이다. 대비는 크기·굵기·자간에서 나오지
두 번째 서체에서 나오지 않는다.

## 디자인

크림 캔버스 단일 테마. 필과 원, 잉크 블랙 CTA.

**색·반경·그림자 토큰의 값과 그 값인 이유는 [`docs/design-reference.md`](docs/design-reference.md)
에 있다.** 화면 원본은 `design/prototype.html` — 의존성 없는 단일 HTML 이고 구현의
기준이다.

특히 둘은 취향이 아니라 규칙이다:

- **`--chart-1..5` 는 색각 이상 대비 검증을 통과한 조합이고 배열 순서까지가 검증 단위다.**
  색을 바꾸거나 6번째를 더하려면 검증기를 다시 돌린다
- **`--signal`·`--signal-lt` 는 예약색이다.** 값을 그리는 자리와 상태 표시 전용이고,
  마케팅 CTA 는 예외 없이 `bg-ink`

## 아는 한계

- **기기를 바꾸면 사라진다.** 계정이 없어서 그렇다
- **카탈로그는 178곡이고 목표는 300곡이다.** 하위 장르 20종이 다 차 있고 지역 × 장르
  10칸이 각각 4곡 이상이다(`check-catalog` 가 단언한다)
- **공개 배포는 하루 100번의 검색을 아무나 쓴다.** 같은 검색어는 하루 캐시로 한 번만
  나가지만, 서로 다른 검색어 100개면 그날치가 끝난다. 마르면 카탈로그 결과는 그대로
  뜨고 화면이 사정을 말한다
- **YouTube 업로드는 언젠가 사라진다.** 공식 채널이 아닌 업로드가 일부 섞여 있고
  (`src/data/catalog.ts` 머리말에 id 가 적혀 있다), 재생 실패는 그 곡을 건너뛰는 것으로
  국소화된다

## 배포

Vercel. Production Branch 는 `main` 이고 흐름은 `feat/*` → `development` → `main` 이다.

배포 전에 **Environment Variables 에 `YOUTUBE_API_KEY`** 를 넣는다(Production · Preview).
DB 도 인증도 없고 카탈로그는 저장소에 커밋돼 있어서 그 밖에 필요한 설정이 없다.
