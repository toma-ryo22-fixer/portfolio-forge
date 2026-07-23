"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { SAMPLES } from "../../lib/samples";
import { downloadMarkdown, downloadDocx } from "../../lib/exporters";

// 最小限のMarkdown→HTML変換（見出し・箇条書き・強調のみ）
function mdToHtml(md) {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = esc(md).split("\n");
  let html = "";
  let inList = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("- ") || t.startsWith("* ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inline(t.slice(2))}</li>`;
      continue;
    }
    if (inList) {
      html += "</ul>";
      inList = false;
    }
    if (t.startsWith("### ")) html += `<h3>${inline(t.slice(4))}</h3>`;
    else if (t.startsWith("## ")) html += `<h2>${inline(t.slice(3))}</h2>`;
    else if (t.startsWith("# ")) html += `<h1>${inline(t.slice(2))}</h1>`;
    else if (t === "") html += "";
    else html += `<p>${inline(t)}</p>`;
  }
  if (inList) html += "</ul>";
  return html;

  function inline(s) {
    return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }
}

export default function Dashboard() {
  const [session, setSession] = useState(undefined); // undefined=判定中
  const [form, setForm] = useState({
    company_name: "",
    industry: "",
    strengths: "",
    target: "",
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [resultTitle, setResultTitle] = useState("提案書");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const router = useRouter();

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("generations")
      .select("id, company_name, industry, output_md, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory(data || []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      if (!data.session) router.replace("/login");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (session) loadHistory();
  }, [session, loadHistory]);

  async function generate(e) {
    e.preventDefault();
    setGenerating(true);
    setError("");
    setResult(null);
    try {
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${s.access_token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setResult(json.output_md);
      setResultTitle(form.company_name);
      loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function exportDocx() {
    setExporting(true);
    try {
      await downloadDocx(result, resultTitle);
    } finally {
      setExporting(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (session === undefined) {
    return (
      <div className="container" style={{ padding: 80, textAlign: "center" }}>
        <span className="spinner" /> 読み込み中...
      </div>
    );
  }
  if (session === null) return null;

  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="logo" style={{ color: "inherit" }}>
          Portfolio<span style={{ color: "var(--accent)" }}>Forge</span>
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {session.user.email || "ゲスト利用中"}
          </span>
          <button className="btn-ghost" onClick={logout}>
            ログアウト
          </button>
        </div>
      </header>

      <div className="panel">
        <h2 style={{ fontSize: 20 }}>AI提案書ジェネレーター</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
          会社情報を入力すると、Claude がその場で提案書を書きます。結果はあなた専用の履歴としてDBに保存されます。
        </p>

        <div style={{ marginTop: 16 }}>
          <span style={{ fontSize: 13, color: "var(--muted)", marginRight: 10 }}>
            サンプルで入力:
          </span>
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="btn-ghost"
              style={{ marginRight: 8, marginTop: 6 }}
              onClick={() => setForm({ ...s.form })}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={generate}>
          <label className="label">会社名 *</label>
          <input
            className="input"
            required
            placeholder="例: 株式会社サンプル製作所"
            value={form.company_name}
            onChange={(e) =>
              setForm({ ...form, company_name: e.target.value })
            }
          />
          <label className="label">業種 *</label>
          <input
            className="input"
            required
            placeholder="例: 金属加工業"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
          <label className="label">強み・実績</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="例: 創業50年、微細加工の特許3件、大手メーカーとの取引実績"
            value={form.strengths}
            onChange={(e) => setForm({ ...form, strengths: e.target.value })}
          />
          <label className="label">提案したい相手・目的</label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="例: 自動車部品メーカーへの新規取引提案"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
          />
          <div style={{ marginTop: 24 }}>
            <button className="btn" type="submit" disabled={generating}>
              {generating ? (
                <>
                  <span className="spinner" />
                  執筆中です（20秒ほどお待ちください）
                </>
              ) : (
                "提案書を生成する"
              )}
            </button>
          </div>
        </form>
        {error && <div className="notice err">エラー: {error}</div>}
      </div>

      {result && (
        <div className="panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div className="badge" style={{ marginBottom: 0 }}>
              生成結果（保存済み）
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-ghost"
                onClick={() => downloadMarkdown(result, resultTitle)}
              >
                Markdownで保存
              </button>
              <button
                className="btn-ghost"
                onClick={exportDocx}
                disabled={exporting}
              >
                {exporting ? "作成中..." : "Wordで保存"}
              </button>
            </div>
          </div>
          <div
            className="output"
            dangerouslySetInnerHTML={{ __html: mdToHtml(result) }}
          />
        </div>
      )}

      <div className="panel">
        <h2 style={{ fontSize: 17 }}>生成履歴</h2>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          Supabase に保存された、あなたのアカウント専用の履歴です（他のユーザーには見えません）。
        </p>
        {history.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 12 }}>
            まだ履歴がありません。上のフォームから生成してみてください。
          </p>
        )}
        {history.map((h) => (
          <div
            key={h.id}
            className="history-item"
            onClick={() => {
              setResult(h.output_md);
              setResultTitle(h.company_name);
            }}
          >
            <strong>{h.company_name}</strong>{" "}
            <span style={{ color: "var(--muted)" }}>（{h.industry}）</span>
            <div className="meta">
              {new Date(h.created_at).toLocaleString("ja-JP")} — クリックで表示
            </div>
          </div>
        ))}
      </div>

      <footer className="footer">
        Built end-to-end with osi-deploy — GitHub / Vercel / Supabase / Claude
        API. © AI OSI URI
      </footer>
    </div>
  );
}
