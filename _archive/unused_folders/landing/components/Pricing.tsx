
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';

const PLANS = [
  {
    title: "The Talent",
    price: "0",
    priceYearly: "0",
    desc: "Establish your basic digital signal.",
    features: ["AI Profile Builder", "Standard pholio.st URL", "3 Verified Frames", "Community Casting Access"],
    button: "Get Started",
    accent: "neutral"
  },
  {
    title: "Studio+",
    price: "19.99",
    priceYearly: "15.99",
    desc: "Elevate to agency-grade visibility.",
    features: ["Custom Domain", "Unlimited RAW Uploads", "Priority Signal Boost", "Advanced Analytics", "Verification Badge"],
    button: "Upgrade to Studio+",
    accent: "gold"
  }
];

export const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-32 px-4 relative bg-[#FAF9F7]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-24">
          <span className="inline-block font-sans text-xs tracking-[0.2em] uppercase text-[#C9A55A]/80 mb-6 px-5 py-2 border border-[#C9A55A]/20 rounded-full bg-[#C9A55A]/5 font-medium">
            Select Your Signal
          </span>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.2] mb-6 text-[#0F172A] tracking-[0.02em]" style={{ fontFamily: "'Noto Serif Display', serif" }}>
            MEMBERSHIP<br/><span className="text-[#C9A55A]">ARCHITECTURE</span>
          </h2>
          <p className="font-sans text-[clamp(1rem,2vw,1.25rem)] text-[#475569] max-w-2xl mx-auto leading-[1.7] font-normal">
            Pricing built for transparency. No hidden fees, no algorithm manipulation. Just your talent, verified.
          </p>
          <div className="w-[120px] h-0.5 bg-gradient-to-r from-transparent via-[#C9A55A]/50 to-transparent mx-auto mt-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#C9A55A]/80 rounded-full"></div>
          </div>
        </div>

        {/* Billing Toggle - Only show for Studio+ */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-[#0F172A]/10 shadow-sm">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                isYearly ? 'bg-[#C9A55A]' : 'bg-[#0F172A]/10'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isYearly ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
              Yearly
            </span>
            {isYearly && (
              <span className="ml-2 px-2 py-1 bg-[#C9A55A]/10 text-[#C9A55A] text-xs font-semibold rounded-full" style={{ fontFamily: "'Inter', sans-serif" }}>
                Save 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#0F172A]/10 border border-[#0F172A]/10 rounded-2xl overflow-hidden max-w-4xl mx-auto" style={{ boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)' }}>
          {PLANS.map((plan, i) => {
            const displayPrice = isYearly && plan.priceYearly ? plan.priceYearly : plan.price;
            return (
              <div key={i} className="bg-white p-10 flex flex-col group relative overflow-hidden">
                 {plan.accent === 'gold' && (
                   <div className="absolute top-6 right-6 bg-[#C9A55A] text-[#0F172A] px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-md">
                     <Sparkles size={10}/> Most Requested
                   </div>
                 )}
                 
                 <div className="mb-10">
                   <h4 className="text-[#64748B] text-[10px] uppercase tracking-[0.3em] font-bold mb-4">{plan.title}</h4>
                   <div className="flex items-baseline gap-1">
                     <span className="text-2xl text-[#64748B]">$</span>
                     <span className="text-6xl font-bold tracking-tighter text-[#0F172A]">{displayPrice}</span>
                     <span className="text-[#64748B] text-xs ml-2 font-bold uppercase tracking-widest">/{isYearly ? 'mo' : 'mo'}</span>
                   </div>
                   {isYearly && plan.priceYearly && parseFloat(plan.priceYearly) > 0 && (
                     <p className="mt-2 text-xs text-[#C9A55A] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                       Billed annually (${(parseFloat(displayPrice) * 12).toFixed(2)}/year)
                     </p>
                   )}
                   <p className="mt-4 text-[#475569] text-sm">{plan.desc}</p>
                 </div>

                 <div className="flex-1 space-y-4 mb-12">
                   {plan.features.map((feature, j) => (
                     <div key={j} className="flex items-center gap-3 text-sm text-[#0F172A]">
                       <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${plan.accent === 'gold' ? 'border-[#C9A55A] text-[#C9A55A]' : 'border-[#0F172A]/20 text-[#0F172A]/40'}`}>
                          <Check size={10}/>
                       </div>
                       {feature}
                     </div>
                   ))}
                 </div>

                 <button className={`w-full py-5 rounded-xl font-bold uppercase tracking-[0.3em] text-[10px] transition-all duration-500 border shadow-sm
                   ${plan.accent === 'gold' 
                     ? 'bg-[#C9A55A] text-[#0F172A] border-[#C9A55A] hover:bg-[#0F172A] hover:text-[#C9A55A] hover:shadow-md' 
                     : 'bg-white text-[#0F172A] border-[#0F172A]/10 hover:border-[#C9A55A] hover:text-[#C9A55A] hover:shadow-md'}`}>
                   {plan.button}
                 </button>

                 {/* Scanning light effect on hover */}
                 <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#C9A55A]/20 blur-sm animate-scan" />
                 </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Banner */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-2xl p-10 border border-[#0F172A]/20 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                  Enterprise
                </h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Filter the noise for your roster. Bulk talent management, API access, private sourcing portal, white-label profiles, and dedicated support.
                </p>
              </div>
              <button className="px-8 py-4 bg-[#C9A55A] text-[#0F172A] font-bold uppercase tracking-[0.3em] text-[10px] rounded-xl hover:bg-white transition-all duration-300 shadow-md">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </section>
  );
};

