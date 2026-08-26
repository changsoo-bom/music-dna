import Image from "next/image";

/**
 * 검색어가 가수였을 때 화면 맨 위에 서는 카드. **이 카드가 제목 자리를
 * 대신한다** — 사람을 찾아온 사람에게 `"NewJeans" 4곡` 은 결과의 개수지
 * 찾던 대상이 아니다. 그래서 이름이 `h1` 이다.
 *
 * **출처를 가리지 않는다.** 카탈로그에 있는 가수든 YouTube 에서 찾아온
 * 가수든 같은 카드가 그린다 — 두 벌로 두면 한쪽만 고치는 날이 온다. 대신
 * 값의 모양을 낮춰서 받는다(`meta` 는 이미 만들어진 한 줄): 카탈로그는
 * 곡 수와 장르를, 채널은 구독자 수를 말하는데 그 둘은 합칠 수 있는 값이
 * 아니다 → `app/(site)/search/page.tsx`
 *
 * **없는 줄은 안 그린다.** 자리를 잡아 두고 비워 두면 카드가 고장 난 것처럼
 * 보인다 → `RemoteArtist`
 *
 * 서버 컴포넌트다. 누를 것이 없는 카드라 클라이언트로 내려갈 이유가 없다
 * → `.claude/rules/structure.md` 의 `"use client"` 는 leaf 에만
 *
 * 표면은 곡 줄과 같다(`bg-lifted` · `rounded-btn`). 가수는 곡보다 큰 것이지
 * 다른 종류의 것이 아니라서, 여기만 다른 종이를 쓰면 한 화면에 표면이 두 벌
 * 생긴다 → `PlaylistCard`
 */
export function ArtistCard({
  name,
  thumbnail,
  meta,
  about,
}: {
  name: string;
  thumbnail?: string;
  /** 이름 아래 한 줄. `4곡 · 국내 · 케이팝` 이거나 `구독자 123만` */
  meta?: string;
  about?: string;
}) {
  return (
    <div className="mt-5 flex items-center gap-6 rounded-btn bg-lifted p-6 max-sm:mt-4 max-sm:gap-4 max-sm:p-4">
      {thumbnail && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-ghost max-sm:h-20 max-sm:w-20">
          {/* **`sizes` 는 상자 폭이 아니라 그려지는 폭이다.** 카탈로그 쪽
              썸네일은 16:9(320×180)고 상자는 정사각형이라 `object-cover` 가
              높이를 맞춰 확대한다 — 96px 상자에 실제로 깔리는 폭은
              96 × 16/9 ≒ 171px 다. 96 을 적으면 브라우저가 그만한 후보를
              골라서 171px 로 늘려 그린다. 그게 뭉개짐이었다
              → `PlayerBar` · `PlaylistCard` 에 같은 계산이 적혀 있다.

              채널 사진(정사각형)에는 이 값이 두 배쯤 크다. 후보를 하나 더
              내려받는 대신 가로세로를 안 따지는 쪽을 골랐다 — 두 출처가
              한 상자를 쓰는데 `sizes` 만 갈라지면, 다음에 고치는 사람이
              둘 중 어느 쪽 수인지 알 수 없다 */}
          <Image src={thumbnail} alt="" fill sizes="176px" className="object-cover" />
        </div>
      )}

      <div className="min-w-0">
        <p className="eyebrow text-slate">가수</p>
        <h1 className="mt-2 truncate text-[clamp(26px,2.6vw,34px)] leading-[1.1] tracking-[-0.02em]">
          {name}
        </h1>
        {meta && <p className="mt-1.5 text-sm tabular-nums text-slate">{meta}</p>}
        {about && <p className="mt-2 line-clamp-2 max-w-[52ch] text-sm text-slate">{about}</p>}
      </div>
    </div>
  );
}

/** 구독자 수를 사람이 읽는 단위로. `1234567` → `123만` */
export function readableCount(value: number) {
  if (value >= 100_000_000) return `${Math.floor(value / 100_000_000)}억`;
  if (value >= 10_000) return `${Math.floor(value / 10_000)}만`;
  if (value >= 1_000) return `${Math.floor(value / 1_000)}천`;
  return String(value);
}
