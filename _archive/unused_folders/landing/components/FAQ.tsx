
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: "How does the 'Verification' process work?",
    a: "Every Pholio profile goes through a biometric and editorial check. We verify your height, measurements, and current base location using AI-assisted analysis of your submitted RAW files."
  },
  {
    q: "Is Pholio an agency?",
    a: "No. Pholio is the technology layer that sits between talent and agencies. We provide the tools for talent to be seen and for agencies to filter through the noise efficiently."
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. Studio and Agency tiers allow you to link your custom domain (e.g., yourname.com) directly to your Pholio profile while maintaining the high-performance delivery engine."
  },
  {
    q: "What is a 'Signal Boost'?",
    a: "Our engine identifies high-potential matches between talent attributes and current industry demands. Pro members get prioritized in agency search results when their 'Signal' matches an active query."
  }
];

export const FAQ: React.FC = () => {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section className="py-32 px-4 bg-[#FAF9F7]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-24">
          <span className="inline-block font-sans text-xs tracking-[0.2em] uppercase text-[#C9A55A]/80 mb-6 px-5 py-2 border border-[#C9A55A]/20 rounded-full bg-[#C9A55A]/5 font-medium">
            Decoding Pholio
          </span>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.2] mb-6 text-[#0F172A] tracking-[0.02em]" style={{ fontFamily: "'Noto Serif Display', serif" }}>
            CLARIFYING THE<br/><span className="text-[#C9A55A]">SIGNAL</span>
          </h2>
          <div className="w-[120px] h-0.5 bg-gradient-to-r from-transparent via-[#C9A55A]/50 to-transparent mx-auto mt-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#C9A55A]/80 rounded-full"></div>
          </div>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-[#0F172A]/10 rounded-2xl overflow-hidden bg-white shadow-sm">
              <button 
                onClick={() => setActive(active === i ? null : i)}
                className="w-full p-8 flex justify-between items-center text-left transition-colors hover:bg-[#FAF9F7]/50"
              >
                <span className="text-lg font-bold tracking-tight pr-8 text-[#0F172A]">{faq.q}</span>
                <div className="text-[#C9A55A]">
                  {active === i ? <Minus size={20}/> : <Plus size={20}/>}
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${active === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-8 pt-0 text-[#475569] text-sm leading-relaxed border-t border-[#0F172A]/10">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

