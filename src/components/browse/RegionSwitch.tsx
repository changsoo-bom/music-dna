import Link from "next/link";

import { REGIONS } from "@/constants/regions";
import { browseHref } from "@/lib/browse";
import type { Genre, Region } from "@/types/music";

/**
 * 국내·해외를 가르는 스위치. **머리글 줄의 오른쪽 끝에 선다.**
 *
 * 셋 중 하나를 배타적으로 고르는 일이라 버튼 세 개가 아니라 **한 덩어리**다.
 * 헤어라인 테두리가 그 경계를 그린다 — 기능적 구분은 그림자가 아니라
 * `--hair` 1px 이 한다(`docs/design-reference.md`).
 *
 * 이 화면에서 떠 있는 것은 여기 고른 칸 하나뿐이다. 전에는 필터가 아홉 개의
 * `shadow-lift` 칩이었고, 그러면 정작 떠 있어야 할 네비 필과 무게가 겹친다.
 *
 * **고른 칸만 모양을 갖는다.** 안 고른 칸은 트랙 위의 글자로 남는다 —
 * 칸마다 바닥을 깔거나 사이에 세로선을 긋는 것도 해 봤는데, 셋 다 모양을
 * 가지면 트랙 안이 다시 버튼 세 개가 되고 어느 것이 켜졌는지가 흐려진다.
 * 켜진 것 하나만 떠 있으면 그 하나만 보면 된다.
 *
 * 고른 칸과 아닌 칸의 차이는 표면보다 **무게에서 온다.** `--lifted`(#FCFBFA)와
 * `--white` 사이는 눈에 잡히는 간격이 아니고, 일하는 것은 그림자와 잉크·500 이다
 * — 이 시스템은 대비를 크기·굵기·자간에서 만든다.
 */
export function RegionSwitch({ region, genre }: { region: Region | null; genre: Genre | null }) {
  const items = [{ id: null, label: "전체" }, ...REGIONS];

  return (
    <nav
      aria-label="국내·해외"
      className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-hair bg-lifted p-1"
    >
      {items.map((item) => {
        const on = region === item.id;
        return (
          <Link
            key={item.id ?? "all"}
            href={browseHref({ region, genre }, { region: item.id })}
            /* 좁히는 것은 이동이 아니다 — 보던 자리에서 목록만 바뀐다.
               색인과 같은 이유다 → `GenreRail` */
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={`inline-flex h-9 shrink-0 items-center rounded-pill px-4 text-sm whitespace-nowrap transition duration-200 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none ${
              on ? "bg-white font-medium text-ink shadow-lift" : "text-slate hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
