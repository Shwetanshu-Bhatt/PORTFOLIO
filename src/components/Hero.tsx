"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { personal } from "@/data";

export default function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const resetPointer = () => setPointer({ x: 0, y: 0 });
    stage.addEventListener("pointerleave", resetPointer);
    return () => stage.removeEventListener("pointerleave", resetPointer);
  }, []);

  const handleStagePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    });
  };

  const stageStyle = {
    "--pointer-x": `${pointer.x}`,
    "--pointer-y": `${pointer.y}`,
  } as CSSProperties;

  return (
    <section className="site-section hero-section hero-experience" id="hero">
      <div className="hero-topline" aria-hidden="true">
        <span>Field notes / 001</span>
        <span className="hero-topline-center"><i /> System online</span>
        <span>Scroll to deploy ↓</span>
      </div>

      <div className="section-inner hero-grid hero-experience-grid">
        <div className="hero-copy-column">
          <p className="eyebrow">Independent software engineer / Dehradun, IN</p>
          <h1 className="hero-title">
            <span>Build</span>
            <span className="outline">the</span>
            <span className="accent-line">hard part.</span>
          </h1>
          <div className="hero-copy">
            <div className="hero-copy-line" aria-hidden="true" />
            <p>{personal.description} I care about the seams: failure states, useful abstractions, and software that stays calm under load.</p>
          </div>
          <div className="hero-actions">
            <a className="button-primary" href="#projects">Explore selected work <span className="button-arrow">↘</span></a>
            <Link className="button-ghost" href="/world">Enter 3D World <span className="button-arrow"></span></Link>
            <a className="button-ghost" href={`mailto:${personal.email}`}>Start a conversation</a>
          </div>
          <div className="hero-signal-row" aria-label="Specialties">
            <span><i /> Python / backend</span>
            <span><i /> AI integrations</span>
            <span><i /> Production calm</span>
          </div>
        </div>

        <div
          ref={stageRef}
          className="hero-stage"
          style={stageStyle}
          onPointerMove={handleStagePointerMove}
          aria-label="Interactive systems map"
        >
          <div className="stage-sun" aria-hidden="true" />

          <div className="stage-profile-card">
            <div className="stage-profile-top"><span>Profile / 001</span><strong>Available</strong></div>
            <div className="stage-profile-image">
              <Image src="/images/profile.png" alt={personal.name} width={425} height={587} priority />
              <div className="stage-profile-caption">
                <strong>Shwetanshu<br />Bhatt</strong>
                <span>Backend<br />+ AI systems</span>
              </div>
            </div>
            <div className="stage-profile-bottom"><span>Currently building</span><strong>Reliable things</strong></div>
          </div>
        </div>
      </div>

      <div className="hero-marquee" aria-hidden="true">
        <div>Make it useful <span>-</span> Make it resilient <span>-</span> Make it feel alive <span>-</span> Make it useful <span>-</span> Make it resilient <span>-</span></div>
      </div>
      <div> 
      <a className="hero-scroll" href="#about">Scroll to inspect</a>
      </div>
    </section>
  );
}
