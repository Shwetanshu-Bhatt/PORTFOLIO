import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Contact() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

    const currentTheme = theme === "system" ? systemTheme : theme;

    return (
      <section
        id = "Contact"
        className={`${mounted && currentTheme === "dark" ? "themeLight" : "theme2"}
          py-20 px-5 text-white text-center`}>
        <h2 className="text-4xl font-bold">Contact</h2>
        <p className="mt-5">Feel free to reach out to me!</p>
        <div className="mt-8 flex justify-center gap-4 items-center">
          <a href="mailto:shwetanshubhatt@gmail.com" className="text-lg bg-red-500 px-6 py-2 rounded-lg">
            Mail Me
          </a>
          <a href="https://www.linkedin.com/in/shwetanshu-bhatt-082167257" className="text-lg bg-blue-600 px-6 py-2 rounded-lg">
            LinkedIn
          </a>
          <a href="https://github.com/Shwetanshu-Bhatt" className="text-lg bg-gray-700 px-6 py-2 rounded-lg">
            GitHub
          </a>
        </div>
      </section>
    );
  }
  