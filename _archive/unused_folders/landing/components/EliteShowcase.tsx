
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, ExternalLink } from 'lucide-react';

const SHOWCASE = [
  {
    name: "ALEXIS VANCE",
    score: "9.9",
    location: "PARIS",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
    tags: ["EDITORIAL", "RUNWAY"]
  },
  {
    name: "JORDAN KAI",
    score: "9.7",
    location: "MILAN",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800",
    tags: ["COMMERCIAL", "FIT"]
  },
  {
    name: "SOPHIE CHEN",
    score: "9.8",
    location: "NYC",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800",
    tags: ["EDITORIAL", "BEAUTY"]
  },
  {
    name: "LIAM ROSS",
    score: "9.6",
    location: "LONDON",
    image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800",
    tags: ["HIGH-FASHION"]
  }
];

export const EliteShowcase: React.FC = () => {
  return (
    <section id="showcase" className="py-40 bg-[#FAF9F7] text-[#0F172A] relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-24">
          <span className="inline-block font-sans text-xs tracking-[0.2em] uppercase text-[#C9A55A]/80 mb-6 px-5 py-2 border border-[#C9A55A]/20 rounded-full bg-[#C9A55A]/5 font-medium">
            The Result
          </span>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-normal leading-[1.2] mb-6 text-[#0F172A] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            The New Standard
          </h2>
          <p className="font-sans text-[clamp(1rem,2vw,1.25rem)] text-[#64748b] max-w-2xl mx-auto leading-[1.7] font-normal">
            Editorial-quality portfolios. Generated in minutes.
          </p>
          <div className="w-[120px] h-0.5 bg-gradient-to-r from-transparent via-[#C9A55A]/50 to-transparent mx-auto mt-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#C9A55A]/80 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHOWCASE.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative aspect-[3/4] overflow-hidden group cursor-pointer bg-[#F8F8F7] rounded-2xl border border-[#0F172A]/5"
              style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}
            >
              <img 
                src={item.image} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]" 
                alt={item.name} 
              />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 text-white">
                <div className="flex justify-between items-start">
                   <div className="bg-white text-[#0F172A] px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-[#0F172A]/5">
                     Verified Profile
                   </div>
                   <ExternalLink size={18} />
                </div>
                
                <div>
                   <div className="text-[10px] font-bold tracking-[0.3em] mb-2 flex items-center gap-2">
                     <MapPin size={10} className="text-[#C9A55A]" /> {item.location}
                   </div>
                   <h4 className="text-2xl font-semibold tracking-tight mb-4">{item.name}</h4>
                   <div className="flex gap-2">
                     {item.tags.map(tag => (
                       <span key={tag} className="text-[8px] border border-white/30 px-2 py-0.5 rounded-full font-bold tracking-widest uppercase">
                         {tag}
                       </span>
                     ))}
                   </div>
                </div>
              </div>

              {/* Static Badge - Always Visible */}
              <div className="absolute bottom-6 right-6 z-10">
                <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex flex-col items-center justify-center border border-[#0F172A]/8 shadow-lg group-hover:bg-[#C9A55A] group-hover:text-[#0F172A] transition-colors">
                  <span className="text-[8px] font-bold tracking-tighter opacity-50 uppercase">Score</span>
                  <span className="text-xl font-bold tracking-tighter leading-none">{item.score}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20 border-t border-[#0F172A]/10 pt-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold tracking-[0.4em] text-[#64748B] uppercase">
           <span>Global Talent Propagation: 4.2k active nodes</span>
           <div className="flex gap-8 mt-6 md:mt-0">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Agency Side: Online</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Talent Side: Syncing</span>
           </div>
        </div>
      </div>
    </section>
  );
};

