export default function About() {
  return (
    <section id="About" className="py-24 px-6 bg-[#12121a]">
      <div className="container">
        <h2 className="section-title mb-3">About Me</h2>
        
        <div className="card max-w-4xl mx-auto">
          <p className="text-base md:text-lg text-[#a0a0b0] leading-relaxed mb-5">
            I'm a <span className="text-[#f0f0f5] font-medium">Backend Developer</span> specializing in 
            <span className="text-[#6366f1]"> production-scale AI-integrated backend systems</span>. 
            I have hands-on experience building an internal QA Engine used in production that automated 
            technical question generation, reducing operational cost by <span className="text-[#ec4899] font-semibold">95%</span> and 
            generation time by <span className="text-[#ec4899] font-semibold">90%</span>.
          </p>
          
          <p className="text-base md:text-lg text-[#a0a0b0] leading-relaxed mb-6">
            I'm experienced in designing <span className="text-[#f0f0f5] font-medium">fault-tolerant architectures</span> using 
            Python, PostgreSQL, concurrency control, and multi-AI integration. My work involves building 
            robust backend systems that can handle autonomous long-running execution with features like 
            lease-based locking, crash recovery, and deterministic ID generation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-[#0a0a0f] rounded-lg border border-[#2a2a3a]">
              <div className="text-3xl font-bold gradient-text">95%</div>
              <div className="text-sm text-[#a0a0b0] mt-1">Cost Reduction</div>
            </div>
            <div className="text-center p-4 bg-[#0a0a0f] rounded-lg border border-[#2a2a3a]">
              <div className="text-3xl font-bold gradient-text">90%</div>
              <div className="text-sm text-[#a0a0b0] mt-1">Time Reduction</div>
            </div>
            <div className="text-center p-4 bg-[#0a0a0f] rounded-lg border border-[#2a2a3a]">
              <div className="text-3xl font-bold gradient-text">3+</div>
              <div className="text-sm text-[#a0a0b0] mt-1">AI Providers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
