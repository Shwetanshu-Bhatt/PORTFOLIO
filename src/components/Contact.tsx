import { FormEvent, useState } from "react";
import { personal } from "@/data";
import Link from "next/link";

type SubmitState = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState("sending");

    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          email: values.get("email"),
          message: values.get("message"),
          website: values.get("website"),
        }),
      });

      if (!response.ok) throw new Error("Message could not be sent");
      form.reset();
      setSubmitState("sent");
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <section className="site-section contact-section" id="contact">
      <div className="section-inner">
        <div className="section-mark">Next / Let&apos;s work</div>
        <div className="contact-grid">
          <div className="contact-intro">
            <h2 className="contact-heading">Make the hard part <em>boring.</em></h2>
            <div className="contact-details">
              <span className="contact-kicker">Have a real problem to solve?</span>
              <a className="contact-link" href={`mailto:${personal.email}`}>{personal.email}</a>
              <p className="contact-note">Tell me what is stuck, what is slow, or what needs to exist. I&apos;ll get back to you with a clear next step.</p>
              <div className="local-service-links" aria-label="Development services in Dehradun">
                <Link href="/#services">Freelance development</Link>
                <Link href="/#services">Web development</Link>
                <Link href="/#services">Backend development</Link>
              </div>
              <div className="social-row">
                <a href={personal.github} target="_blank" rel="noreferrer">GitHub ↗</a>
                <a href={personal.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <label>
                Your name
                <input name="name" type="text" autoComplete="name" maxLength={80} required />
              </label>
              <label>
                Email address
                <input name="email" type="email" autoComplete="email" maxLength={254} required />
              </label>
            </div>
            <label>
              What can I help with?
              <textarea name="message" rows={5} maxLength={5000} required />
            </label>
            <label className="contact-form-trap" aria-hidden="true">
              Leave this field empty
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="contact-form-footer">
              <p className="contact-form-status" aria-live="polite">
                {submitState === "sent" && "Thanks — your message is on its way."}
                {submitState === "error" && <>Couldn&apos;t send that just now. Email me at <a href={`mailto:${personal.email}`}>{personal.email}</a>.</>}
              </p>
              <button className="contact-submit" type="submit" disabled={submitState === "sending"}>
                {submitState === "sending" ? "Sending…" : "Send message"}<span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
