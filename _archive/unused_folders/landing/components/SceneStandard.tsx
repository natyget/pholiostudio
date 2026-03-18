'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LivingHeadline } from './LivingHeadline';

gsap.registerPlugin(ScrollTrigger);

export function SceneStandard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate text elements on scroll
      gsap.from(textRef.current!.children, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%", // Start animation when top of section hits 60% of viewport
          end: "bottom top",
          toggleActions: "play none none reverse"
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[80vh] w-full bg-ink flex items-center justify-center overflow-hidden py-24">
      {/* Background Ambience - subtle gradients to keep it "alive" but dark */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-ink-soft/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div ref={textRef} className="flex flex-col items-center max-w-5xl mx-auto">
          
          <div className="mb-8 flex items-center gap-4">
            <div className="h-[1px] w-12 bg-gold/50"></div>
            <span className="text-gold font-sans text-xs tracking-[0.3em] uppercase font-medium">The New Paradigm</span>
            <div className="h-[1px] w-12 bg-gold/50"></div>
          </div>

          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-[1.1] mb-10">
            Pholio is the <br/>
            <span className="italic text-gold">industry standard.</span>
          </h2>

          <p className="font-sans text-lg md:text-xl text-ink-muted max-w-2xl leading-relaxed">
            The era of PDF attachments and lost DMs is over. 
            We replaced the static portfolio with a living, data-driven identity system 
            designed for the speed of modern casting.
          </p>

        </div>
      </div>
    </section>
  );
}
