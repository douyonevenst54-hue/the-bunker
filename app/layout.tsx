import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import "./globals.css";
import { LangProvider, LangToggle } from "@/components/LangProvider";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";
import { getPlayer } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { Analytics } from "@vercel/analytics/next";

const DESC = "An emergency-preparedness game for families, in English and Haitian Creole. Free to start. Built by Dr. Jhon Evenst Douyon, MD, MPH.";
export const metadata: Metadata = {
  title: "THE BUNKER — Build your bunker. Protect lives.",
  description: DESC,
  metadataBase: new URL("https://buildthebunker.com"),
  applicationName: "THE BUNKER",
  openGraph: { title: "THE BUNKER — Build your bunker. Protect lives.", description: DESC, type: "website", siteName: "THE BUNKER" },
  twitter: { card: "summary_large_image" },
};
export const viewport = { themeColor: "#10151c" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const player = await getPlayer().catch(() => null);
  const s = STRINGS[lang];
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LangProvider initial={lang}>
          <div className="wrap">
            <header>
              <div className="brand"><Link href="/">THE <span>BUNKER</span></Link></div>
              <div className="right">
                {isAdmin(player) && <Link className="acct" href="/admin">{s.admin}</Link>}
                <Link className="acct" href="/account">{player?.email ? "👤" : s.account}</Link>
                <LangToggle />
              </div>
            </header>
            {children}
            <footer className="site-foot">
              <Link href="/privacy">{s.privacy}</Link> · <Link href="/terms">{s.terms}</Link> · <a href={`mailto:${process.env.CONTACT_EMAIL || "hello@buildthebunker.com"}`}>{s.contact}</a>
              <div>© {new Date().getFullYear()} THE BUNKER · Dr. Jhon Evenst Douyon, MD, MPH</div>
            </footer>
          </div>
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
