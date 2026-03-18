import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Upload, Sparkles, Palette, Download, Send, BarChart, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Sign Up',
    description: 'Create your account with email or Google',
    duration: '30 seconds',
    icon: UserPlus,
    color: '#C9A55A'
  },
  {
    number: '02',
    title: 'Upload Photos',
    description: 'Drag and drop your best images',
    duration: '2 minutes',
    icon: Upload,
    color: '#C9A55A'
  },
  {
    number: '03',
    title: 'AI Generates Bio',
    description: 'Professional bio written instantly',
    duration: 'Instant',
    icon: Sparkles,
    color: '#C9A55A'
  },
  {
    number: '04',
    title: 'Choose Theme',
    description: 'Select from professional comp card layouts',
    duration: '1 minute',
    icon: Palette,
    color: '#C9A55A'
  },
  {
    number: '05',
    title: 'Download Comp Card',
    description: 'Print-ready PDF in industry standard format',
    duration: 'Instant',
    icon: Download,
    color: '#C9A55A'
  },
  {
    number: '06',
    title: 'Apply to Agencies',
    description: 'One-click applications with AI match scores',
    duration: '1 click',
    icon: Send,
    color: '#0F172A'
  },
  {
    number: '07',
    title: 'Track Progress',
    description: 'See who viewed your profile and when',
    duration: 'Real-time',
    icon: BarChart,
    color: '#0F172A'
  },
  {
    number: '08',
    title: 'Get Booked',
    description: 'Receive inquiries and book opportunities',
    duration: 'Ongoing',
    icon: CheckCircle,
    color: '#0F172A'
  }
];

export const ProcessTimeline: React.FC = () => {
  return (
    <section className="py-32 bg-[#FAF9F7] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A55A]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0F172A]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block font-sans text-xs tracking-[0.2em] uppercase text-[#C9A55A]/80 mb-6 px-5 py-2 border border-[#C9A55A]/20 rounded-full bg-[#C9A55A]/5 font-medium">
            The Journey
          </span>
          <h2
            className="text-5xl md:text-6xl font-normal mb-6 text-[#0F172A] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            From Upload to Booked
          </h2>
          <p className="text-xl text-[#64748b] max-w-3xl mx-auto mb-8">
            Your complete journey from raw photos to agency representation
          </p>
          <div
            className="text-4xl font-normal text-[#C9A55A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Total Time: Under 5 Minutes
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                {/* Connecting Line (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#0F172A]/20 to-transparent z-0"></div>
                )}

                {/* Card */}
                <div className="bg-white rounded-2xl p-6 border border-[#0F172A]/10 relative z-10 h-full hover:shadow-2xl transition-all duration-500"
                     style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}>
                  {/* Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#0F172A] flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${step.color}15` }}
                  >
                    <Icon size={28} style={{ color: step.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#64748b] mb-4 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Duration Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F7] rounded-full border border-[#0F172A]/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A55A] animate-pulse"></div>
                    <span className="text-xs font-medium text-[#64748b]">{step.duration}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <button className="px-8 py-4 bg-[#C9A55A] hover:bg-[#b08d45] text-[#0F172A] rounded-xl font-semibold transition-colors text-lg shadow-lg">
            Start Your Journey →
          </button>
          <p className="text-sm text-[#64748b] mt-4">
            Join 1,200+ models who've transformed their careers with Pholio
          </p>
        </motion.div>
      </div>
    </section>
  );
};
