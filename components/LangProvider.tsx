"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/rooms/types";
import { STRINGS, LANG_COOKIE, type StringKey } from "@/lib/i18n";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: StringKey) => string }>({
  lang: "en", setLang: () => {}, t: (k) => STRINGS.en[k],
});

export function LangProvider({ initial, children }: { initial: Lang; children: React.ReactNode }) {
  const [lang, set] = useState<Lang>(initial);
  const router = useRouter();
  const setLang = useCallback((l: Lang) => {
    set(l);
    document.cookie = `${LANG_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = l;
    router.refresh(); // re-render server parts (dashboard) in the new language
  }, [router]);
  const t = useCallback((k: StringKey) => STRINGS[lang][k], [lang]);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang">
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
      <button className={lang === "ht" ? "on" : ""} onClick={() => setLang("ht")}>KREYÒL</button>
    </div>
  );
}
