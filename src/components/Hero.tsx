import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

export default function Hero() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = useMemo(() => {
    return theme === "system" ? systemTheme : theme;
  }, [theme, systemTheme]);

  const themeClass = mounted && currentTheme === "dark" ? "themeLight" : "theme2";

  return (
    <section
      id="hero"
      className={`${themeClass} py-20 px-6 flex flex-col items-center justify-center min-h-screen text-center transition-all duration-500`}
    >
      <div className="w-48 h-50 rounded-full overflow-hidden border-4 border-blue-700 shadow-xl shadow-blue-500/20 mb-6 animate-fade-in">
        <Image
          src="/images/profile.png"
          alt="Shwetanshu Bhatt"
          width={155}
          height={155}
          className="object-cover mt-1 ml-6"
        />
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold">
        Hey, I&apos;m Shwetanshu Bhatt
      </h1>

      <p className="mt-6 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
        B.Tech student passionate about <span className="text-blue-400">AI</span>,{" "}
        <span className="text-purple-400">ML</span>, and{" "}
        <span className="text-pink-400">software development</span>. Currently working
        on stock market analysis, genetic algorithms, and innovative tech solutions.
      </p>
    </section>
  );
}