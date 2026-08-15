"use client";

import { useTheme } from "@/hooks/useTheme";

const links = [
  ["01", "About", "about"],
  ["02", "Stack", "skills"],
  ["03", "Work", "experience"],
  ["04", "Projects", "projects"],
  ["05", "Contact", "contact"],
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
          <a href="#contact">Contact</a>
          <button onClick={toggleTheme} type="button" aria-label="Toggle color theme">
            {theme === "dark" ? "☼" : "◐"}
          </button>
        </div>
      </header>
    </>
  );
}
