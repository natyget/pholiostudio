
import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Eye, ShieldCheck, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Curation Engine",
    desc: "Our neural network analyzes 400+ editorial data points per frame to select the image that maximizes agency engagement.",
    label: "VISUAL LOGIC"
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Biometric Trust",
    desc: "Instant verification of height, measurements, and location via multi-angle RAW file cross-referencing.",
    label: "IDENTITY STACK"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Signal Matching",
    desc: "Predictive matching engine that connects talent attributes with current industry-wide casting shifts in real-time.",
    label: "ACTIVE SYNC"
  }
];

export const PholioIntelligence: React.FC = () => {
  return (
    <section id="intelligence" className="py-40 bg-[#FAF9F7] relative overflow-hidden">
      {/* Visual background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full opacity-5 pointer-events-none border border-[#C9A55A] blur-[100px]" />
      
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          
          <div className="lg:col-span-5 space-y-10">
            <div className="text-center lg:text-left">
              <span className="inline-block font-sans text-xs tracking-[0.2em] uppercase text-[#C9A55A]/80 mb-6 px-5 py-2 border border-[#C9A55A]/20 rounded-full bg-[#C9A55A]/5 font-medium">
                Intelligence Core
              </span>
              
              <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.2] mb-6 text-[#0F172A] tracking-[0.02em]" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                THE ALGORITHM<br/><span className="text-[#C9A55A]">THAT VALUED ART.</span>
              </h2>
              
              <p className="font-sans text-[clamp(1rem,2vw,1.25rem)] text-[#475569] leading-[1.7] font-normal max-w-md mx-auto lg:mx-0">
                Pholio Intelligence isn't just an AI—it's a curated lens. It understands the nuances of editorial standards and the cold logic of high-volume agency sourcing.
              </p>

              <div className="w-[120px] h-0.5 bg-gradient-to-r from-transparent via-[#C9A55A]/50 to-transparent mt-8 mx-auto lg:mx-0 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#C9A55A]/80 rounded-full"></div>
              </div>

              <button className="mt-10 px-10 py-5 bg-[#0F172A] text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-[#C9A55A] hover:text-[#0F172A] transition-all duration-500 rounded-xl shadow-md">
                Explore the Engine
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-px bg-[#0F172A]/5 border border-[#0F172A]/10 rounded-2xl overflow-hidden backdrop-blur-3xl" style={{ boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)' }}>
            {FEATURES.map((feature, i) => (
              <div key={i} className={`p-10 bg-white relative group ${i === 2 ? 'md:col-span-2' : ''}`}>
                <div className="text-[#C9A55A] mb-8 bg-[#FAF9F7] w-12 h-12 rounded-xl flex items-center justify-center border border-[#0F172A]/8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <div className="text-xs font-semibold tracking-[0.1em] text-[#C9A55A]/60 mb-3 uppercase" style={{ fontFamily: "'Noto Serif Display', serif", letterSpacing: '0.1em', fontSize: '0.75rem' }}>{feature.label}</div>
                <h4 className="text-xl font-bold mb-4 text-[#0F172A] tracking-[0.02em]" style={{ fontFamily: "'Noto Serif Display', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{feature.title}</h4>
                <p className="text-[#475569] leading-[1.7] font-normal" style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>{feature.desc}</p>
                
                {/* Decorative scanning line */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A55A]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

