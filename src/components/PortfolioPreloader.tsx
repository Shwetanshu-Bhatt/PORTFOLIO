import { useEffect, useState } from "react";

const DISPLAY_TIME = 3000;
const EXIT_TIME = 520;

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
    <div className={`portfolio-preloader portfolio-preloader--${phase}`} role="status" aria-label="Loading portfolio">
      <div className="preloader-atmosphere" aria-hidden="true" />

      <header className="preloader-header">
        <span className="preloader-mark">SB<span>.</span></span>
        <span>INDEPENDENT SOFTWARE ENGINEER</span>
        <span>DEHRADUN / IN</span>
      </header>

      <main className="preloader-main">
        <div className="preloader-lockup">
          <p className="preloader-kicker"><i /> A PRACTICAL SOFTWARE PRACTICE</p>
          <h1><span>SHWETANSHU</span><em>BHATT.</em></h1>
          <div className="preloader-rule"><span /></div>
          <p className="preloader-description">Websites, systems, and useful automation for the messy parts.</p>
        </div>

        <div className="preloader-stages" aria-hidden="true">
          <div className="preloader-stage preloader-stage--one">
            <span>01</span><strong>THINK</strong><small>Find the signal</small><b>↗</b>
          </div>
          <div className="preloader-stage preloader-stage--two">
            <span>02</span><strong>BUILD</strong><small>Make it useful</small><b>↗</b>
          </div>
          <div className="preloader-stage preloader-stage--three">
            <span>03</span><strong>SHIP</strong><small>Keep it calm</small><b>↗</b>
          </div>
          <div className="preloader-stage-line" />
        </div>
      </main>

      <footer className="preloader-footer">
        <div className="preloader-progress"><span /></div>
        <div className="preloader-footer-copy"><span>LOADING SELECTED WORK</span><span>SOFTWARE · AI · AUTOMATION</span><span>SB / 26</span></div>
      </footer>
    </div>
  );
}
