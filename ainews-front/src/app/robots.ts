import type { MetadataRoute } from "next";
import { absoluteUrl, articleIndexable } from "@/lib/seo";

const PRIVATE = ["/admin", "/hesab", "/axtaris", "/sizin-ucun", "/baxis/", "/icmal/tesdiq", "/icmal/abunelikden-cix"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }],
    sitemap: [absoluteUrl("/sitemap.xml"), ...(articleIndexable ? [absoluteUrl("/news-sitemap.xml")] : [])],
    host: absoluteUrl("/"),
  };
}
