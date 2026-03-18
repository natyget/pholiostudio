'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LivingHeadline } from './LivingHeadline';
import { Search, MapPin, Sliders } from 'lucide-react';

export function SceneAgency() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
       // Mock UI Animation
       const tl = gsap.timeline({
          scrollTrigger: {
             trigger: containerRef.current,
             start: "top 60%",
          }
       });

       tl.from('.dashboard-ui', {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
       });
       
       tl.from('.talent-card', {
         y: 20,
         opacity: 0,
         stagger: 0.1,
         duration: 0.6,
         ease: "back.out(1.2)"
       }, "-=0.5");

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen w-full bg-cream-warm flex items-center justify-center overflow-hidden py-24">
      
      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Left: Visualization (Agency Dashboard) */}
        <div className="order-2 md:order-1 dashboard-ui bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-xl mx-auto md:mx-0 w-full transform -rotate-1 hover:rotate-0 transition-transform duration-500">
           
           {/* Fake Header */}
           <div className="h-12 border-b border-gray-100 flex items-center px-4 justify-between bg-white">
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="text-xs text-gray-400 font-sans tracking-widest">AGENCY DASHBOARD</div>
           </div>

           {/* Dashboard Content */}
           <div className="p-6 bg-gray-50/50">
              {/* Search Bar */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3 mb-6 shadow-sm">
                 <Search size={16} className="text-gray-400" />
                 <span className="text-sm text-ink flex-1">find blonde editorial models in...</span>
                 <div className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500">⌘K</div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                 <div className="px-3 py-1 bg-ink text-white rounded-full text-xs font-medium whitespace-nowrap">Available Now</div>
                 <div className="px-3 py-1 bg-white border border-gray-200 text-ink-soft rounded-full text-xs font-medium whitespace-nowrap">Looking for Representation</div>
                 <div className="px-3 py-1 bg-white border border-gray-200 text-ink-soft rounded-full text-xs font-medium whitespace-nowrap">Height 5'9"+</div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="talent-card bg-white p-2 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                       <div className="aspect-[3/4] bg-gray-200 rounded mb-2 relative overflow-hidden">
                          <img src={`https://images.unsplash.com/photo-${[
                             '1534528741775-53994a69daeb',
                             '1544005313-94ddf0286df2',
                             '1531746020798-e6953c6e8e04',
                             '1517841905240-472988babdf9'
                          ][i-1]}?q=80&w=400`} className="w-full h-full object-cover" alt="Model" />
                          <div className="absolute top-1 right-1 bg-green-500 w-2 h-2 rounded-full border border-white"></div>
                       </div>
                       <div className="flex justify-between items-start">
                          <div>
                             <div className="font-bold text-sm text-ink">Name {i}.</div>
                             <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                <MapPin size={8} /> New York
                             </div>
                          </div>
                          <div className="text-[10px] font-bold text-gold">9{i}% Match</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Narrative */}
        <div className="order-1 md:order-2">
          <div className="flex items-center gap-2 mb-4">
             <div className="h-[1px] w-8 bg-gold"></div>
             <span className="text-sm font-sans tracking-widest uppercase text-gold font-semibold">The Agency View</span>
          </div>
          <LivingHeadline 
            text="Where Agencies Look First." 
            className="text-5xl md:text-7xl text-ink mb-6"
          />
          <p className="font-sans text-lg text-ink-soft max-w-lg leading-relaxed mb-8">
            Top tier agencies use Pholio's advanced dashboard to scout talent. 
            By standardizing your data and verifying your metrics, you appear in their qualified search results—<b>not</b> the spam folder.
          </p> 
          <ul className="space-y-4">
             <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                   <Search size={20} />
                </div>
                <div>
                   <h4 className="font-serif text-lg text-ink">Priority Search Ranking</h4>
                   <p className="text-sm text-ink-muted">Studio+ profiles appear first in agency results.</p>
                </div>
             </li>
             <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                   <Sliders size={20} />
                </div>
                <div>
                   <h4 className="font-serif text-lg text-ink">Verified Filtering</h4>
                   <p className="text-sm text-ink-muted">Agencies filter by 'Verified Only' to save time. Be listed.</p>
                </div>
             </li>
          </ul>
        </div>

      </div>

    </section>
  );
}
