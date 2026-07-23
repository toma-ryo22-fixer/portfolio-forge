import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          Portfolio<span>Forge</span>
        </div>
        <Link href="/login" className="btn-ghost" style={{ lineHeight: 1 }}>
          ログイン
        </Link>
      </header>

      <section className="hero">
        <div className="badge">
          チャットで依頼しただけで、認証・DB・AI・本番公開まで自動構築されたアプリです
        </div>
        <h1>
          会社情報を入れると、
          <br />
          AIが<em>その場で提案書</em>を書き上げる。
        </h1>
        <p>
          PortfolioForge は AI OSI URI のフルスタック自動デプロイ（osi-deploy）の
          デモアプリ。メール認証によるログイン、Claude
          による提案書生成、生成履歴のデータベース保存——
          すべてが実際に動いています。
        </p>
        <Link href="/login" className="btn">
          ログインして試す →
        </Link>

        <div className="steps">
          <div className="step">
            <div className="num">STEP 1</div>
            <h3>メールでログイン</h3>
            <p>Magic Link が実際に届きます（Supabase Auth）</p>
          </div>
          <div className="step">
            <div className="num">STEP 2</div>
            <h3>会社情報を入力</h3>
            <p>会社名・業種・強み・提案先を入れるだけ</p>
          </div>
          <div className="step">
            <div className="num">STEP 3</div>
            <h3>AIが提案書を生成</h3>
            <p>Claude がその場で構成付きの提案書を執筆</p>
          </div>
          <div className="step">
            <div className="num">STEP 4</div>
            <h3>履歴はDBに保存</h3>
            <p>リロードしても残る。あなた専用の履歴です（RLS）</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        Built end-to-end with osi-deploy — GitHub / Vercel / Supabase / Claude
        API. © AI OSI URI
      </footer>
    </div>
  );
}
