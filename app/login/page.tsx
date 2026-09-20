"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const action =
      mode === "up"
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });
    const { error } = await action;
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (mode === "up") {
      setMessage("Account ready. If email confirm is on, check your inbox. Otherwise you can sign in now.");
      setMode("in");
      return;
    }
    router.push("/desk");
    router.refresh();
  }

  return (
    <main className="wrap" style={{ padding: "48px 0 80px", maxWidth: 520 }}>
      <p className="kicker">{mode === "in" ? "Welcome back" : "New desk"}</p>
      <h1 style={{ fontSize: 48 }}>{mode === "in" ? "Sign in" : "Create an account"}</h1>
      <form className="panel" onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" required minLength={8} autoComplete={mode === "up" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        {message ? <p className={message.includes("ready") ? "note" : "err"}>{message}</p> : null}
        <div className="row">
          <button className="btn" disabled={busy} type="submit">{busy ? "Working…" : mode === "in" ? "Enter" : "Open desk"}</button>
          <button className="btn ghost" type="button" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "Need an account" : "I already have one"}</button>
        </div>
      </form>
    </main>
  );
}
