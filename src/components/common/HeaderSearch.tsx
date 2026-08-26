"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchField } from "@/components/common/SearchField";
import { NAV_FORWARD } from "@/constants/nav";

/**
 * 헤더의 검색 자리. 넓은 화면에서는 필드, 좁은 화면에서는 돋보기 하나다.
 *
 * ## 결과 화면에서는 통째로 접힌다
 *
 * **헤더는 `?q=` 를 모른다.** `searchParams` 는 페이지가 받고 레이아웃까지
 * 올라오지 않는다. 그래서 결과를 보는 내내 이 칸은 빈 채로 서 있고,
 * `아이유` 를 `아이유 밤편지` 로 좁히려면 처음부터 다시 쳐야 한다.
 * 돋보기 쪽은 더 나쁘다 — `/search` 로 가는 링크라 **누르면 지금 보고 있는
 * 결과가 날아간다.**
 *
 * 그래서 `/search` 에서는 둘 다 안 그린다. 거기서는 페이지가 칸을 갖고,
 * 그 칸은 지금 찾고 있는 말을 물고 있다 → `SearchPage`
 *
 * **접는 판단이 여기 있는 이유**는 필드와 돋보기가 같은 조건으로 접혀야
 * 해서다. 조건을 `SearchField` 안에 두면 형제인 돋보기가 규칙 밖에 남는다.
 *
 * `useSearchParams` 로 여기서 직접 읽는 방법도 있지만, 그러면 레이아웃을
 * 쓰는 **모든** 화면이 정적 렌더에서 이탈하고 Suspense 경계를 요구한다.
 * `usePathname` 은 그 대가가 없다.
 *
 * **경로를 아는 화면이 칸을 책임진다.** `/search` 의 페이지도, 그 화면이
 * 죽었을 때 뜨는 `error.tsx` 도 각자 칸을 그린다 — 여기서 접었는데 저쪽이
 * 안 그리면 그 화면에는 검색 입구가 하나도 없다.
 */
export function HeaderSearch() {
  const pathname = usePathname();
  if (pathname === "/search") return null;

  return (
    <>
      {/* **필드는 트랙보다 커지지 않는다.** 고정폭으로 두면 좁은 구간에서
          격자 칸을 넘쳐 가운데 메뉴 위로 흘러넘친다(끝 정렬이라 왼쪽으로).
          `max-w-*` 라야 실제로 줄어든다 → `SiteHeader` 의 `minmax(0,1fr)` */}
      <SearchField className="w-full max-w-56 max-lg:max-w-44 max-sm:hidden" />

      {/* 좁은 화면에서는 필드가 로고와 메뉴 사이를 못 버틴다. 아이콘만 남기고
          결과 화면으로 보낸다 — 거기 같은 필드가 있다 → `SearchPage` */}
      <Link
        href="/search"
        transitionTypes={NAV_FORWARD}
        aria-label="곡·아티스트 검색"
        className="hidden text-slate transition-colors hover:text-ink max-sm:block"
      >
        <MagnifyingGlassIcon size={18} weight="bold" aria-hidden />
      </Link>
    </>
  );
}
