'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const LOGOS = [
  { name: 'Elite', width: 120 },
  { name: 'Ford', width: 100 },
  { name: 'IMG', width: 90 },
  { name: 'Next', width: 110 },
  { name: 'DNA', width: 90 },
  { name: 'Wilhelmina', width: 140 },
  { name: 'Vogue', width: 110 }, // Editorial Cred
  { name: 'Bazaar', width: 120 },
];

export function SceneSocial() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Endless seamless scroll
      gsap.to(scrollRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 30,
        repeat: -1
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-cream border-t border-b border-ink/5 py-12 overflow-hidden">
      <div className="container mx-auto px-6 mb-8 text-center">
        <span className="text-xs font-sans tracking-[0.3em] uppercase text-ink-muted">Trusted by Industry Leaders</span>
      </div>
      
      <div className="relative w-full overflow-hidden">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-cream to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-cream to-transparent z-10" />

        <div ref={scrollRef} className="flex gap-24 w-max px-12">
          {/* Double the logos for seamless loop */}
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <div key={i} className="flex items-center justify-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               {/* Placeholder Text Logos using Serif Font to simulate agency brands */}
               <span className="font-serif text-3xl md:text-4xl text-ink whitespace-nowrap">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
