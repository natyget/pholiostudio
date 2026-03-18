/**
 * Casting Reveal - Step 5: The Reveal
 * Brand-compliant full-screen archetype reveal
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCastingReveal, useCastingComplete } from '../../hooks/useCasting';
import RadarChart from '../../components/casting/RadarChart';
import { toast } from 'sonner';
import { fadeVariants } from './animations';

function CastingReveal({ onComplete }) {
  const [showResults, setShowResults] = useState(false);
  const { data: archetype, isLoading, error } = useCastingReveal();
  const completeMutation = useCastingComplete();

  useEffect(() => {
    if (archetype) {
      setTimeout(() => setShowResults(true), 800);
    }
  }, [archetype]);

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync();
      toast.success('Welcome to Pholio.');
      onComplete();
    } catch (error) {
      toast.error(error.message || 'Failed to complete. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <motion.div variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 border-2 border-[#C9A55A]/20 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute inset-0 border-2 border-t-[#C9A55A] border-transparent rounded-full animate-spin" />
        </div>
        <h2 className="cinematic-question">Decoding your signals...</h2>
      </motion.div>
    );
  }

  if (error || !archetype) {
    return (
      <motion.div variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="text-center">
        <h2 className="cinematic-question">Error revealing archetype</h2>
        <p className="text-xl text-[#64748b] mb-12">{error?.message || 'Prerequisites not met'}</p>
        <button className="cinematic-button-primary" onClick={() => window.location.reload()}>Try Again</button>
      </motion.div>
    );
  }

  const { archetype: archetypeData } = archetype;

  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      className="w-full flex flex-col items-center justify-center"
    >
      <motion.div
        animate={{ opacity: showResults ? 1 : 0, y: showResults ? 0 : 20 }}
        className="text-center w-full max-w-4xl"
      >
        <p className="text-xl text-[#64748b] mb-4 uppercase tracking-[0.2em]">The Result</p>
        <h1 className="cinematic-question" style={{ fontSize: '5rem', marginBottom: '4rem' }}>
          You're {archetypeData.label}
        </h1>

        <div className="mb-12 flex justify-center">
          <div className="w-80 h-80">
            <RadarChart data={archetype.radar_data} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-12 mb-16 max-w-2xl mx-auto">
          <div>
            <div className="text-4xl font-bold mb-1">{Math.round(archetypeData.commercial_pct)}%</div>
            <div className="text-sm text-[#64748b] uppercase tracking-widest font-medium">Commercial</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">{Math.round(archetypeData.editorial_pct)}%</div>
            <div className="text-sm text-[#64748b] uppercase tracking-widest font-medium">Editorial</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">{Math.round(archetypeData.lifestyle_pct)}%</div>
            <div className="text-sm text-[#64748b] uppercase tracking-widest font-medium">Lifestyle</div>
          </div>
        </div>

        <button
          onClick={handleComplete}
          disabled={completeMutation.isLoading}
          className="cinematic-button-primary"
        >
          {completeMutation.isLoading ? 'Processing...' : 'Enter your Dashboard'}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default CastingReveal;
