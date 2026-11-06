import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-origin";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/portal", "/staff", "/api/", "/cart", "/login", "/register"] },
    sitemap: `${siteOrigin()}/sitemap.xml`
  };
}
