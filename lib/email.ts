import "server-only";

const FROM = process.env.EMAIL_FROM || "THE BUNKER <noreply@buildthebunker.com>";

export interface Mail { to: string; subject: string; html: string; text: string }

/**
 * Sends through Resend's HTTP API. Without RESEND_API_KEY (local tests),
 * the message is written to the server log when EMAIL_DEV_LOG=1, otherwise dropped.
 */
export async function sendMail(m: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.EMAIL_DEV_LOG === "1") console.log(`[email:dev] to=${m.to} subject=${m.subject}\n${m.text}`);
    else console.warn("[email] RESEND_API_KEY not set; email not sent");
    return false;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [m.to], subject: m.subject, html: m.html, text: m.text }),
    });
    if (!r.ok) console.error("[email] Resend error", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("[email] send failed", e);
    return false;
  }
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

/** Bilingual reset email: the player's language first, the other one below. */
export function resetEmail(link: string, lang: "en" | "ht", name: string | null): Mail {
  const en = {
    hi: name ? `Hi ${name},` : "Hi,",
    body: "We got a request to reset your THE BUNKER password. Tap the button to choose a new one. The link works for 1 hour and only once.",
    btn: "Reset my password",
    ignore: "If you didn't ask for this, you can ignore this email. Your password won't change.",
  };
  const ht = {
    hi: name ? `Bonjou ${name},` : "Bonjou,",
    body: "Nou resevwa yon demann pou chanje modpas THE BUNKER ou. Peze bouton an pou chwazi yon nouvo modpas. Lyen an bon pou 1 èdtan epi yon sèl fwa.",
    btn: "Chanje modpas mwen",
    ignore: "Si se pa ou ki mande sa, ou ka inyore imèl sa a. Modpas ou p ap chanje.",
  };
  const [a, b] = lang === "ht" ? [ht, en] : [en, ht];
  const block = (t: typeof en, primary: boolean) => `
    <p style="margin:0 0 12px;font-size:${primary ? 16 : 14}px;color:${primary ? "#111" : "#555"}">${esc(t.hi)}</p>
    <p style="margin:0 0 18px;font-size:${primary ? 16 : 14}px;line-height:1.5;color:${primary ? "#111" : "#555"}">${esc(t.body)}</p>
    <p style="margin:0 0 18px"><a href="${esc(link)}" style="display:inline-block;background:#f2a93b;color:#1a1205;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px">${esc(t.btn)}</a></p>
    <p style="margin:0;font-size:13px;color:#777">${esc(t.ignore)}</p>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f2;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:24px">
    <div style="font-size:20px;font-weight:800;letter-spacing:2px;margin-bottom:16px">THE <span style="color:#d9901f">BUNKER</span></div>
    <div style="background:#fff;border-radius:12px;padding:24px">${block(a, true)}
      <hr style="border:0;border-top:1px solid #eee;margin:24px 0">${block(b, false)}</div>
    <p style="font-size:12px;color:#999;margin-top:16px">buildthebunker.com · Built by Dr. Jhon Evenst Douyon, MD, MPH</p>
  </div></body></html>`;
  const text = `${a.hi}\n\n${a.body}\n\n${a.btn}: ${link}\n\n${a.ignore}\n\n---\n\n${b.hi}\n\n${b.body}\n\n${b.btn}: ${link}\n\n${b.ignore}`;
  return { to: "", subject: lang === "ht" ? "Chanje modpas THE BUNKER ou" : "Reset your THE BUNKER password", html, text };
}
