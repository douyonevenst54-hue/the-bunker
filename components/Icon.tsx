/**
 * An item symbol: an emoji, or one of our own drawings in /public/icons when no emoji fits
 * (e.g. a plastic water bottle, a coffee filter, a space blanket). Sized like text (1em).
 */
export default function Icon({ e }: { e: string }) {
  if (e.startsWith("/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={e} alt="" className="icon-img" draggable={false} />;
  }
  return <>{e}</>;
}
