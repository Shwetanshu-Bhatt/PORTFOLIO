import { useEffect, useState } from "react";

const DISPLAY_TIME = 900;
const EXIT_TIME = 360;

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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      restoreBody();
      setPhase("hidden");
      window.requestAnimationFrame(() => window.dispatchEvent(new Event("portfolio:ready")));
      return restoreBody;
    }

    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(DISPLAY_TIME - (performance.now() - startedAt), 0);

      exitTimer = window.setTimeout(() => {
        setPhase("exiting");
        hideTimer = window.setTimeout(() => {
          restoreBody();
          setPhase("hidden");
          window.requestAnimationFrame(() => window.dispatchEvent(new Event("portfolio:ready")));
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
    <div className={`portfolio-preloader portfolio-preloader--${phase}`} role="status" aria-label="Preparing Shwetanshu Bhatt’s portfolio">
      <main className="preloader-content">
        <div className="preloader-kicker"><span>SB / SYSTEMS FIELD MANUAL</span><span>DEHRADUN · INDIA</span></div>
        <h1>The work behind your product <em>should just work.</em></h1>
        <p className="preloader-description">{phase === "exiting" ? "SYSTEM READY / OPENING PORTFOLIO" : "MAPPING REQUESTS · CHECKING FAILURES · BUILDING THE VIEW"}</p>
        <div className="preloader-pipeline" aria-hidden="true">
          <span><i>01</i> REQUEST</span><b />
          <span><i>02</i> BUILD</span><b />
          <span><i>03</i> VALIDATE</span><b />
          <span><i>04</i> READY</span>
        </div>
        <div className="preloader-loading" aria-hidden="true"><span /></div>
        <p className="preloader-status"><span>STARTUP SEQUENCE</span><span>FIELD NOTE / 001</span></p>
      </main>
    </div>
  );
}
