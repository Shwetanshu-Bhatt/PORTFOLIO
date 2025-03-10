import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

const Navbar = () => {
  const [theme, setTheme] = useState<string>("theme");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") || "theme";
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme2", theme);
      const dark =
        theme === "dark" || (theme === "theme" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    }
  }, [theme]);

  useEffect(() => {
    if (theme === "theme") {
      const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        document.documentElement.classList.toggle("dark", matchMedia.matches);
      };
      matchMedia.addEventListener("change", handleChange);
      return () => matchMedia.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <nav className={`${theme === "dark" ? "themeLight" : "theme"} fixed top-0 left-0 w-full shadow-md py-4 px-6 z-50 border-b border-gray-600`}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="font-bold text-lg cursor-pointer" onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}>
          Shwetanshu Bhatt
        </h1>

        <div className="flex space-x-6">
          {["about", "skills", "projects", "contact"].map((section) => (
            <button key={section} onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })} className="nav-link hover:opacity-75">
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
        

        <button
          className={`px-5 py-2.5 rounded-lg border transition-all duration-200 shadow-md hover:shadow-lg font-semibold ${
            theme === "dark"
              ? "bg-gray-100 border-gray-600 hover:bg-gray-300 hover:border-gray-500"
              : "bg-gray-1000  border-gray-400 hover:bg-gray-900 hover:border-gray-500"
          }`}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
