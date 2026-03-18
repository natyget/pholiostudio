'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent } from 'react';

interface CinematicCardProps {
  children: React.ReactNode;
  className?: string;
}

export function CinematicCard({ children, className = "" }: CinematicCardProps) {
  // Mouse position state
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for the tilt
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  // Map mouse position to rotation degrees
  // Range is small (-5deg to 5deg) for a subtle, premium feel
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);
  
  // Dynamic glare effect
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate normalized position (-0.5 to 0.5)
    // Center of card is 0,0
    const width = rect.width;
    const height = rect.height;
    
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    const xPct = (mouseXPos / width) - 0.5;
    const yPct = (mouseYPos / height) - 0.5;

    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform ${className}`}
    >
      <div 
        className="relative overflow-hidden bg-white shadow-2xl rounded-xl border border-gold-muted backdrop-blur-sm"
        style={{ transform: "translateZ(20px)" }} // Pop out effect
      >
        {children}

        {/* Glossy Glare Overlay */}
        <motion.div
          className="absolute inset-0 z-50 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            background: `radial-gradient(
              circle at ${glareX} ${glareY}, 
              rgba(255,255,255,0.8) 0%, 
              rgba(255,255,255,0) 60%
            )`
          }}
        />
      </div>
    </motion.div>
  );
}
