import Image from "next/image";
import { personal, type Project } from "@/data";

const pipeline = [
  { id: "01", label: "Request", note: "Define the job", className: "pipeline-request" },
  { id: "02", label: "Queue", note: "Hold the state", className: "pipeline-queue" },
  { id: "03", label: "Generate", note: "Use the right model", className: "pipeline-model" },
  { id: "04", label: "Validate", note: "Catch weak output", className: "pipeline-validate" },
];

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
          <h1><span>The work behind</span><span>your product</span><span>should <em>just work.</em></span></h1>
          <p className="field-intro">Web apps, backend APIs, and practical AI workflows built to work reliably in production.</p>
          <div className="field-actions">
            <a className="field-button field-button-primary" href="#projects">View selected work <span aria-hidden="true">↘</span></a>
            <a className="field-text-link" href={`mailto:${personal.email}`}>Tell me what you&apos;re building <span aria-hidden="true">↗</span></a>
          </div>
          <div className="field-capabilities" aria-label="Areas of work">
            <span>Backend & APIs</span><span>AI workflows</span><span>Web products</span>
          </div>
        </div>

        <div className="system-sheet" role="img" aria-label={`A resilient ${featuredTitle} pipeline, from request through validation and recovery`}>
          <div className="system-sheet-head">
            <span><i /> SYSTEM NOTE / 001</span><span>BUILT TO RECOVER</span>
          </div>
          <div className="pipeline-map" aria-hidden="true">
            <svg className="pipeline-wires" viewBox="0 0 640 360" preserveAspectRatio="none">
              <path className="pipeline-wire" d="M72 112 H570" />
              <path className="pipeline-wire pipeline-wire-return" d="M493 145 V250 H345 V148" />
              <path className="pipeline-wire pipeline-wire-output" d="M570 112 H608 V300 H390" />
              <circle cx="72" cy="112" r="5" /><circle cx="570" cy="112" r="5" /><circle cx="390" cy="300" r="5" />
            </svg>
            {pipeline.map((step) => (
              <div className={`pipeline-node ${step.className}`} key={step.id}>
                <span>{step.id} / {step.label}</span><strong>{step.note}</strong>
              </div>
            ))}
            <span className="pipeline-branch-label">INVALID? RETRY WITH CONTEXT ↶</span>
            <span className="pipeline-output"><i /> ACCEPTED OUTPUT</span>
            <div className="pipeline-proof"><span>{featuredTitle.toUpperCase()} / RESULT</span><strong>{metricValue}</strong><small>{metricLabel}</small></div>
            <span className="pipeline-coordinate">DEHRADUN / IST</span>
          </div>
          <div className="system-sheet-foot">
            <Image src="/images/profile.png" alt="" width={40} height={40} />
            <span><strong>Shwetanshu Bhatt</strong><small>Backend · AI · Product engineering</small></span>
            <span className="sheet-stamp">FIELD<br />TESTED</span>
          </div>
        </div>
      </div>
      <div className="field-hero-index" aria-hidden="true">SB / 26</div>
    </section>
  );
}
