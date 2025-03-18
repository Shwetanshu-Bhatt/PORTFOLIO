"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

const Navbar = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : "light";

  const handleScroll = (section: string) => {
    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={`${currentTheme === "dark" ? "themeLight" : "theme"} fixed top-0 left-0 w-full shadow-md py-4 px-6 z-50 border-b border-gray-600`}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="font-bold text-lg cursor-pointer" onClick={() => handleScroll("hero")}>
          Shwetanshu Bhatt
        </h1>

        <div className="flex space-x-6">
          {["About", "Skills", "Projects", "Contact"].map((section) => (
            <button
              key={section}
              onClick={() => handleScroll(section)}
              className="nav-link hover:opacity-75 transition-all duration-200"
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        <button
          className={`px-5 py-2.5 rounded-lg border transition-all duration-200 shadow-md hover:shadow-lg font-semibold ${
            currentTheme === "dark"
              ? "bg-gray-100 border-gray-600 hover:bg-gray-300 hover:border-gray-500"
              : "bg-gray-1000 border-gray-400 hover:bg-gray-900 hover:border-gray-500"
          }`}
          onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
        >
          {currentTheme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
