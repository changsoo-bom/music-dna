"use client";

import { CheckIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { PlaylistPickerPop } from "@/components/library/PlaylistPickerPop";
import { usePop } from "@/hooks/use-pop";
import type { CatalogTrack } from "@/types/music";

/**
 * 곡을 리스트에 담는 버튼. 곡이 나오는 자리마다 같은 모양으로 붙는다.
 *
 * **누르면 어느 리스트에 담을지 고르는 창이 열린다**(`PlaylistPickerPop`).
 * 한때는 여기서 바로 하나뿐인 보관함에 넣었는데, 리스트가 여럿이 되자
 * 이 버튼만으로는 **어디에** 담을지를 말할 수 없게 됐다. 담고 빼는 일은
 * 창 안에서 리스트별로 한다.
 *
 * 담기 전 아이콘은 **맨 +** 다. 폴더·파일 모양을 얹어 봤는데, 32px 로도
 * 종이 접힌 자리와 + 가 같이 들어가서 줄 오른쪽 끝에서는 그냥 얼룩으로
 * 읽혔다. 무엇에 담기는지는 옆의 목록이 이미 말하고 있다.
 *
 * 이름 뒤에 `Icon` 이 붙은 쪽을 쓴다. Phosphor 2.1 부터 접미사 없는 이름은
 * deprecated 다 — 이 저장소의 다른 아이콘들은 아직 옛 이름이다.
 *
 * **원이 없다. 아이콘 하나로 선다.** 알약과 원은 이 시스템에서 떠 있는
 * 것들의 모양이고(네비 필·칩·위성 재생 버튼), 목록의 곁다리 조작에까지
 * 붙이면 카드마다 떠 있는 것이 둘이 되어 재생 버튼과 같은 무게로 읽힌다.
 * 과녁은 그대로 40px 이고 배경만 없다 — 안 보이는 것은 배경이지 과녁이 아니다.
 *
 * **담긴 상태를 색이 아니라 아이콘으로 말한다.** 담기 전과 체크는 형태가 달라서
 * 색을 못 보는 사람도 구분된다. 색은 거들 뿐이다(슬레이트 → 잉크).
 * 체크는 **어느 리스트엔가 담겼다**는 뜻이고, 어느 리스트인지는 창을 열면
 * 나온다. `aria-pressed` 는 안 쓴다 — 이 버튼은 담는 것이 아니라 창을 여는
 * 것이라 눌린 상태가 없다. 대신 `aria-haspopup`·`aria-expanded` 다.
 *
 * 값을 그리는 자리가 아니라 조작이므로 `--signal` 을 안 쓴다
 * → `.claude/rules/styling.md`
 *
 * **담겼는지는 부모가 판정해서 내려준다.** 여기서 `useSavedTrackIds()` 를
 * 부르면 줄마다 스토어를 구독한다 — 아홉 줄이면 구독이 아홉 개고, 한 번
 * 담을 때마다 아홉 번의 `JSON.parse` 가 돈다. 재생 상태를 다루는 방식과 같다
 * → `TrackRow`
 */
export function LibraryButton({
  track,
  saved,
  className = "",
}: {
  track: CatalogTrack;
  saved: boolean;
  className?: string;
}) {
  const picker = usePop();
  const Icon = saved ? CheckIcon : PlusIcon;

  return (
    <>
      <button
        type="button"
        onClick={picker.show}
        aria-expanded={picker.open}
        aria-haspopup="dialog"
        aria-label={`${track.title} 리스트에 담기`}
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none ${
          saved ? "text-ink" : "text-slate hover:text-ink"
        } ${className}`}
      >
        {/* `key` 가 바뀌면 새 요소라 애니메이션이 다시 돈다 — 뺄 때는 안 튄다.
            담는 것은 남기는 조작이고, 빼는 것은 되돌리는 조작이다 */}
        <Icon key={String(saved)} className={saved ? "tuck" : ""} size={24} weight="light" aria-hidden />
      </button>

      {/* 열려 있는 동안에만 그린다. 줄마다 창을 미리 만들어 두면 아홉 줄에
          리스트 구독이 아홉 개 붙는다.

          `mounted` 는 닫히는 전환까지 포함이다 — `open` 이 꺼지는 즉시
          걷어 가면 나가는 모습이 안 보인다 → `usePop` */}
      {picker.mounted && <PlaylistPickerPop state={picker} track={track} />}
    </>
  );
}
