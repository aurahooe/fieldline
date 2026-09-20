"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  title: string;
  body: string;
  is_public: boolean;
  created_at: string;
};

export default function DeskPage() {
  const router = useRouter();
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, is_public, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
    setReady(true);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user.id,
      title: title.trim(),
      body: body.trim(),
      is_public: isPublic,
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setTitle("");
    setBody("");
    setIsPublic(false);
    await load();
    router.refresh();
  }

  async function togglePublic(post: Post) {
    await supabase.from("posts").update({ is_public: !post.is_public }).eq("id", post.id);
    await load();
    router.refresh();
  }

  async function remove(id: string) {
    await supabase.from("posts").delete().eq("id", id);
    await load();
    router.refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!ready) {
    return (
      <main className="wrap" style={{ padding: "60px 0" }}>
        <p className="note">Opening the desk…</p>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ padding: "36px 0 80px" }}>
      <p className="kicker">Your papers</p>
      <h1 style={{ fontSize: 54 }}>Desk</h1>
      <form className="panel" onSubmit={onSubmit}>
        <label htmlFor="title">Title</label>
        <input id="title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="body">Note</label>
        <textarea id="body" required maxLength={8000} value={body} onChange={(e) => setBody(e.target.value)} />
        <label className="check">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Show this on the public board
        </label>
        {error ? <p className="err">{error}</p> : null}
        <div className="row">
          <button className="btn" type="submit">Save note</button>
          <button className="btn ghost" type="button" onClick={signOut}>Sign out</button>
        </div>
      </form>
      <section className="grid" style={{ paddingTop: 28 }}>
        {posts.map((post) => (
          <article className="card" key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <div className="meta">
              <span>{post.is_public ? "Public" : "Private"}</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn ghost" type="button" onClick={() => togglePublic(post)}>{post.is_public ? "Make private" : "Make public"}</button>
              <button className="btn ghost" type="button" onClick={() => remove(post.id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
