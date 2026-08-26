import Image from "next/image";

import type { RemoteArtist } from "@/types/music";

/** 구독자 수를 사람이 읽는 단위로. `1234567` → `123만` */
function readableCount(value: number) {
  if (value >= 100_000_000) return `${Math.floor(value / 100_000_000)}억`;
  if (value >= 10_000) return `${Math.floor(value / 10_000)}만`;
  if (value >= 1_000) return `${Math.floor(value / 1_000)}천`;
  return String(value);
}

/**
 * 검색어가 가수였을 때 목록 위에 서는 카드.
 *
 * **YouTube 가 주는 것만 그린다** — 이름, 채널 설명 첫 줄, 썸네일, 구독자 수.
 * 앨범도 데뷔년도도 장르도 없다. 없는 값을 자리만 잡아 두고 비워 놓으면
 * 카드가 고장 난 것처럼 보이므로, 없는 것은 줄째로 안 그린다 → `RemoteArtist`
 *
 * 서버 컴포넌트다. 누를 것이 없는 카드라 클라이언트로 내려갈 이유가 없다
 * → `.claude/rules/structure.md` 의 `"use client"` 는 leaf 에만
 *
 * 표면은 곡 줄과 같다(`bg-lifted` · `rounded-btn`). 가수는 곡보다 큰 것이지
 * 다른 종류의 것이 아니라서, 여기만 다른 종이를 쓰면 한 화면에 표면이 두 벌
 * 생긴다 → `PlaylistCard`
 */
export function ArtistCard({ artist }: { artist: RemoteArtist }) {
  return (
    <div className="mt-10 flex items-center gap-6 rounded-btn bg-lifted p-6 max-sm:mt-6 max-sm:gap-4 max-sm:p-4">
      {artist.thumbnail && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-ghost max-sm:h-20 max-sm:w-20">
          <Image src={artist.thumbnail} alt="" fill sizes="96px" className="object-cover" />
        </div>
      )}

      <div className="min-w-0">
        <p className="eyebrow text-slate">가수</p>
        <h2 className="mt-2 truncate text-[26px] leading-[1.1] tracking-[-0.02em] max-sm:text-[22px]">
          {artist.name}
        </h2>
        {artist.subscribers !== undefined && (
          <p className="mt-1.5 text-sm tabular-nums text-slate">
            구독자 {readableCount(artist.subscribers)}
          </p>
        )}
        {artist.about && (
          <p className="mt-2 line-clamp-2 max-w-[52ch] text-sm text-slate">{artist.about}</p>
        )}
      </div>
    </div>
  );
}
