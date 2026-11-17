import type { MetadataRoute } from "next";
const BASE = "https://buildthebunker.com";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/upgrade", "/privacy", "/terms"].map((p) => ({ url: BASE + p, changeFrequency: "weekly", priority: p === "" ? 1 : 0.5 }));
}
