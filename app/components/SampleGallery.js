"use client";

import { useState } from "react";
import { SAMPLES } from "../../lib/samples";

// 最小限のMarkdown→HTML変換（dashboardと同等）
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

export default function SampleGallery() {
  const [active, setActive] = useState(SAMPLES[0].id);
  const sample = SAMPLES.find((s) => s.id === active);

  return (
    <section style={{ margin: "16px 0 48px" }}>
      <h2 style={{ fontSize: 24, marginBottom: 4 }}>
        生成例ギャラリー
        <span
          style={{
            fontSize: 13,
            color: "var(--muted)",
            fontWeight: 400,
            marginLeft: 12,
          }}
        >
          ログイン不要でご覧いただけます
        </span>
      </h2>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>
        実際にこのアプリのAI（Claude）が生成した提案書のサンプルです。業種を選んでください。
      </p>

      <div style={{ display: "flex", gap: 10, margin: "18px 0 " }}>
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            className="btn-ghost"
            onClick={() => setActive(s.id)}
            style={
              s.id === active
                ? {
                    borderColor: "var(--accent)",
                    color: "var(--accent)",
                    fontWeight: 700,
                  }
                : undefined
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 8 }}>
        <div className="badge">
          入力: {sample.form.company_name}（{sample.form.industry}）→
          目的: {sample.form.target}
        </div>
        <div
          className="output"
          dangerouslySetInnerHTML={{ __html: mdToHtml(sample.output_md) }}
        />
      </div>
    </section>
  );
}
