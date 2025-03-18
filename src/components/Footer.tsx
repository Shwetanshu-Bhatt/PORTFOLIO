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
          py-5 text-white text-center`}>
        <p>&copy; {new Date().getFullYear()} Shwetanshu Bhatt. All Rights Reserved.</p>
      </section>
    );
  }
  