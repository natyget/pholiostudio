
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const FEEDBACK = [
  {
    name: "Elena Rossi",
    role: "Casting Director, Milan",
    quote: "Pholio has completely eliminated the 'Noise' for my team. I only see verified, premium talent signals now.",
    image: "https://picsum.photos/id/65/100/100"
  },
  {
    name: "Marcus Thorne",
    role: "Editorial Lead",
    quote: "The visual fidelity of the Pholio profile is unmatched. It's the first digital asset that feels like a real agency composite.",
    image: "https://picsum.photos/id/66/100/100"
  },
  {
    name: "Sarah Jenkins",
    role: "Agency Founder",
    quote: "We've reduced our talent scouting time by 60% since integrating the Pholio Agency Portal.",
    image: "https://picsum.photos/id/67/100/100"
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-32 px-4 border-t border-[#0F172A]/10 bg-[#FAF9F7] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#C9A55A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-24">
          <span className="inline-block font-sans text-xs tracking-[0.2em] uppercase text-[#C9A55A]/80 mb-6 px-5 py-2 border border-[#C9A55A]/20 rounded-full bg-[#C9A55A]/5 font-medium">
            The Verified Voice
          </span>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.2] mb-6 text-[#0F172A] tracking-[0.02em]" style={{ fontFamily: "'Noto Serif Display', serif" }}>
            SIGNALS FROM<br/><span className="text-[#C9A55A]">THE INDUSTRY</span>
          </h2>
          <div className="w-[120px] h-0.5 bg-gradient-to-r from-transparent via-[#C9A55A]/50 to-transparent mx-auto mt-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#C9A55A]/80 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEEDBACK.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 bg-white border border-[#0F172A]/10 rounded-2xl relative group hover:border-[#C9A55A]/30 transition-all duration-500 shadow-sm hover:shadow-md"
            >
              <div className="mb-6 flex justify-between items-center">
                 <div className="flex text-[#C9A55A] gap-1">
                    {[...Array(5)].map((_, j) => <Star key={j} size={12} fill="currentColor"/>)}
                 </div>
                 <Quote className="text-[#CBD5E1]" size={24}/>
              </div>
              <p className="text-[#0F172A] text-lg leading-relaxed mb-8 italic">"{item.quote}"</p>
              <div className="flex items-center gap-4 border-t border-[#0F172A]/10 pt-6">
                 <img src={item.image} className="w-12 h-12 rounded-full grayscale border border-[#0F172A]/8 shadow-sm" alt={item.name}/>
                 <div>
                    <h4 className="font-bold text-sm tracking-tight text-[#0F172A]">{item.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-[#C9A55A] font-bold">{item.role}</p>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

