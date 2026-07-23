import "./globals.css";

export const metadata = {
  title: "PortfolioForge — AI提案書ジェネレーター",
  description:
    "会社情報を入れると、AIがその場で提案書を生成。ログイン・DB保存まで一気通貫で動くフルスタックデモ。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
