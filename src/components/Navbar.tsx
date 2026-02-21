"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleScroll = (section: string) => {
    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[var(--bg-primary)]/90 backdrop-blur-lg border-b border-[var(--border-color)]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleScroll("hero")}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[var(--accent-primary)]">
              <Image
                src="/Shwetanshu.png"
                alt="Shwetanshu Bhatt"
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)]">SB</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            {["About", "Skills", "Experience", "Education", "Projects", "Contact"].map((section) => (
              <button
                key={section}
                onClick={() => handleScroll(section)}
                className="nav-link"
              >
                {section}
              </button>
            ))}
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="nav-link flex items-center justify-center w-10 h-10 ml-2"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--text-primary)] p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--border-color)]">
            <div className="flex flex-col py-2">
              {["About", "Skills", "Experience", "Education", "Projects", "Contact"].map((section) => (
                <button
                  key={section}
                  onClick={() => handleScroll(section)}
                  className="nav-link text-left py-3 px-4"
                >
                  {section}
                </button>
              ))}
              {/* Theme Toggle in Mobile Menu */}
              <button
                onClick={toggleTheme}
                className="nav-link text-left py-3 px-4 flex items-center gap-2"
              >
                {theme === "light" ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Dark Mode
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Light Mode
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
