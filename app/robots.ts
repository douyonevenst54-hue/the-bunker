import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/p/", "/account", "/reset", "/forgot"] }],
    sitemap: "https://buildthebunker.com/sitemap.xml",
  };
}
