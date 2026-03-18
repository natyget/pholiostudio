'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LivingHeadline } from './LivingHeadline';

export function SceneMagazine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal Scroll Logic
      const track = trackRef.current;
      if (!track) return;

      const totalWidth = track.scrollWidth;
      const viewportWidth = window.innerWidth;
      
      gsap.to(track, {
        x: () => -(totalWidth - viewportWidth),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${totalWidth - viewportWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-ink text-cream overflow-hidden">
      
      <div ref={trackRef} className="flex h-full w-[300vw]">
        
        {/* Panel 1: Intro */}
        <div className="w-screen h-full flex items-center justify-center border-r border-ink-soft shrink-0">
          <div className="max-w-4xl px-8">
            <LivingHeadline 
              text="Your Book. Reimagined."
              className="text-8xl px-2 text-cream"
            />
          </div>
        </div>

        {/* Panel 2: Large Image Spread */}
        <div className="w-screen h-full flex items-center justify-center border-r border-ink-soft shrink-0 relative p-20">
          <div className="w-full h-full bg-zinc-800 rounded-sm overflow-hidden relative group">
             {/* Image placeholder */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700" />
             
             <div className="absolute bottom-12 left-12">
               <h3 className="text-4xl font-serif text-white">Editorial V2</h3>
               <p className="text-sm font-mono tracking-widest text-gold mt-2">PARIS / 2024</p>
             </div>
          </div>
        </div>

        {/* Panel 3: CTA */}
        <div className="w-screen h-full flex items-center justify-center shrink-0 bg-cream text-ink">
          <div className="text-center">
            <h2 className="text-9xl font-serif mb-8">Ready?</h2>
            <button className="px-12 py-4 bg-ink text-cream text-xl tracking-widest hover:bg-gold hover:text-ink transition-colors duration-300">
              START CASTING
            </button>
          </div>
        </div>

      </div>

    </section>
  );
}
