"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";

const links = [
  ["Selected work", "projects"],
  ["Services", "services"],
  ["About", "about"],
  ["Experience", "experience"],
];

function Brand() {
  return (
    <a className="nav-brand" href="#hero" aria-label="Shwetanshu Bhatt, home">
      <Image className="nav-brand-mark" src="/logo.svg" alt="" width={42} height={42} />
      <span className="nav-brand-name">Shwetanshu Bhatt<span>Freelance developer</span></span>
    </a>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [hasReviews, setHasReviews] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/reviews").then(res => res.json()).then(data => setHasReviews((data.reviews || []).length > 0)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const navLinks = hasReviews ? [...links, ["Reviews", "reviews"]] : links;
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="header-links" aria-label="Primary navigation">
          {navLinks.map(([label, id]) => <a href={`#${id}`} key={id}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} type="button">
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <a className="header-cta" href="#contact">Start a project <span aria-hidden="true">↗</span></a>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(open => !open)}
            type="button"
          >
            <span>{mobileMenuOpen ? "Close" : "Menu"}</span><i aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className={`mobile-nav-menu${mobileMenuOpen ? " is-open" : ""}`} id="mobile-navigation">
        <nav className="mobile-nav-links" aria-label="Mobile navigation">
          {navLinks.map(([label, id]) => <a href={`#${id}`} key={id} onClick={closeMenu}>{label}<span aria-hidden="true">↘</span></a>)}
        </nav>
        <div className="mobile-nav-meta">
          <button onClick={toggleTheme} type="button">Switch to {theme === "dark" ? "light" : "dark"} mode</button>
          <a className="header-cta" href="#contact" onClick={closeMenu}>Start a project <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </header>
  );
}
