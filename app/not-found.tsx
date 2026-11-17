import Link from "next/link";
import { cookies } from "next/headers";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";

export default async function NotFound() {
  const s = STRINGS[asLang((await cookies()).get(LANG_COOKIE)?.value)];
  return (
    <div className="card">
      <div className="stage">404</div>
      <h1>🚪 {s.notFound}</h1>
      <Link className="btn" href="/">{s.backToBunker}</Link>
    </div>
  );
}
