"use client";

import { useState, useEffect } from "react";

export default function PholioHeader() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Header */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-[999] transition-all duration-400
          ${scrolled
            ? 'pt-4 pb-4 bg-[#FAF9F7]/98 border-b border-[#C9A55A]/25 shadow-sm'
            : 'pt-7 pb-7 bg-[#FAF9F7]/98 border-b border-[#C9A55A]/15 shadow-md'
          }
        `}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between gap-8 min-h-[2.5rem]">

          {/* Logo - Simple Text */}
          <a
            href="/"
            className="flex items-center text-[#C9A55A] transition-transform duration-300 hover:scale-105"
            style={{ fontFamily: "'Noto Serif Display', serif" }}
          >
            Pholio
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center flex-1 justify-center" aria-label="Primary">
            <ul className="flex list-none p-0 m-0 gap-8 items-center">
              <li className="m-0 p-0">
                <a
                  href="/"
                  className="nav-link"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.9375rem',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#475569',
                    textDecoration: 'none',
                    padding: '0.5rem 0',
                    position: 'relative',
                    display: 'inline-block',
                    transition: 'color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                >
                  Home
                </a>
              </li>
              <li className="m-0 p-0">
                <a
                  href="/features"
                  className="nav-link"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.9375rem',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#475569',
                    textDecoration: 'none',
                    padding: '0.5rem 0',
                    position: 'relative',
                    display: 'inline-block',
                    transition: 'color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                >
                  Features
                </a>
              </li>
              <li className="m-0 p-0">
                <a
                  href="/pricing"
                  aria-current="page"
                  className="nav-link active"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#C9A55A',
                    textDecoration: 'none',
                    padding: '0.5rem 0',
                    position: 'relative',
                    display: 'inline-block',
                    transition: 'color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                >
                  Pricing
                </a>
              </li>
              <li className="m-0 p-0">
                <a
                  href="/pro"
                  className="nav-link"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.9375rem',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#475569',
                    textDecoration: 'none',
                    padding: '0.5rem 0',
                    position: 'relative',
                    display: 'inline-block',
                    transition: 'color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                >
                  Studio+
                </a>
              </li>
              <li className="m-0 p-0">
                <a
                  href="/press"
                  className="nav-link"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.9375rem',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#475569',
                    textDecoration: 'none',
                    padding: '0.5rem 0',
                    position: 'relative',
                    display: 'inline-block',
                    transition: 'color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                >
                  Press
                </a>
              </li>
            </ul>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <a
              href={`${appUrl}/login`}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9375rem',
                fontWeight: 400,
                letterSpacing: '0.05em',
                color: '#475569',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              className="hover:text-[#0F172A]"
            >
              Login
            </a>
            <a
              href={`${appUrl}/signup`}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.625rem 1.5rem',
                background: '#C9A55A',
                color: '#0F172A',
                borderRadius: '999px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                display: 'inline-block'
              }}
              className="hover:bg-[#b08d45]"
            >
              Start Creating
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl border border-[#e2e8f0]/70 bg-white inline-flex items-center justify-center relative cursor-pointer transition-all duration-200 hover:border-[#C9A55A]/50"
            aria-label="Toggle menu"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isMobileMenuOpen ? (
              <>
                <span className="absolute w-5 h-0.5 bg-[#0F172A] rounded-sm" style={{ transform: 'rotate(45deg)' }}></span>
                <span className="absolute w-5 h-0.5 bg-[#0F172A] rounded-sm" style={{ transform: 'rotate(-45deg)' }}></span>
              </>
            ) : (
              <>
                <span className="absolute w-5 h-0.5 bg-[#0F172A] rounded-sm" style={{ transform: 'translateY(-6px)' }}></span>
                <span className="absolute w-5 h-0.5 bg-[#0F172A] rounded-sm"></span>
                <span className="absolute w-5 h-0.5 bg-[#0F172A] rounded-sm" style={{ transform: 'translateY(6px)' }}></span>
              </>
            )}
          </button>
        </div>

        {/* Add nav-link styles in a style tag */}
        <style jsx>{`
          .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: #C9A55A;
            transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .nav-link:hover {
            color: #0F172A !important;
          }

          .nav-link:hover::after,
          .nav-link:focus::after {
            width: 100%;
          }

          .nav-link.active::after {
            width: 100%;
            background: #C9A55A;
          }
        `}</style>
      </header>

      {/* Mobile Navigation Panel */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-[998]"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          />

          {/* Mobile Menu */}
          <div className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-[#FAF9F7]/98 z-[999] shadow-2xl"
               style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0]/50 sticky top-0 bg-[#FAF9F7]/98 z-10"
                   style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
                <span style={{ fontFamily: "'Noto Serif Display', serif", color: '#C9A55A' }}>
                  Pholio
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-12 h-12 rounded-xl border border-[#e2e8f0]/70 bg-white inline-flex items-center justify-center relative"
                  aria-label="Close menu"
                >
                  <span className="absolute w-5 h-0.5 bg-[#0F172A] rounded-sm" style={{ transform: 'rotate(45deg)' }}></span>
                  <span className="absolute w-5 h-0.5 bg-[#0F172A] rounded-sm" style={{ transform: 'rotate(-45deg)' }}></span>
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="p-6 flex-1">
                <ul className="list-none p-0 m-0 space-y-4">
                  <li>
                    <a href="/" className="block py-3 text-sm font-medium uppercase tracking-wider text-[#0F172A] hover:text-[#C9A55A] transition-colors">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/features" className="block py-3 text-sm font-medium uppercase tracking-wider text-[#0F172A] hover:text-[#C9A55A] transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" aria-current="page" className="block py-3 text-sm font-semibold uppercase tracking-wider text-[#C9A55A] transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="/pro" className="block py-3 text-sm font-medium uppercase tracking-wider text-[#0F172A] hover:text-[#C9A55A] transition-colors">
                      Studio+
                    </a>
                  </li>
                  <li>
                    <a href="/press" className="block py-3 text-sm font-medium uppercase tracking-wider text-[#0F172A] hover:text-[#C9A55A] transition-colors">
                      Press
                    </a>
                  </li>
                </ul>
              </nav>

              {/* Mobile Actions */}
              <div className="p-6 border-t border-[#e2e8f0]/50 space-y-3">
                <a
                  href={`${appUrl}/login`}
                  className="block text-center py-3 text-sm font-medium uppercase tracking-wider text-[#475569] hover:text-[#0F172A] transition-colors"
                >
                  Login
                </a>
                <a
                  href={`${appUrl}/signup`}
                  className="block text-center py-3 px-6 text-xs font-bold uppercase tracking-wider bg-[#C9A55A] text-[#0F172A] rounded-full hover:bg-[#b08d45] transition-colors"
                >
                  Start Creating
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
