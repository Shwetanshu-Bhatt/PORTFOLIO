import { personal } from "@/data";

export default function Contact() {
  return (
    <section className="site-section contact-section" id="contact">
      <div className="section-inner">
        <div className="section-mark">Next / Let&apos;s work</div>
        <div className="contact-grid">
          <h2 className="contact-heading">Make the hard part <em>boring.</em></h2>
          <div className="contact-details">
            <span className="contact-kicker">Have a real problem to solve?</span>
            <a className="contact-link" href={`mailto:${personal.email}`}>{personal.email}</a>
            <p className="contact-note">Tell me what is stuck, what is slow, or what needs to exist. I&apos;ll get back to you with a clear next step.</p>
            <div className="social-row">
              <a href={personal.github} target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
