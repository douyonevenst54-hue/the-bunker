import type { Metadata } from "next";
import { CONTACT, UPDATED, OWNER } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms · THE BUNKER" };

export default function Terms() {
  return (
    <div className="card legal">
      <div className="stage">THE BUNKER</div>
      <h1>Terms of Use</h1>
      <p className="note">Last updated {UPDATED}</p>

      <div className="legal-ht">
        <strong>An kreyòl, an kout:</strong> THE BUNKER se yon jwèt pou aprann, li pa ranplase doktè, ponpye oswa otorite lokal yo.
        Nan yon ijans, rele 911 epi swiv sa otorite yo di. Manmbrè a renouvle otomatikman chak mwa oswa chak ane; ou ka anile nenpòt lè nan paj Kont ou.
      </div>

      <h2>1. Education, not emergency advice</h2>
      <p>THE BUNKER teaches general preparedness using public guidance (for example CDC, Ready.gov, NWS, EPA and the Red Cross).
        It is not medical, legal or professional advice and does not replace training, your doctor or local officials.
        <b> In an emergency, call 911 and follow your local officials.</b></p>

      <h2>2. Who can use it</h2>
      <p>Anyone can play as a guest. Accounts are for people 13 and older, or a parent or guardian creating an account for their family.</p>

      <h2>3. Your account</h2>
      <p>Keep your password private. You are responsible for activity on your account. We may suspend accounts that abuse the service.</p>

      <h2>4. Membership and payments</h2>
      <ul>
        <li>Rooms 1 and 2 are free. A membership ($2.99/month or $24.99/year, US dollars) unlocks everything else.</li>
        <li>Memberships renew automatically until you cancel. Cancel any time from Account → Manage membership; you keep access until the end of the paid period.</li>
        <li>Payments are processed by Stripe. Prices may change; we will tell members before a change applies to them.</li>
        <li>Refunds: if something went wrong, email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> within 14 days of a charge and we will make it right.</li>
      </ul>

      <h2>4a. Pi edition (pi.buildthebunker.com)</h2>
      <ul>
        <li>In the Pi Browser, rooms 1 and 2 are free. The Bunker Pass, paid once in Pi, opens rooms 3 to 6 and the emergency levels for 30 days and does not renew by itself. Optionally, watching one short Pi Network ad opens Room 3 for 24 hours, once a day. Pi Network is a separate service with its own terms.</li>
        <li>Supporting THE BUNKER in Pi is optional. It gives a supporter badge and never changes the gameplay.</li>
        <li>A Pi payment is confirmed on the Pi blockchain and we cannot reverse it there. If something went wrong, email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and we will look into it.</li>
        <li>We never ask for your wallet passphrase. Anyone who does is not us.</li>
      </ul>

      <h2>5. Sharing</h2>
      <p>If you share your progress page, you choose to make your first name, rooms, levels and badges public to anyone with the link. You can stop sharing any time.</p>

      <h2>6. Content</h2>
      <p>The game, its text, drawings and code belong to {OWNER}. Please don't copy or resell them. Teachers and community groups may show the game in class or in workshops.</p>

      <h2>7. No warranty</h2>
      <p>We work to keep the content accurate and the site running, but the service is provided "as is." To the extent the law allows, we are not liable for decisions made using the game.</p>

      <h2>8. Contact</h2>
      <p><a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
    </div>
  );
}
