"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

const baseLinks = [
  ["01", "About", "about"],
  ["02", "Stack", "skills"],
  ["03", "Work", "experience"],
  ["04", "Projects", "projects"],
];

function Brand() {
  return (
    <a className="nav-brand" href="#hero" aria-label="Back to the top">
      <span className="nav-brand-mark">S</span>
      <span className="nav-brand-name">SB / 26</span>
    </a>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [hasReviews, setHasReviews] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => { fetch('/api/reviews').then(res => res.json()).then(data => setHasReviews((data.reviews || []).length > 0)).catch(() => undefined); }, []);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);
  const links = [...baseLinks, ...(hasReviews ? [["05", "Reviews", "reviews"]] : []), [hasReviews ? "06" : "05", "Contact", "contact"]];

  return (
    <>
      <aside className="site-nav" aria-label="Primary navigation">
        <Brand />
        <nav className="nav-links">
          {links.map(([number, label, id]) => (
            <a className="nav-link" href={`#${id}`} key={id}>
              <span aria-hidden="true">{number} </span>{label}
            </a>
          ))}
        </nav>
        <div className="nav-bottom">
          <span className="nav-status"><i className="status-dot" /> Open to work</span>
          <button className="theme-toggle" onClick={toggleTheme} type="button">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      <header className={`mobile-nav${mobileMenuOpen ? ' is-open' : ''}`}>
        <Brand />
        <button
          aria-controls="mobile-navigation"
          aria-expanded={mobileMenuOpen}
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(open => !open)}
          type="button"
        >
          <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
          <i aria-hidden="true" />
        </button>
        <div className="mobile-nav-menu" id="mobile-navigation">
          <nav className="mobile-nav-links" aria-label="Mobile navigation">
            {links.map(([number, label, id]) => (
              <a href={`#${id}`} key={id} onClick={() => setMobileMenuOpen(false)}>
                <span>{number}</span>{label}
              </a>
            ))}
          </nav>
          <div className="mobile-nav-meta">
            <span className="nav-status"><i className="status-dot" /> Open to work</span>
            <button onClick={toggleTheme} type="button">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
