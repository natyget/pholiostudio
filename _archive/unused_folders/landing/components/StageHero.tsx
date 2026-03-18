
import React, { useMemo } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface StageProps {
  scrollYProgress: MotionValue<number>;
}

const POSITIVE_WORDS = [
  'visibility', 'discovered', 'booked', 'trusted', 'portfolio', 'proof', 'signal', 'clarity',
  'verified', 'casting-ready', 'agency-grade', 'credibility', 'momentum', 'craft', 'elevate',
  'premium', 'control', 'ownership', 'standards', 'positioning', 'direct', 'clean', 'confident',
  'undeniable', 'professional', 'searchable', 'organized', 'consistent', 'presence', 'authority'
];

const NEGATIVE_WORDS = [
  'ignored', 'buried', 'overlooked', 'lost', 'scattered', 'spam', 'noise', 'ghosted', 'unpaid',
  'lowball', 'confusion', 'fake', 'exploitative', 'gatekept', 'messy', 'random', 'insecure',
  'inconsistent', 'unverified', 'outdated', 'algorithm', 'rejection', 'silence', 'shadowban',
  'forgotten', 'dismissed', 'unseen', 'unread', 'deleted', 'filtered', 'blocked', 'rejected',
  'overwhelmed', 'drowned', 'diluted', 'compromised', 'undervalued', 'exploited', 'manipulated',
  'disregarded', 'neglected', 'abandoned', 'isolated', 'invisible', 'unnoticed', 'unanswered',
  'missed', 'skipped', 'bypassed', 'ignored', 'unopened', 'archived', 'trashed', 'deleted',
  'unprofessional', 'amateur', 'unpolished', 'rough', 'chaotic', 'disorganized', 'fragmented',
  'broken', 'incomplete', 'unfinished', 'unclear', 'vague', 'uncertain', 'doubtful', 'questionable'
];

export const StageHero: React.FC<StageProps> = ({ scrollYProgress }) => {
  // Generate random word cloud data once - Phase 1: ONLY negative/problem words (no positive words)
  const wordCloud = useMemo(() => {
    return Array.from({ length: 180 }).map((_, i) => {
      // Phase 1 shows ONLY the problem - negative words only
      const text = NEGATIVE_WORDS[Math.floor(Math.random() * NEGATIVE_WORDS.length)];
      
      return {
        id: i,
        text: text.toUpperCase(),
        // More scattered: allow positions beyond 100% for wider spread
        x: (Math.random() - 0.5) * 150 + 50, // -25% to 125% (centered around 50%)
        y: (Math.random() - 0.5) * 150 + 50, // -25% to 125% (centered around 50%)
        depth: 0.2 + Math.random() * 0.8,
        isPositive: false, // All words are negative in Phase 1
        seed: Math.random() * Math.PI * 2
      };
    });
  }, []);

  // Warp & Fade logic - Extended for immersive "ocean submersion" experience
  const zoomRange = [0, 0.65];
  const scale = useTransform(scrollYProgress, zoomRange, [1, 25]);
  const opacity = useTransform(scrollYProgress, [0.5, 0.6], [1, 0]);
  const blur = useTransform(scrollYProgress, zoomRange, [0, 25]);

  // Ink Mask logic (The deep navy reveal) - Extended timeline for full experience
  const inkOpacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1]);
  const maskRadius = useTransform(scrollYProgress, [0.55, 0.75], [0, 3000]);

  return (
    <motion.section 
      style={{
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      className="absolute inset-0 h-screen w-full pointer-events-none overflow-hidden"
    >
      {/* Radial Ink Reveal (Visual Transition foundation) */}
      <motion.div 
        style={{ 
          opacity: inkOpacity,
          background: `radial-gradient(circle ${maskRadius.get()}px at 50% 50%, #0F172A 0%, transparent 100%)`
        }}
        className="absolute inset-0 z-0"
      />

      {/* Dynamic Word Flood Layer - Extended immersive ocean experience */}
      <div className="absolute inset-0 z-0">
        {wordCloud.map((word) => {
          // Much extended timeline for truly immersive, slower movement
          const yOffset = useTransform(scrollYProgress, [0, 0.65], [0, (word.depth * -1500)]);
          // Words appear very gradually and stay visible much longer for full experience
          const wordOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5], [0, word.depth * 0.75, 0]);
          // More scattered horizontal drift - increased range for wider spread
          const xDrift = useTransform(scrollYProgress, [0, 0.65], [0, Math.sin(word.seed) * 150 + Math.cos(word.seed * 0.7) * 80]);
          
          return (
            <motion.div
              key={word.id}
              style={{
                position: 'absolute',
                left: `${word.x}%`,
                top: `${word.y}%`,
                y: yOffset,
                x: xDrift,
                opacity: wordOpacity,
                scale: word.depth,
                filter: `blur(${(1 - word.depth) * 5}px)`,
                color: '#94A3B8', // Phase 1: All words are problem words (gray/slate)
                fontSize: `${Math.max(14, word.depth * 28)}px`,
              }}
              className="font-bold tracking-widest whitespace-nowrap"
            >
              {word.text}
            </motion.div>
          );
        })}
      </div>

      {/* Main Narrative Content */}
      <motion.div 
        style={{ 
          scale, 
          filter: useTransform(blur, b => `blur(${b}px)`)
        }}
        className="relative z-10 text-center px-4"
      >
        <h1 style={{
          fontFamily: "'Noto Serif Display', serif",
          fontSize: 'clamp(4rem, 10vw, 9rem)',
          lineHeight: '0.9',
          letterSpacing: '-0.03em',
          fontWeight: 300,
          color: '#0F172A',
          textAlign: 'center',
          padding: '0 2rem',
          marginBottom: '0',
          width: 'max-content',
          maxWidth: '90vw'
        }}>
          Don't let your talent<br/>
          <span style={{ color: '#C9A55A', fontStyle: 'italic', fontWeight: 400 }}>get lost.</span>
        </h1>
        
        <div style={{
          fontFamily: 'monospace',
          fontSize: '9px',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: '#94A3B8',
          fontWeight: 600,
          marginTop: '3rem'
        }}>
          SCROLL TO CURATE
        </div>
      </motion.div>
    </motion.section>
  );
};
