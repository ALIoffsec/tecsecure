"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";

const parentRoutes: Record<string, string> = {
  "/products": "/",
  "/services": "/",
  "/learning": "/",
  "/news": "/",
  "/portal": "/",
  "/admin": "/",
  "/staff/login": "/"
};

function getParentRoute(pathname: string): string {
  if (pathname.startsWith("/products/")) return "/products";
  if (pathname.startsWith("/services/")) return "/services";
  if (pathname.startsWith("/learning/")) return "/learning";
  if (pathname.startsWith("/news/")) return "/news";
  if (pathname.startsWith("/portal/")) return "/portal";
  if (pathname.startsWith("/admin/")) return "/admin";
  if (pathname === "/contact" || pathname === "/consultation" || pathname === "/request-service" || pathname === "/cybersecurity" || pathname === "/monitoring") return "/services";
  if (pathname === "/request-quote") return "/products";
  if (pathname === "/privacy" || pathname === "/terms") return "/learning";
  return parentRoutes[pathname] ?? "/";
}

export function PageBackLink() {
  const pathname = usePathname();
  const { t } = useSitePreferences();
  if (pathname === "/") return null;

  return (
    <div className="container page-back-wrap">
      <Link
        className="page-back-link"
        href={getParentRoute(pathname)}
        onClick={(event) => {
          if (window.history.length > 1) {
            event.preventDefault();
            window.history.back();
          }
        }}
      >
        <span aria-hidden="true">←</span>
        {t("goBack")}
      </Link>
    </div>
  );
}
