'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useScroll, useTransform, motion, useMotionValue } from 'framer-motion'

/**
 * HeroScrollyTalent Component
 * 
 * A scrollytelling hero that zooms into the letter "a" in "talent" while
 * flooding the screen with positive (gold) and negative (grey) words.
 * 
 * Scroll Phases:
 * - 0-20%: Full headline visible
 * - 20-65%: "talent" scales up, camera drifts to letter "a"
 * - 65-100%: Inside letter, word flood activates
 * 
 * Performance:
 * - Pre-generates word positions (no randomization per frame)
 * - Uses GPU-friendly transforms (translate3d, scale, opacity)
 * - Caps word count based on device
 * - Respects prefers-reduced-motion
 */

// Word sets
const POSITIVE_WORDS = [
  'visibility', 'discovered', 'booked', 'trusted', 'portfolio', 'proof',
  'signal', 'clarity', 'verified', 'casting-ready', 'agency-grade',
  'credibility', 'momentum', 'craft', 'elevate', 'premium', 'control',
  'ownership', 'standards', 'positioning', 'direct', 'clean', 'confident',
  'undeniable', 'professional', 'searchable', 'organized', 'consistent'
]

const NEGATIVE_WORDS = [
  'ignored', 'buried', 'overlooked', 'lost', 'scattered', 'spam', 'noise',
  'ghosted', 'unpaid', 'lowball', 'confusion', 'fake', 'exploitative',
  'gatekept', 'messy', 'random', 'insecure', 'inconsistent', 'unverified',
  'outdated', 'algorithm', 'rejection', 'silence', 'shadowban', 'churn',
  'cheap', 'disposable', 'competition', 'chaos'
]

// Gold color token
const GOLD = '#C9A55A'
const GOLD_RICH = '#D4AF6A'

// Grey variants
const GREY_LIGHT = '#6B6B6B'
const GREY_DARK = '#2A2A2A'

interface WordData {
  text: string
  type: 'positive' | 'negative'
  x: number // Viewport-relative (0-1)
  y: number // Viewport-relative (0-1)
  depth: number // 0-1, affects scale/opacity/blur
  appearAt: number // Scroll progress when word appears (0-1)
  rotate: number // Rotation in degrees
  driftX: number // Horizontal drift per scroll
  driftY: number // Vertical drift per scroll
  size: number // Base font size multiplier
}

// Pre-generate word positions (called once, not per frame)
function generateWords(count: number): WordData[] {
  const words: WordData[] = []
  const allWords = [
    ...POSITIVE_WORDS.map(w => ({ text: w, type: 'positive' as const })),
    ...NEGATIVE_WORDS.map(w => ({ text: w, type: 'negative' as const }))
  ]
  
  // Shuffle array
  const shuffled = [...allWords].sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const word = shuffled[i]
    
    // Distribute words across viewport
    // More words appear later in scroll (65-100% = last 35% of scroll)
    const appearAt = 0.65 + (Math.random() * 0.35)
    
    // Depth: mix of close (0.3-0.6) and far (0.6-1.0)
    const depth = Math.random() < 0.4 ? 0.3 + Math.random() * 0.3 : 0.6 + Math.random() * 0.4
    
    words.push({
      text: word.text,
      type: word.type,
      x: Math.random(), // 0-1 across viewport width
      y: Math.random(), // 0-1 across viewport height
      depth,
      appearAt,
      rotate: (Math.random() - 0.5) * 15, // -7.5 to +7.5 degrees
      driftX: (Math.random() - 0.5) * 0.1, // Small horizontal drift
      driftY: (Math.random() - 0.5) * 0.1, // Small vertical drift
      size: 0.8 + Math.random() * 0.4 // 0.8x to 1.2x base size
    })
  }
  
  return words
}

export default function HeroScrollyTalent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const talentRef = useRef<HTMLDivElement>(null)
  const letterRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({})
  const [letterBounds, setLetterBounds] = useState<{ [key: string]: DOMRect | null }>({})
  const [reducedMotion, setReducedMotion] = useState(false)
  
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('[HeroScrollyTalent] Component mounted')
  }, [])
  
  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  // Measure letter bounds on mount and resize
  useEffect(() => {
    const measureLetters = () => {
      const bounds: { [key: string]: DOMRect | null } = {}
      const talent = talentRef.current
      if (!talent) return
      
      // Measure each letter span
      Object.keys(letterRefs.current).forEach(letter => {
        const el = letterRefs.current[letter]
        if (el) {
          const rect = el.getBoundingClientRect()
          const containerRect = talent.getBoundingClientRect()
          // Store relative to container
          bounds[letter] = new DOMRect(
            rect.left - containerRect.left,
            rect.top - containerRect.top,
            rect.width,
            rect.height
          )
        }
      })
      
      setLetterBounds(bounds)
    }
    
    measureLetters()
    window.addEventListener('resize', measureLetters)
    return () => window.removeEventListener('resize', measureLetters)
  }, [])
  
  // Generate words based on device capability
  const wordCount = useMemo(() => {
    if (typeof window === 'undefined') return 150
    // Reduce on mobile, more on desktop
    const isMobile = window.innerWidth < 768
    return isMobile ? 80 : 180
  }, [])
  
  const words = useMemo(() => generateWords(wordCount), [wordCount])
  
  // Scroll tracking - track the spacer element
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ['start start', 'end end']
  })
  
  // Phase calculations
  // Phase 1: 0-0.2 (show full headline)
  // Phase 2: 0.2-0.65 (zoom into letter)
  // Phase 3: 0.65-1.0 (word flood)
  
  const phase1Progress = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const phase2Progress = useTransform(scrollYProgress, [0.2, 0.65], [0, 1])
  const phase3Progress = useTransform(scrollYProgress, [0.65, 1], [0, 1])
  
  // Talent zoom: scale from 1 to 18x (or 8x on mobile)
  const maxScale = reducedMotion ? 3 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 18)
  const talentScale = useTransform(
    scrollYProgress,
    [0.2, 0.65],
    [1, maxScale],
    { clamp: true }
  )
  
  // Letter centering translation
  // Target letter: "a" (index 1 in "talent")
  const targetLetter = 'a1' // "a" at index 1
  const targetBounds = letterBounds[targetLetter]
  
  // Calculate translation to center the target letter
  const talentTranslateX = useMotionValue(0)
  const talentTranslateY = useMotionValue(0)
  
  useEffect(() => {
    if (!targetBounds || reducedMotion) {
      talentTranslateX.set(0)
      talentTranslateY.set(0)
      return
    }
    
    const updateTranslation = () => {
      const progress = phase2Progress.get()
      if (progress === 0) {
        talentTranslateX.set(0)
        talentTranslateY.set(0)
        return
      }
      
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth
      const containerHeight = containerRef.current?.clientHeight || window.innerHeight
      const letterCenterX = targetBounds.left + targetBounds.width / 2
      const letterCenterY = targetBounds.top + targetBounds.height / 2
      const viewportCenterX = containerWidth / 2
      const viewportCenterY = containerHeight / 2
      
      const scale = talentScale.get()
      
      // Calculate how much to translate to center the letter
      // As we scale, the letter moves away from center, so we need to compensate
      const deltaX = (viewportCenterX - letterCenterX) * (scale - 1) / scale
      const deltaY = (viewportCenterY - letterCenterY) * (scale - 1) / scale
      
      talentTranslateX.set(deltaX * progress)
      talentTranslateY.set(deltaY * progress)
    }
    
    // Subscribe to progress changes
    const unsubscribeProgress = phase2Progress.on('change', updateTranslation)
    const unsubscribeScale = talentScale.on('change', updateTranslation)
    
    // Also update on resize
    const handleResize = () => {
      // Re-measure letters on resize
      const talent = talentRef.current
      if (talent) {
        const bounds: { [key: string]: DOMRect | null } = {}
        Object.keys(letterRefs.current).forEach(letter => {
          const el = letterRefs.current[letter]
          if (el) {
            const rect = el.getBoundingClientRect()
            const containerRect = talent.getBoundingClientRect()
            bounds[letter] = new DOMRect(
              rect.left - containerRect.left,
              rect.top - containerRect.top,
              rect.width,
              rect.height
            )
          }
        })
        setLetterBounds(bounds)
      }
      // Small delay to let layout settle
      setTimeout(updateTranslation, 50)
    }
    
    window.addEventListener('resize', handleResize)
    updateTranslation()
    
    return () => {
      unsubscribeProgress()
      unsubscribeScale()
      window.removeEventListener('resize', handleResize)
    }
  }, [targetBounds, reducedMotion, phase2Progress, talentScale, talentTranslateX, talentTranslateY])
  
  // Background effects
  const backgroundOpacity = useTransform(scrollYProgress, [0.2, 0.65], [0, 0.3])
  const vignetteOpacity = useTransform(scrollYProgress, [0.2, 1], [0, 0.6])
  
  // Render "talent" as individual letters
  const renderTalentLetters = () => {
    const word = 'talent'
    return word.split('').map((letter, index) => (
      <span
        key={index}
        ref={(el) => {
          letterRefs.current[letter + index] = el
        }}
        className="inline-block"
        style={{ fontFeatureSettings: '"liga" off' }} // Prevent ligatures for accurate measurement
      >
        {letter}
      </span>
    ))
  }
  
  return (
    <div className="relative w-full min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Scroll spacer - creates the scroll distance */}
      <div
        ref={spacerRef}
        className="relative w-full"
        style={{ height: '300vh' }} // 3x viewport height for long scroll
      />
      
      {/* Pinned hero container */}
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-screen overflow-hidden z-10"
        style={{
          backgroundColor: '#FAF9F6', // Fallback cream color
          backgroundImage: 'var(--paper-texture)',
          backgroundSize: '200px 200px'
        }}
      >
        {/* Background layers */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, rgba(10, 10, 10, 0) 0%, rgba(10, 10, 10, 0.4) 100%)`,
            opacity: backgroundOpacity
          }}
        />
        
        {/* Vignette */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)`,
            opacity: vignetteOpacity
          }}
        />
        
        {/* Main headline container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            ref={talentRef}
            className="relative"
            style={{
              scale: reducedMotion ? 1 : talentScale,
              x: reducedMotion ? 0 : talentTranslateX,
              y: reducedMotion ? 0 : talentTranslateY,
              transformOrigin: 'center center'
            }}
          >
            {/* Full headline - fades out in Phase 2 */}
            <motion.div
              className="text-center px-4"
              style={{
                opacity: phase1Progress
              }}
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-light leading-tight" style={{ color: 'var(--ink)' }}>
                Don't let your
                <br />
                <span className="relative inline-block">
                  {renderTalentLetters()}
                </span>
                <br />
                get lost.
              </h1>
            </motion.div>
            
            {/* Just "talent" - visible during zoom */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: useTransform(scrollYProgress, [0.2, 0.3], [0, 1])
              }}
            >
              <div className="text-6xl md:text-8xl lg:text-9xl font-serif font-light" style={{ color: 'var(--ink)' }}>
                {renderTalentLetters()}
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Word flood - Phase 3 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {words.map((word, index) => {
            const wordProgress = useTransform(
              scrollYProgress,
              [word.appearAt, Math.min(1, word.appearAt + 0.15)],
              [0, 1],
              { clamp: true }
            )
            
            // Opacity based on depth and progress
            const baseOpacity = word.depth > 0.6 ? 0.4 : 0.8
            const wordOpacity = useTransform(wordProgress, (p) => p * baseOpacity)
            
            // Scale based on depth: close words (low depth) are bigger
            const depthScale = 1 - word.depth * 0.5
            const wordScale = useTransform(wordProgress, (p) => depthScale * word.size * p)
            
            // Blur for far words
            const wordBlur = word.depth > 0.7 ? word.depth * 4 : 0
            
            // Position with drift - use viewport width/height
            // We'll use a ref to get container dimensions
            const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
            const containerHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
            
            const wordX = useTransform(
              phase3Progress,
              (phase3) => {
                const baseX = word.x * containerWidth
                const driftX = word.driftX * containerWidth * phase3
                return baseX + driftX
              }
            )
            
            const wordY = useTransform(
              phase3Progress,
              (phase3) => {
                const baseY = word.y * containerHeight
                const driftY = word.driftY * containerHeight * phase3
                return baseY + driftY
              }
            )
            
            return (
              <motion.div
                key={index}
                className="absolute whitespace-nowrap"
                style={{
                  x: wordX,
                  y: wordY,
                  opacity: wordOpacity,
                  scale: wordScale,
                  rotate: word.rotate,
                  filter: wordBlur > 0 ? `blur(${wordBlur}px)` : 'none',
                  color: word.type === 'positive' ? GOLD : (word.depth > 0.6 ? GREY_LIGHT : GREY_DARK),
                  fontSize: 'clamp(1rem, 2vw, 2.5rem)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontFamily: 'var(--font-sans)',
                  textShadow: word.type === 'positive' 
                    ? `0 0 20px ${GOLD_RICH}40`
                    : 'none'
                }}
              >
                {word.text}
              </motion.div>
            )
          })}
        </div>
        
        {/* Scroll hint - Phase 1 only */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{
            opacity: phase1Progress
          }}
        >
          <div className="text-xs uppercase tracking-wider text-ink/60">DISCOVER</div>
          <div className="w-px h-12 bg-ink/20" />
        </motion.div>
      </div>
    </div>
  )
}

