import "./globals.css";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "PortfolioForge — AI提案書ジェネレーター",
  description:
    "会社情報を入れると、AIがその場で提案書を生成。ログイン・DB保存まで一気通貫で動くフルスタックデモ。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
