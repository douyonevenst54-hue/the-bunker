import { NextResponse } from "next/server";
import { prisma, dbEnabled } from "@/lib/db";
import { getPlayer } from "@/lib/session";
import { isPiEdition, piApiKey } from "@/lib/edition";

const PI_API = process.env.PI_API_BASE ?? "https://api.minepi.com";
import { SUPPORT_AMOUNT } from "@/lib/pi";

type PiPaymentDTO = {
  identifier: string; user_uid: string; amount: number | string; memo?: string;
  metadata?: { kind?: string } | null;
  status?: { developer_approved?: boolean; developer_completed?: boolean; cancelled?: boolean; user_cancelled?: boolean; transaction_verified?: boolean };
  transaction?: { txid?: string } | null;
};

async function pi(path: string, body?: unknown) {
  const key = await piApiKey();
  if (!key) throw new Error("PI_API_KEY missing");
  const r = await fetch(`${PI_API}/v2/payments/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`pi ${path} ${r.status}`);
  return r.json() as Promise<PiPaymentDTO>;
}

async function markComplete(p: PiPaymentDTO, txid: string) {
  const owner = await prisma.player.findUnique({ where: { piUid: p.user_uid } });
  await prisma.piPayment.upsert({
    where: { paymentId: p.identifier },
    create: { paymentId: p.identifier, piUid: p.user_uid, playerId: owner?.id ?? null, amount: Number(p.amount), kind: p.metadata?.kind ?? "supporter", status: "completed", txid },
    update: { status: "completed", txid },
  });
  if (owner && !owner.piSupporterAt) await prisma.player.update({ where: { id: owner.id }, data: { piSupporterAt: new Date() } });
}

/**
 * Server side of a Pi payment.
 *  approve  — the signed-in Pioneer's own supporter payment, for the right amount
 *  complete — after the blockchain transaction (txid), finish it and grant the badge
 *  recover  — an incomplete payment found at sign-in: finish it if paid, cancel it if not
 */
export async function POST(req: Request) {
  if (!(await isPiEdition())) return NextResponse.json({ error: "pi_only" }, { status: 404 });
  if (!dbEnabled) return NextResponse.json({ error: "no_db" }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const action = String(b.action ?? ""), paymentId = String(b.paymentId ?? ""), txid = b.txid ? String(b.txid) : null;
  if (!/^[A-Za-z0-9_-]{6,80}$/.test(paymentId)) return NextResponse.json({ error: "bad_payment" }, { status: 400 });

  try {
    const p = await pi(paymentId);
    if (action === "recover") {
      // Pi only returns this app's payments for our key; the badge goes to whoever paid.
      if (p.status?.developer_completed) return NextResponse.json({ ok: true, state: "done" });
      if (p.transaction?.txid) { await pi(`${paymentId}/complete`, { txid: p.transaction.txid }); await markComplete(p, p.transaction.txid); return NextResponse.json({ ok: true, state: "completed" }); }
      await pi(`${paymentId}/cancel`, {});
      await prisma.piPayment.updateMany({ where: { paymentId }, data: { status: "cancelled" } });
      return NextResponse.json({ ok: true, state: "cancelled" });
    }

    const player = await getPlayer();
    if (!player?.piUid) return NextResponse.json({ error: "sign_in_with_pi" }, { status: 401 });
    if (p.user_uid !== player.piUid) return NextResponse.json({ error: "not_yours" }, { status: 403 });

    if (action === "approve") {
      if (Number(p.amount) !== SUPPORT_AMOUNT || p.metadata?.kind !== "supporter") return NextResponse.json({ error: "bad_amount" }, { status: 400 });
      if (!p.status?.developer_approved) await pi(`${paymentId}/approve`, {});
      await prisma.piPayment.upsert({
        where: { paymentId },
        create: { paymentId, piUid: p.user_uid, playerId: player.id, amount: Number(p.amount), kind: "supporter", status: "approved" },
        update: {},
      });
      return NextResponse.json({ ok: true });
    }
    if (action === "complete") {
      if (!txid) return NextResponse.json({ error: "txid_required" }, { status: 400 });
      if (!p.status?.developer_completed) await pi(`${paymentId}/complete`, { txid });
      await markComplete(p, txid);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch (e) {
    console.error("pi payment failed", e);
    return NextResponse.json({ error: "pi_error" }, { status: 502 });
  }
}
