import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { SearchField } from "@/components/common/SearchField";
import { NAV_BACK, NAV_FORWARD } from "@/constants/nav";

/**
 * 떠 있는 흰 필 헤더. 뷰포트 상단에 붙지 않고 24px 아래에 뜬다.
 *
 * 오른쪽 메뉴는 로고보다 약하다(`font-medium` · `text-slate`). 굵기와 색이
 * 로고와 같아지면 셋이 같은 층으로 읽혀서 어디가 집인지 안 보인다.
 *
 * **검색은 메뉴 왼쪽에 선다.** 가는 곳(`전체보기`·`보관함`)과 하는 일(검색)은
 * 다른 종류라 같은 줄에 나란히 두면 셋 중 어느 것이 이동인지 안 읽힌다.
 * 좁은 화면에서는 필드가 로고와 메뉴 사이를 못 버텨서 돋보기만 남고,
 * 필드는 결과 화면이 갖는다 → `SearchField`
 *
 * **여기서 나가는 길에도 방향이 있다.** 로고는 집으로 돌아가는 길이라
 * `NAV_BACK`, 메뉴 두 칸은 들어가는 길이라 `NAV_FORWARD` 다 — 검사 화면을
 * 오갈 때와 같은 장치를 같은 뜻으로 쓴다. 헤더 자체는 전환에서 안 움직인다
 * (`globals.css` 의 `.header-drop` 이 `view-transition-name` 을 갖는다).
 *
 * 진입할 때 위에서 내려온다. 애니메이션은 안쪽 `<header>` 에 건다 —
 * `sticky` 요소에 `transform` 을 걸면 그 요소가 새 컨테이닝 블록이 되어
 * 고정 동작이 깨진다.
 */
export function SiteHeader() {
  return (
    <div className="sticky top-6 z-50 px-12 max-lg:px-6 max-sm:top-3 max-sm:px-4">
      <header className="header-drop mx-auto flex max-w-[1280px] items-center py-3 pl-8 pr-8 text-[15px] font-bold tracking-[0.02em] rounded-pill bg-white shadow-lift max-sm:pl-5 max-sm:pr-5">
        <Link href="/" transitionTypes={NAV_BACK} className="flex items-center gap-2.5">
          <span aria-hidden className="relative block h-5 w-[34px]">
            <span className="absolute left-0 top-0 h-5 w-5 rounded-full bg-chart-2 mix-blend-multiply" />
            <span className="absolute right-0 top-0 h-5 w-5 rounded-full bg-chart-1 mix-blend-multiply" />
          </span>
          MY MUSIC DNA
        </Link>

        {/* **검색은 메뉴가 아니라 조작이라 메뉴 앞에 선다.** 테두리 하나로만
            구별한다 — 헤더가 이미 떠 있는 흰 필이라 여기에 표면을 하나 더
            깔면 종이가 세 겹이 된다 → `.claude/rules/styling.md` */}
        <SearchField className="ml-auto w-56 max-lg:w-44 max-sm:hidden" />

        {/* 좁은 화면에서는 필드가 로고와 메뉴 사이를 못 버틴다. 아이콘만 남기고
            결과 화면으로 보낸다 — 거기 같은 필드가 있다 */}
        <Link
          href="/search"
          transitionTypes={NAV_FORWARD}
          aria-label="곡·아티스트 검색"
          className="ml-auto hidden text-slate transition-colors hover:text-ink max-sm:block"
        >
          <MagnifyingGlassIcon size={18} weight="bold" aria-hidden />
        </Link>

        <nav className="flex items-center gap-7 ml-7 font-medium text-slate max-sm:gap-5 max-sm:ml-5">
          <Link href="/browse" transitionTypes={NAV_FORWARD} className="transition-colors hover:text-ink">
            전체보기
          </Link>
          <Link href="/library" transitionTypes={NAV_FORWARD} className="transition-colors hover:text-ink">
            보관함
          </Link>
        </nav>
      </header>
    </div>
  );
}
