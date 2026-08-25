"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { TrackRow } from "@/components/common/TrackRow";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { NAV_BACK } from "@/constants/nav";
import { useStoredValue } from "@/hooks/use-stored-value";
import { renamePlaylist } from "@/lib/playlists";
import { toTracks } from "@/lib/schemas/played";
import { parsePlaylists } from "@/lib/schemas/playlist";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";

const ICON_BUTTON =
  "grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none";

/**
 * 리스트 하나. 위에 리스트 정보, 밑에 담긴 곡.
 *
 * **머리글이 여기 있다.** 리스트 이름은 저장소에서 오는 값이라 서버가 모른다
 * — 라우트의 `page.tsx` 가 제목을 그리면 이름 자리가 비어 있다가 채워진다.
 * 이 화면에서는 제목이 곧 리스트 정보라 통째로 클라이언트가 그린다.
 *
 * 곡은 **좁은 모양**(`compact`)이다. 전체 화면 재생목록과 같은 자리 —
 * 이미 한 덩어리 안에 들어 있는 목록이라 줄마다 표면을 또 깔면 종이가
 * 세 겹이 된다 → `TrackRow`
 *
 * 서버는 Local Storage 를 못 보므로 첫 렌더에서 리스트를 못 찾는다. 없는
 * 주소와 아직 못 읽은 상태가 같은 모양이라 한 프레임 "없는 리스트" 가 스친다
 * — 보관함 목록이 치르는 것과 같은 대가다 → `LibraryList`
 */
export function PlaylistDetail({ id }: { id: string }) {
  const [editing, setEditing] = useState(false);
  const playlist = parsePlaylists(useStoredValue(STORAGE_KEYS.playlists)).find(
    (list) => list.id === id,
  );
  const tracks = toTracks(playlist?.trackIds ?? []);
  const queue = tracks.filter(isPlayable);
  const play = usePlayerStore((state) => state.play);
  const sounding = usePlayerStore((state) => soundingId(state, "library"));

  if (!playlist) {
    return (
      <>
        <span className="eyebrow text-ink">보관함</span>
        <h1 className="mt-5 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">
          리스트를 찾을 수 없습니다
        </h1>
        <p className="mt-4 text-sm text-slate">지웠거나 다른 기기에서 만든 리스트입니다.</p>
        <ButtonLink href="/library" transitionTypes={NAV_BACK} variant="text" className="mt-6">
          보관함으로 돌아가기
          <Arrow />
        </ButtonLink>
      </>
    );
  }

  return (
    <>
      {/* 뒤로가기는 **보관함으로 가는 링크다.** `router.back()` 은 직전 화면으로
          가는 것이라, 여기까지 주소로 바로 들어왔거나 다른 곳을 거쳐 왔으면
          엉뚱한 데로 나간다. 이 화면 위에 있는 것은 언제나 보관함이다 */}
      <ButtonLink href="/library" transitionTypes={NAV_BACK} variant="text">
        <span aria-hidden className="transition-transform duration-200 group-hover:-translate-x-1">
          ←
        </span>
        보관함
      </ButtonLink>

      <div className="mt-4 flex items-start gap-2">
        {editing ? (
          <input
            // 열릴 때 초점과 전체 선택. ref 콜백이라 effect 가 필요 없다
            ref={(el) => el?.select()}
            defaultValue={playlist.name}
            aria-label="리스트 이름"
            maxLength={40}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              // Esc 는 값을 되돌리고 나간다. blur 가 저장을 하므로 값을 먼저 되돌린다
              if (event.key === "Escape") {
                event.currentTarget.value = playlist.name;
                event.currentTarget.blur();
              }
            }}
            onBlur={(event) => {
              renamePlaylist(playlist.id, event.currentTarget.value);
              setEditing(false);
            }}
            // 상자가 아니라 **밑줄 하나다.** 제목 자리에 흰 상자가 들어오면
            // 고치는 동안 이 화면에 종이가 한 겹 더 생긴다. 글자는 제자리에
            // 있고 밑에 줄만 그어지면 무엇을 고치는 중인지가 바로 읽힌다
            className="w-full max-w-[500px] border-b-2 border-ink bg-transparent pb-1 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-0.02em] focus-visible:outline-none"
          />
        ) : (
          <>
            <h1 className="min-w-0 text-[clamp(28px,3.4vw,40px)] leading-[1.1] break-all">
              {playlist.name}
            </h1>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="리스트 이름 바꾸기"
              className={ICON_BUTTON}
            >
              <PencilSimpleIcon size={20} weight="light" aria-hidden />
            </button>
          </>
        )}

        {/* 삭제는 보관함 목록의 카드에 있다(`PlaylistCard`). 지우는 것은 리스트를
            고르는 일에 가까워서, 여러 장이 나란히 보이는 자리가 맞다 */}
      </div>

      <p className="mt-3 text-sm text-slate">
        총 {playlist.trackIds.length}곡
        <span className="tabular-nums"> · {playlist.createdAt.replaceAll("-", ".")}</span>
      </p>

      {tracks.length === 0 ? (
        <p className="mt-12 text-sm text-slate">
          아직 담긴 곡이 없습니다. 곡 옆의 +를 누르면 여기에 쌓입니다.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col">
          {tracks.map((track) => (
            <li key={track.id}>
              <TrackRow
                compact
                track={track}
                isCurrent={sounding === track.id}
                saved
                onPlay={() =>
                  play(
                    "library",
                    queue,
                    queue.findIndex((item) => item.id === track.id),
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
