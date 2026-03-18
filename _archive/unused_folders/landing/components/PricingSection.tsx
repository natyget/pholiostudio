import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const features = [
  'Unlimited portfolio updates',
  'AI bio generation & refinement',
  'Professional comp card themes',
  'Apple Wallet integration',
  '90-day analytics dashboard',
  'Direct agency applications',
  'Custom domain support',
  'Profile optimization insights',
  'Priority support',
  'Early access to new features'
];

export const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const monthlyPrice = 9.99;
  const annualPrice = 95.90; // 20% savings
  const monthlySavings = ((monthlyPrice * 12) - annualPrice).toFixed(2);

  return (
    <section className="py-32 bg-[#FAF9F7] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A55A]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="text-5xl md:text-6xl font-normal mb-6 text-[#0F172A] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            One Price, All Features
          </h2>
          <p className="text-xl text-[#64748b] max-w-2xl mx-auto">
            Simple, transparent pricing. No hidden fees, no limits.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-4 p-2 bg-white rounded-full border border-[#0F172A]/10 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`
                px-6 py-2 rounded-full font-medium transition-all duration-300
                ${billingCycle === 'monthly'
                  ? 'bg-[#C9A55A] text-[#0F172A]'
                  : 'text-[#64748b] hover:text-[#0F172A]'
                }
              `}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`
                px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2
                ${billingCycle === 'annual'
                  ? 'bg-[#C9A55A] text-[#0F172A]'
                  : 'text-[#64748b] hover:text-[#0F172A]'
                }
              `}
            >
              Annual
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <motion.div
          key={billingCycle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-12 border border-[#0F172A]/10 relative"
          style={{ boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.15)' }}
        >
          {/* Badge */}
          {billingCycle === 'annual' && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-green-500 text-white rounded-full text-sm font-semibold shadow-lg">
              Save ${monthlySavings}/year
            </div>
          )}

          {/* Price */}
          <div className="text-center mb-10">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-[#64748b] text-xl line-through">
                {billingCycle === 'monthly' ? '$19.99' : '$239.88'}
              </span>
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span
                className="text-7xl font-normal text-[#0F172A]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                ${billingCycle === 'monthly' ? monthlyPrice.toFixed(2) : annualPrice.toFixed(2)}
              </span>
              <span className="text-2xl text-[#64748b]">
                {billingCycle === 'monthly' ? '/month' : '/year'}
              </span>
            </div>
            {billingCycle === 'annual' && (
              <div className="text-sm text-[#64748b]">
                That's just ${(annualPrice / 12).toFixed(2)}/month
              </div>
            )}
          </div>

          {/* Features List */}
          <div className="mb-10">
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 bg-[#C9A55A]/10 rounded-full text-sm font-semibold text-[#C9A55A]">
                Everything Included
              </span>
            </div>
            <ul className="grid md:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#C9A55A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-[#C9A55A]" />
                  </div>
                  <span className="text-[#0F172A]">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <button className="w-full py-4 bg-[#C9A55A] hover:bg-[#b08d45] text-[#0F172A] rounded-xl font-semibold transition-colors text-lg shadow-lg">
              Start Free Trial
            </button>
            <p className="text-sm text-center text-[#64748b]">
              7 days free, no credit card required. Cancel anytime.
            </p>
          </div>

          {/* Trust Elements */}
          <div className="mt-8 pt-8 border-t border-[#0F172A]/10 flex flex-wrap justify-center gap-8 text-sm text-[#64748b]">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>No commitment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>

        {/* FAQ Snippet */}
        <div className="mt-16 text-center">
          <p className="text-[#64748b] mb-4">
            Have questions?{' '}
            <a href="#faq" className="text-[#C9A55A] hover:underline font-semibold">
              View our FAQ
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
