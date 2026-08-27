import Link from "next/link";

/**
 * 잉크 블랙 푸터. **시스템이 규정한 세 번째 표면이지 다크 모드가 아니다**
 * (`docs/design-reference.md`). 위쪽 두 모서리만 스타디움 반경으로 깎여
 * 페이지가 여기서 닫힌다는 걸 보여 준다.
 *
 * 프로토타입은 4열 링크 판이지만 여기는 저작권 줄만 둔다. 갈 곳이 없는
 * 링크를 열다섯 개 만드는 것보다 **없는 편이 정직하다** — 누르면 아무 일도
 * 안 일어나는 것을 만들지 않는다는 판단을 이 저장소에서 계속 지켜 왔다.
 *
 * 대신 실제로 밝혀야 하는 두 가지를 적는다. 곡 정보와 썸네일의 출처,
 * 그리고 검사 결과가 브라우저 밖으로 안 나간다는 사실. 계정을 두지 않기로
 * 한 결정이 사용자에게 어떤 뜻인지는 말해 줘야 한다.
 *
 * 연도는 고정 값이다. `new Date()` 를 써도 이 페이지는 정적으로 미리
 * 그려지므로 빌드 시점에 얼어붙는다 — 자동으로 바뀌는 척하지 않는다.
 */
export function SiteFooter() {
  return (
    <footer className="site-foot mt-20 rounded-t-stadium bg-ink pt-12 pb-9 text-canvas max-sm:mt-14 max-sm:pt-9 max-sm:pb-7">
      <div className="shell">
        {/* 좁아지면 세로로 쌓는다. 한 줄로 두면 워드마크 옆에서
            안내 문장이 한 글자씩 끊긴다 */}
        <div className="flex max-lg:flex-col max-lg:gap-5">
          {/* w-fit 이 없으면 세로로 쌓일 때 링크가 한 줄을 통째로 차지한다 —
              워드마크 오른쪽 빈 자리를 눌러도 홈으로 간다 */}
          <Link
            href="/"
            className="flex w-fit items-center gap-2.5 text-[15px] font-bold tracking-[0.02em] transition-opacity hover:opacity-70"
          >
            <span aria-hidden className="relative block h-5 w-[34px]">
              <span className="absolute top-0 left-0 h-5 w-5 rounded-full bg-chart-2" />
              <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-chart-1" />
            </span>
            MY MUSIC DNA
          </Link>

          {/* **"서버로 보내지 않습니다" 였다.** 결과를 쿠키에도 두면서 그 말이
              사실이 아니게 됐다 — 쿠키는 매 요청에 실려 간다. 첫 화면을 서버가
              그리게 하려고 한 일이고, 읽어서 그릴 뿐 어디에도 안 남긴다.
              지키는 약속만 적는다. → `src/lib/preference-cookie.ts` */}
          <p className="ml-auto text-[13px] leading-relaxed text-canvas/70 max-lg:ml-0">
            검사 결과와 재생 이력은 이 브라우저에 저장됩니다. 계정이 없고, 서버에 남기지 않습니다.
            곡 정보와 앨범 이미지는 YouTube 에서 가져옵니다.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-canvas/25 pt-6 text-[13px] text-canvas/70 max-sm:mt-6">
          <span>© 2026 Music DNA</span>
        </div>
      </div>
    </footer>
  );
}
