"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_FORWARD } from "@/constants/nav";

const ITEMS = [
  { href: "/browse", label: "둘러보기" },
  { href: "/library", label: "보관함" },
] as const;

/**
 * 헤더 가운데의 두 칸. **지금 어디에 서 있는지를 말한다.**
 *
 * 전에는 두 칸이 늘 같은 회색이라, 보관함에서 보관함 링크를 눌러도 아무 일도
 * 안 일어나는 것이 화면 어디에도 안 적혀 있었다. 사이트 껍데기가 하는 일의
 * 절반은 방향 안내다.
 *
 * **지금 칸은 잉크색이고 점이 켜진다.** 점은 이 시스템의 아이브로우 장치를
 * 그대로 가져온 것이다(`globals.css` 의 `.eyebrow::before`) — 섹션이 어디인지
 * 말하는 표시라 "여기가 지금 자리다" 와 같은 말을 한다. 예약색을 버튼에
 * 쓰지 말라는 규칙은 지킨다. 이건 눌리는 것이 아니라 상태다
 * → `.claude/rules/styling.md`
 *
 * **점 자리는 꺼져 있어도 비워 둔다.** 켜질 때 자리를 만들면 이동할 때마다
 * 글자가 옆으로 밀리는데, 헤더는 페이지가 바뀌어도 안 움직이는 것이 일이다.
 * 8px 아이브로우보다 작은 5px 다 — 16px 글줄 옆에서 8px 는 글머리표로 읽힌다.
 *
 * **좁은 화면에서는 점을 뺀다.** 점 하나가 자리까지 13px 을 먹는데 두 칸이면
 * 26px 이고, 그 폭이 로고와 돋보기 사이에 없다 — 필이 화면 밖으로 나간다.
 * 거기서는 잉크색과 회색의 차이가 같은 말을 한다.
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
            className={`flex items-center gap-2 transition-colors ${
              here ? "text-ink" : "text-slate hover:text-ink"
            }`}
          >
            <span
              aria-hidden
              className={`h-[5px] w-[5px] shrink-0 rounded-full bg-signal transition-opacity duration-200 max-sm:hidden ${
                here ? "opacity-100" : "opacity-0"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
