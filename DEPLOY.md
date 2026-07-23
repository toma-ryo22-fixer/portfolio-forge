# DEPLOY.md — 運用ルール（osi-deploy 準拠）

- **正本は GitHub リモート**。ローカルクローンは作業コピー（壊れたら再cloneで復旧）。
- **Vercel プロジェクトは1リポにつき1つ。再createは絶対禁止**（名前衝突で増殖する）。
  更新はすべて `git push` → CI自動デプロイ。
- 本番URLは production alias（`portfolio-forge-*.vercel.app`）。per-deploy URLを正本にしない。
- 更新は Cowork の `update-deploy` スキル経由が既定（clone→編集→push→CI監視→smoke）。

## 環境変数（Vercel に設定済み）

| キー | 用途 |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase プロジェクトURL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | クライアント用キー |
| SUPABASE_SERVICE_ROLE_KEY | サーバ専用（API routeでのtoken検証・insert） |
| ANTHROPIC_API_KEY | Claude API（拡張が自動注入） |

## DB スキーマ

`supabase/migrations/001_init.sql` 参照。テーブル: `generations`（RLS: 本人のみselect/insert）。
