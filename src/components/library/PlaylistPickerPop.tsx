"use client";

import { CheckIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import type { MouseEvent } from "react";

import { usePlaylists } from "@/hooks/use-playlists";
import { createPlaylist, togglePlaylistTrack } from "@/lib/playlists";
import { closeAfterPop } from "@/lib/pop-close";
import type { CatalogTrack } from "@/types/music";

/**
 * 곡을 어느 리스트에 담을지 고르는 창.
 *
 * **여기서만 리스트를 구독한다.** 곡 줄마다 리스트를 읽으면 아홉 줄에
 * 구독이 아홉 개고, 이 창은 한 번에 하나만 열린다. 열려 있는 동안에만
 * 사는 컴포넌트라 구독도 그동안만 산다 → `LibraryButton`
 *
 * **진짜 모달이다**(`showModal()`). 전체 화면 재생과 반대다 — 저쪽은 시트
 * 뒤의 재생 바가 살아 있어야 해서 모달이 아니었고, 여기는 뒤에서 할 일이
 * 없다. 그래서 Escape·초점 가두기·뒤 배경을 브라우저가 해 준다.
 *
 * **고르면 닫힌다.** 한 곡을 여러 리스트에 잇달아 담는 일은 드물고, 담고
 * 나서도 창이 남아 있으면 "더 할 일이 있나" 하고 한 번 더 보게 된다.
 * 닫는 것까지가 담기의 끝이다.
 *
 * 담긴 리스트는 체크다. 색이 아니라 형태로 말한다 → `LibraryButton`
 * 이미 담긴 리스트를 누르면 빼는 것도 여기서 된다 — 같은 버튼이 두 방향을
 * 한다(`togglePlaylistTrack`). 그쪽도 누르면 닫힌다.
 */
export function PlaylistPickerPop({ track, onClose }: { track: CatalogTrack; onClose: () => void }) {
  const playlists = usePlaylists();

  /** 담고 닫는다. 닫는 길은 `close()` 하나로 모은다 — 창이 사라지는 방법이
      둘이면 애니메이션도 두 벌이 된다 */
  const pick = (event: MouseEvent<HTMLButtonElement>, playlistId: string) => {
    togglePlaylistTrack(playlistId, track.id);
    event.currentTarget.closest("dialog")?.close();
  };

  return (
    <dialog
      // 열자마자 모달로 띄운다. `open` 속성만으로는 최상위 레이어에 안 올라간다
      ref={(el) => {
        if (el && !el.open) el.showModal();
      }}
      // 닫히는 애니메이션이 끝난 뒤에 언마운트한다. 여기서 바로 `onClose` 를
      // 부르면 노드가 사라져서 나가는 모습이 한 프레임도 안 보인다 → `closeAfterPop`
      onClose={(event) => closeAfterPop(event.currentTarget, onClose)}
      // 배경을 누르면 닫는다. `<dialog>` 자체가 과녁이면 그건 바깥이다
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      aria-label={`${track.title} 리스트에 담기`}
      className="pop m-auto w-[min(26rem,calc(100vw-2rem))] rounded-stadium bg-lifted p-7 shadow-float"
    >
      <p className="text-lg font-medium tracking-[-0.01em]">리스트에 담기</p>
      <p className="mt-1 truncate text-sm text-slate">{track.title}</p>

      {playlists.length === 0 ? (
        <p className="mt-6 text-sm text-slate">
          아직 리스트가 없습니다. 아래에서 하나 만들고 눌러서 담으세요.
        </p>
      ) : (
        // `.scroll-panel` 이다 — 리스트가 많아지면 여기서만 스크롤하고,
        // 막대 모양도 전체 화면 재생목록과 같은 것을 쓴다 → `globals.css`
        <ul className="scroll-panel mt-5 flex max-h-80 flex-col gap-1 pr-1">
          {playlists.map((list) => {
            const has = list.trackIds.includes(track.id);
            return (
              <li key={list.id}>
                <button
                  type="button"
                  onClick={(event) => pick(event, list.id)}
                  aria-pressed={has}
                  className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center">
                    {has && <CheckIcon size={20} weight="light" aria-hidden />}
                  </span>
                  <span className={`min-w-0 flex-1 truncate ${has ? "font-medium" : ""}`}>
                    {list.name}
                  </span>
                  <span className="shrink-0 text-sm text-slate tabular-nums">
                    {list.trackIds.length}곡
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* 선 하나로 나눈다. 위는 **있는 것 중에 고르는** 자리고 아래는
          **없는 것을 만드는** 자리라, 줄이 이어져 있으면 새 리스트가 목록의
          마지막 항목처럼 읽힌다. 리스트가 없을 때는 나눌 것도 없다 */}
      <div className={`mt-4 ${playlists.length > 0 ? "border-t border-hair pt-3" : ""}`}>
        {/* 리스트가 없어도 여기서 끝낼 수 있다. 만들러 다른 화면에 갔다 오면
            담으려던 곡을 다시 찾아야 한다.

            **만들기만 한다. 창은 안 닫힌다.** 새 리스트는 맨 위에 생기고
            (`createPlaylist`), 담는 것은 그것을 한 번 더 누르는 일이다 —
            만들자마자 담고 닫아 버리면 방금 무엇이 생겼는지, 어디에 담겼는지를
            못 본 채로 창이 사라진다. 담기는 언제나 목록에서 고르는 한 가지
            동작이고, 여기는 고를 것을 늘리는 자리다 */}
        <button
          type="button"
          onClick={() => createPlaylist()}
          className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left font-medium transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
        >
          {/* 아이콘 자리가 위의 체크 자리와 같은 폭이다. 안 맞추면 글자
              시작점이 한 줄만 어긋난다 */}
          <span className="grid h-6 w-6 shrink-0 place-items-center">
            <PlusIcon size={20} weight="bold" aria-hidden />
          </span>
          새 리스트 만들기
        </button>

        <button
          type="button"
          onClick={(event) => event.currentTarget.closest("dialog")?.close()}
          className="mt-1 h-11 w-full rounded-btn text-sm text-slate transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
        >
          닫기
        </button>
      </div>
    </dialog>
  );
}
