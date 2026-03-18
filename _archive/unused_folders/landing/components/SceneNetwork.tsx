'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LivingHeadline } from './LivingHeadline';

export function SceneNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered reveal of agency logos/names
      gsap.from('.agency-item', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        }
      });
      
      // Connecting line animation
      gsap.fromTo('.connection-line', 
        { scaleX: 0 },
        { 
          scaleX: 1, 
          duration: 1.5, 
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[80vh] w-full bg-ink text-cream flex flex-col items-center justify-center overflow-hidden py-32">
      
      {/* Background World Map / Network Hint */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 mb-6">
             <div className="h-[1px] w-8 bg-gold"></div>
             <span className="text-sm font-sans tracking-widest uppercase text-gold font-semibold">The Network</span>
             <div className="h-[1px] w-8 bg-gold"></div>
          </div>
          <LivingHeadline 
            text="Direct Access." 
            className="text-6xl md:text-9xl text-cream mb-6"
          />
          <p className="font-sans text-xl text-ink-muted max-w-2xl leading-relaxed">
            Skip the cold emails and lost DMs. Pholio connects your verified portfolio directly 
            to the casting dashboards of top-tier agencies worldwide.
          </p>
        </div>

        {/* Agency Grid Placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
          {['NEW YORK', 'PARIS', 'LONDON', 'MILAN'].map((city, i) => (
             <div key={i} className="agency-item flex flex-col items-center gap-3">
                <div className="w-full h-[1px] bg-ink-soft/30 mb-2 connection-line origin-left" />
                <span className="font-serif text-2xl text-cream tracking-wide">{city}</span>
                <span className="text-[10px] font-sans tracking-[0.2em] text-gold uppercase">Connected</span>
             </div>
          ))}
        </div>

        {/* CTA */}
        <div className="agency-item relative group inline-block">
          <div className="absolute -inset-1 bg-gradient-to-r from-gold to-white rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <button className="relative px-12 py-5 bg-cream text-ink text-lg font-medium tracking-widest uppercase rounded-lg hover:bg-white transition-all transform hover:-translate-y-1">
            Sign Your Profile
          </button>
        </div>

      </div>

    </section>
  );
}
