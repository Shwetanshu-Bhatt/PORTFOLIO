
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Footer() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const currentTheme = theme === "system" ? systemTheme : theme;
  const projects = [
      {
        title: "Data-Collection",
        description: "Collecting stock data of some important stocks",
        link: "#",
      },
      {
        title: "InvestWise",
        description: "Stock market analysis using AI.",
        link: "#",
      },
      {
        title: "Haptic Hearing System",
        description: "Converting sound into vibrations for the hearing impaired.",
        link: "#",
      },
      {
        title: "Evolutionary Maze Solver",
        description: "Solving mazes using genetic algorithms with Java Swing GUI.",
        link: "#",
      },
      {
        title: "BioSim",
        description: "Visualising evolution and genetic traits.",
        link: "#",
      },
      {
        title: "Any Downloader",
        description: "Downloading any video from different platforms like youtube",
        link: "#",
      },
      {
        title: "Weather-app",
        description: "Getting weather condition of any place of past and future",
        link: "#",
      },
    ];
  
    return (
      <section
        id = "Projects"
        className={`${mounted && currentTheme === "dark" ? "themeLight" : "theme2"}
          py-20 px-5 text-center`}>
        <h2 className="text-4xl font-bold">Projects</h2>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto center">
          {projects.map((project, index) => (
            <a key={index} href={project.link} className="block p-5 border-2 border-white rounded-lg ">
              <h3 className="text-2xl font-semibold">{project.title}</h3>
              <p className="mt-2">{project.description}</p>
            </a>
          ))}
        </div>
      </section>
    );
  }
  