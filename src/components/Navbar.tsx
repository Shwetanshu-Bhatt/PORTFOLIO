"use client";

import { useState } from "react";
import Image from "next/image";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (section: string) => {
    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-[#2a2a3a]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleScroll("hero")}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#6366f1]">
              <Image
                src="/Shwetanshu.png"
                alt="Shwetanshu Bhatt"
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="font-bold text-lg text-[#f0f0f5]">SB</span>
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
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#f0f0f5] p-2"
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
          <div className="md:hidden border-t border-[#2a2a3a]">
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
