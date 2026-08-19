import Link from "next/link";

/**
 * 떠 있는 흰 필 헤더. 뷰포트 상단에 붙지 않고 24px 아래에 뜬다.
 * 랜딩에는 네비게이션을 두지 않는다 — 검사 전에는 갈 곳이 없다.
 *
 * 진입할 때 위에서 내려온다. 애니메이션은 안쪽 `<header>` 에 건다 —
 * `sticky` 요소에 `transform` 을 걸면 그 요소가 새 컨테이닝 블록이 되어
 * 고정 동작이 깨진다.
 */
export function SiteHeader() {
  return (
    <div className="sticky top-6 z-50 px-12 max-lg:px-6 max-sm:top-3 max-sm:px-4">
      <header className="header-drop mx-auto flex max-w-[1280px] items-center py-3 pl-8 pr-8 text-[15px] font-bold tracking-[0.02em] rounded-pill bg-white shadow-lift max-sm:pl-5 max-sm:pr-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span aria-hidden className="relative block h-5 w-[34px]">
            <span className="absolute left-0 top-0 h-5 w-5 rounded-full bg-chart-2 mix-blend-multiply" />
            <span className="absolute right-0 top-0 h-5 w-5 rounded-full bg-chart-1 mix-blend-multiply" />
          </span>
          MY MUSIC DNA
        </Link>
      </header>
    </div>
  );
}
