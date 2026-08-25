"use client";

import { MusicNotesIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ConfirmPop } from "@/components/ui/ConfirmPop";
import { NAV_FORWARD } from "@/constants/nav";
import { deletePlaylist } from "@/lib/playlists";
import { toTracks } from "@/lib/schemas/played";
import type { Playlist } from "@/types/music";

/**
 * 리스트 한 장. 커버 자리 + 이름 + 곡 수 + 만든 날, 오른쪽 끝에 삭제.
 *
 * **카드 전체가 상세로 가는 링크고, 삭제만 그 위에 얹힌다.** 곡 줄과 같은
 * 구조다 — 저기도 줄 전체가 재생 과녁이고 담기 버튼만 오른쪽 끝을 차지한다.
 * 버튼을 링크 안에 넣을 수는 없어서(중첩 금지) 둘은 형제고, 글자가 버튼
 * 밑으로 들어가지 않게 오른쪽 여백을 비워 둔다 → `TrackRow`
 *
 * 오른쪽 끝 아이콘은 곡 줄의 그것과 같은 크기다(과녁 40px · 글리프 24px).
 * 목록 두 종류가 세로로 이어지는 화면이라 오른쪽 끝이 한 줄로 안 맞으면
 * 바로 눈에 띈다.
 *
 * **커버는 가장 최근에 담은 곡의 썸네일이다.** `trackIds` 는 새로 담은 것이
 * 맨 앞이라(`togglePlaylistTrack`) 앞에서부터 커버가 있는 첫 곡을 쓴다 —
 * 카드가 마지막으로 무엇을 했는지 말해 주고, 리스트가 여럿일 때 이름보다
 * 그림이 먼저 구별된다.
 *
 * 빈 리스트도 만들어지고 커버 없는 곡(`youtubeId` 미보강)만 담길 수도 있으므로
 * 없을 때의 모양이 여전히 필요하다. 회색 사각에 음표 하나 — `TrackRow` 가
 * 틀 수 없는 곡에 쓰는 것과 같은 처리다.
 *
 * 곡 줄과 같은 표면·같은 반경이다(`bg-lifted` · `rounded-btn`). 리스트는
 * 곡보다 큰 것이지 다른 종류의 것이 아니라서, 카드를 따로 만들면 한 페이지에
 * 표면이 두 벌 생긴다. 포인터가 올라오면 한 단계 떠오르는 것도 같다.
 */
export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const [asking, setAsking] = useState(false);
  const cover = toTracks(playlist.trackIds).find((track) => track.youtubeId)?.youtubeId;

  return (
    <div className="relative">
      <Link
        href={`/library/${playlist.id}`}
        transitionTypes={NAV_FORWARD}
        className="flex items-center gap-5 rounded-btn bg-lifted p-4 pr-16 transition duration-200 hover:bg-white hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none max-sm:gap-4"
      >
        <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-btn bg-ghost text-slate max-sm:h-20 max-sm:w-20">
          {cover ? (
            /* 16:9 를 정사각형에 덮는다 — 곡 줄의 커버와 같은 처리다 → `TrackRow`

               `sizes` 는 상자 폭이 아니라 그려지는 폭이다: 96 × 16/9 ≒ 171.
               96 을 적으면 브라우저가 w=128 후보를 골라 171px 로 늘려 그린다.
               그게 뭉개짐이었다 → `PlayerBar` 에 같은 계산이 적혀 있다. */
            <Image
              src={`https://i.ytimg.com/vi/${cover}/mqdefault.jpg`}
              alt=""
              fill
              sizes="176px"
              className="object-cover"
            />
          ) : (
            <MusicNotesIcon size={30} weight="light" aria-hidden />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-[22px] font-semibold tracking-[-0.02em]">{playlist.name}</h2>
          <p className="mt-1.5 text-sm text-slate">총 {playlist.trackIds.length}곡</p>
          {/* 저장된 값이 `2026-08-25` 라 점만 바꾼다 — 날짜를 다시 파싱하면
              시간대에 따라 하루가 밀린다 */}
          <p className="text-sm text-slate tabular-nums">
            {playlist.createdAt.replaceAll("-", ".")}
          </p>
        </div>
      </Link>

      {/* **곡이 든 리스트는 한 번 묻는다.** 되돌리기가 화면에 없어서 잘못 누른
          삭제는 그대로 끝이다. 빈 리스트는 잃을 것이 없으므로 안 묻는다 */}
      <button
        type="button"
        onClick={() => {
          if (playlist.trackIds.length > 0) {
            setAsking(true);
            return;
          }
          deletePlaylist(playlist.id);
        }}
        aria-label={`${playlist.name} 삭제`}
        className="absolute top-1/2 right-4 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-slate transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
      >
        <TrashIcon size={24} weight="light" aria-hidden />
      </button>

      {asking && (
        <ConfirmPop
          title={`${playlist.name} 리스트를 지울까요?`}
          detail={`담긴 ${playlist.trackIds.length}곡이 이 리스트에서 빠집니다. 되돌릴 수 없습니다.`}
          onConfirm={() => deletePlaylist(playlist.id)}
          onClose={() => setAsking(false)}
        />
      )}
    </div>
  );
}
