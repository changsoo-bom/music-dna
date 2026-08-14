---
globs:
  - "src/app/**"
  - "src/lib/**"
  - "src/types/**"
---
### 읽기는 서버 컴포넌트, 쓰기는 Server Action

이 두 문장이 전부다.

#### 새 기능 추가 순서 (아래에서 위로)

```
1. src/types/{domain}.ts          — 타입 정의
2. src/lib/schemas/{domain}.ts    — Zod 스키마 (safeParse / z.infer)
3. src/lib/spotify | lib/report   — 데이터 소스 접근·계산
4. src/app/.../actions.ts         — Server Action (쓰기)
5. src/components/{domain}/...    — 컴포넌트
6. src/app/.../page.tsx           — 라우트 조립
```

컴포넌트부터 만들면 타입이 나중에 따라오면서 `any`가 스며든다.

#### 읽기

- 리포트 조회는 **서버 컴포넌트에서 직접** 가져온다
- 필터·기간·정렬은 **`searchParams`**로 받는다. 클라이언트 state로 들고 있지 않는다
  → 뒤로가기·공유·SEO가 공짜로 따라온다
- 외부 API 호출은 반드시 `lib/spotify/` 경유

#### 쓰기 — Server Action

**Route Handler를 새로 만들지 않는다.** OAuth 콜백처럼 라이브러리가 요구하는 경우만 예외.

**인증 → 검증 → 실행 → revalidate.** 순서를 지킨다. 세션 확인이 첫 줄이다.

#### 인증은 서버에서 확인한다

클라이언트에서 버튼을 숨긴 것은 인증이 아니다. Server Action은 URL만 알면 직접 호출된다.
권한 판별 시 null·예외값은 **더 낮은 권한으로 폴백**한다(fail-closed).

#### 소유권 검증

리포트는 개인 청취 기록이다. 조회·삭제 쿼리의 조건에 **반드시 사용자 조건을 포함**한다.
누락돼도 화면상 티가 안 나고 에러도 안 난다.

#### 토큰은 서버에만

Spotify access/refresh 토큰을 **클라이언트로 내려보내지 않는다.** 클라이언트 컴포넌트의
props 로 넘기는 것도 직렬화되어 HTML 에 실린다. 토큰이 필요한 호출은 전부 서버에서 끝낸다.

#### 외부 API 실패는 국소화한다

Spotify가 죽어도 사이트 전체가 죽으면 안 된다. 해당 섹션만 접히게 만든다.

- 외부 데이터를 읽는 서브트리에 자체 `error.tsx` 경계를 둔다
- `lib/spotify/`가 파싱·검증·캐싱을 전담한다 → **바깥은 검증된 타입만 본다**

#### 캐싱

- 외부 API 응답은 ISR로 캐싱한다(`revalidate`)
- **캐시 키에 필터 파라미터를 빠짐없이 반영** — 누락 시 캐시 오염
- 청취 기록은 자주 안 바뀐다. 리포트 재계산 주기를 짧게 잡을 이유가 없다
