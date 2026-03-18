'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LivingHeadline } from './LivingHeadline';

// Mock Portfolio Pages
const PORTFOLIOS = [
  { id: 1, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop', name: 'Editorial' },
  { id: 2, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2788&auto=format&fit=crop', name: 'Commercial' },
  { id: 3, img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop', name: 'Runway' },
  { id: 4, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2459&auto=format&fit=crop', name: 'Beauty' },
];

export function SceneShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollWidth = scrollContainerRef.current!.scrollWidth;
      const windowWidth = window.innerWidth;
      const xMove = -(scrollWidth - windowWidth + 200); // 200px buffer

      gsap.to(scrollContainerRef.current, {
        x: xMove,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${Math.abs(xMove)}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-ink text-cream overflow-hidden">
      
      <div className="absolute top-12 left-6 md:left-12 z-20 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
           <div className="h-[1px] w-8 bg-gold"></div>
           <span className="text-sm font-sans tracking-widest uppercase text-gold font-semibold">The Portfolio</span>
        </div>
        <LivingHeadline text="Magazine Quality." className="text-5xl md:text-7xl" />
      </div>

      <div className="h-full w-full flex items-center pl-[5vw] md:pl-[20vw] overflow-x-hidden">
        <div ref={scrollContainerRef} className="flex gap-12 md:gap-20 items-center">
            {PORTFOLIOS.map((item) => (
               <div key={item.id} className="relative w-[70vw] md:w-[400px] h-[50vh] md:h-[600px] shrink-0 group perspective-1000">
                  <div className="w-full h-full bg-cream rounded overflow-hidden relative transform group-hover:-rotate-1 transition-transform duration-500 origin-bottom-left shadow-2xl">
                     <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform hover:scale-105" style={{ backgroundImage: `url(${item.img})` }} />
                     <div className="absolute top-6 left-6 mix-blend-difference text-white">
                        <span className="font-serif text-3xl md:text-5xl">{item.name}</span>
                     </div>
                     <div className="absolute bottom-6 right-6 font-sans text-[10px] tracking-widest uppercase bg-white text-ink px-3 py-1 font-bold">
                        Pholio Series.
                     </div>
                  </div>
               </div>
            ))}
            
            <div className="w-[50vw] md:w-[300px] shrink-0 pr-20 flex flex-col justify-center gap-6">
               <h3 className="font-serif text-4xl text-cream">Ready for your close up?</h3>
               <button className="px-8 py-3 bg-gold text-white font-medium tracking-widest uppercase rounded hover:bg-gold-rich transition-colors self-start">
                 Build Portfolio
               </button>
            </div>
        </div>
      </div>

    </section>
  );
}
