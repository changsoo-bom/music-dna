"use client";

import { PencilSimpleIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { TrackRow } from "@/components/common/TrackRow";
import { Arrow, ButtonLink, buttonClass } from "@/components/ui/Button";
import { ConfirmPop } from "@/components/ui/ConfirmPop";
import { NAV_BACK } from "@/constants/nav";
import { useStoredValue } from "@/hooks/use-stored-value";
import { removePlaylistTracks, renamePlaylist } from "@/lib/playlists";
import { toTracks } from "@/lib/schemas/played";
import { parsePlaylists } from "@/lib/schemas/playlist";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";

const ICON_BUTTON =
  "grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none";

/**
 * 목록 머리줄의 텍스트 버튼. **라벨과 같은 13px 이다** —
 * `buttonClass("text")` 는 16px 이라 옆의 "담긴 곡" 보다 커져서, 곁가지인
 * 조작이 목록 이름보다 무겁게 읽힌다 → `Button`
 */
const ROW_ACTION =
  "text-[13px] font-medium tracking-[-0.01em] text-ink transition-opacity hover:opacity-55 disabled:pointer-events-none disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none";

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
  /** 고치는 중인 이름. **`null` 이면 안 고치는 중이다** — 열림 여부와 초안을
      한 값에 둔다. 둘로 나누면 닫을 때마다 초안을 따로 비워야 하고, 한 번
      빼먹으면 다음에 열었을 때 지난 초안이 남는다 */
  const [draft, setDraft] = useState<string | null>(null);
  /** 고른 곡. **`null` 이면 선택 모드가 아니다** — 이름 초안과 같은 방식이다.
      나갈 때 고른 것이 남아 있으면 다음에 켰을 때 이미 체크된 줄이 보인다 */
  const [picked, setPicked] = useState<ReadonlySet<string> | null>(null);
  /** 빼기 전에 한 번 묻는 중. **되돌리기가 화면에 없다** — 리스트를 지울 때와
      같은 이유다(`PlaylistCard`). 여기는 여러 곡이 한 번에 빠져서 잘못
      눌렀을 때 다시 담는 값이 더 크다 */
  const [asking, setAsking] = useState(false);
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
        {draft !== null ? (
          /* **나가는 문은 취소와 저장 둘뿐이다.** 전에는 blur 가 저장이었는데,
             옆을 한 번 눌렀을 뿐인데 이름이 바뀌어 있었다 — 되돌리기가 없는
             화면에서 초점이 빠지는 것이 곧 결정이면 안 된다. 지금 blur 는
             아무 일도 안 한다 */
          <div className="row-enter flex w-full items-end gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-3">
            <div className="relative max-w-[500px] flex-1">
              <input
                // 열릴 때 초점과 전체 선택. ref 콜백이라 effect 가 필요 없다
                ref={(el) => el?.select()}
                value={draft}
                onChange={(event) => setDraft(event.currentTarget.value)}
                aria-label="리스트 이름"
                maxLength={40}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    renamePlaylist(playlist.id, draft);
                    setDraft(null);
                  }
                  if (event.key === "Escape") setDraft(null);
                }}
                // 상자가 아니라 **밑줄 하나다.** 제목 자리에 흰 상자가 들어오면
                // 고치는 동안 이 화면에 종이가 한 겹 더 생긴다. 글자는 제자리에
                // 있고 밑에 줄만 그어지면 무엇을 고치는 중인지가 바로 읽힌다
                className="w-full border-b-2 border-ink bg-transparent pb-1 pr-11 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-0.02em] focus-visible:outline-none"
              />

              {/* 한 번에 비운다. 자동 생성된 이름(`20260825 (2)`)을 다른 이름으로
                  갈아 끼우는 것이 이 화면의 거의 전부라, 지우는 데 스무 번을
                  누르게 하면 안 된다. 비어 있으면 지울 것도 없으니 안 나온다.
                  `onMouseDown` 을 막아 초점을 입력칸에 붙여 둔다 — 지우고 바로
                  타이핑이 이어진다 */}
              {draft && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setDraft("")}
                  aria-label="이름 지우기"
                  className="absolute right-0 bottom-1.5 grid h-9 w-9 place-items-center rounded-full text-slate transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
                >
                  <XIcon size={20} weight="bold" aria-hidden />
                </button>
              )}
            </div>

            {/* 텍스트 버튼이다. 이름 바꾸기는 이 화면의 주 행동이 아니라
                제목 밑에 잠깐 열리는 곁가지다 — 필 버튼 두 개를 놓으면
                무게가 곡 목록보다 무거워진다 → `Button`
                빈 이름은 저장이 조용히 무시하므로(`renamePlaylist`) 아예 막는다.

                **입력칸 오른쪽에 나란히 선다.** 밑줄이 500px 을 다 쓰지 않으니
                아래로 한 줄을 더 내려 쓸 이유가 없고, 제목 아래에 붙는 것이
                줄어들수록 목록이 위로 올라온다. `items-end` 라 버튼 밑변이
                밑줄과 같은 선에 놓인다. 좁은 화면에서만 아래로 접힌다 */}
            <div className="flex items-center gap-6 pb-1">
              <button type="button" onClick={() => setDraft(null)} className={buttonClass("text")}>
                취소
              </button>
              <button
                type="button"
                disabled={!draft.trim()}
                onClick={() => {
                  renamePlaylist(playlist.id, draft);
                  setDraft(null);
                }}
                className={buttonClass("text")}
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 고치고 나오면 제목도 같이 들어온다 — 밑줄이 사라지는 순간
                제목이 제자리에 그냥 박혀 있으면 저장이 됐는지가 안 읽힌다 */}
            <h1 className="row-enter min-w-0 text-[clamp(28px,3.4vw,40px)] leading-[1.1] break-all">
              {playlist.name}
            </h1>
            <button
              type="button"
              onClick={() => setDraft(playlist.name)}
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
        /* **전체 화면의 재생목록과 같은 모양이다** → `PlayedQueue`
           작은 굵은 라벨 하나 얹고 바로 줄이 이어진다. 줄 자체는 이미 같은
           것을 쓰고 있었다(`compact`).

           **폭은 안 묶는다.** 한때 560px 로 좁혔는데, 이 화면은 시트가 아니라
           페이지고 위의 제목·날짜가 이미 단 폭을 다 쓴다 — 목록만 반쯤에서
           끊기면 오른쪽이 통째로 빈다.

           스크롤 상자로 만들지도 않는다(`.scroll-panel`). 저기는 시트 안이라
           목록만 움직여야 하지만 여기서는 페이지가 스크롤하는 게 맞다 */
        <section className="mt-12">
          {/* 라벨 밑에 실선 한 줄. **여기 한 줄뿐이다** — 줄마다 그으면 곡 사이에
              칸막이가 생기고, 호버로 뜨는 표면(`hover:bg-lifted`)과 선이 겹쳐
              같은 경계를 두 번 그린다. 목록이 어디서 시작하는지만 말하면 된다 */}
          <div className="flex items-center justify-between border-b border-hair pb-3">
            <h2 className="text-[13px] font-bold text-slate">담긴 곡</h2>

            {/* **같은 자리에서 모드가 바뀐다.** "선택하기" 가 있던 곳이 그대로
                "취소 · 삭제" 가 되므로, 선택 모드에 들어갔다는 것을 체크박스가
                나타나기 전에 여기서 먼저 알 수 있다 */}
            {picked ? (
              <div className="row-enter flex items-center gap-5">
                <button type="button" onClick={() => setPicked(null)} className={ROW_ACTION}>
                  취소
                </button>
                {/* 하나도 안 골랐으면 누를 것이 없다 — 눌러도 아무 일이 없는
                    버튼은 고장으로 읽힌다 */}
                <button
                  type="button"
                  disabled={picked.size === 0}
                  onClick={() => setAsking(true)}
                  className={ROW_ACTION}
                >
                  삭제{picked.size > 0 && ` (${picked.size})`}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPicked(new Set())}
                className={`row-enter ${ROW_ACTION} text-slate`}
              >
                선택하기
              </button>
            )}
          </div>

          {/* **`key` 에 모드를 섞는다.** 선택 모드를 켜고 끌 때 목록이 다시
              마운트되면서 `row-shift` 가 한 번 더 돈다 — 클래스만 붙여 두면
              처음 그릴 때만 돌고, 정작 자리가 밀리는 순간에는 안 돈다.
              **`ul` 에 건다.** 줄마다 걸면 곡이 하나씩 따로 움직인다 */}
          <ul key={picked ? "pick" : "plain"} className="row-shift mt-3 flex flex-col">
            {tracks.map((track) => (
              <li key={track.id} className="flex items-center gap-1">
                {/* **네이티브 체크박스다.** 직접 그리면 포커스 링·키보드
                    토글·낭독기 상태를 전부 다시 만들어야 한다. 색만 잉크로
                    맞춘다.

                    줄을 통째로 선택 과녁으로 바꾸지 않는다 — 선택 모드에서도
                    곡은 눌러서 들어 보고 지울지 정한다 */}
                {picked && (
                  <input
                    type="checkbox"
                    checked={picked.has(track.id)}
                    onChange={(event) => {
                      const next = new Set(picked);
                      if (event.currentTarget.checked) next.add(track.id);
                      else next.delete(track.id);
                      setPicked(next);
                    }}
                    aria-label={`${track.title} 선택`}
                    className="h-5 w-5 shrink-0 accent-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <TrackRow
                    compact
                    savable={false}
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
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 리스트를 지울 때와 같은 창을 쓴다 → `PlaylistCard`
          곡은 카탈로그에서 사라지는 게 아니라 이 리스트에서만 빠진다.
          그것까지 말해 줘야 "삭제" 가 어디까지 가는지가 읽힌다 */}
      {asking && picked && (
        <ConfirmPop
          title="삭제하시겠습니까?"
          detail={`고른 ${picked.size}곡이 이 리스트에서 빠집니다. 곡 자체는 남아 있고, 다시 담을 수 있습니다.`}
          onConfirm={() => {
            removePlaylistTracks(playlist.id, picked);
            setPicked(null);
            // **여기서도 닫는다.** `onClose` 는 `<dialog>` 가 실제로 닫힐 때
            // 오는데, 그 전에 `picked` 가 비면서 이 창이 먼저 언마운트된다 —
            // 이벤트를 받을 것이 없어져 `asking` 이 켜진 채로 남고, 다음에
            // "선택하기" 를 누르는 순간 창이 저절로 열린다
            setAsking(false);
          }}
          onClose={() => setAsking(false)}
        />
      )}
    </>
  );
}
