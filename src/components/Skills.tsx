import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Footer() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const currentTheme = theme === "system" ? systemTheme : theme;
  const skills = [
      "Java", "Python", "C++", "JavaScript", "TypeScript",
      "Next.js", "React", "Tailwind CSS", "AI/ML", "Neural Networks",
      "Data Structures & Algorithms", "Stock Market Analysis"
    ];
    
  
  return (
      <section
        id = "Skills"
        className={`${mounted && currentTheme === "dark" ? "themeLight" : "theme2"}
          py-20 px-5 text-center`}>
        <h2 className="text-4xl font-bold">Skills</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {skills.map((skill, index) => (
            <span key={index} className="px-4 py-2 border-2 border-white rounded-lg">
              {skill}
            </span>
          ))}
        </div>
      </section>
    );
  }
  