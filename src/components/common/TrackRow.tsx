"use client";

import { Pause, Play } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { LibraryButton } from "@/components/common/LibraryButton";
import { formatDuration } from "@/lib/format";
import { isCatalogTrack, isPlayable } from "@/lib/use-player-store";
import type { AnyTrack } from "@/types/music";

/**
 * 곡 한 줄. 커버 + 옆으로 붙은 글자, 오른쪽 끝에 보관함 버튼.
 * 빠른 선곡·보관함·전체보기·전체 화면의 재생목록이 **전부 이걸 쓴다** —
 * 같은 곡을 네 화면이 다르게 그릴 이유가 없고, 한쪽만 고쳐서 어긋나는 일도
 * 여기서는 안 생긴다. 전에 전체 화면이 자기 몫을 따로 갖고 있었는데,
 * 재생 불가 처리를 이쪽에만 넣자마자 둘이 갈라지기 시작했다.
 *
 * **두 모양이 있다.**
 *
 * - 기본: 크림 캔버스 위에 놓이는 줄. 커버 56px 원, 표면이 있다.
 * - `compact`: 다른 표면 **위에** 놓이는 줄(전체 화면 시트). 커버 44px 사각,
 *   표면 없이 호버에만 깔린다 — 시트가 이미 한 겹이라 그 위에 또 얹으면
 *   종이가 세 겹이 된다.
 *
 * **커버 56px 은 썸네일 원본을 안 늘리는 크기다**(320×180 을 정사각으로
 * 자르면 180px). 정사각 카드로 크게 그렸을 때는 1.6배로 늘어나 눈에 띄게
 * 뭉갰다.
 *
 * **줄은 가만히 있을 때부터 표면을 갖는다**(기본 모양). 호버에만 배경을 주면
 * 평소에는 글자만 떠 있는 목록이라 허전하고, 어디까지가 한 곡인지도 안 보인다.
 * 크림 캔버스 위의 `bg-lifted` 가 기본이고, 포인터가 올라오면 `bg-white` +
 * `shadow-lift` 로 한 단계 떠오른다 — 시스템이 정한 세 표면의 순서 그대로다.
 * 지금 나는 곡은 그 떠오른 상태로 고정된다.
 *
 * **재생 버튼과 보관함 버튼은 형제다.** 한때 줄 전체가 버튼 하나였는데,
 * 버튼 안에 버튼을 넣을 수 없어서 보관함이 들어올 자리가 없었다. 재생 과녁은
 * 여전히 줄 전체고, 보관함만 그 위에 얹혀 오른쪽 끝을 차지한다. 글자가 그
 * 밑으로 들어가지 않게 오른쪽 여백을 버튼 폭만큼 비워 둔다(`pr-14`).
 *
 * 재생 상태와 보관 여부는 부모가 판정해서 내려준다. 줄마다 스토어를 구독하면
 * 아홉 줄이 아홉 번 깨어난다.
 */
export function TrackRow({
  track,
  isCurrent,
  saved,
  onPlay,
  compact = false,
  savable = true,
}: {
  track: AnyTrack;
  isCurrent: boolean;
  saved: boolean;
  onPlay: () => void;
  /** 다른 표면 위에 놓이는 좁은 모양. 전체 화면 시트의 재생목록이 쓴다 */
  compact?: boolean;
  /** 담기 버튼을 뺀다. **리스트 상세처럼 이미 담긴 것만 모인 목록**에서는
      모든 줄이 체크 표시로 켜져 있어서 아무 것도 구별해 주지 않는다 —
      거기서 곡을 빼는 것은 머리줄의 "선택하기" 가 한다 → `PlaylistDetail` */
  savable?: boolean;
}) {
  const length = formatDuration(track.duration);
  const Icon = isCurrent ? Pause : Play;
  // 담을 수는 있는데 틀 수는 없는 곡이 있다 — 카탈로그가 배치로 채워지는 중이라
  // `youtubeId` 가 아직 안 붙은 자리가 남는다. 그런 줄은 보이되 안 눌린다.
  const playable = isPlayable(track);
  /* **카탈로그 밖의 곡은 못 담는다.** 리스트는 id 만 저장하고 읽을 때 카탈로그에서
     되찾는데(`toTracks`), 검색이 YouTube 에서 찾아온 곡은 거기 없어서 담아도
     다음에 열면 사라진다. 버튼을 안 그리는 것이 담기고 사라지는 것보다 낫고,
     호출부가 `savable` 을 기억하는 데 기대지 않는다 → `RemoteTrack`

     오른쪽 여백이 이 값을 같이 본다. `savable` 만 보면 버튼 없는 줄에 40px 이
     빈 채로 남아서 곡 길이가 줄 끝에서 떨어져 뜬다 */
  const hasSaveButton = savable && isCatalogTrack(track);

  const surface = compact
    ? "hover:bg-lifted"
    : `${isCurrent ? "bg-white shadow-lift" : "bg-lifted"} ${playable ? "hover:bg-white hover:shadow-lift" : ""}`;

  return (
    <div className="relative">
      {/* **`disabled` 가 아니라 `aria-disabled` 다.** `disabled` 버튼은 탭
          순서에서 빠지고 낭독기도 건너뛴다 — 곡 제목과 아티스트가 이 버튼
          안에만 있어서, 그러면 재생 불가 곡은 **이름조차 안 읽힌다.**
          흐린 것은 눈에만 보이는 정보다.
          포커스와 낭독은 살려 두고 누르는 것만 여기서 막는다. */}
      <button
        type="button"
        onClick={() => {
          if (playable) onPlay();
        }}
        aria-disabled={!playable}
        aria-label={
          playable
            ? `${track.artist} ${track.title} ${isCurrent ? "일시정지" : "재생"}`
            : `${track.artist} ${track.title} 재생할 수 없음`
        }
        className={`group flex w-full items-center gap-4 rounded-btn text-left transition duration-200 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none ${
          compact ? "py-2.5 pl-3" : "py-3.5 pl-4"
        } ${
          // 오른쪽 여백은 담기 버튼 자리다. 버튼이 없으면 그만큼 비워 둘
          // 이유도 없다 — 곡 길이가 줄 끝에서 40px 떨어져 뜬다
          hasSaveButton ? "pr-14" : "pr-4"
        } ${surface} ${playable ? "" : "opacity-55"}`}
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-ghost ${
            compact ? "h-11 w-11 rounded-btn" : "h-14 w-14 rounded-full"
          }`}
        >
          {/* 커버는 유튜브가 갖고 있다. 틀 수 없는 곡은 커버도 없으므로
              회색 원만 남는다 — 깨진 이미지 아이콘보다 조용하다.
              16:9 를 정사각형에 덮으므로 실제로 깔리는 폭은 1.78배다 —
              `sizes` 는 상자 폭이 아니라 그 폭이다. 56 을 적으면 w=64 후보를
              100px 로 늘려 그려서 뭉개진다 → `PlayerBar` */}
          {playable && (
            <Image
              src={`https://i.ytimg.com/vi/${track.youtubeId}/mqdefault.jpg`}
              alt=""
              fill
              sizes={compact ? "80px" : "100px"}
              className="object-cover"
            />
          )}

          {/* 커버를 덮어 어둡게 깔고 그 위에 아이콘.
              지금 나는 곡은 계속 보이고, 나머지는 포인터가 올라올 때만 보인다.
              opacity 만 움직인다 — 커버는 사진이라 아이콘이 그냥 얹히면 안 읽힌다. */}
          <div
            className={`absolute inset-0 grid place-items-center bg-ink/45 text-white transition-opacity duration-200 ${
              isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } ${playable ? "" : "hidden"}`}
          >
            {/* 재생 삼각형을 따로 밀지 않는다 — Phosphor 의 `Play`(fill)는
                잉크가 박스 안에서 이미 오른쪽에 그려져 있다 */}
            <Icon size={compact ? 16 : 18} weight="fill" aria-hidden />
          </div>
        </div>

        {compact ? (
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[15px] tracking-[-0.01em] ${isCurrent ? "font-medium" : ""}`}>
              {track.title}
            </p>
            <p className="truncate text-[13px] text-slate">{track.artist}</p>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-[17px] tracking-[-0.01em]">{track.title}</p>
            {/* 길이는 아티스트와 달리 **안 잘린다.** 좁은 칸에서 먼저
                사라지는 건 긴 이름이어야 하고, 3:47 은 네 글자다. */}
            <p className="mt-0.5 flex items-baseline text-sm text-slate">
              <span className="truncate">{track.artist}</span>
              {length && <span className="shrink-0 tabular-nums">&nbsp;· {length}</span>}
            </p>
          </div>
        )}

        {/* 좁은 모양에서는 길이가 오른쪽 끝에 선다. 줄이 얇아서 두 줄짜리
            글자 덩어리 안에 넣으면 아티스트와 붙어 한 덩어리로 읽힌다 */}
        {compact && length && (
          <span className="shrink-0 text-[13px] tabular-nums text-slate">{length}</span>
        )}
      </button>

      {hasSaveButton && (
        <LibraryButton
          track={track}
          saved={saved}
          className="absolute top-1/2 right-3 -translate-y-1/2"
        />
      )}
    </div>
  );
}
