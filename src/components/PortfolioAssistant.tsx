import { FormEvent, KeyboardEvent, UIEvent, useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const openingMessage: ChatMessage = {
  role: "assistant",
  content: "Hey—what are you trying to build, fix, or make simpler? Tell me a little about it and I’ll help you find the next step.",
};

const promptCards = [
  {
    index: "01",
    category: "THE BUILD",
    title: "From idea to product",
    description: "Web apps, backend systems, and useful AI.",
    prompt: "What kind of work do you take on?",
  },
  {
    index: "02",
    category: "UNDER THE HOOD",
    title: "How the QA Engine works",
    description: "Retries, validation, and systems built to recover.",
    prompt: "How did you build the QA Engine?",
  },
  {
    index: "03",
    category: "THE FIRST STEP",
    title: "Make the scope clearer",
    description: "Bring the rough version. We can start there.",
    prompt: "What would starting together look like?",
  },
];

export default function PortfolioAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([openingMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [activePrompt, setActivePrompt] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const promptTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen, isSending]);

  const sendMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content: cleanText }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/portfolio-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-8) }),
      });
      const result = await response.json() as { answer?: string; error?: string; diagnostic?: string };
      if (!response.ok || !result.answer) {
        const details = [result.error, result.diagnostic].filter(Boolean).join(" ");
        throw new Error(details || "I could not get an answer just now. Please try again shortly.");
      }
      setMessages((current) => [...current, { role: "assistant", content: result.answer! }]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "I could not get an answer just now. Please try again shortly.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const goToPrompt = (index: number) => {
    const safeIndex = Math.max(0, Math.min(promptCards.length - 1, index));
    const card = promptTrackRef.current?.children.item(safeIndex) as HTMLElement | null;
    if (!card) return;
    setActivePrompt(safeIndex);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    promptTrackRef.current?.scrollTo({ left: card.offsetLeft, behavior });
  };

  const handlePromptScroll = (event: UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    const cards = Array.from(track.children) as HTMLElement[];
    if (!cards.length) return;
    const nextIndex = cards.reduce((closestIndex, card, index) => {
      const closestDistance = Math.abs(cards[closestIndex].offsetLeft - track.scrollLeft);
      const cardDistance = Math.abs(card.offsetLeft - track.scrollLeft);
      return cardDistance < closestDistance ? index : closestIndex;
    }, 0);
    setActivePrompt((current) => current === nextIndex ? current : nextIndex);
  };

  return (
    <div className="portfolio-assistant">
      {isOpen && (
        <section id="portfolio-assistant-panel" className="assistant-panel" role="dialog" aria-label="Shwetanshu's custom project guide" aria-modal="false">
          <header className="assistant-header">
            <div>
              <span className="assistant-eyebrow"><i aria-hidden="true" /> SHWETANSHU / PROJECT DESK</span>
              <h2>What are you building?</h2>
              <p>How I work · What I&apos;ve built · Next steps</p>
            </div>
            <button className="assistant-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">×</button>
          </header>

          <div className="assistant-transcript" ref={transcriptRef} role="log" aria-live="polite" aria-relevant="additions text">
            <div className="assistant-scope-note">I built this guide around my work. Tell me what you need to make or fix, and we can start there.</div>
            {messages.map((message, index) => (
              <div className={`assistant-message is-${message.role}`} key={`${index}-${message.role}`}>
                {message.role === "assistant" && <span className="assistant-message-label">SB / PROJECT DESK</span>}
                <p>{message.content}</p>
              </div>
            ))}
            {messages.length === 1 && (
              <section className="assistant-prompt-picker" aria-label="Choose a conversation topic">
                <div className="assistant-prompt-toolbar">
                  <span><i aria-hidden="true" /> PICK A THREAD <b>{String(activePrompt + 1).padStart(2, "0")} / {String(promptCards.length).padStart(2, "0")}</b></span>
                  <div>
                    <button type="button" aria-label="Previous topic" onClick={() => goToPrompt(activePrompt - 1)} disabled={activePrompt === 0}>←</button>
                    <button type="button" aria-label="Next topic" onClick={() => goToPrompt(activePrompt + 1)} disabled={activePrompt === promptCards.length - 1}>→</button>
                  </div>
                </div>
                <div className="assistant-prompt-track" ref={promptTrackRef} onScroll={handlePromptScroll}>
                  {promptCards.map((card) => (
                    <button className="assistant-prompt-card" key={card.index} type="button" onClick={() => void sendMessage(card.prompt)} disabled={isSending}>
                      <span className="assistant-prompt-card-top"><span>{card.index} / {card.category}</span><i aria-hidden="true">↗</i></span>
                      <strong>{card.title}</strong>
                      <span className="assistant-prompt-description">{card.description}</span>
                    </button>
                  ))}
                </div>
                <div className="assistant-prompt-pagination" aria-label="Carousel pages">
                  {promptCards.map((card, index) => (
                    <button key={card.index} type="button" className={activePrompt === index ? "is-active" : ""} aria-label={`Go to topic ${index + 1}: ${card.category.toLowerCase()}`} aria-current={activePrompt === index ? "true" : undefined} onClick={() => goToPrompt(index)} />
                  ))}
                </div>
              </section>
            )}
            {isSending && <div className="assistant-message is-assistant assistant-typing" aria-label="Assistant is thinking"><span /><span /><span /></div>}
            {error && <p className="assistant-error" role="alert">{error}</p>}
          </div>

          <form className="assistant-form" onSubmit={handleSubmit}>
            <label className="assistant-input-label" htmlFor="portfolio-assistant-question">Your question</label>
            <input
              id="portfolio-assistant-question"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              maxLength={1000}
              placeholder="What are you trying to build or fix?"
              autoComplete="off"
              disabled={isSending}
            />
            <button type="submit" aria-label="Send question" disabled={!input.trim() || isSending}><span aria-hidden="true">↗</span></button>
          </form>
          <p className="assistant-disclosure">A custom guide built around my work · Your question is sent to an AI service · Please don&apos;t share sensitive details.</p>
        </section>
      )}

      <button
        className={`assistant-launcher${isOpen ? " is-open" : ""}`}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={isOpen ? "portfolio-assistant-panel" : undefined}
      >
        <span className="assistant-launcher-mark" aria-hidden="true"><i /></span>
        <span>{isOpen ? "Close" : "Talk through a project"}</span>
        <span className="assistant-launcher-arrow" aria-hidden="true">{isOpen ? "×" : "↗"}</span>
      </button>
    </div>
  );
}
