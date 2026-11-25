import type { Metadata } from "next";
import { CONTACT, UPDATED, OWNER } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy · THE BUNKER" };

export default function Privacy() {
  return (
    <div className="card legal">
      <div className="stage">THE BUNKER</div>
      <h1>Privacy Policy</h1>
      <p className="note">Last updated {UPDATED}</p>

      <div className="legal-ht">
        <strong>An kreyòl, an kout:</strong> Nou kolekte sèlman sa nou bezwen pou jwèt la mache: imèl ou ak premye non ou si ou kreye yon kont,
        pwogrè ou nan jwèt la, ak peman manmbrè (Stripe jere kat ou, nou pa janm wè l). Nou pa vann enfòmasyon ou. Ou ka mande pou nou efase kont ou nenpòt lè:
        ekri nou nan <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </div>

      <h2>Who we are</h2>
      <p>THE BUNKER (buildthebunker.com) is an emergency-preparedness learning game operated by {OWNER}. Questions: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>

      <h2>What we collect</h2>
      <ul>
        <li><b>Playing as a guest:</b> a random ID in a cookie, and your answers, scores and badges. No name or email.</li>
        <li><b>With an account:</b> your email, an optional first name, and a securely hashed password (we never store the password itself).</li>
        <li><b>Pi edition (pi.buildthebunker.com):</b> when you sign in with Pi, we receive your Pi username and a Pi user ID from Pi Network, nothing else. If you choose to watch an optional ad, Pi Network shows it; we only receive a confirmation that it was watched.
          We do not ask for your wallet address and never ask for your passphrase. If you choose to support the game in Pi, we keep the payment ID, amount and transaction ID.</li>
        <li><b>Membership:</b> Stripe processes payments. We receive your Stripe customer ID and subscription status, never your card number.</li>
        <li><b>Emails:</b> we send password-reset emails through Resend.</li>
        <li><b>Usage statistics:</b> anonymous, cookie-free page-visit counts (Vercel Web Analytics).</li>
        <li><b>Security:</b> failed sign-in attempts (email and IP address) for 24 hours, to block password guessing.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To save your progress, unlock rooms and levels, and award badges.</li>
        <li>To manage memberships and send password-reset emails.</li>
        <li>To improve the lessons, using totals across all players (for example, which questions are missed most).</li>
      </ul>
      <p>We do not sell or rent personal information, and we do not show third-party ads.</p>

      <h2>Sharing your progress</h2>
      <p>If you tap Share, we create a public page with your first name, rooms passed, levels and badges. It never shows your email.
        You can turn it off any time under Account → Stop sharing my page; the old link then stops working.</p>

      <h2>Children</h2>
      <p>Accounts are for people 13 and older. Children under 13 can play as guests (no personal information) or with a parent or guardian using the parent's account.
        If you believe a child under 13 gave us personal information, contact us and we will delete it.</p>

      <h2>Who processes data for us</h2>
      <p>Vercel (hosting and analytics), Neon (database), Stripe (payments), Pi Network (sign-in and Pi payments in the Pi edition), Resend (email). Each handles data only to provide its service.</p>

      <h2>Keeping and deleting data</h2>
      <p>We keep account data while your account is active. To get a copy of your data or delete your account, email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        Guest data is tied only to a cookie; clearing your cookies disconnects it.</p>

      <h2>Security</h2>
      <p>Connections are encrypted (HTTPS), passwords are hashed, sessions are signed, and sign-in attempts are rate-limited.</p>

      <h2>Changes</h2>
      <p>If this policy changes in an important way, we will update the date above and tell signed-in players on the site.</p>
    </div>
  );
}
