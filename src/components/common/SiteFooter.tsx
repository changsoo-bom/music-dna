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
    <footer className="mt-24 rounded-t-stadium bg-ink pt-20 pb-16 text-canvas max-sm:mt-16 max-sm:pt-14 max-sm:pb-12">
      <div className="shell">
        <span className="flex items-center gap-2.5 text-[15px] font-bold tracking-[0.02em]">
          <span aria-hidden className="relative block h-5 w-[34px]">
            <span className="absolute top-0 left-0 h-5 w-5 rounded-full bg-chart-2" />
            <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-chart-1" />
          </span>
          MY MUSIC DNA
        </span>

        <p className="mt-8 max-w-[52ch] text-sm leading-relaxed text-canvas/70">
          검사 결과와 재생 이력은 이 브라우저에만 저장됩니다. 계정이 없고, 서버로 보내지 않습니다.
          곡 정보와 앨범 이미지는 YouTube 에서 가져옵니다.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-canvas/25 pt-7 text-[13px] text-canvas/70 max-sm:mt-9">
          <span>© 2026 Music DNA</span>
          <span>포트폴리오용으로 만든 화면입니다.</span>
        </div>
      </div>
    </footer>
  );
}
