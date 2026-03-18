'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LivingHeadline } from './LivingHeadline';
import { CinematicCard } from './CinematicCard';

// Dummy data for the "AI Sorting" visual
const PHOTOS = [
  { id: 1, ratio: 'aspect-[3/4]', bg: 'bg-zinc-200', selected: false },
  { id: 2, ratio: 'aspect-[3/4]', bg: 'bg-zinc-300', selected: true },
  { id: 3, ratio: 'aspect-[4/3]', bg: 'bg-zinc-200', selected: false },
  { id: 4, ratio: 'aspect-[3/4]', bg: 'bg-zinc-300', selected: true },
  { id: 5, ratio: 'aspect-[3/4]', bg: 'bg-zinc-200', selected: false },
];

export function SceneCuratorial() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the section while we "sort" the photos
      // Visual Idea: A chaotic grid that snaps into a clean row
      
      const cards = gsap.utils.toArray('.curatorial-card');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%", // Pin for 1.5 screen heights
          pin: true,
          scrub: 1,
        }
      });

      // Step 1: Fade out unselected
      tl.to('.card-unselected', {
        opacity: 0.1,
        scale: 0.8,
        filter: 'blur(4px)',
        duration: 1
      });

      // Step 2: Highlight selected with Gold border
      tl.to('.card-selected', {
        borderColor: '#C9A55A',
        borderWidth: '2px',
        boxShadow: '0 20px 40px rgba(201, 165, 90, 0.2)',
        scale: 1.1,
        zIndex: 10,
        duration: 1
      }, "<");

      // Step 3: Align selected into a clean row
      // We'd need Flip plugin for true layout transitions, but we can fake it or just focus on the "selection" moment for now
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-cream flex items-center justify-center overflow-hidden">
      
      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left: Narrative */}
        <div className="order-2 md:order-1">
          <div className="flex items-center gap-2 mb-4">
             <div className="h-[1px] w-8 bg-gold"></div>
             <span className="text-sm font-sans tracking-widest uppercase text-gold font-semibold">Pholio Intelligence</span>
          </div>
          <LivingHeadline 
            text="Your best angles. Automatically." 
            className="text-6xl md:text-7xl text-ink mb-6"
          />
          <p className="font-sans text-lg text-ink-soft max-w-md leading-relaxed mb-6">
            We don't just host your photos; we understand them. 
            **Pholio Intelligence** analyzes your raw uploads for composition, lighting, and market fit to curate an editorial narrative that agencies actually want to see.
          </p>
          <ul className="space-y-3 font-sans text-ink-muted text-sm">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              <span>Automated Sequence Optimization</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              <span>Market Trends Analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              <span>Editorial Composition Check</span>
            </li>
          </ul>
        </div>

        {/* Right: The Visual Visualizer */}
        <div ref={gridRef} className="order-1 md:order-2 grid grid-cols-3 gap-4 p-8 relative">
          {PHOTOS.map((photo) => (
            <div 
              key={photo.id}
              className={`
                curatorial-card relative rounded-lg overflow-hidden ${photo.ratio} ${photo.bg}
                ${photo.selected ? 'card-selected border border-transparent' : 'card-unselected'}
                transition-all duration-500
              `}
            >
              {photo.selected && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-gold rounded-full shadow-lg" />
              )}
            </div>
          ))}
          
          {/* Floating UI Card overlaid */}
          <div className="absolute -bottom-10 -left-10 w-64">
            <CinematicCard>
              <div className="p-5 bg-white/90 backdrop-blur-md">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold tracking-widest text-ink-muted uppercase">Intelligence Score</span>
                  <span className="text-xs font-bold text-gold">98/100</span>
                </div>
                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gold w-[98%]" />
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] text-ink-soft">Editorial Print</span>
                   <span className="text-[10px] text-green-600 font-medium">Verified</span>
                </div>
              </div>
            </CinematicCard>
          </div>
        </div>

      </div>

    </section>
  );
}
