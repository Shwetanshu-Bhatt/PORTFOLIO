import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Hero() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <section
      id="hero"
      className={`${
        mounted && currentTheme === "dark" ? "themeLight" : "theme2"
      } flex flex-col items-center justify-center min-h-screen px-5 text-white text-center`}
    >
      <h1 className="text-5xl font-bold">Hey, I&apos;m Shwetanshu Bhatt</h1>
      <p className="mt-6 text-lg max-w-3xl mx-auto">
        B.Tech student passionate about AI, ML, and software development.  
        Currently working on stock market analysis, genetic algorithms, and innovative tech solutions.
      </p>
    </section>
  );
}
