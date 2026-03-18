import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';

const stats = [
  { value: '1,200+', label: 'Portfolios Created' },
  { value: '340+', label: 'Agency Partners' },
  { value: '89%', label: 'Response Rate' },
  { value: '4.8★', label: 'Average Rating' }
];

const testimonials = [
  {
    quote: "Pholio got me signed in 2 weeks. The comp card is stunning and agencies actually respond to my applications now.",
    name: "Sarah Chen",
    role: "Model",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  },
  {
    quote: "Finally, a platform where submissions are organized and professional. The AI matching saves us hours of screening time.",
    name: "Michael Torres",
    role: "Talent Director",
    location: "Elite Models NYC",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  },
  {
    quote: "I was skeptical about AI-generated bios, but it captured my experience perfectly. My booking rate tripled after joining Pholio.",
    name: "Alex Rivera",
    role: "Commercial Model",
    location: "Los Angeles, CA",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"
  }
];

export const SocialProof: React.FC = () => {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className="text-5xl md:text-6xl font-normal mb-6 text-[#0F172A] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Trusted by the Industry
          </h2>
          <p className="text-xl text-[#64748b] max-w-3xl mx-auto">
            Join thousands of models and hundreds of agencies building their careers on Pholio
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div
                className="text-4xl md:text-5xl font-normal text-[#C9A55A] mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-[#64748b] font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-[#FAF9F7] rounded-2xl p-8 border border-[#0F172A]/10 hover:shadow-2xl transition-all duration-500"
              style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-[#C9A55A] text-[#C9A55A]"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-[#0F172A] leading-relaxed mb-8">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-[#0F172A]/10">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-[#0F172A]">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-[#64748b]">
                    {testimonial.role}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#64748b] mt-1">
                    <MapPin size={10} className="text-[#C9A55A]" />
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          className="mt-20 flex flex-wrap justify-center items-center gap-8 opacity-40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.4 }}
          viewport={{ once: true }}
        >
          {/* Placeholder for agency logos - would be real logos in production */}
          <div className="text-2xl font-bold tracking-wider text-[#0F172A]">IMG</div>
          <div className="text-2xl font-bold tracking-wider text-[#0F172A]">ELITE</div>
          <div className="text-2xl font-bold tracking-wider text-[#0F172A]">NEXT</div>
          <div className="text-2xl font-bold tracking-wider text-[#0F172A]">WILHELMINA</div>
          <div className="text-2xl font-bold tracking-wider text-[#0F172A]">FORD</div>
        </motion.div>

        {/* Bottom Note */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-[#64748b]">
            Agency logos shown for illustrative purposes. Pholio is an independent platform.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
