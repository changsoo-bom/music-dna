import type { Metadata } from "next";
import { Sofia_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// 라틴 디스플레이·본문. 가변 폰트라 본문 450 weight 가 실제로 렌더된다.
const sofia = Sofia_Sans({
  variable: "--font-sofia",
  subsets: ["latin"],
});

/**
 * 한글. 정적 웨이트 3종만 들고 온다 — 본문(400) · 헤드라인/버튼(500) · 아이브로우(700).
 * 전각 한글이 들어간 파일이라 개당 800KB 다. 초기 렌더를 막지 않도록 preload 하지 않는다.
 * 본문 450 은 CSS 폰트 매칭에서 400 파일로 떨어진다(400–500 구간은 이하 값을 먼저 찾는다).
 * 라틴 450 옆에서 무게가 맞으므로 의도된 동작이다. docs/design-reference.md 참고.
 */
const pretendard = localFont({
  variable: "--font-kr",
  preload: false,
  display: "swap",
  src: [
    { path: "../fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "MUSIC DNA — 당신의 취향에는 지문이 있습니다",
  description:
    "지난 1년의 재생 기록을 장르, 템포, 분위기, 시간대로 분해해 한 장의 리포트로 돌려드립니다.",
};

/**
 * 첫 페인트 전에 검사 이력이 있는지만 확인해 표시를 남긴다.
 *
 * 서버는 Local Storage 를 못 보므로 홈은 항상 소개 화면으로 그려진다.
 * 검사를 마친 사람은 하이드레이션 직후 결과로 바뀌는데, 그 사이에
 * **소개 화면이 한 번 번쩍인다.** 새로고침할 때마다 안 본 페이지가 스치는 셈이다.
 *
 * 값을 파싱하지 않는다 — 키가 있는지만 본다. 실제 검증은
 * `parsePreference` 가 하이드레이션 후에 한다. 여기서 하는 일은
 * **CSS 가 소개 화면을 먼저 숨기게 하는 것뿐**이다.
 *
 * 소개 화면이 실제로 렌더되면(저장값이 깨진 경우) 그쪽 ref 가 이 표시를 지운다.
 */
const HIDE_INTRO_BEFORE_PAINT = `try{if(localStorage.getItem('musicdna:musicPreference:v1'))document.documentElement.dataset.dna='1'}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: HIDE_INTRO_BEFORE_PAINT }} />
      </head>
      <body className={`${sofia.variable} ${pretendard.variable}`}>
        {children}
      </body>
    </html>
  );
}
