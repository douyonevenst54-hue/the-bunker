/** What the Pi edition sells. Rooms 1–2 stay free; the Bunker Pass opens the rest. */
export const SUPPORT_AMOUNT = Number(process.env.PI_SUPPORT_AMOUNT ?? "1");
export const PASS_AMOUNT = Number(process.env.PI_PASS_AMOUNT ?? "4");
export const PASS_DAYS = 30;

/** Price of each product, by the kind sent in the payment's metadata. */
export const PI_PRICES: Record<string, number> = { supporter: SUPPORT_AMOUNT, pass30: PASS_AMOUNT };

/** New end date when a 30-day pass is added: from today, or from the current end if still running. */
export function extendPass(current: Date | null | undefined, now = new Date()): Date {
  const from = current && current > now ? current : now;
  return new Date(from.getTime() + PASS_DAYS * 864e5);
}
