"use client";

import { Play } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { TrackRow } from "@/components/common/TrackRow";
import { useSavedTrackIds } from "@/hooks/use-playlists";
import { browseGroups } from "@/lib/browse";
import { browseSoundingId, isPlayable, usePlayerStore } from "@/lib/use-player-store";
import type { Genre, Region } from "@/types/music";

/**
 * 둘러보기의 곡 목록.
 *
 * **좁히는 값은 주소에서 온다**(`region` · `genre`). 색인과 스위치는 링크고
 * 이 화면은 고른 값을 받기만 한다 — 뒤로가기·공유가 공짜로 따라온다
 * → `.claude/rules/state.md` · `GenreRail`
 *
 * 좁히는 규칙 자체는 `browseGroups` 한 곳에 있다. 머리글의 곡 수는 서버가
 * 세고 목록은 여기서 그리는데, 두 곳이 각자 세면 언젠가 어긋난다.
 *
 * 두 축은 곱해진다. 국내 힙합처럼 둘 다 고른 화면이 정상이고, 그 교집합이
 * 비면 "여기엔 아직 곡이 없다" 고 말한다 — 빈 목록만 남기면 고장으로 읽힌다.
 *
 * 구독은 둘뿐이다(재생 중인 곡 하나, 보관함 하나). 줄마다 구독하면
 * 100줄이 100번 깨어난다 → `TrackRow`
 */

/** 접힌 칸이 보여주는 곡 수. 2열이라 세 줄로 떨어진다 */
const PREVIEW = 6;

export function BrowseList({ region, genre }: { region: Region | null; genre: Genre | null }) {
  const play = usePlayerStore((state) => state.play);
  const toggle = usePlayerStore((state) => state.toggle);
  // 이 화면의 큐는 둘이다(줄 클릭 `browse` · 칸의 전체 재생 `browse:{genre}`).
  // 어느 쪽으로 틀었든 표시는 그 줄에 붙어야 한다 → `browseSoundingId`
  const sounding = usePlayerStore(browseSoundingId);
  // 어느 쪽 큐로 틀었는지. 칸 버튼이 자기가 튼 칸을 다시 누른 것인지 판별한다
  const queueId = usePlayerStore((state) => state.queueId);
  const savedIds = useSavedTrackIds();

  /* 펼침은 **주소로 안 나간다.** 좁히는 값(`region`·`genre`)과 달리 이건
     보여주는 양이라, 링크로 받은 사람이 같은 것을 봐야 할 이유가 없다
     → `.claude/rules/state.md` 의 "클라이언트 전용 UI" */
  const [expanded, setExpanded] = useState<ReadonlySet<Genre>>(new Set());

  const groups = browseGroups(region, genre);

  /* 칸을 하나만 골랐으면 접지 않는다 — 그 화면은 이미 그 칸만 본다.
     전체 화면에서만 앞 여섯 곡으로 접힌다. 카탈로그가 배치로 커지면서
     Pop 한 칸이 마흔 줄이 됐고, 그러면 아래 칸들이 스크롤 밖으로 밀린다 */
  const sections = groups.map((group) => ({
    ...group,
    shown:
      genre === null && !expanded.has(group.genre) ? group.tracks.slice(0, PREVIEW) : group.tracks,
  }));

  /**
   * 큐는 **지금 보이는 것 전부다.** 장르별로 끊으면 Pop 마지막 곡에서 재생이
   * 서고, 눈에 보이는 다음 줄과 다음에 나는 곡이 어긋난다. 반대로 안 보이는
   * 곡까지 넣으면 국내만 골라 놓고 틀었는데 해외 곡이 이어진다 — 좁힌 것이
   * 목록에만 걸리고 재생에는 안 걸리는 셈이다.
   *
   * 접힌 곡도 마찬가지로 안 보이는 곡이다. 여섯 번째를 눌러 놓고 일곱 번째가
   * 나면, 화면 어디에도 없는 곡이 재생 중으로 표시된다.
   */
  const queue = sections.flatMap((section) => section.shown).filter(isPlayable);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-slate">
        고른 조건에 맞는 곡이 아직 없습니다. 왼쪽에서 다른 칸을 눌러 보세요.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-14 max-sm:gap-10">
      {sections.map((section) => {
        // 틀 수 있는 것만 튼다. 카탈로그가 배치로 채워지는 중이라 `youtubeId`
        // 가 아직 안 붙은 곡이 섞여 있다 → `TrackRow`
        const groupQueue = section.tracks.filter(isPlayable);
        const groupId = `browse:${section.genre}` as const;
        const foldable = genre === null && section.tracks.length > PREVIEW;
        const open = section.shown.length === section.tracks.length;

        return (
          <section key={section.genre}>
            {/* 장르 이름과 조작이 헤어라인 한 줄을 나눠 쓴다. 목록이 여러 칸으로
                이어질 때 그 줄이 칸의 시작을 말한다 — 큰 여백만으로는 스크롤
                중에 어디서 갈렸는지가 안 읽힌다.

                색인에서 장르를 하나만 골랐으면 제목을 안 그린다 — 그 이름은
                왼쪽 기둥에도, 페이지 머리글에도 이미 있다. 같은 말이 세 번
                서면 어느 것이 주인인지가 흐려진다. 줄은 남는다: 헤어라인이
                목록의 시작을 말하고, 오른쪽 끝은 여전히 조작의 자리다 */}
            <div
              className={`flex items-baseline gap-4 border-b border-hair pb-3 ${
                genre === null ? "justify-between" : "justify-end"
              }`}
            >
              {genre === null && (
                <h2 className="min-w-0 truncate text-[19px] font-medium tracking-[-0.01em]">
                  {section.label}
                  <span className="ml-2.5 text-sm tabular-nums text-slate">
                    {section.tracks.length}
                  </span>
                </h2>
              )}

              {/* **이 칸만 튼다.** 큐가 이 장르로 끊기므로 마지막 곡 다음은
                  옆 칸이 아니라 라디오가 이어 붙인다(`radioPick`) — 버튼이
                  "전체 재생" 이라고 말했으면 그 전체가 어디까지인지가 목록과
                  같아야 한다. 줄을 눌러 트는 것은 여전히 화면 전체가 큐다.

                  텍스트 버튼이다. 이 화면에서 떠 있는 것은 스위치의 고른 칸
                  하나뿐이라, 여기에 알약을 놓으면 그 하나가 둘이 된다.
                  틀 수 있는 곡이 없으면 안 나온다 — 눌러도 아무 일이 없는
                  버튼은 고장으로 읽힌다 */}
              {groupQueue.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    // **전체를 튼다고 했으면 전체가 보여야 한다.** 접힌 채로
                    // 틀면 일곱 번째 곡부터는 화면 어디에도 없는 곡이 재생
                    // 중이 된다 — 위 `queue` 주석이 못박은 규칙이 여기에도
                    // 걸린다. 버튼이 "51곡 전체 재생" 이라고 말한 이상,
                    // 그 51곡이 곧 이 칸의 모습이어야 한다
                    if (foldable) {
                      setExpanded((prev) => new Set(prev).add(section.genre));
                    }
                    // **이 버튼은 토글이 아니다.** 재생 삼각형에 "전체 재생"
                    // 이라고 적혀 있는 것이 정지를 하면 안 된다. 그런데 스토어의
                    // `play` 는 같은 큐의 같은 곡이면 토글로 빠지므로, 이 칸을
                    // 이미 첫 곡부터 틀고 있는 경우가 정확히 거기 걸린다 —
                    // 그때는 이미 하라는 일을 하고 있으니 아무 일도 안 한다.
                    // 멈춰 있으면 `sounding` 이 `null` 이라 여기 안 걸리고
                    // 아래 `play` 가 토글로 빠져 이어 튼다.
                    if (queueId === groupId && sounding === groupQueue[0].id) return;
                    // **칸 전용 큐 이름이다**(`browse:{genre}`). 줄 클릭과 같은
                    // 이름을 쓰면 화면 첫 곡이 나는 중에 눌렀을 때 같은 토글
                    // 분기에 걸린다 → `QueueId`
                    play(groupId, groupQueue, 0);
                  }}
                  aria-label={`${section.label} ${groupQueue.length}곡 전체 재생`}
                  className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium tracking-[-0.01em] whitespace-nowrap text-ink transition-opacity hover:opacity-55 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
                >
                  {/* 재생 삼각형을 따로 밀지 않는다 — Phosphor 의 `Play`(fill)는
                      잉크가 박스 안에서 이미 오른쪽에 그려져 있다 */}
                  <Play size={13} weight="fill" aria-hidden />
                  전체 재생
                </button>
              )}
            </div>

            <ul className="mt-5 grid grid-cols-2 gap-3 max-md:grid-cols-1">
              {section.shown.map((track) => (
                <li key={track.id}>
                  <TrackRow
                    track={track}
                    isCurrent={sounding === track.id}
                    saved={savedIds.has(track.id)}
                    /* **아이콘과 행동이 같은 조건에서 갈린다.** 표시는 두 큐를
                       다 보는데(`sounding`) 누르는 쪽만 `"browse"` 로 좁으면,
                       칸의 전체 재생으로 튼 줄이 일시정지 아이콘을 달고도
                       눌렀을 때 안 멈춘다 — 큐만 화면 전체로 조용히 바뀐다.
                       지금 나는 곡을 누른 것은 언제나 일시정지다
                       → `soundingId` · `PlayerScreen` 의 재생목록 */
                    onPlay={() =>
                      sounding === track.id
                        ? toggle()
                        : play(
                            "browse",
                            queue,
                            queue.findIndex((item) => item.id === track.id),
                          )
                    }
                  />
                </li>
              ))}
            </ul>

            {/* 접힌 쪽은 **남은 수를 적는다.** "더 보기" 만 있으면 한 번 더
                눌러야 끝인지, 서른 번을 더 눌러야 끝인지 누르기 전에는 모른다.
                한 번에 그 칸을 다 편다 — 여섯씩 끊어 여러 번 누르게 하면
                아래 칸으로 내려가는 길이 그만큼 멀어진다.

                펼친 쪽은 수를 안 적는다. 접으면 몇 곡이 되는지가 아니라
                **되돌린다**는 것이 이 버튼의 일이고, 그 수는 이미 칸 제목
                옆에 있다.

                자리는 안 옮긴다. 목록 끝에 그대로 두면 마흔 줄을 편 뒤
                되돌리려고 다시 위로 올라갈 필요가 없다.

                목록 폭 전체를 쓰는 헤어라인 테두리다. 알약을 놓으면 이 화면에서
                떠 있어야 할 국내·해외 스위치와 무게가 겹친다 → `RegionSwitch` */}
            {foldable && (
              <button
                type="button"
                aria-expanded={open}
                onClick={() =>
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (!next.delete(section.genre)) next.add(section.genre);
                    return next;
                  })
                }
                className="mt-3 flex h-12 w-full items-center justify-center rounded-btn border border-hair text-sm font-medium tracking-[-0.01em] text-slate transition-colors hover:border-dust hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
              >
                {open ? "접기" : `${section.label} ${section.tracks.length - PREVIEW}곡 더 보기`}
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
