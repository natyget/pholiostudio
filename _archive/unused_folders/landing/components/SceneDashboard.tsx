'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LivingHeadline } from './LivingHeadline';
import { CinematicCard } from './CinematicCard';

export function SceneDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Very subtle float effect for the background elements
      gsap.to('.dashboard-float', {
        y: -30,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2
      });
      
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top center",
        onEnter: () => gsap.from('.stat-row', {
            opacity: 0,
            x: -20,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out"
        })
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen w-full bg-cream-warm flex items-center justify-center overflow-hidden py-24">
      
      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: The Visual (3D Profile Card) */}
        <div className="order-1 relative perspective-1000">
          <CinematicCard className="w-full max-w-md mx-auto">
             <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-8 border border-gray-100">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gold p-0.5">
                      <div className="w-full h-full rounded-full bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop')] grayscale hover:grayscale-0 transition-all duration-500" />
                   </div>
                   <div>
                      <h3 className="font-serif text-2xl text-ink">Alyssa M.</h3>
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-bold tracking-widest uppercase rounded">Verified</span>
                         <span className="text-xs text-ink-muted">Los Angeles, CA</span>
                      </div>
                   </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="stat-row p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Height</div>
                      <div className="text-lg font-medium text-ink">178 cm</div>
                   </div>
                   <div className="stat-row p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Waist</div>
                      <div className="text-lg font-medium text-ink">60 cm</div>
                   </div>
                   <div className="stat-row p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Shoes</div>
                      <div className="text-lg font-medium text-ink">39 EU</div>
                   </div>
                   <div className="stat-row p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Eyes</div>
                      <div className="text-lg font-medium text-ink">Hazel</div>
                   </div>
                </div>

                {/* Verified Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                   <div className="text-xs text-ink-muted">Last updated today</div>
                   <div className="flex items-center gap-1.5 opacity-60">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-medium">Available</span>
                   </div>
                </div>
             </div>
          </CinematicCard>
          
          {/* Decorative Floating Elements */}
          <div className="dashboard-float absolute -z-10 -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-3xl" />
          <div className="dashboard-float absolute -z-10 bottom-12 -left-12 w-48 h-48 bg-ink/5 rounded-full blur-3xl delay-700" />
        </div>

        {/* Right: Narrative */}
        <div className="order-2">
          <div className="flex items-center gap-2 mb-4">
             <div className="h-[1px] w-8 bg-gold"></div>
             <span className="text-sm font-sans tracking-widest uppercase text-gold font-semibold">The Studio+ Standard</span>
          </div>
          <LivingHeadline 
            text="A Dedicated Studio." 
            className="text-5xl md:text-7xl text-ink mb-6"
          />
          <p className="font-sans text-lg text-ink-soft max-w-lg leading-relaxed mb-8">
            Upgrade to <b>Studio+</b> and get your own custom <code>.studio</code> domain. 
            Agencies book talent who treat their career like a business—with verified metrics and professional presentation.
          </p> 
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2">
                <h4 className="font-serif text-xl text-ink">Custom Domain</h4>
                <p className="text-sm text-ink-muted">
                   Claim <code>yourname.pholio.studio</code> and own your SEO and digital presence.
                </p>
             </div>
             <div className="flex flex-col gap-2">
                <h4 className="font-serif text-xl text-ink">Verified Metrics</h4>
                <p className="text-sm text-ink-muted">
                   We cross-reference your measurements to ensure you never get turned away at a go-see.
                </p>
             </div>
          </div>
        </div>

      </div>

    </section>
  );
}
