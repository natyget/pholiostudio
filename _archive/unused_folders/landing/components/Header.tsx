"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const Header = () => {
  const { scrollY } = useScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll Event listener for non-motion values if needed, 
  // but framer-motion handles styles well.
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
        setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Transformations
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(253, 252, 248, 0)', 'rgba(253, 252, 248, 0.85)'] // Cream transparent -> Cream Glass
  );
  
  const backdropFilter = useTransform(
    scrollY,
    [0, 50],
    ['blur(0px)', 'blur(12px)']
  );
  
  const height = useTransform(
    scrollY,
    [0, 50],
    ['90px', '70px']
  );
  
  const borderBottomColor = useTransform(
      scrollY,
      [0, 50],
      ['rgba(15, 23, 42, 0)', 'rgba(15, 23, 42, 0.08)'] // Ink soft border
  );

  return (
    <>
    <motion.header
        style={{ 
            backgroundColor, 
            backdropFilter, 
            height,
            borderBottom: '1px solid',
            borderBottomColor
        }}
        className="fixed top-0 left-0 w-full z-50 flex items-center px-6 md:px-12 transition-all duration-300"
    >
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="z-50">
                <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-ink">
                    PHOLIO
                </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-10">
                {['TALENT', 'AGENCIES', 'JOURNAL'].map((item) => (
                    <Link 
                        key={item} 
                        href="#" 
                        className="text-xs font-bold tracking-[0.2em] text-ink/70 hover:text-gold transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </nav>

            {/* Desktop Utilities */}
            <div className="hidden md:flex items-center gap-8">
                <Link href={`${appUrl}/login`} className="text-sm font-medium text-ink hover:text-gold transition-colors">
                    Log in
                </Link>
                <Link href={`${appUrl}/onboarding`} className="px-6 py-2.5 bg-ink text-cream text-xs font-bold tracking-widest uppercase rounded hover:bg-gold transition-colors duration-300">
                    Get Scouted
                </Link>
            </div>

            {/* Mobile Toggle */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="md:hidden z-50 flex flex-col gap-1.5 p-2"
            >
                <motion.div 
                    animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }} 
                    className="w-6 h-0.5 bg-ink" 
                />
                <motion.div 
                    animate={{ opacity: isMobileMenuOpen ? 0 : 1 }} 
                    className="w-6 h-0.5 bg-ink" 
                />
                <motion.div 
                    animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }} 
                    className="w-6 h-0.5 bg-ink" 
                />
            </button>
        </div>
    </motion.header>

    {/* Mobile Overlay Menu */}
    <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed inset-0 z-40 bg-cream flex flex-col items-center justify-center gap-8 md:hidden"
            >
                {['TALENT', 'AGENCIES', 'JOURNAL'].map((item) => (
                    <Link 
                        key={item} 
                        href="#" 
                        className="text-3xl font-serif text-ink hover:text-gold transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {item}
                    </Link>
                ))}
                
                <Link
                    href={`${appUrl}/login`}
                    className="text-3xl font-serif text-ink hover:text-gold transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    LOG IN
                </Link>

                <Link
                    href={`${appUrl}/onboarding`}
                    className="mt-4 px-8 py-4 bg-ink text-cream text-sm font-bold tracking-widest uppercase rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    GET SCOUTED
                </Link>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
};
