"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { usePathname, useRouter } from "next/navigation";

import { NAV_FORWARD } from "@/constants/nav";

/**
 * 곡·아티스트를 찾는 입력 필드. **헤더와 검색 결과 화면이 같은 것을 쓴다** —
 * 결과를 보다 검색어를 고치는 자리가 따로 필요한데, 거기에 다른 모양의 필드를
 * 놓으면 한 화면에 같은 일을 하는 조작이 둘이 된다.
 *
 * **전체 새로고침이 아니라 클라이언트 내비게이션이다.** `<form method="get">`
 * 이면 JS 없이도 도는 대신 문서가 통째로 다시 로드되는데, 이 사이트는 재생
 * 바가 레이아웃에 살아 있는 전역 iframe 이라 **듣던 음악이 끊긴다.**
 * 검색하려고 눌렀을 뿐인데 소리가 멎는 것은 고장으로 읽힌다.
 *
 * 그래서 `onSubmit` 을 가로채고 `router.push` 로 넘긴다 — `<form>` 자체는
 * 그대로 둔다. Enter 로 제출되고, 낭독기가 `role="search"` 로 이 자리를
 * 부르고, 값이 `name` 으로 나가는 것이 전부 폼의 기본 동작이다.
 *
 * `type="search"` 다. 브라우저가 지우기 버튼을 그려 준다 — 우리가 만들 이유가
 * 없고, 만들면 그 버튼만 우리 것이라 눌렀을 때 다르게 움직인다.
 */
export function SearchField({
  query = "",
  className = "",
  hideOnResults = false,
}: {
  /** 결과 화면에서 지금 찾고 있는 말. 필드가 그것을 물고 시작한다 */
  query?: string;
  className?: string;
  /**
   * 결과 화면에서는 이 필드를 안 그린다. **헤더가 켠다.**
   *
   * 헤더는 레이아웃에 살아서 `?q=` 를 모른다 — `searchParams` 는 페이지가
   * 받고, 레이아웃까지 올라오지 않는다. 그래서 결과를 보는 동안 헤더 칸은
   * 늘 비어 있고, `아이유` 로 찾은 것을 `아이유 밤편지` 로 좁히려면 처음부터
   * 다시 쳐야 한다.
   *
   * **한 화면에 칸은 하나다.** 결과 화면에서만 그 하나를 페이지가 갖는다 —
   * 거기서는 지금 찾고 있는 말을 물고 있을 수 있다. 다른 화면에서는 헤더가
   * 갖는다.
   *
   * `useSearchParams` 로 헤더가 직접 읽는 방법도 있지만, 그러면 레이아웃을
   * 쓰는 **모든** 화면이 정적 렌더에서 이탈하고 Suspense 경계를 요구한다.
   * `usePathname` 은 그 대가가 없다.
   */
  hideOnResults?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  if (hideOnResults && pathname === "/search") return null;

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        // 빈 말로는 주소에 `?q=` 만 남는다. 같은 화면의 다른 이름이라
        // 뒤로가기에 빈 검색이 한 칸 쌓인다 → `browseHref`
        router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search", {
          transitionTypes: NAV_FORWARD,
        });
      }}
      className={`flex h-9 items-center gap-2 rounded-pill border border-hair pr-3 pl-3.5 transition-colors focus-within:border-dust ${className}`}
    >
      {/* 아이콘이 라벨 노릇을 하지 않는다 — 낭독기는 아래 `aria-label` 을 읽는다.
          여기 있는 것은 "이 칸이 검색이다" 를 눈에 말하는 일뿐이다 */}
      <MagnifyingGlassIcon size={16} weight="bold" aria-hidden className="shrink-0 text-slate" />
      <input
        // 결과 화면에서 주소가 바뀌어도 이 값은 안 따라온다(비제어 입력).
        // 쓰는 쪽이 `key` 로 리마운트를 잡는다 → `app/(site)/search/page.tsx`
        defaultValue={query}
        name="q"
        type="search"
        placeholder="곡·아티스트"
        aria-label="곡·아티스트 검색"
        className="min-w-0 flex-1 bg-transparent text-[14px] font-medium tracking-[-0.01em] text-ink placeholder:text-slate focus:outline-none"
      />
    </form>
  );
}
