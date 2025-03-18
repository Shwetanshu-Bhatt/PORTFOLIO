import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function About() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const currentTheme = theme === "system" ? systemTheme : theme;

    return (
      <section
        id = "About"
        className={`${mounted && currentTheme === "dark" ? "themeLight" : "theme2"}
           py-20 px-5 text-center`}>
        <h2 className="text-4xl font-bold">About Me</h2>
        <p className="mt-5 pb-6 text-lg max-w-3xl mx-auto">
          I&apos;am a Passionate B.Tech student with a focus on AI, ML, and software development.  
          I love working on innovative projects, from financial applications to AI-driven solutions.
        </p>
      </section>
    );
  }
  