import type { NextConfig } from "next";

const security = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\")" },
];

// The Pi edition is shown inside the Pi Browser sandbox and PiNet, so it may be framed by Pi's sites only.
const piHosts = (process.env.PI_HOSTS ?? "pi.buildthebunker.com,testnet.buildthebunker.com").split(",").map((h) => h.trim()).filter(Boolean);
const piHostRe = `(${piHosts.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`;
const PI_FRAMERS = "frame-ancestors 'self' https://*.minepi.com https://*.pinet.com https://*.pi.app https://sandbox.minepi.com";

const config: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: security },
      { source: "/:path*", missing: [{ type: "host", value: piHostRe }], headers: [{ key: "X-Frame-Options", value: "DENY" }, { key: "Content-Security-Policy", value: "frame-ancestors 'none'" }] },
      { source: "/:path*", has: [{ type: "host", value: piHostRe }], headers: [{ key: "Content-Security-Policy", value: PI_FRAMERS }] },
    ];
  },
  async redirects() {
    // Old static URLs from the first prototype.
    return [
      { source: "/medical", destination: "/room/medical", permanent: true },
      { source: "/medical/", destination: "/room/medical", permanent: true },
    ];
  },
};

export default config;
