"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HomepageV1() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ghostTextsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate headline
      gsap.fromTo(
        headlineRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.3,
        }
      );

      // Animate ghost texts
      ghostTextsRef.current.forEach((el, index) => {
        if (el) {
          gsap.fromTo(
            el,
            {
              opacity: 0,
              y: 20,
            },
            {
              opacity: 0.3,
              y: 0,
              duration: 1,
              delay: 1 + index * 0.3,
              ease: "power2.out",
            }
          );
        }
      });

      // Scroll-triggered animations
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          if (headlineRef.current) {
            gsap.to(headlineRef.current, {
              opacity: 1 - progress * 0.5,
              y: -progress * 100,
              duration: 0.1,
            });
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const ghostTexts = [
    { text: "Rejected", top: "15%", left: "10%", delay: 2 },
    { text: "Overlooked", top: "25%", right: "12%", delay: 2.5 },
    { text: "Forgotten", top: "55%", left: "8%", delay: 3 },
    { text: "Lost", top: "65%", right: "15%", delay: 3.5 },
    { text: "Missed", top: "75%", left: "12%", delay: 4 },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[500vh] bg-cream overflow-hidden"
    >
      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream-warm to-cream-dark opacity-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] opacity-15 pointer-events-none mix-blend-overlay"></div>
        
        {/* Spotlight Effect */}
        <div 
          className="absolute top-0 left-1/2 w-[120vw] h-[120vw] rounded-full blur-[80px] -translate-x-1/2 -translate-y-[20%] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 60%)"
          }}
        ></div>

        {/* Scroll Hint */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-ink/40">DISCOVER</div>
          <div className="w-px h-12 bg-ink/20"></div>
        </div>

        {/* Phase 1: Main Headline */}
        <div className="relative z-10 text-center px-8">
          <div
            ref={headlineRef}
            className="text-6xl md:text-7xl lg:text-8xl font-light text-ink leading-tight"
            style={{ fontFamily: "'Noto Serif Display', serif" }}
          >
            Don't let your talent
            <br />
            <span className="text-gold italic">get lost.</span>
          </div>
        </div>

        {/* Ghost Text Debris */}
        {ghostTexts.map((ghost, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) ghostTextsRef.current[index] = el;
            }}
            className="absolute text-ink/20 font-light text-2xl md:text-3xl pointer-events-none"
            style={{
              top: ghost.top,
              left: ghost.left,
              right: ghost.right,
              animationDelay: `${ghost.delay}s`,
            }}
          >
            {ghost.text}
          </div>
        ))}
      </div>

      {/* Additional Content Sections */}
      <div className="relative z-20 bg-cream min-h-screen flex items-center justify-center px-8 py-24">
        <div className="max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-light text-ink mb-8">
            Make them <span className="text-gold italic">stare.</span>
          </h2>
          <p className="text-lg md:text-xl text-ink/70 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            Transform raw talent data into standardized comp cards and portfolios in minutes.
            Verified credentials. Professional presentation. Industry standard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-ink text-cream font-light hover:bg-gold hover:text-ink transition-all duration-300">
              Get Started Free
            </button>
            <button className="px-8 py-4 border border-ink/30 text-ink font-light hover:border-gold hover:text-gold transition-all duration-300">
              See How It Works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

