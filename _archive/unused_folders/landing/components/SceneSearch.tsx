'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LivingHeadline } from './LivingHeadline';
import { CinematicCard } from './CinematicCard';
import { Search } from 'lucide-react';

export function SceneSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Typewriter effect for the search query
      const queryText = "Find me a vintage aesthetic model in NYC.";
      const chars = queryText.split('');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "bottom top",
          toggleActions: "play none none reverse"
        }
      });

      // Animate search container in
      tl.from(searchBarRef.current, {
        scaleX: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      });

      // Typewriter
      tl.to('.search-cursor', { opacity: 1, duration: 0.1 });
      chars.forEach((char, i) => {
        tl.to('.search-text', {
          textContent: queryText.substring(0, i + 1),
          duration: 0.05,
          ease: "none"
        }, "+=0.02");
      });
      
      // Blink cursor
      tl.to('.search-cursor', { opacity: 0, repeat: 3, yoyo: true, duration: 0.5 });

      // Reveal Results (The Magic)
      tl.from('.search-result-card', {
        y: 40,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, "-=0.5");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen w-full bg-cream flex items-center justify-center overflow-hidden py-24">
      
      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Narrative */}
        <div className="order-1">
          <div className="flex items-center gap-2 mb-4">
             <div className="h-[1px] w-8 bg-gold"></div>
             <span className="text-sm font-sans tracking-widest uppercase text-gold font-semibold">Semantic Discovery</span>
          </div>
          <LivingHeadline 
            text="Found By Nuance." 
            className="text-5xl md:text-7xl text-ink mb-6"
          />
          <p className="font-sans text-lg text-ink-soft max-w-lg leading-relaxed mb-8">
            Old directories use checkboxes. Pholio uses <b>Maverick</b> language models to understand style, vibe, and aesthetic.
            Agencies find you by describing exactly what they need.
          </p>
        </div>

        {/* Right: The Visual (Search Demo) */}
        <div className="order-2 relative flex flex-col items-center">
            
            {/* The Search Bar */}
            <div ref={searchBarRef} className="w-full max-w-md bg-white rounded-full shadow-xl border border-gray-100 p-2 flex items-center mb-12 relative z-20">
               <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-ink-muted">
                  <Search size={18} />
               </div>
               <div className="flex-1 px-4 font-serif text-lg text-ink">
                  <span className="search-text"></span><span className="search-cursor opacity-0">|</span>
               </div>
            </div>

            {/* The Result: A matched profile */}
            <div className="search-result-card w-full max-w-sm relative z-10">
               <CinematicCard>
                  <div className="bg-white p-4">
                     <div className="aspect-[3/4] w-full bg-gray-200 mb-4 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=2549&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold tracking-widest uppercase text-ink">99% Match</div>
                     </div>
                     <div className="flex justify-between items-end">
                        <div>
                           <h3 className="font-serif text-xl">Elena R.</h3>
                           <p className="text-xs text-ink-muted mt-1">Found via "Vintage", "NYC"</p>
                        </div>
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-colors">
                           <span className="text-lg leading-none mb-0.5">+</span>
                        </button>
                     </div>
                  </div>
               </CinematicCard>
            </div>

            {/* Connecting Line */}
            <div className="absolute top-16 left-1/2 w-[1px] h-12 bg-gold/30 -z-10 search-result-card"></div>

        </div>

      </div>

    </section>
  );
}
