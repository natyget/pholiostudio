'use client'

import { motion } from 'framer-motion'

const agencyFeatures = [
  {
    icon: '📋',
    title: 'Application Management',
    description: 'Review and organize all incoming talent applications in one place. Kanban boards, filters, and smart sorting.',
    highlight: 'Streamlined workflow'
  },
  {
    icon: '🤖',
    title: 'AI-Powered Insights',
    description: 'Get AI-generated match scores and tags to quickly identify talent that fits your agency\'s needs.',
    highlight: 'Smart discovery'
  },
  {
    icon: '💼',
    title: '100% Free Forever',
    description: 'Our dashboard is completely free for verified partner agencies. No subscription fees, no hidden costs.',
    highlight: 'Always free'
  }
]

export default function AgencySection() {
  return (
    <section className="relative bg-[#FAF9F6] py-24 px-4 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="mb-4 inline-block rounded-full bg-[#C9A55A]/10 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-[#C9A55A]">
            For Agencies
          </div>
          <h2 className="mb-6 text-4xl font-serif font-semibold text-gray-900 md:text-5xl lg:text-6xl">
            Free Talent Management<br />Dashboard
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600 md:text-xl">
            Pholio provides verified agencies with a premium dashboard to manage incoming talent applications—completely free.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {agencyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#C9A55A]/10 text-3xl">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mb-4 leading-relaxed text-gray-600">
                {feature.description}
              </p>
              <div className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {feature.highlight}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <a
            href="/partners"
            className="inline-flex items-center gap-3 rounded-full bg-gray-900 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-[#C9A55A] hover:shadow-lg hover:shadow-[#C9A55A]/20"
          >
            Become a Partner Agency
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
