import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const PRIVATE = ["/admin", "/hesab", "/axtaris", "/sizin-ucun", "/baxis/", "/icmal/tesdiq", "/icmal/abunelikden-cix"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }],
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/news-sitemap.xml")],
    host: absoluteUrl("/"),
  };
}
