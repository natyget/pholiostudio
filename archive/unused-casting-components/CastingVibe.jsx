/**
 * Casting Vibe - Step 4: The Vibe
 * Brand-compliant one-question-at-a-time with auto-advance
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCastingVibe } from '../../hooks/useCasting';
import { toast } from 'sonner';
import { fadeVariants } from './animations';

const QUESTIONS = [
  {
    id: 'ambition_type',
    question: 'Dream gig?',
    options: [
      { value: 'editorial', label: 'Editorial', description: 'Vogue, high fashion, avant-garde' },
      { value: 'commercial', label: 'Commercial', description: 'Brands, e-commerce, lifestyle' }
    ]
  },
  {
    id: 'travel_willingness',
    question: 'Travel?',
    options: [
      { value: 'high', label: 'Love it', description: 'Ready to travel anywhere' },
      { value: 'low', label: 'Prefer local', description: 'Want to stay close to home' }
    ]
  }
];

function CastingVibe({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const vibeMutation = useCastingVibe();

  console.log('[CastingVibe] Component rendered', { currentQuestion, answers });

  const question = QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;

  const handleOptionSelect = async (value) => {
    console.log('[CastingVibe] Option selected', { questionId: question.id, value });

    const newAnswers = {
      ...answers,
      [question.id]: value
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Last question - submit all answers
      setIsSubmitting(true);
      try {
        console.log('[CastingVibe] Submitting answers...', newAnswers);
        await vibeMutation.mutateAsync(newAnswers);
        console.log('[CastingVibe] Submission successful');
        toast.success('Responses recorded!');
        
        // Brief delay before transitioning
        setTimeout(() => {
          console.log('[CastingVibe] Calling onComplete');
          onComplete();
        }, 800);
      } catch (error) {
        console.error('[Casting Vibe] Submit error:', error);
        toast.error(error.message || 'Submission failed. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      // Auto-advance to next question
      console.log('[CastingVibe] Auto-advancing to next question');
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 600);
    }
  };

  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full flex items-center justify-center px-8"
    >
      <div className="max-w-3xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-7xl font-bold text-[#0f172a] mb-16 leading-tight tracking-tight">
              {question.question}
            </h1>

            <div className="space-y-4 max-w-2xl mx-auto">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  disabled={isSubmitting}
                  className="w-full px-10 py-6 bg-white border-2 border-[#e2e8f0] rounded-xl text-left hover:bg-[#f8f9fa] hover:border-[#cbd5e1] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl text-[#0f172a] font-semibold">
                      {option.label}
                    </span>
                    <span className="text-xl text-[#C9A55A] opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </div>
                  <p className="text-base text-[#64748b]">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Question indicator */}
            <div className="mt-16 flex justify-center gap-2">
              {QUESTIONS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentQuestion
                      ? 'bg-[#C9A55A] w-8'
                      : index < currentQuestion
                      ? 'bg-[#C9A55A]/50 w-2'
                      : 'bg-[#e2e8f0] w-2'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CastingVibe;
