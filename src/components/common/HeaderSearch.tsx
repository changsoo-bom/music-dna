"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { SearchField } from "@/components/common/SearchField";
import { NAV_FORWARD } from "@/constants/nav";

/**
 * 헤더의 검색 자리. 넓은 화면에서는 필드, 좁은 화면에서는 돋보기 하나다.
 *
 * ## 칸은 어디서도 안 접힌다
 *
 * 전에는 `/search` 에서 통째로 `null` 을 돌려주고 결과 화면이 자기 칸을
 * 그렸다. 헤더가 `?q=` 를 몰라서였는데, **그러면 헤더의 폭이 화면마다 달라진다** —
 * 격자의 오른쪽 칸이 비면서 가운데 메뉴가 옮겨 앉는다. 헤더는 페이지가 바뀌어도
 * 안 움직이는 것이 일이라, 그 흔들림이 접기의 값어치보다 비쌌다.
 *
 * **이제 여기서 `?q=` 를 읽는다.** 그래서 결과를 보는 내내 칸이 지금 찾고
 * 있는 말을 물고 있고, `아이유` 를 `아이유 밤편지` 로 좁히는 데 처음부터 다시
 * 칠 필요가 없다. 접었던 이유가 사라졌다.
 *
 * **대가는 `<Suspense>` 한 겹이다.** `useSearchParams` 는 정적 렌더에서
 * 경계를 요구하는데, 헤더는 레이아웃에 있어서 그 경계가 없으면 `/library`·
 * `/quiz` 까지 빌드가 깨진다. 경계는 `SiteHeader` 가 친다.
 *
 * `key` 로 리마운트시킨다 — 비제어 입력이라 주소가 바뀌어도 `defaultValue` 가
 * 안 따라온다. 뒤로가기로 이전 검색어에 돌아왔을 때 칸에 방금 친 말이 남아
 * 있으면 화면과 칸이 다른 말을 한다. effect 로 값을 되돌리지 말라는
 * `.claude/rules/react.md` 가 지정한 도구가 `key` 다 → `SearchField`
 */
export function HeaderSearch() {
  const pathname = usePathname();
  const query = useSearchParams().get("q") ?? "";

  return (
    <>
      {/* **필드는 트랙보다 커지지 않는다.** 고정폭으로 두면 좁은 구간에서
          격자 칸을 넘쳐 가운데 메뉴 위로 흘러넘친다(끝 정렬이라 왼쪽으로).
          `max-w-*` 라야 실제로 줄어든다 → `SiteHeader` 의 `minmax(0,1fr)` */}
      <SearchField
        key={query}
        query={query}
        className="w-full max-w-56 max-lg:max-w-44 max-sm:hidden"
      />

      {/* 좁은 화면에서는 필드가 로고와 메뉴 사이를 못 버틴다. 아이콘만 남기고
          결과 화면으로 보낸다 — 거기 좁은 화면 전용 칸이 있다 → `SearchPage`

          **결과 화면에서는 이 아이콘이 없다.** 지금 있는 자리로 보내는
          링크라 눌러도 아무 일이 안 난다. */}
      {pathname !== "/search" && (
        <Link
          href="/search"
          transitionTypes={NAV_FORWARD}
          aria-label="곡·아티스트 검색"
          className="hidden text-slate transition-colors hover:text-ink max-sm:block"
        >
          <MagnifyingGlassIcon size={18} weight="bold" aria-hidden />
        </Link>
      )}
    </>
  );
}
