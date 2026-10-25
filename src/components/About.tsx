export default function About() {
  return (
    <section className="site-section" id="about">
      <div className="section-inner editorial-grid">
        <div className="section-index" aria-hidden="true">01</div>
        <div className="about-layout">
          <div className="about-story">
            <div className="section-mark">How I think about the work</div>
            <h2 className="section-heading">Happy paths are easy. <em>I design for what happens next.</em></h2>
            <p className="about-copy">
              I&apos;m a <strong>backend developer and AI systems engineer</strong> who turns fuzzy requirements into dependable workflows: clear data models, observable jobs, careful retries, and APIs that can grow with the product.
            </p>
          </div>
          <div className="proof-grid" aria-label="Selected results">
            <div className="proof-item"><span className="proof-value">90%</span><span className="proof-label">faster generation time</span></div>
            <div className="proof-item"><span className="proof-value">3×</span><span className="proof-label">AI providers integrated</span></div>
            <div className="proof-item"><span className="proof-value">1</span><span className="proof-label">production engine shipped</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
