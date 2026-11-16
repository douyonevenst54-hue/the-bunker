import type { Lang } from "./rooms/types";

const en = {
  start: "Start mission", next: "Next", use: "Use", skip: "Not needed", avoid: "Avoid",
  right: "Correct", wrong: "Not quite", of: "of",
  results: "Room readiness",
  level_expert: "Preparedness expert", level_well: "Well prepared", level_improve: "Needs improvement", level_training: "Additional training required",
  criticalTitle: "Critical safety error",
  criticalBody: "You missed an answer that could cost a life in a real emergency. Review it and play again to unlock the next room.",
  checklist: "Your real-life checklist", checkSub: "Take this lesson home. Check off what you already have.",
  copy: "Copy checklist", copied: "Copied ✓", again: "Play again", sources: "Facts checked against:",
  s1: "Stage 1 · Identify", s1t: "Use it, skip it, or avoid it?",
  review: "Expert review: all answers", play: "Play the room",
  saving: "Saving progress…", saved: "Progress saved ✓", notSaved: "Progress not saved (offline). Your score still counts here.",
  bunker: "My bunker", backToBunker: "Back to my bunker", nextRoom: "Next room",
  unlockHint: "Score 60+ with no critical errors to unlock the next room.",
  proto: "For education, not professional certification. In an emergency, follow your local officials.<br>Built by Dr. Jhon Evenst Douyon, MD, MPH",
  // dashboard
  welcome: "Build your bunker. Protect lives.",
  welcomeSub: "Each room teaches real skills that keep families safe. Finish a room to unlock the next.",
  roomsDone: "rooms passed", best: "Best", play_: "Play", replay: "Play again", locked: "Locked", comingSoon: "Coming soon",
  statusNew: "Not started", statusPassed: "Passed", statusRetry: "Try again to unlock the next room",
  guestNote: "You're playing as a guest. Create a free account to keep your progress on any device.",
  mapLabel: "Map of your bunker", entrance: "ENTRANCE", corridor: "CORRIDOR",
  badges: "Badges", continueWith: "Continue", newBadges: "New badge earned!",
  // account
  account: "Account", createAccount: "Create free account", signIn: "Sign in", signOut: "Sign out",
  email: "Email", password: "Password (8+ characters)", name: "First name (optional)",
  haveAccount: "Already have an account?", noAccount: "New here?", signedInAs: "Signed in as",
  errEmail: "Enter a valid email.", errPassword: "Password must be at least 8 characters.",
  errTaken: "An account with this email already exists. Sign in instead.", errLogin: "Wrong email or password.",
  errServer: "Something went wrong. Please try again.",
};

const ht: typeof en = {
  start: "Kòmanse misyon an", next: "Kontinye", use: "Sèvi ak li", skip: "Pa nesesè", avoid: "Evite l",
  right: "Bon repons", wrong: "Pa tout bon", of: "sou",
  results: "Preparasyon chanm nan",
  level_expert: "Ekspè nan preparasyon", level_well: "Byen prepare", level_improve: "Bezwen amelyore", level_training: "Bezwen plis fòmasyon",
  criticalTitle: "Erè sekirite grav",
  criticalBody: "Ou rate yon repons ki ka koute yon lavi nan yon vrè ijans. Revize l epi jwe ankò pou debloke pwochen chanm nan.",
  checklist: "Lis pou lavi reyèl ou", checkSub: "Pote leson sa a lakay ou. Tcheke sa ou genyen deja.",
  copy: "Kopye lis la", copied: "Kopye ✓", again: "Jwe ankò", sources: "Enfòmasyon yo verifye ak:",
  s1: "Etap 1 · Idantifye", s1t: "Sèvi ak li, kite l, oswa evite l?",
  review: "Revizyon ekspè: tout repons yo", play: "Jwe chanm nan",
  saving: "N ap sere pwogrè w…", saved: "Pwogrè w sere ✓", notSaved: "Pwogrè w pa sere (pa gen koneksyon). Nòt ou toujou konte isit la.",
  bunker: "Bunker mwen", backToBunker: "Retounen nan bunker mwen", nextRoom: "Pwochen chanm",
  unlockHint: "Fè 60 oswa plis san erè grav pou debloke pwochen chanm nan.",
  proto: "Pou edikasyon, se pa yon sètifika pwofesyonèl. Nan ijans, swiv sa otorite lokal yo di.<br>Kreye pa Dr. Jhon Evenst Douyon, MD, MPH",
  welcome: "Bati bunker ou. Pwoteje lavi.",
  welcomeSub: "Chak chanm anseye konesans reyèl ki pwoteje fanmi. Fini yon chanm pou debloke pwochen an.",
  roomsDone: "chanm reyisi", best: "Pi bon", play_: "Jwe", replay: "Jwe ankò", locked: "Fèmen", comingSoon: "Ap vini byento",
  statusNew: "Poko kòmanse", statusPassed: "Reyisi", statusRetry: "Eseye ankò pou debloke pwochen chanm nan",
  guestNote: "W ap jwe kòm envite. Kreye yon kont gratis pou kenbe pwogrè w sou nenpòt aparèy.",
  mapLabel: "Plan bunker ou", entrance: "ANTRE", corridor: "KORIDÒ",
  badges: "Badj", continueWith: "Kontinye", newBadges: "Nouvo badj!",
  account: "Kont", createAccount: "Kreye kont gratis", signIn: "Konekte", signOut: "Dekonekte",
  email: "Imèl", password: "Modpas (8 karaktè oswa plis)", name: "Prenon (si ou vle)",
  haveAccount: "Ou gen yon kont deja?", noAccount: "Ou nouvo isit la?", signedInAs: "Konekte kòm",
  errEmail: "Antre yon imèl ki valab.", errPassword: "Modpas la dwe gen omwen 8 karaktè.",
  errTaken: "Gen yon kont ak imèl sa a deja. Konekte pito.", errLogin: "Imèl oswa modpas la pa bon.",
  errServer: "Gen yon bagay ki pa mache. Tanpri eseye ankò.",
};

export const STRINGS: Record<Lang, typeof en> = { en, ht };
export type StringKey = keyof typeof en;
export const LANG_COOKIE = "bunkerLang";
export function asLang(v: string | undefined | null): Lang {
  return v === "ht" ? "ht" : "en";
}
