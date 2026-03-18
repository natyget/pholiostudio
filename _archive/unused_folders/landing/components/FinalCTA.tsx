import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-40 bg-[#0F172A] text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A55A]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C9A55A]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#C9A55A]/10 rounded-full border border-[#C9A55A]/30 mb-12"
          >
            <Sparkles size={16} className="text-[#C9A55A]" />
            <span className="text-sm font-medium text-[#C9A55A] uppercase tracking-wider">
              Start Your Journey Today
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl lg:text-8xl font-normal mb-8 tracking-tight leading-[1.1]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Stop Getting Lost.
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-6xl lg:text-7xl font-normal mb-12 text-[#C9A55A] tracking-tight leading-[1.1]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Start Getting Booked.
          </motion.h3>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-white/70 mb-16 max-w-3xl mx-auto leading-relaxed"
          >
            Join 1,200+ models who transformed their careers from scattered submissions to professional portfolios that agencies actually respond to.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button className="group px-10 py-5 bg-[#C9A55A] hover:bg-[#b08d45] text-[#0F172A] rounded-xl font-semibold transition-all duration-300 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center gap-3">
              Create Your Portfolio
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300 text-lg border border-white/20 backdrop-blur-sm">
              See Example Portfolio
            </button>
          </motion.div>

          {/* Trust Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-white/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#C9A55A]">✓</span>
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#C9A55A]">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#C9A55A]">✓</span>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#C9A55A]">✓</span>
              <span>Setup in under 5 minutes</span>
            </div>
          </motion.div>

          {/* Social Proof Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-20 pt-12 border-t border-white/10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
                    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=100'
                  ].map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-12 h-12 rounded-full border-2 border-[#0F172A] object-cover"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Join 1,200+ models</div>
                  <div className="text-white/60 text-sm">Building careers on Pholio</div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#C9A55A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    4.8★
                  </div>
                  <div className="text-white/60 text-sm">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#C9A55A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    89%
                  </div>
                  <div className="text-white/60 text-sm">Response Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
