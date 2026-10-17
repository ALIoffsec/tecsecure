"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";

const slides = [
  {
    id: "business",
    eyebrow: "heroEyebrow",
    title: "introTitle",
    description: "introDescription",
    links: [
      { label: "navServices", href: "/services", style: "" },
      { label: "navMarket", href: "/products", style: "secondary" },
      { label: "navEducation", href: "/learning", style: "ghost" }
    ]
  },
  {
    id: "infrastructure",
    eyebrow: "heroInfrastructureEyebrow",
    title: "heroInfrastructureTitle",
    description: "heroInfrastructureDescription",
    links: [
      { label: "navServices", href: "/services", style: "" },
      { label: "requestAQuote", href: "/request-quote", style: "secondary" }
    ]
  },
  {
    id: "security",
    eyebrow: "heroSecurityEyebrow",
    title: "heroSecurityTitle",
    description: "heroSecurityDescription",
    links: [
      { label: "cybersecurity", href: "/cybersecurity", style: "" },
      { label: "contact", href: "/contact", style: "secondary" }
    ]
  }
] as const;

const slideInterval = 12_000;

export function HomeHeroAlbum() {
  const { t } = useSitePreferences();
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, slideInterval);
    return () => window.clearInterval(timer);
  }, [activeSlide, paused]);

  return (
    <section
      className={`hero intro-hero hero-album${paused ? " is-paused" : ""}`}
      aria-label={t("heroAlbumLabel")}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="hero-album-slides">
        {slides.map((slide, index) => (
          <article
            aria-hidden={activeSlide !== index}
            aria-roledescription={t("heroSlideLabel")}
            className={`hero-album-slide hero-album-slide-${slide.id}${activeSlide === index ? " active" : ""}`}
            inert={activeSlide !== index}
            key={slide.id}
          >
            <div className="container intro-content hero-album-content">
              <span className="eyebrow">{t(slide.eyebrow)}</span>
              <h1>{t(slide.title)}</h1>
              <p className="lead">{t(slide.description)}</p>
              <div className="hero-actions">
                {slide.links.map((link) => (
                  <Link className={`button ${link.style}`.trim()} href={link.href} key={link.href}>
                    {t(link.label)}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="hero-album-controls">
        <div className="hero-album-pagination" role="group" aria-label={t("heroAlbumLabel")}>
          {slides.map((slide, index) => (
            <button
              aria-current={activeSlide === index ? "true" : undefined}
              aria-label={`${t("heroSlideLabel")} ${index + 1}`}
              className={`hero-album-page${activeSlide === index ? " active" : ""}`}
              key={slide.id}
              onClick={() => setActiveSlide(index)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i aria-hidden="true"><b /></i>
            </button>
          ))}
        </div>
        <span className="hero-album-counter" aria-live="polite">
          {String(activeSlide + 1).padStart(2, "0")} <i>/</i> {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
