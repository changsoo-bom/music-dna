import Link from "next/link";

import { GENRES } from "@/constants/genres";
import { REGIONS } from "@/constants/regions";
import type { Genre, Region } from "@/types/music";

/**
 * 알약 하나. 고른 것은 잉크로 찬다.
 *
 * **떠 있는 것의 모양이다**(흰 배경 · 알약 · `shadow-lift`) — 네비 필·칩과
 * 같은 편이다. 고른 칸만 `bg-ink` 로 뒤집는다: 이 화면에서 색으로 상태를
 * 말하는 자리는 여기뿐이고, 켜진 것이 하나라 색만으로도 헷갈리지 않는다.
 */
function Tab({ href, label, on }: { href: string; label: string; on: boolean }) {
  return (
    <Link
      href={href}
      // 고른 칸은 낭독기에도 말해 준다. 색은 보는 쪽 정보다
      aria-current={on ? "page" : undefined}
      className={`inline-flex h-10 shrink-0 items-center rounded-pill px-4 text-sm font-medium tracking-[-0.01em] whitespace-nowrap transition duration-200 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none ${
        on ? "bg-ink text-canvas" : "bg-white text-ink shadow-lift hover:-translate-y-px"
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * 전체보기의 탭 두 줄. **위는 국내·해외, 아래는 장르다.**
 *
 * 두 축이 곱해진다 — 국내 힙합, 해외 록. 한 줄에 다 늘어놓으면 열 칸이
 * 넘고 무엇과 무엇이 같은 종류인지가 안 보인다.
 *
 * **`<Link>` 다. 버튼이 아니다.** 고른 값이 주소에 실려서 뒤로가기·공유·
 * 북마크가 공짜로 따라오고, 이 컴포넌트가 서버에 남는다 → `.claude/rules/state.md`
 *
 * 둘째 줄은 첫째 줄의 값을 물고 간다. 안 물면 장르를 고르는 순간 국내·해외가
 * 풀려서, 좁히려고 누른 것이 넓히는 결과가 된다.
 *
 * 좁은 화면에서는 가로로 스크롤한다. 줄바꿈으로 접으면 탭이 세 줄 네 줄이
 * 되면서 목록이 화면 밖으로 밀린다 — 탭은 목록을 보러 온 사람의 길잡이지
 * 그 자체가 화면의 주인공이 아니다.
 */
export function BrowseTabs({ region, genre }: { region: Region | null; genre: Genre | null }) {
  const href = (next: { region?: Region | null; genre?: Genre | null }) => {
    const params = new URLSearchParams();
    const nextRegion = next.region === undefined ? region : next.region;
    const nextGenre = next.genre === undefined ? genre : next.genre;

    if (nextRegion) params.set("region", nextRegion);
    if (nextGenre) params.set("genre", nextGenre);

    // 아무것도 안 고르면 맨 주소다. `?` 만 남은 주소는 같은 화면의 다른 이름이 된다
    const query = params.toString();
    return query ? `/browse?${query}` : "/browse";
  };

  return (
    <div className="mt-6 flex flex-col gap-2.5">
      <div className="scroll-panel flex gap-2 overflow-x-auto pb-1">
        <Tab href={href({ region: null })} label="전체" on={region === null} />
        {REGIONS.map((item) => (
          <Tab
            key={item.id}
            href={href({ region: item.id })}
            label={item.label}
            on={region === item.id}
          />
        ))}
      </div>

      <div className="scroll-panel flex gap-2 overflow-x-auto pb-1">
        <Tab href={href({ genre: null })} label="전체 장르" on={genre === null} />
        {GENRES.map((item) => (
          <Tab
            key={item.id}
            href={href({ genre: item.id })}
            label={item.label}
            on={genre === item.id}
          />
        ))}
      </div>
    </div>
  );
}
