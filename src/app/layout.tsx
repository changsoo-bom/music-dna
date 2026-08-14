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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${sofia.variable} ${pretendard.variable}`}>
        {children}
      </body>
    </html>
  );
}
