import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import "./globals.css";
import { LangProvider, LangToggle } from "@/components/LangProvider";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";
import { getPlayer } from "@/lib/session";

export const metadata: Metadata = {
  title: "THE BUNKER — Build your bunker. Protect lives.",
  description: "A free emergency-preparedness game in English and Haitian Creole. Built by Dr. Jhon Evenst Douyon, MD, MPH.",
  metadataBase: new URL("https://buildthebunker.com"),
};

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
                <Link className="acct" href="/account">{player?.email ? "👤" : s.account}</Link>
                <LangToggle />
              </div>
            </header>
            {children}
          </div>
        </LangProvider>
      </body>
    </html>
  );
}
