'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LivingHeadlineProps {
  text: string;
  className?: string;
  delay?: number;
}

export function LivingHeadline({ text, className = "", delay = 0 }: LivingHeadlineProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate from chaos (scattered) to order (readable)
      gsap.fromTo(
        wordsRef.current,
        {
          opacity: 0,
          y: 40,
          rotateX: 45,
          filter: 'blur(10px)',
          scale: 1.1
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          scale: 1,
          duration: 1.2,
          stagger: 0.05, // Stagger each word
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%", // Start when top of element hits 85% of viewport
            toggleActions: "play none none reverse"
          },
          delay
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [delay, text]);

  // Split text into words for animation
  // We use words instead of characters for better accessibility and SEO
  // while still giving that "assembly" feel
  const words = text.split(" ");
  
  // Reset refs array
  wordsRef.current = [];

  return (
    <h2 
      ref={containerRef}
      className={`font-serif tracking-tight leading-[1.1] overflow-hidden ${className}`}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span 
          key={i} 
          className="inline-block mr-[0.25em]"
          ref={el => { if (el) wordsRef.current[i] = el; }}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}
