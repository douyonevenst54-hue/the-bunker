import type { NextConfig } from "next";

const security = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\")" },
];

const config: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: security }];
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
