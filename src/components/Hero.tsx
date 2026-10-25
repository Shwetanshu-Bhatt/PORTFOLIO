import Image from "next/image";
import { personal, type Project } from "@/data";

export default function Hero({ featuredProject }: { featuredProject?: Project }) {
  const featuredStat = featuredProject?.stats[0] || "";
  const metricMatch = featuredStat.match(/^(\d+(?:\.\d+)?%?|\d+×)\s*(.*)$/i);
  const metricValue = metricMatch?.[1] || "FIELD";
  const metricLabel = metricMatch?.[2] || featuredStat || "SYSTEM NOTE";
  const featuredTitle = featuredProject?.title || "Featured system";

  return (
    <section className="site-section hero-section field-hero" id="hero">
      <div className="section-inner field-hero-inner">
        <div className="field-hero-copy">
          <p className="field-kicker"><span>Freelance software engineer</span><i /> Dehradun, India</p>
          <h1><span>Software that</span><span><em>holds up.</em></span></h1>
          <p className="field-intro">I build web apps, backend systems, and practical AI workflows that keep working after launch.</p>
          <div className="field-actions">
            <a className="field-button field-button-primary" href="#projects">View selected work <span aria-hidden="true">↘</span></a>
            <a className="field-text-link" href={`mailto:${personal.email}`}>Tell me what you&apos;re building <span aria-hidden="true">↗</span></a>
          </div>
          <div className="field-capabilities" aria-label="Areas of work">
            <span>Backend & APIs</span><span>AI workflows</span><span>Web products</span>
          </div>
        </div>

        <div className="hero-visual motion-reveal" role="img" aria-label={`Portrait of Shwetanshu Bhatt alongside a ${featuredTitle} result: ${metricValue} ${metricLabel}`}>
          <div className="hero-visual-meta"><span>Independent software engineer</span><span>Dehradun · India</span></div>
          <div className="hero-portrait-stage">
            <Image className="hero-portrait" src="/images/profile.png" alt="" width={720} height={900} priority sizes="(max-width: 900px) 90vw, 42vw" />
            <span className="hero-monogram" aria-hidden="true">SB</span>
            <div className="hero-proof-card"><span>{featuredTitle}</span><strong>{metricValue}</strong><small>{metricLabel}</small></div>
            <span className="hero-photo-index" aria-hidden="true">01 / 06</span>
          </div>
        </div>
      </div>
      <div className="field-hero-index" aria-hidden="true">SB / 26</div>
    </section>
  );
}
