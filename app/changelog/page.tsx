import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;

export default async function ChangelogPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("feature_log")
    .select("id, title, body, shipped_at")
    .order("shipped_at", { ascending: false })
    .limit(50);

  return (
    <main className="wrap" style={{ padding: "48px 0 80px" }}>
      <p className="kicker">Hourly work</p>
      <h1>What shipped</h1>
      <p className="lede">Fieldline grows in small, visible pieces. New work lands here.</p>
      <section className="grid">
        {(items ?? []).map((item) => (
          <article className="card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <div className="meta">
              <span>Shipped</span>
              <span>{new Date(item.shipped_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
