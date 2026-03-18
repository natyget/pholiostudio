import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Smartphone, TrendingUp, Search, Download } from 'lucide-react';

const features = [
  {
    title: 'AI Bio Generation',
    description: 'Professional bios written and refined by AI in seconds',
    icon: Sparkles,
    color: '#C9A55A',
    size: 'large', // spans 2 columns
    demo: (
      <div className="space-y-3 text-xs">
        <div className="p-3 bg-white/50 rounded-lg border border-[#0F172A]/10">
          <div className="text-[#64748b] mb-2">Your input:</div>
          <div className="text-[#0F172A]">"Model from NYC, 5 years experience"</div>
        </div>
        <div className="flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#C9A55A] animate-pulse" />
        </div>
        <div className="p-3 bg-[#C9A55A]/10 rounded-lg border border-[#C9A55A]/30">
          <div className="text-[#C9A55A] font-medium mb-2">AI refined:</div>
          <div className="text-[#0F172A] leading-relaxed">
            Experienced fashion and editorial model based in New York. 5+ years of professional runway and campaign work with top agencies.
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Comp Card Themes',
    description: 'Multiple professional layouts ready to print',
    icon: FileText,
    color: '#0F172A',
    size: 'medium',
    demo: (
      <div className="grid grid-cols-2 gap-2">
        <div className="aspect-[3/4] bg-white rounded-md border border-[#0F172A]/10 overflow-hidden">
          <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs text-[#64748b]">
            Editorial
          </div>
        </div>
        <div className="aspect-[3/4] bg-white rounded-md border border-[#0F172A]/10 overflow-hidden">
          <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-xs text-[#64748b]">
            Classic
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Apple Wallet',
    description: 'Your portfolio in your pocket, always ready',
    icon: Smartphone,
    color: '#0F172A',
    size: 'medium',
    demo: (
      <div className="flex items-center justify-center h-full">
        <div className="w-32 h-40 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 shadow-2xl text-white">
          <div className="text-[8px] font-bold mb-2">PHOLIO</div>
          <div className="text-xs font-semibold mb-1">Sarah Chen</div>
          <div className="text-[8px] opacity-60">Model • NYC</div>
          <div className="mt-4 space-y-1">
            <div className="h-1 bg-white/20 rounded"></div>
            <div className="h-1 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Portfolio Analytics',
    description: 'Track views, engagement, and agency interest',
    icon: TrendingUp,
    color: '#C9A55A',
    size: 'medium',
    demo: (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#64748b]">Profile Views</span>
          <span className="text-[#C9A55A] font-bold">+127</span>
        </div>
        <div className="h-20 flex items-end gap-1">
          {[40, 65, 45, 80, 60, 95, 70].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-[#C9A55A] rounded-t"
              style={{ height: `${height}%`, opacity: 0.3 + (i * 0.1) }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-[#64748b]">
          <span>Mon</span>
          <span>Sun</span>
        </div>
      </div>
    )
  },
  {
    title: 'Agency Discovery',
    description: 'AI-powered matching with verified agencies',
    icon: Search,
    color: '#0F172A',
    size: 'medium',
    demo: (
      <div className="space-y-2">
        {[
          { name: 'Elite Models NYC', match: 94 },
          { name: 'IMG Worldwide', match: 87 }
        ].map((agency, i) => (
          <div key={i} className="p-3 bg-white rounded-lg border border-[#0F172A]/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#0F172A]">{agency.name}</div>
              <div className="text-[9px] text-[#64748b]">Verified Agency</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs font-bold text-[#C9A55A]">{agency.match}%</div>
              <div className="text-[8px] text-[#64748b]">Match</div>
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    title: 'PDF Generation',
    description: 'Print-ready comp cards, instant download',
    icon: Download,
    color: '#0F172A',
    size: 'medium',
    demo: (
      <div className="flex items-center justify-center h-full">
        <div className="w-24 h-32 bg-white rounded-lg border-2 border-[#0F172A]/20 shadow-lg p-2 relative">
          <div className="h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded mb-1"></div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-200 rounded"></div>
            <div className="h-1 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#C9A55A] rounded-full flex items-center justify-center shadow-lg">
            <Download size={14} className="text-[#0F172A]" />
          </div>
        </div>
      </div>
    )
  }
];

export const FeaturesBento: React.FC = () => {
  return (
    <section className="py-32 bg-[#FAF9F7]">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block font-sans text-xs tracking-[0.2em] uppercase text-[#C9A55A]/80 mb-6 px-5 py-2 border border-[#C9A55A]/20 rounded-full bg-[#C9A55A]/5 font-medium">
            Intelligence Meets Craft
          </span>
          <h2
            className="text-5xl md:text-6xl font-normal mb-6 text-[#0F172A] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Everything You Need
          </h2>
          <p className="text-xl text-[#64748b] max-w-3xl mx-auto">
            AI-powered features that transform your portfolio into an agency-ready presentation
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`
                  bg-white rounded-2xl p-8 border border-[#0F172A]/10
                  ${feature.size === 'large' ? 'md:col-span-2' : ''}
                  hover:shadow-2xl transition-all duration-500
                `}
                style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${feature.color}10` }}
                >
                  <Icon size={24} style={{ color: feature.color }} />
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#64748b] mb-6">
                  {feature.description}
                </p>

                {/* Demo */}
                <div className="mt-auto">
                  {feature.demo}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
