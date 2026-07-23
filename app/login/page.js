"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "sending" | "sent" | "error"
  const [errMsg, setErrMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  async function sendLink(e) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setStatus("error");
      setErrMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="logo" style={{ color: "inherit" }}>
          Portfolio<span style={{ color: "var(--accent)" }}>Forge</span>
        </Link>
      </header>

      <div className="panel" style={{ maxWidth: 480, margin: "80px auto" }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>ログイン</h2>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          メールアドレスを入力すると、ログイン用リンク（Magic
          Link）が届きます。パスワードは不要です。
        </p>
        <form onSubmit={sendLink}>
          <label className="label">メールアドレス</label>
          <input
            className="input"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={{ marginTop: 20 }}>
            <button
              className="btn"
              type="submit"
              disabled={status === "sending"}
              style={{ width: "100%" }}
            >
              {status === "sending" ? "送信中..." : "ログインリンクを送る"}
            </button>
          </div>
        </form>
        {status === "sent" && (
          <div className="notice ok">
            送信しました。メール内のリンクを開くとダッシュボードに入れます。
          </div>
        )}
        {status === "error" && (
          <div className="notice err">送信に失敗しました: {errMsg}</div>
        )}
      </div>
    </div>
  );
}
