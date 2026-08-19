const CHART = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

/**
 * 셋업 확인용 스펙 페이지. 폰트·토큰·반경·그림자가 실제로 물렸는지 한눈에 본다.
 * 실제 화면을 옮기기 시작하면 이 파일은 지운다. 원본은 design/prototype.html.
 */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-12 py-24">
      <h1 className="text-6xl leading-[1.04]">
        당신의 취향에는
        <br />
        지문이 있습니다
      </h1>

      <p className="mt-6 max-w-[52ch] text-slate">
        Sofia Sans 와 Noto Sans KR 이 물렸고, 본문은 450 weight 로 렌더된다.
      </p>

      <div className="mt-10 flex gap-3">
        <button className="rounded-btn border-[1.5px] border-ink bg-ink px-6 py-2.5 font-medium text-canvas">
          취향 분석하기
        </button>
        <button className="rounded-btn border-[1.5px] border-ink bg-white px-6 py-2.5 text-ink">
          샘플 리포트 보기
        </button>
      </div>

      <div className="mt-16 flex h-24 gap-0.5">
        {CHART.map((c) => (
          <div key={c} className={`flex-1 rounded-pill ${c}`} />
        ))}
      </div>

      <div className="rounded-stadium mt-16 bg-lifted p-11 shadow-float">
        <p className="text-slate">
          40px 스타디움 프레임 · shadow-float · bg-lifted
        </p>
      </div>
    </main>
  );
}
