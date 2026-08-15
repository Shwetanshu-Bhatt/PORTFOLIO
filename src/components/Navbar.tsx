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
  useEffect(() => { fetch('/api/reviews').then(res => res.json()).then(data => setHasReviews((data.reviews || []).length > 0)).catch(() => undefined); }, []);
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

      <header className="mobile-nav">
        <Brand />
        <div className="mobile-nav-links">
          <a href="#projects">Work</a>
          {hasReviews && <a href="#reviews">Reviews</a>}
          <a href="#contact">Contact</a>
          <button onClick={toggleTheme} type="button" aria-label="Toggle color theme">
            {theme === "dark" ? "☼" : "◐"}
          </button>
        </div>
      </header>
    </>
  );
}
