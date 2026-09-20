import { useEffect } from "react";

const MOTION_SELECTOR = [
  ".hero-topline",
  ".hero-copy-column > .eyebrow",
  ".hero-title",
  ".hero-copy-column > .hero-copy",
  ".hero-actions",
  ".hero-signal-row",
  ".hero-stage",
  ".hero-scroll",
  ".site-section:not(.hero-section) .section-mark",
  ".site-section:not(.hero-section) .section-heading",
  ".about-copy",
  ".proof-item",
  ".services-intro",
  ".service-card",
  ".skill-block",
  ".timeline-entry",
  ".education-row",
  ".featured-project",
  ".project-card",
  ".review-card",
  ".contact-grid",
].join(", ");

export default function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll<HTMLElement>(MOTION_SELECTOR));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.classList.add("motion-ready");

    items.forEach((item, index) => {
      item.classList.add(item.matches(".hero-stage") ? "motion-fade" : "motion-reveal");
      item.style.setProperty("--motion-delay", `${(index % 5) * 70}ms`);
    });

    if (reducedMotion) {
      items.forEach((item) => item.classList.add("is-in-view"));
      return () => root.classList.remove("motion-ready");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in-view");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
