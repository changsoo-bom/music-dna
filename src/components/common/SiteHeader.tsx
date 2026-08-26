import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { SearchField } from "@/components/common/SearchField";
import { SiteNav } from "@/components/common/SiteNav";
import { NAV_BACK, NAV_FORWARD } from "@/constants/nav";

/**
 * 떠 있는 흰 필 헤더. 뷰포트 상단에 붙지 않고 24px 아래에 뜬다.
 *
 * ## 세 칸이다 — 가운데 칸이 진짜 가운데다
 *
 * 로고 · 메뉴 · 검색을 `grid-cols-[1fr_auto_1fr]` 로 놓는다. 전에는 로고만
 * 왼쪽에 두고 나머지를 `ml-auto` 로 오른쪽 끝까지 밀었는데, 1280px 짜리 필
 * 안에서 **가운데 700px 가 통째로 비었다.** 필은 떠 있는 물건이라 그 빈 곳이
 * 여백으로 안 읽히고 덜 채운 바로 읽힌다.
 *
 * 양쪽 칸을 `1fr` 로 같이 잡으면 메뉴가 **양쪽 폭과 무관하게** 필의 정중앙에
 * 선다 — 검색 필드가 길어지거나 메뉴가 하나 늘어도 중앙이 안 흔들린다.
 * 원본 프로토타입의 배치이기도 하다(`design/prototype.html` 의 `.nav ul`
 * `margin: 0 auto`).
 *
 * ## 굵기와 자간은 로고만의 것이다
 *
 * `font-bold tracking-[0.02em]` 이 `<header>` 에 걸려 있어서 메뉴까지 그
 * 자간을 물려받았다. 시스템의 표는 **네비를 16px · 500 · -2%** 로 적어 두는데
 * 화면에는 15px · +2% 가 그려지고 있었다 — 로고 전용 처리가 두 칸에
 * 번진 것이다. 이제 로고가 자기 값을 직접 들고, 메뉴는 `SiteNav` 가 표대로
 * 그린다 → `docs/design-reference.md` 의 타이포 표
 *
 * ## 나가는 길에도 방향이 있다
 *
 * 로고는 집으로 돌아가는 길이라 `NAV_BACK`, 메뉴 두 칸은 들어가는 길이라
 * `NAV_FORWARD` 다(`SiteNav`) — 검사 화면을 오갈 때와 같은 장치를 같은 뜻으로
 * 쓴다. 헤더 자체는 전환에서 안 움직인다(`globals.css` 의 `.header-drop` 이
 * `view-transition-name` 을 갖는다).
 *
 * 진입할 때 위에서 내려온다. 애니메이션은 안쪽 `<header>` 에 건다 —
 * `sticky` 요소에 `transform` 을 걸면 그 요소가 새 컨테이닝 블록이 되어
 * 고정 동작이 깨진다.
 */
export function SiteHeader() {
  return (
    <div className="sticky top-6 z-50 px-12 max-lg:px-6 max-sm:top-3 max-sm:px-4">
      {/* **좁은 화면에서는 격자를 놓는다.** `1fr auto 1fr` 은 양쪽 칸을 같은
          폭으로 맞추는데, 거기서는 왼쪽이 로고(넓다)고 오른쪽이 돋보기
          하나(좁다)라 오른쪽 칸이 로고만큼 부풀어 필이 화면 밖으로 나간다.
          넓은 화면에서는 반대쪽이 검색 필드라 그 등폭이 정확히 원하는 것이다.

          **`1fr` 이 아니라 `minmax(0,1fr)` 이다.** `1fr` 은 `minmax(auto,1fr)`
          이고 `auto` 의 최소값은 min-content 라, 좁아지면 트랙이 줄어드는 게
          아니라 **필 밖으로 넘친다.** 640px 에서 헤더 안쪽이 528px 인데
          가운데 메뉴가 ~165px 을 먹으면 양쪽이 각 ~181px 이고 오른쪽에
          176px 짜리 필드가 들어간다 — 한 자릿수 px 여유였다. 이제 넘치는
          대신 필드가 줄어든다 */}
      <header className="header-drop mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center py-3 pr-8 pl-8 rounded-pill bg-white shadow-lift max-sm:flex max-sm:justify-between max-sm:pr-5 max-sm:pl-5">
        {/* 로고만 굵고 자간이 넓다. 셋이 같은 굵기가 되면 어디가 집인지 안 보인다 */}
        <Link
          href="/"
          transitionTypes={NAV_BACK}
          className="flex items-center gap-2.5 justify-self-start text-[15px] font-bold tracking-[0.02em]"
        >
          <span aria-hidden className="relative block h-5 w-[34px]">
            <span className="absolute top-0 left-0 h-5 w-5 rounded-full bg-chart-2 mix-blend-multiply" />
            <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-chart-1 mix-blend-multiply" />
          </span>
          MY MUSIC DNA
        </Link>

        {/* **가운데 칸은 좁은 화면에서도 가운데다.** 여기서만 간격을 좁힌다 */}
        <SiteNav className="max-sm:gap-5" />

        {/* **검색은 메뉴가 아니라 조작이라 메뉴와 같은 칸에 안 선다.** 가는 곳
            (`둘러보기`·`보관함`)과 하는 일(검색)이 나란히 있으면 셋 중 어느
            것이 이동인지 안 읽힌다. 테두리 하나로만 구별한다 — 헤더가 이미
            떠 있는 흰 필이라 여기에 표면을 하나 더 깔면 종이가 세 겹이 된다
            → `.claude/rules/styling.md` */}
        {/* 필드와 돋보기는 **한 칸을 나눠 쓴다.** 칸이 셋인 격자에 넷째 아이가
            들어오면 그 아이는 다음 줄로 떨어진다 — 좁은 화면에서 헤더가 두
            줄이 되는 사고가 여기서 난다 */}
        <div className="min-w-0 justify-self-end">
          {/* **결과 화면에서는 이 칸을 페이지에 넘긴다.** 헤더는 레이아웃에
              살아서 `?q=` 를 모르므로, 여기 남겨 두면 결과를 보는 내내 칸이
              비어 있다 → `SearchField` 의 `hideOnResults` */}
          <SearchField hideOnResults className="w-56 max-lg:w-44 max-sm:hidden" />

          {/* 좁은 화면에서는 필드가 로고와 메뉴 사이를 못 버틴다. 아이콘만
              남기고 결과 화면으로 보낸다 — 거기 같은 필드가 있다
              → `SearchPage` */}
          <Link
            href="/search"
            transitionTypes={NAV_FORWARD}
            aria-label="곡·아티스트 검색"
            className="hidden text-slate transition-colors hover:text-ink max-sm:block"
          >
            <MagnifyingGlassIcon size={18} weight="bold" aria-hidden />
          </Link>
        </div>
      </header>
    </div>
  );
}
