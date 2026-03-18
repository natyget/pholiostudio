'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LivingHeadline } from './LivingHeadline';
import { Check } from 'lucide-react';

const FEATURES = [
  "Custom .studio Domain",
  "Unlimited Portfolio Photos",
  "Verified Comp Card",
  "Priority Agency Search",
  "Profile Analytics",
  "Direct Agency Invites"
];

export function ScenePricing() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
       gsap.from('.pricing-card', {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
             trigger: containerRef.current,
             start: "top 70%"
          }
       });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen w-full bg-ink text-cream flex items-center justify-center overflow-hidden py-24">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <div className="mb-12 text-center">
           <span className="text-sm font-sans tracking-widest uppercase text-gold font-semibold mb-4 block">Membership</span>
           <LivingHeadline text="Invest In Yourself." className="text-6xl md:text-8xl text-cream mb-6" />
           <p className="font-sans text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed">
              The cost of a single coffee per month for a career-defining platform.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
           
           {/* Free Tier */}
           <div className="pricing-card p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
              <div className="mb-8">
                 <h3 className="font-serif text-3xl text-cream mb-2">Talent</h3>
                 <div className="text-4xl font-sans font-bold text-white mb-2">Free</div>
                 <p className="text-sm text-ink-muted">Essential profile building.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                 <li className="flex gap-3 text-sm text-ink-muted items-center">
                    <Check size={16} className="text-white" />
                    <span>Basic Portfolio</span>
                 </li>
                 <li className="flex gap-3 text-sm text-ink-muted items-center">
                    <Check size={16} className="text-white" />
                    <span>Limited Uploads</span>
                 </li>
                 <li className="flex gap-3 text-sm text-ink-muted items-center">
                    <Check size={16} className="text-white" />
                    <span>Standard Application Link</span>
                 </li>
              </ul>
              <button className="w-full py-4 rounded border border-white/20 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/10 transition-colors">
                 Get Started
              </button>
           </div>

           {/* Studio+ Tier */}
           <div className="pricing-card p-8 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent backdrop-blur-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                 <div className="bg-gold text-ink text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">Recommended</div>
              </div>
              
              <div className="mb-8">
                 <h3 className="font-serif text-3xl text-gold mb-2">Studio+</h3>
                 <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-sans font-bold text-white">$9.99</span>
                    <span className="text-sm text-ink-muted mb-1">/mo</span>
                 </div>
                 <p className="text-sm text-gold/80">Everything you need to get signed.</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                 {FEATURES.map((feat, i) => (
                    <li key={i} className="flex gap-3 text-sm text-cream items-center">
                       <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center text-ink">
                          <Check size={10} strokeWidth={4} />
                       </div>
                       <span>{feat}</span>
                    </li>
                 ))}
              </ul>

              <button className="w-full py-4 rounded bg-gold text-ink font-sans text-xs tracking-widest uppercase font-bold hover:bg-gold-rich transition-colors shadow-lg shadow-gold/20">
                 Join Studio+
              </button>
           </div>

        </div>

        <div className="mt-16 text-center">
           <p className="text-xs text-ink-muted tracking-widest uppercase">
              Trusted by 10,000+ Talents Worldwide
           </p>
        </div>

      </div>

    </section>
  );
}
