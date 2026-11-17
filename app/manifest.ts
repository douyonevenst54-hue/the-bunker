import type { MetadataRoute } from "next";
/** Lets players add THE BUNKER to their phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "THE BUNKER — Build your bunker. Protect lives.",
    short_name: "THE BUNKER",
    description: "Emergency-preparedness game for families, in English and Haitian Creole.",
    start_url: "/",
    display: "standalone",
    background_color: "#10151c",
    theme_color: "#10151c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
