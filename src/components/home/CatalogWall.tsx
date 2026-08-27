import Image from "next/image";

import { GENRES, PARENT_OF } from "@/constants/genres";
import { REGIONS } from "@/constants/regions";
import { CATALOG } from "@/data/catalog";
import type { CatalogTrack } from "@/types/music";

/** 한 벌에 들어가는 커버 수. 이 한 벌이 두 번 이어져 띠가 된다.
    적으면 같은 커버가 금방 돌아오고, 많으면 첫 화면에서 받는 이미지가 늘어난다 */
const SHOWN = 16;

/**
 * 장르를 돌아가며 한 곡씩 뽑는다. **카탈로그 순서대로 자르면 앞머리가
 * 전부 K-Pop 이다** — 파일이 장르 블록으로 적혀 있다. 돌아가며 뽑으면 한 벌
 * 안에 다섯 장르가 고르게 선다.
 */
function spread(): CatalogTrack[] {
  const byGenre = GENRES.map((genre) =>
    CATALOG.filter((track) => PARENT_OF[track.subGenre] === genre.id && track.youtubeId),
  );

  const picked: CatalogTrack[] = [];
  for (let round = 0; picked.length < SHOWN; round += 1) {
    for (const bucket of byGenre) {
      const track = bucket[round];
      if (track && picked.length < SHOWN) picked.push(track);
    }
    if (byGenre.every((bucket) => bucket.length <= round)) break;
  }
  return picked;
}

const covers = spread();

const perRegion = REGIONS.map(
  (region) => `${region.label} ${CATALOG.filter((track) => track.region === region.id).length}곡`,
);
const subGenres = new Set(CATALOG.map((track) => track.subGenre));

/**
 * 카탈로그의 벽. **검사 전 화면의 그림이다.**
 *
 * 제목이 "찾아보세요" 라고 부르는데 무엇에서 찾는지를 안 보여 주면 그 말이
 * 빈 초대가 된다.
 *
 * ## 도표를 지어내지 않는다
 *
 * 전에는 이 자리에 곡을 세로선으로 늘어놓은 지문 그림이 있었다. **납작했다** —
 * 높이가 곡 길이인데 카탈로그의 길이가 대부분 180~340초에 몰려 있어서, 막대가
 * 다 비슷하게 서고 결과적으로 잡음 띠가 됐다. 데이터에 없는 변화를 그림에서
 * 만들어 낼 수는 없다. 게다가 그 약한 그림을 캡션·축·범례 세 줄이 둘러싸서,
 * 설명이 그림보다 무거웠다.
 *
 * **음악 서비스에는 보여 줄 것이 이미 있다.** 앨범 아트는 지어낸 것이 아니고,
 * 곡마다 다르고, 색이 그 자체로 다양하다. 이 화면이 파는 것이 곡이라면
 * 화면에 서야 할 것도 곡이다.
 *
 * ## 천천히 흐른다
 *
 * **이 화면에서 유일하게 움직이는 것이다.** 그래서 느리다 — 빠르면 읽으려고
 * 눈이 따라가는데, 이 화면이 하려는 말은 "다섯 문항을 하자" 다. 움직임이
 * 하는 일은 목록이 여기서 끝나지 않는다고 말하는 것뿐이다.
 *
 * 포인터가 올라오면 선다. 곡 이름이 적혀 있으니 읽고 싶은 것이 맞다.
 * 모션을 끈 설정에서는 아예 안 움직인다 → `globals.css` 의 `drift`
 *
 * ## 커버는 정사각으로 자른다
 *
 * 유튜브 썸네일은 16:9 다. 정사각 상자에 `object-cover` 로 덮으므로 **실제로
 * 깔리는 폭이 상자의 1.78배**고, `sizes` 는 상자 폭이 아니라 그 폭이다 —
 * 상자 크기를 적으면 브라우저가 작은 후보를 골라 늘려 그린다 → `TrackRow`
 */
export function CatalogWall() {
  return (
    <figure className="mt-16 max-sm:mt-12">
      {/* 양 끝을 흐린다. 흐르는 띠라 두 끝이 다 이어지는 자리고, 딱 잘리면
          거기가 목록의 끝으로 읽힌다 */}
      <div className="drift-stage overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]">
        {/* 같은 목록을 두 벌 넣고 정확히 절반을 민다 → `globals.css` 의 `drift`.
            `w-max` 라 트랙이 제 내용만큼 넓어진다 — 부모 폭에 맞춰 줄어들면
            커버가 짜부라진다 */}
        <ul className="drift flex w-max">
          {[...covers, ...covers].map((track, index) => (
            <li
              key={index}
              // 두 번째 벌은 눈에만 있는 사본이다. 낭독기가 같은 곡을 두 번 읽을 이유가 없다
              aria-hidden={index >= covers.length}
              // 간격을 오른쪽 여백으로 준다. `gap` 이면 벌과 벌 사이에도
              // 한 번 들어가서 절반이 한 벌 폭과 어긋나고 이음매가 튄다
              className="w-[9.5rem] shrink-0 pr-3 max-lg:w-[8rem] max-sm:w-[6.5rem] max-sm:pr-2"
            >
              <div className="relative aspect-square overflow-hidden rounded-btn bg-ghost">
                <Image
                  src={`https://i.ytimg.com/vi/${track.youtubeId}/mqdefault.jpg`}
                  alt=""
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </div>
              {/* 곡 이름을 적는다. 커버만 늘어놓으면 벽지가 되고, 이 화면이
                  실제 곡을 갖고 있다는 것이 안 읽힌다 */}
              <p className="mt-2.5 truncate text-[13px] tracking-[-0.01em]">{track.title}</p>
              <p className="truncate text-[13px] text-slate">{track.artist}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* 한 줄이다. 그림이 말하는 것(이런 곡들이 있다)과 다른 것을 말한다
          — 얼마나, 어디까지 있는지. 위 문단이 이미 한 말을 되풀이하지 않는다.

          **총계와 내역을 무게로 가른다.** 넷을 가운뎃점으로 죽 이으면 어느
          숫자가 이 줄의 값인지가 안 보인다. 앞의 하나만 잉크로 세우면 나머지는
          그 값을 쪼갠 것으로 읽힌다 */}
      <figcaption className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm max-sm:mt-6">
        <span className="text-ink">카탈로그 {CATALOG.length}곡</span>
        <span className="text-slate">
          {perRegion.join(" · ")} · 장르 {subGenres.size}종
        </span>
      </figcaption>
    </figure>
  );
}
