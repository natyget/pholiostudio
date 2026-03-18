'use client'

import { motion } from 'framer-motion'

const features = [
  {
    icon: '✨',
    title: 'AI-Curated Portfolios',
    description: 'Transform raw talent data into publication-ready comp cards with intelligent curation and editorial-quality presentation.'
  },
  {
    icon: '📸',
    title: 'Professional Comp Cards',
    description: 'Generate stunning PDF comp cards that meet industry standards. Download and share with agencies instantly.'
  },
  {
    icon: '🎯',
    title: 'Get Discovered',
    description: 'Connect directly with top agencies actively looking for talent. Your profile is searchable and verified.'
  },
  {
    icon: '📊',
    title: 'Analytics & Insights',
    description: 'Track portfolio views, agency engagement, and application performance with detailed analytics.'
  },
  {
    icon: '🔒',
    title: 'Verified & Secure',
    description: 'Secure authentication, verified profiles, and professional presentation that builds trust with agencies.'
  },
  {
    icon: '⚡',
    title: 'Instant Updates',
    description: 'Update your portfolio in real-time. Changes sync across all platforms and agency dashboards immediately.'
  }
]

export default function FeaturesSection() {
  return (
    <section className="relative bg-white py-24 px-4 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="mb-4 text-4xl font-serif font-semibold text-gray-900 md:text-5xl lg:text-6xl">
            Everything you need to<br />
            <span className="text-[#C9A55A]">stand out</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
            Professional tools built for talent, trusted by top agencies
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:border-[#C9A55A]/20 hover:shadow-xl hover:shadow-[#C9A55A]/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
