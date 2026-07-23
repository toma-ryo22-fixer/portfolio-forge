import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req) {
  try {
    // --- 認証: クライアントの access_token を検証 ---
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return Response.json({ error: "未ログインです" }, { status: 401 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(token);
    if (authError || !user) {
      return Response.json(
        { error: "認証に失敗しました。再ログインしてください" },
        { status: 401 }
      );
    }

    // --- 入力 ---
    const { company_name, industry, strengths, target } = await req.json();
    if (!company_name || !industry) {
      return Response.json(
        { error: "会社名と業種は必須です" },
        { status: 400 }
      );
    }

    // --- Claude で提案書生成 ---
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = [
      `あなたは一流の経営コンサルタント兼コピーライターです。`,
      `以下の会社の営業提案書をMarkdownで作成してください。`,
      ``,
      `会社名: ${company_name}`,
      `業種: ${industry}`,
      `強み・実績: ${strengths || "（未記入。業種から妥当に推測して構成すること）"}`,
      `提案したい相手・目的: ${target || "（未記入。新規取引先開拓を想定）"}`,
      ``,
      `要件:`,
      `- 構成: # タイトル / ## エグゼクティブサマリー / ## 貴社の課題認識 / ## ご提案内容（3項目） / ## 期待効果 / ## 次のステップ`,
      `- 具体的な数字・仮説を交えて説得力を持たせる（架空の場合は「想定」と明記）`,
      `- 全体で800〜1200字程度、日本語ビジネス文書として自然に`,
      `- Markdownの見出し・箇条書きのみ使用（表・リンクは使わない）`,
    ].join("\n");

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const output_md = msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    // --- DBに保存（service role / user_id 明示） ---
    const { error: insertError } = await admin.from("generations").insert({
      user_id: user.id,
      company_name,
      industry,
      strengths: strengths || null,
      target: target || null,
      output_md,
    });
    if (insertError) {
      // 保存失敗でも生成結果は返す（デモの継続性優先）
      console.error("insert error:", insertError.message);
    }

    return Response.json({ output_md });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err?.message || "生成に失敗しました" },
      { status: 500 }
    );
  }
}
