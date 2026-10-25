import { useEffect } from "react";

const MOTION_SELECTOR = [
  ".field-kicker",
  ".field-hero h1",
  ".field-intro",
  ".field-actions",
  ".field-capabilities",
  ".system-sheet",
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
  ".projects-heading",
  ".project-card",
  ".review-card",
  ".contact-grid",
].join(", ");

export default function MotionController() {
  useEffect(() => {
    let cleanupMotion: () => void = () => {};

    const activateMotion = () => {
      const root = document.documentElement;
      const items = Array.from(document.querySelectorAll<HTMLElement>(MOTION_SELECTOR));
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const heroDelays = [
        [".field-kicker", 0],
        [".field-hero h1", 140],
        [".field-intro", 260],
        [".field-actions", 370],
        [".field-capabilities", 470],
        [".system-sheet", 220],
      ] as const;
      root.classList.add("motion-ready");

      items.forEach((item, index) => {
        item.classList.add(item.matches(".hero-stage") ? "motion-fade" : "motion-reveal");
        const heroDelay = heroDelays.find(([selector]) => item.matches(selector))?.[1];
        item.style.setProperty("--motion-delay", `${heroDelay ?? (index % 5) * 90}ms`);
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
        { rootMargin: "18% 0px 18% 0px", threshold: 0 },
      );

      const revealVisibleItems = () => {
        items.forEach((item) => {
          if (item.classList.contains("is-in-view")) return;
          const bounds = item.getBoundingClientRect();
          if (bounds.top <= window.innerHeight * 1.18 && bounds.bottom >= -window.innerHeight * 0.18) {
            item.classList.add("is-in-view");
            observer.unobserve(item);
          }
        });
      };
      const handleHashChange = () => window.requestAnimationFrame(revealVisibleItems);

      items.forEach((item) => observer.observe(item));
      window.addEventListener("scroll", revealVisibleItems, { passive: true });
      window.addEventListener("hashchange", handleHashChange);
      revealVisibleItems();
      return () => {
        observer.disconnect();
        window.removeEventListener("scroll", revealVisibleItems);
        window.removeEventListener("hashchange", handleHashChange);
        root.classList.remove("motion-ready");
      };
    };

    const startMotion = () => { cleanupMotion = activateMotion(); };
    const waitForPortfolio = document.querySelector(".portfolio-preloader");
    if (waitForPortfolio) window.addEventListener("portfolio:ready", startMotion, { once: true });
    else startMotion();

    return () => {
      window.removeEventListener("portfolio:ready", startMotion);
      cleanupMotion();
    };
  }, []);

  return null;
}
