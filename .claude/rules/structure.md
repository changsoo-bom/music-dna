---
globs:
  - "src/**"
---
### 폴더 구조

레이어를 세로로 통과한다. **각 단계는 아래 단계만 알고, 위 단계는 모른다.**
이 방향이 뒤집히면 순환 의존이 생긴다.

```
types → schemas → lib/{spotify,report} → components → app(route)
```

```
src/
├── app/                      # 라우팅 전용 (얇게 유지)
│   ├── (public)/             #   공개 영역 — 랜딩, 샘플 리포트
│   ├── (auth)/               #   계정 연결 이후 영역
│   │   └── report/
│   │       ├── page.tsx
│   │       └── actions.ts    #   Server Action
│   ├── _components/          #   라우트 전용 프로바이더/셸
│   └── api/                  #   Route Handler — 라이브러리가 요구할 때만 (OAuth 콜백)
│
├── components/
│   ├── ui/                   # 전역 프리미티브 (Button, Chip, SatelliteButton…)
│   ├── common/               # 공통 조합 컴포넌트 (index.ts 배럴)
│   └── report/{feature}/     # 도메인 컴포넌트 — genre, clock, mood, drift, artist, recommend
│
├── hooks/                    # use-*.ts
├── lib/
│   ├── spotify/              # 외부 API 클라이언트 — 파싱 + 검증 + 캐싱
│   ├── report/               # 재생 기록 → 지표 계산
│   ├── schemas/{domain}.ts   # Zod 스키마 (+ index.ts 배럴)
│   └── utils.ts
├── types/                    # 도메인별 타입 (`music.ts` …)
└── constants/
```

#### 원칙

1. **`app/`은 라우팅만.** 로직은 컴포넌트·액션·lib에 있다
2. **외부 API는 `lib/` 경유.** 컴포넌트에서 직접 fetch 하지 않는다
3. 파일이 많아져도 **도메인 → 기능 2단계**로 접힌다

#### 컴포넌트 접미사

한 화면을 통짜로 만들지 않고 일관된 접미사로 쪼갠다.
`List` 목록 · `Filter` 필터 · `Card` 항목 하나 · `Detail` 상세 · `Form` 입력 · `Pop` 모달

**파일 하나 = 역할 하나.** `page.tsx`는 도메인 컴포넌트를 조립만 한다.

#### `"use client"` 는 leaf 에만

실제로 상호작용하는 말단에만 붙인다. 페이지·레이아웃·차트 컨테이너는 서버 컴포넌트로 유지한다.
**차트 SVG 자체는 서버에서 렌더할 수 있다** — 툴팁·호버가 붙는 껍데기만 클라이언트로 내린다.

도메인 전용 컴포넌트를 `ui/`에 두지 않는다. 경계가 무너지면 `ui/`가 잡동사니 서랍이 된다.
