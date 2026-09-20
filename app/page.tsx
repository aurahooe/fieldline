import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 20;

export default async function Home() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, body, created_at, user_id, profiles(display_name)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(36);

  return (
    <main className="wrap">
      <section className="hero">
        <p className="kicker">Open notebook</p>
        <h1>Leave a line.<br />Keep the rest.</h1>
        <p className="lede">
          Sign in, write at your desk, and mark a note public when it is ready for the room.
          Private notes stay yours.
        </p>
        <div className="row">
          <Link className="btn" href="/login">Sit down</Link>
          <Link className="btn ghost" href="/changelog">What shipped</Link>
        </div>
      </section>
      <section className="grid">
        {(posts ?? []).length === 0 ? (
          <article className="card">
            <h3>The board is quiet</h3>
            <p>First public note will land here. Until then the paper stays empty on purpose.</p>
          </article>
        ) : (
          posts!.map((post) => {
            const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
            return (
              <article className="card" key={post.id}>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <div className="meta">
                  <span>{profile?.display_name ?? "someone"}</span>
                  <span>{new Date(post.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
