'use client'

import { motion } from 'framer-motion'

export default function CTASection() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <section className="relative bg-white py-24 px-4 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-16 text-center shadow-2xl md:px-16 md:py-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#C9A55A] blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C9A55A] blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Headline */}
            <motion.h2
              className="mb-6 text-4xl font-serif font-semibold text-white md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to be discovered?
            </motion.h2>

            {/* Description */}
            <motion.p
              className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join thousands of talents who've built their portfolios on Pholio.<br />
              Create your professional comp card in minutes.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <a
                href={`${appUrl}/signup`}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#C9A55A] px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-[#D4AF6A] hover:shadow-xl hover:shadow-[#C9A55A]/30 sm:w-auto"
              >
                Get Started Free
              </a>
              <a
                href="/features"
                className="inline-flex w-full items-center justify-center rounded-full border-2 border-white/20 bg-white/5 px-10 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                Learn More
              </a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-12 flex flex-col items-center justify-center gap-6 border-t border-white/10 pt-10 text-sm text-gray-400 sm:flex-row"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-[#C9A55A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-[#C9A55A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-[#C9A55A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
