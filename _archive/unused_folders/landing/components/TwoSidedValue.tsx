import React from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Check } from 'lucide-react';

const talentFeatures = [
  'Professional portfolio builder',
  'AI bio generation & refinement',
  'Multiple comp card themes',
  'Apple Wallet integration',
  '90-day analytics dashboard',
  'Direct agency applications',
  'Custom domain support',
  'Profile optimization insights'
];

const agencyFeatures = [
  'Unlimited talent applications',
  'AI match scoring & tagging',
  'Smart discovery & filtering',
  'Board & shortlist management',
  'Interview scheduling',
  'Reminder system & notes',
  'Direct messaging with talent',
  'Application analytics'
];

export const TwoSidedValue: React.FC = () => {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className="text-5xl md:text-6xl font-normal mb-6 text-[#0F172A] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Built for Both Sides
          </h2>
          <p className="text-xl text-[#64748b] max-w-3xl mx-auto">
            A platform both talent and agencies actually want to use
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: For Talent */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <div
                className="w-16 h-16 rounded-2xl bg-[#C9A55A]/10 flex items-center justify-center mb-6"
              >
                <User size={32} className="text-[#C9A55A]" />
              </div>
              <h3
                className="text-3xl md:text-4xl font-normal mb-4 text-[#0F172A] tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                For Talent
              </h3>
              <p className="text-[#64748b] leading-relaxed mb-6">
                Everything you need to present yourself professionally and get discovered by top agencies.
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-4 mb-8">
              {talentFeatures.map((feature, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-5 h-5 rounded-full bg-[#C9A55A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-[#C9A55A]" />
                  </div>
                  <span className="text-[#0F172A]">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* Pricing */}
            <div className="bg-[#FAF9F7] rounded-2xl p-8 border border-[#0F172A]/10">
              <div className="flex items-baseline gap-2 mb-2">
                <span
                  className="text-5xl font-normal text-[#0F172A]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  $9.99
                </span>
                <span className="text-[#64748b]">/month</span>
              </div>
              <div className="text-sm text-[#64748b] mb-6">
                or $95.90/year (save 20%)
              </div>
              <button className="w-full py-3 bg-[#C9A55A] hover:bg-[#b08d45] text-[#0F172A] rounded-xl font-semibold transition-colors">
                Start Free Trial
              </button>
              <p className="text-xs text-[#64748b] text-center mt-3">
                7 days free, no credit card required
              </p>
            </div>
          </motion.div>

          {/* Right: For Agencies */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <div
                className="w-16 h-16 rounded-2xl bg-[#0F172A]/10 flex items-center justify-center mb-6"
              >
                <Building2 size={32} className="text-[#0F172A]" />
              </div>
              <h3
                className="text-3xl md:text-4xl font-normal mb-4 text-[#0F172A] tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                For Agencies
              </h3>
              <p className="text-[#64748b] leading-relaxed mb-6">
                Premium talent management tools with no cost. Review applications, discover talent, and build your roster.
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-4 mb-8">
              {agencyFeatures.map((feature, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-5 h-5 rounded-full bg-[#0F172A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-[#0F172A]" />
                  </div>
                  <span className="text-[#0F172A]">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* Pricing */}
            <div className="bg-[#0F172A] rounded-2xl p-8 border border-[#0F172A]/10 relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A55A]/10 rounded-full blur-3xl"></div>

              <div className="relative">
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="text-5xl font-normal text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Free
                  </span>
                  <span className="text-white/60">forever</span>
                </div>
                <div className="text-sm text-white/60 mb-6">
                  All features included, no limits
                </div>
                <button className="w-full py-3 bg-white hover:bg-white/90 text-[#0F172A] rounded-xl font-semibold transition-colors">
                  Create Agency Account
                </button>
                <p className="text-xs text-white/60 text-center mt-3">
                  No credit card, no hidden fees
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block px-6 py-3 bg-[#C9A55A]/10 rounded-full border border-[#C9A55A]/30">
            <p className="text-sm text-[#0F172A]">
              <span className="font-semibold">1,200+ portfolios</span> created · <span className="font-semibold">340+ agencies</span> connected · <span className="font-semibold">89%</span> response rate
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
