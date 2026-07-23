# PortfolioForge — AI提案書ジェネレーター

AI OSI URI のフルスタック自動デプロイ（osi-deploy）デモアプリ。
チャットで依頼しただけで、リポジトリ作成 → DB構築 → 認証設定 → AI組み込み → 本番公開まで自動構築。

## 何ができるか

1. メールでログイン（Supabase Auth / Magic Link）
2. 会社情報（会社名・業種・強み・提案先）を入力
3. Claude がその場で提案書を生成
4. 生成履歴はDBに保存され、リロードしても残る（RLSでユーザーごとに分離）

## 構成

- Next.js 14 (App Router) / Vercel
- Supabase (Auth + PostgreSQL + RLS)
- Anthropic Claude API（提案書生成）

## 更新方法

main に push すると Vercel が自動再デプロイ。
Cowork からは「portfolio-forge を更新して」で OK（update-deploy スキル）。
