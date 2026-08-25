import Link from "next/link";

import { browseHref } from "@/lib/browse";
import type { Genre, Region } from "@/types/music";

export type RailItem = {
  /** `null` 이 "전체" 다 — 축의 값이 아니라 축을 안 쓰는 상태다 */
  id: Genre | null;
  label: string;
  count: number;
};

/**
 * 장르 색인. **띠가 아니라 왼쪽 기둥이다.**
 *
 * 가로 알약 여섯 개였을 때는 위의 국내·해외 스위치와 같은 모양이라 성격이
 * 다른 두 질문이 버튼 아홉 개로 읽혔다. 세로로 세우면 둘이 겹칠 일이
 * 없고, 목록과 나란히 붙어 있어서 **스크롤하는 동안에도 지금 어디쯤인지가
 * 남는다**(`sticky`). 카탈로그의 색인은 원래 이 모양이다.
 *
 * **곡 수를 같이 적는다.** 누르기 전에 그 칸에 무엇이 얼마나 있는지 알면
 * 빈 칸을 눌러 보고 되돌아오는 일이 없다. 숫자는 국내·해외를 이미 반영한
 * 값이다 — 국내를 골라 둔 채로 보는 "Rock 6" 은 국내 록이 여섯이라는 뜻이다.
 * `tabular-nums` 라 자릿수가 달라도 세로줄이 안 흔들린다.
 *
 * 고른 칸은 **왼쪽 모서리의 잉크 선**과 글자 무게로만 말한다. 알약도 그림자도
 * 색점도 없다 — 목록 옆에 붙어 사는 물건이라 조용해야 하고, 이 시스템은
 * 대비를 크기·굵기·자간에서 만든다.
 *
 * 좁은 화면에서는 기둥이 설 자리가 없으므로 가로로 눕고, 표시가 왼쪽 선에서
 * 아래 선으로 옮겨 간다. 줄바꿈이 아니라 가로 스크롤이다 — 접으면 색인이
 * 세 줄이 되면서 목록이 화면 밖으로 밀린다.
 */
export function GenreRail({
  items,
  region,
  genre,
}: {
  items: readonly RailItem[];
  region: Region | null;
  genre: Genre | null;
}) {
  return (
    <nav
      aria-label="장르"
      className="scroll-panel sticky top-24 flex flex-col self-start max-lg:static max-lg:-mx-1 max-lg:flex-row max-lg:items-center max-lg:gap-1 max-lg:overflow-x-auto max-lg:px-1"
    >
      {items.map((item) => {
        const on = genre === item.id;
        return (
          <Link
            key={item.id ?? "all"}
            href={browseHref({ region, genre }, { genre: item.id })}
            /* **좁히는 것은 이동이 아니다.** 기본 동작은 `<main>` 머리가
               화면 밖에 있으면 거기로 스크롤해 주는 것인데, 이 색인은 붙어
               다니느라(`sticky`) 목록 한참 아래에서도 눌린다. 그러면 Hip-hop
               을 보다가 R&B 를 누른 순간 화면이 페이지 꼭대기로 튀고, 그게
               페이지가 통째로 다시 그려진 것처럼 읽힌다.
               보던 자리에서 목록만 바뀌는 것이 맞다 */
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={`flex shrink-0 items-baseline gap-3 border-l-2 py-2 pl-4 text-[15px] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none max-lg:border-l-0 max-lg:border-b-2 max-lg:py-2.5 max-lg:pl-0 max-lg:pr-5 ${
              on
                ? "border-ink font-medium text-ink"
                : "border-transparent text-slate hover:border-hair hover:text-ink"
            }`}
          >
            <span className="flex-1 whitespace-nowrap">{item.label}</span>
            {/* 숫자는 라벨보다 한 단계 뒤로 물린다. 세는 것이 아니라 가늠하는 값이다 */}
            <span className="text-[13px] tabular-nums text-dust">{item.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
