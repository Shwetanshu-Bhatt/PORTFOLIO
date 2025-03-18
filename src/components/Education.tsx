import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Footer() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

    const currentTheme = theme === "system" ? systemTheme : theme;

    return (
      <section
        id = "Footer"
        className={`${mounted && currentTheme === "dark" ? "themeLight" : "theme2"}
          py-20 px-5 text-white text-center`}>
        <h2 className="text-4xl font-bold">Education</h2>
        <div className="mt-8 max-w-3xl mx-auto p-5 border-2 border-white rounded-lg">
          <h3 className="text-2xl font-semibold">B.Tech in Computer Science</h3>
          <p className="text-gray-400">Graphic Era Hill University, Dehradun</p>
          <p className="mt-2">Focused on AI, ML, and software development.</p>
        </div>
      </section>
    );
  }
  