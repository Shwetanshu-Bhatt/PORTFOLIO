import { useEffect, useState } from "react";

const DISPLAY_TIME = 650;
const EXIT_TIME = 280;

export default function PortfolioPreloader() {
  const [phase, setPhase] = useState<"loading" | "exiting" | "hidden">("loading");

  useEffect(() => {
    const startedAt = performance.now();
    const previousOverflow = document.body.style.overflow;
    let finished = false;
    let exitTimer: number | undefined;
    let hideTimer: number | undefined;

    document.body.style.overflow = "hidden";

    const restoreBody = () => {
      document.body.style.overflow = previousOverflow;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(DISPLAY_TIME - (performance.now() - startedAt), 0);

      exitTimer = window.setTimeout(() => {
        setPhase("exiting");
        hideTimer = window.setTimeout(() => {
          restoreBody();
          setPhase("hidden");
        }, EXIT_TIME);
      }, wait);
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    const failsafe = window.setTimeout(finish, DISPLAY_TIME + 2000);

    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(failsafe);
      if (exitTimer) window.clearTimeout(exitTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
      restoreBody();
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div className={`portfolio-preloader portfolio-preloader--${phase}`} role="status" aria-label="Preparing portfolio">
      <main className="preloader-content">
        <div className="preloader-mark" aria-hidden="true">SB<span>.</span></div>
        <p className="preloader-kicker">INDEPENDENT SOFTWARE ENGINEER <i /> DEHRADUN, INDIA</p>
        <h1>Shwetanshu <em>Bhatt</em></h1>
        <p className="preloader-description">Reliable software, backend systems, and AI integrations.</p>
        <div className="preloader-loading" aria-hidden="true"><span /></div>
        <p className="preloader-status">Preparing selected work<span>PLEASE WAIT</span></p>
      </main>
    </div>
  );
}
