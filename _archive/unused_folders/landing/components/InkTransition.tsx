'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function InkTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // The expansion of the "Ink" (Cream circle revealing the light theme)
  // Starts small (0%) and expands to cover screen (300% to ensure corners)
  const clipPathSize = useTransform(scrollYProgress, [0, 0.8], ["0%", "300%"]);
  
  return (
    <div ref={containerRef} className="relative h-[200vh] w-full">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-velvet-black">
        
        {/* The Dark Layer Content (Hero Text) - This stays behind */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
           {/* Placeholder for Hero Content integration if needed, 
               but realistically Hero sits *above* this or this IS the transition wrapper */}
        </div>

        {/* The Cream Layer (Revealed by Ink) */}
        <motion.div 
          className="absolute inset-0 z-10 bg-cream flex items-center justify-center"
          style={{ 
            clipPath: useTransform(clipPathSize, (val) => `circle(${val} at 50% 50%)`) 
          }}
        >
          {/* This layer is empty initially, just the color reveal */}
        </motion.div>
        
      </div>
    </div>
  );
}
