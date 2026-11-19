import type { MetadataRoute } from "next";
import { brandColors } from "@/lib/brand";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    lang: "az",
    start_url: "/",
    display: "standalone",
    background_color: brandColors.paper,
    theme_color: brandColors.ink,
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
