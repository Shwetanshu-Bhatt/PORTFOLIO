export default function About() {
  return (
    <section className="site-section" id="about">
      <div className="section-inner editorial-grid">
        <div className="section-index" aria-hidden="true">01</div>
        <div>
          <div className="section-mark">About the work</div>
          <h2 className="section-heading">Systems with a <em>point of view.</em></h2>
          <p className="about-copy">
            I&apos;m a <strong>backend developer and AI systems engineer</strong> who likes turning ambiguous ideas into dependable products. My strongest work lives where product thinking meets infrastructure: data models, job orchestration, APIs, and the little decisions that keep a system observable and recoverable.
          </p>
          <div className="proof-grid" aria-label="Selected results">
            <div className="proof-item"><span className="proof-value">95%</span><span className="proof-label">lower operating cost</span></div>
            <div className="proof-item"><span className="proof-value">90%</span><span className="proof-label">faster generation time</span></div>
            <div className="proof-item"><span className="proof-value">3×</span><span className="proof-label">AI providers integrated</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
