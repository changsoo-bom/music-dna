---
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---
### 코딩 컨벤션

- TypeScript `strict: true`, **`any` 금지** (불가피하면 `unknown` + 타입 가드)
- 인터페이스에 `I` 접두사 금지 (`AppState`, ~~`IAppState`~~)
- 타입은 `import type`으로 import
- **경로 별칭 `@/` 항상 사용. 상대 경로 `../` 금지** — `../`가 나오는 순간 파일을 옮길 때마다 import가 깨진다
- Import 순서: 외부 라이브러리 → 내부 모듈(`@/*`) → 상대 경로(CSS 등)

#### 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 페이지·레이아웃 | 프레임워크 규칙 | `page.tsx`, `layout.tsx`, `loading.tsx` |
| 컴포넌트 (`components/` 하위) | **PascalCase** | `GenreBand.tsx`, `RecommendRail.tsx` |
| 유틸·라이브러리·프로바이더 | kebab-case | `spotify-client.ts`, `date-utils.ts` |
| Server Action | 라우트 폴더의 `actions.ts` | `app/(auth)/connect/actions.ts` |
| Zustand 스토어 | `use-{domain}-store.ts` | `use-report-store.ts` |
| 타입 정의 | kebab-case | `music.ts` |

**컴포넌트만 PascalCase, 나머지 파일·폴더는 전부 kebab-case.**

#### export

- 페이지·레이아웃: `export default function`
- 재사용 컴포넌트: **named export**
