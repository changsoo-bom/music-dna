"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_FORWARD } from "@/constants/nav";

const ITEMS = [
  { href: "/browse", label: "둘러보기", narrow: true },
  { href: "/library", label: "보관함", narrow: true },
  /**
   * **좁은 화면에서는 빠진다.** 세 칸이 되면 로고와 돋보기 사이 폭을 넘겨
   * 가운데 칸이 밀리는데, 헤더는 페이지가 바뀌어도 안 움직이는 것이 일이다.
   * 가는 곳 둘이 먼저고 이건 한 번 읽고 마는 글이라, 셋 중 이것이 빠진다.
   * **`max-sm` 에서는 푸터가 같은 링크를 든다** → `SiteFooter`
   */
  { href: "/about", label: "만든 방법", narrow: false },
] as const;

/**
 * 헤더 가운데의 두 칸. **지금 어디에 서 있는지를 말한다.**
 *
 * 전에는 두 칸이 늘 같은 회색이라, 보관함에서 보관함 링크를 눌러도 아무 일도
 * 안 일어나는 것이 화면 어디에도 안 적혀 있었다. 사이트 껍데기가 하는 일의
 * 절반은 방향 안내다.
 *
 * **지금 칸은 잉크색이고 밑줄이 그어진다.**
 *
 * **잉크다. 예약색이 아니다.** 전에는 `--signal-lt` 점이었는데, 예약색을
 * 사이트 껍데기에 **상시 켜 두면 그 신호가 가장 빨리 닳는다** — 값을 그리는
 * 자리에서 그 색을 봤을 때 특별한 것이 없어진다. 그리고 이 시스템은 이미
 * 고른 것을 잉크 선으로 말하고 있다: 전체보기의 장르 색인이 `border-ink`
 * 왼쪽 선이다(`GenreRail`). 같은 뜻은 같은 장치로 말한다.
 *
 * **밑줄은 띄워서 그린다.** 링크 상자에 `border-b` 를 걸면 글자가 2px 위로
 * 밀려서 로고와 밑변이 어긋난다. 절대 위치라 상자를 안 건드리고, 켜고 끄는
 * 것이 `opacity` 뿐이라 이동할 때 헤더가 안 움직인다 — 페이지가 바뀌어도
 * 안 움직이는 것이 헤더의 일이다.
 *
 * **좁은 화면에서도 남는다.** 점일 때는 자리까지 13px 을 먹어서 두 칸이면
 * 26px 이었고, 로고와 돋보기 사이에 그 폭이 없어서 `max-sm` 에서 뺐어야 했다.
 * 밑줄은 가로 폭을 안 먹는다 — 모든 폭에서 같은 말을 한다.
 *
 * `"use client"` 가 여기 붙는 이유는 `usePathname` 하나뿐이다. 헤더 본체는
 * 서버 컴포넌트로 남는다 → `.claude/rules/structure.md`
 *
 * 하위 주소도 그 칸이다 — `/library/xxx` 에서 보관함이 꺼져 있으면 그 화면은
 * 어느 칸에도 안 속한 화면이 된다.
 */
export function SiteNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={`flex items-center gap-8 text-base font-medium tracking-[-0.02em] ${className}`}>
      {ITEMS.map((item) => {
        const here = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            transitionTypes={NAV_FORWARD}
            aria-current={here ? "page" : undefined}
            className={`relative transition-colors ${
              here ? "text-ink" : "text-slate hover:text-ink"
            } ${item.narrow ? "" : "max-sm:hidden"}`}
          >
            {item.label}
            <span
              aria-hidden
              className={`absolute -bottom-1 right-0 left-0 h-0.5 bg-ink transition-opacity duration-200 ${
                here ? "opacity-100" : "opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
