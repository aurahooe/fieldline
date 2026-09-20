import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="wrap nav">
      <Link className="mark" href="/">
        Fieldline
      </Link>
      <nav className="nav-links">
        <Link href="/">Public</Link>
        <Link href="/changelog">Shipped</Link>
        {user ? <Link href="/desk">Desk</Link> : <Link href="/login">Sign in</Link>}
      </nav>
    </header>
  );
}
