import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    // Old static URLs from the first prototype.
    return [
      { source: "/medical", destination: "/room/medical", permanent: true },
      { source: "/medical/", destination: "/room/medical", permanent: true },
    ];
  },
};

export default config;
