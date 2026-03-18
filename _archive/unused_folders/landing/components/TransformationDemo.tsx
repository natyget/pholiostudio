import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';

const MOCK_TALENT = {
  firstName: 'Sarah',
  lastName: 'Chen',
  city: 'New York',
  height: 70, // 5'10"
  measurements: '34-25-36',
  heroImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
  bio: 'Experienced fashion and editorial model with a passion for high-fashion campaigns and runway. Available for bookings worldwide.',
  galleryImages: [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=400'
  ]
};

export const TransformationDemo: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showReplay, setShowReplay] = useState(false);

  const handleReplay = () => {
    setIsAnimating(false);
    setShowReplay(false);
    setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => setShowReplay(true), 6000);
    }, 300);
  };

  // Auto-show replay button after animation
  React.useEffect(() => {
    const timer = setTimeout(() => setShowReplay(true), 6000);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className="text-5xl md:text-6xl font-normal mb-6 text-[#0F172A] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            From Raw Data to Publication-Ready
          </h2>
          <p className="text-xl text-[#64748b] max-w-3xl mx-auto">
            Pholio's AI transforms your images and details into a professional portfolio in seconds.
          </p>
        </div>

        {/* Transformation Zone */}
        <div className="grid md:grid-cols-[1fr,auto,1fr] gap-8 items-center">

          {/* Left: Email Draft */}
          <motion.div
            className="bg-[#FAF9F7] rounded-2xl border border-[#0F172A]/10 overflow-hidden"
            style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}
          >
            {/* Email Header */}
            <div className="bg-white border-b border-[#0F172A]/10 px-6 py-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="text-sm text-[#64748b] font-medium">New Submission</div>
            </div>

            {/* Email Body */}
            <div className="p-6 space-y-4">
              <motion.div
                className="flex gap-2 text-sm"
                animate={isAnimating ? { opacity: 0.2, x: -15 } : { opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                <span className="text-[#64748b] font-medium">From:</span>
                <span className="text-[#0F172A]">{MOCK_TALENT.firstName} {MOCK_TALENT.lastName} &lt;{MOCK_TALENT.firstName.toLowerCase()}@gmail.com&gt;</span>
              </motion.div>

              <motion.div
                className="flex gap-2 text-sm"
                animate={isAnimating ? { opacity: 0.2, x: -15 } : { opacity: 1, x: 0 }}
                transition={{ delay: 1.05, duration: 0.4 }}
              >
                <span className="text-[#64748b] font-medium">Subject:</span>
                <span className="text-[#0F172A]">Portfolio Submission - {MOCK_TALENT.firstName} {MOCK_TALENT.lastName}</span>
              </motion.div>

              <div className="border-t border-[#0F172A]/10 pt-4">
                <motion.div
                  className="text-sm text-[#0F172A] space-y-3"
                  animate={isAnimating ? { opacity: 0.15 } : { opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  <p>Hi there,</p>
                  <p>I'm {MOCK_TALENT.firstName}, a model based in {MOCK_TALENT.city}. I'm {Math.floor(MOCK_TALENT.height / 12)}'{MOCK_TALENT.height % 12}" and my measurements are {MOCK_TALENT.measurements}.</p>
                  <p>I've attached some of my recent work below including digitals and editorial shots. I'm looking for representation and would love to be considered.</p>
                  <p>Thanks,<br/>{MOCK_TALENT.firstName}</p>

                  <div className="space-y-2 pt-4">
                    <div className="flex items-center gap-3 text-xs text-[#64748b]">
                      <span>📎</span>
                      <div>
                        <div className="font-medium">headshot_final.jpg</div>
                        <div className="text-[10px]">2.4 MB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#64748b]">
                      <span>📎</span>
                      <div>
                        <div className="font-medium">full_body_02.jpg</div>
                        <div className="text-[10px]">3.1 MB</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Center: AI Processing Indicator */}
          <div className="flex flex-col items-center gap-4 py-8">
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-12 h-12 rounded-full bg-[#C9A55A]/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#C9A55A]" />
              </div>
              <span className="text-xs font-medium text-[#C9A55A] uppercase tracking-wider">
                AI Processing
              </span>
            </motion.div>

            {/* Arrow */}
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="text-[#C9A55A]">
              <path d="M0 10H35M35 10L28 3M35 10L28 17" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>

          {/* Right: Portfolio Card */}
          <motion.div
            className="bg-white rounded-2xl border border-[#0F172A]/10 overflow-hidden"
            style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="p-8 space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={isAnimating ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ delay: 0, duration: 0.6 }}
              >
                <motion.h3
                  className="text-3xl font-semibold text-[#0F172A] mb-1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isAnimating ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {MOCK_TALENT.firstName} {MOCK_TALENT.lastName}
                </motion.h3>
                <motion.div
                  className="text-sm text-[#C9A55A] font-medium uppercase tracking-wider"
                  initial={{ opacity: 0, y: 5 }}
                  animate={isAnimating ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  {MOCK_TALENT.city.toUpperCase()}
                </motion.div>
              </motion.div>

              {/* Hero Image */}
              <motion.div
                className="aspect-[3/4] rounded-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={isAnimating ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <motion.img
                  src={MOCK_TALENT.heroImage}
                  alt="Portfolio hero"
                  className="w-full h-full object-cover"
                  initial={{ filter: 'brightness(0.7) contrast(0.8) grayscale(0.3)' }}
                  animate={isAnimating ? { filter: 'brightness(1.05) contrast(1.08) grayscale(0)' } : { filter: 'brightness(0.7) contrast(0.8) grayscale(0.3)' }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 15 }}
                animate={isAnimating ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ delay: 2, duration: 0.6 }}
              >
                {[
                  { label: 'Height', value: `${Math.floor(MOCK_TALENT.height / 12)}'${MOCK_TALENT.height % 12}"` },
                  { label: 'Bust', value: MOCK_TALENT.measurements.split('-')[0] },
                  { label: 'Waist', value: MOCK_TALENT.measurements.split('-')[1] },
                  { label: 'Hips', value: MOCK_TALENT.measurements.split('-')[2] }
                ].map((stat, i) => (
                  <div key={i}>
                    <motion.div
                      className="text-[10px] text-[#C9A55A] font-bold uppercase tracking-wider mb-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={isAnimating ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ delay: 2.2 + (i * 0.15), duration: 0.4 }}
                    >
                      {stat.label}
                    </motion.div>
                    <motion.div
                      className="text-lg font-semibold text-[#0F172A]"
                      initial={{ opacity: 0, y: 5 }}
                      animate={isAnimating ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
                      transition={{ delay: 2.4 + (i * 0.15), duration: 0.4 }}
                    >
                      {stat.value}
                    </motion.div>
                  </div>
                ))}
              </motion.div>

              {/* Gallery */}
              <motion.div
                className="grid grid-cols-3 gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={isAnimating ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 3, duration: 0.6 }}
              >
                {MOCK_TALENT.galleryImages.map((img, i) => (
                  <motion.div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isAnimating ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ delay: 3.2 + (i * 0.12), duration: 0.4 }}
                  >
                    <motion.img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ filter: 'brightness(0.7) contrast(0.8) grayscale(0.3)' }}
                      animate={isAnimating ? { filter: 'brightness(1.05) contrast(1.05) grayscale(0)' } : { filter: 'brightness(0.7) contrast(0.8) grayscale(0.3)' }}
                      transition={{ delay: 3.2 + (i * 0.12), duration: 0.6 }}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Bio */}
              <motion.div
                className="text-sm text-[#64748b] leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={isAnimating ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 4, duration: 0.6 }}
              >
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={isAnimating ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
                  transition={{ delay: 4, duration: 0.6 }}
                >
                  {MOCK_TALENT.bio}
                </motion.p>
              </motion.div>

              {/* CTA */}
              <motion.button
                className="w-full py-3 bg-[#C9A55A] hover:bg-[#b08d45] text-[#0F172A] rounded-xl font-semibold transition-colors"
                initial={{ opacity: 0, y: 5 }}
                animate={isAnimating ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
                transition={{ delay: 4, duration: 0.6 }}
              >
                View Full Portfolio
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Replay Button */}
        <AnimatePresence>
          {showReplay && (
            <motion.div
              className="flex justify-center mt-12"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <button
                onClick={handleReplay}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-[#C9A55A]/30 text-[#C9A55A] rounded-full hover:bg-[#C9A55A]/5 transition-colors font-medium"
              >
                <RotateCcw size={16} />
                Replay Animation
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
