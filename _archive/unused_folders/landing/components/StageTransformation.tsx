import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { PhoneFrame } from './DeviceFrames';
import { ArrowUp, Sparkles, User, Fingerprint } from 'lucide-react';

interface StageProps {
  scrollYProgress: MotionValue<number>;
}

export const StageTransformation: React.FC<StageProps> = ({ scrollYProgress }) => {
  // Active range: 0.86 to 1.08 (matching STAGES_SUMMARY.md)
  
  const containerOpacity = useTransform(scrollYProgress, [0.82, 0.86, 1.05, 1.08], [0, 1, 1, 0]);
  
  // CHAT TIMELINE
  // 1. AI Intro
  const chat1Opacity = useTransform(scrollYProgress, [0.86, 0.89], [0, 1]); 
  
  // 2. User Image
  const chat2Opacity = useTransform(scrollYProgress, [0.89, 0.92], [0, 1]);
  
  // Flying Image (Left -> Right)
  const flyImageOpacity = useTransform(scrollYProgress, [0.92, 0.93, 0.95], [0, 1, 0]);
  const flyImageX = useTransform(scrollYProgress, [0.92, 0.95], ["0vw", "40vw"]); 
  const flyImageY = useTransform(scrollYProgress, [0.92, 0.95], ["0vh", "5vh"]);
  const flyImageScale = useTransform(scrollYProgress, [0.92, 0.95], [1, 3.5]);

  // 3. AI Question
  const chat3Opacity = useTransform(scrollYProgress, [0.95, 0.97], [0, 1]);

  // 4. User Stats/Bio
  const chat4Opacity = useTransform(scrollYProgress, [0.97, 0.99], [0, 1]);

  // Flying Text
  const flyTextOpacity = useTransform(scrollYProgress, [0.99, 1.0, 1.02], [0, 1, 0]);
  const flyTextX = useTransform(scrollYProgress, [0.99, 1.02], ["0vw", "35vw"]);
  const flyTextY = useTransform(scrollYProgress, [0.99, 1.02], ["0vh", "15vh"]);

  // PHONE POPULATION
  const heroImageOpacity = useTransform(scrollYProgress, [0.95, 0.97], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [1.02, 1.05], [0, 1]);

  // Gold pulsing for typing/syncing
  const typingOpacity = useTransform(scrollYProgress, [0.86, 1.05], [1, 0]);

  return (
    <motion.section 
      style={{ opacity: containerOpacity }}
      className="absolute inset-0 h-screen w-full flex items-center justify-center pointer-events-none z-20"
    >
       <div className="container mx-auto px-4 max-w-[95rem] h-[80vh] grid grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* LEFT: CONVERSATIONAL AI INTERFACE - PHOLIO BRANDED */}
          <div className="relative max-h-[650px] bg-[#FAF9F7] border border-[#0F172A]/10 p-6 rounded-2xl overflow-hidden flex flex-col shadow-xl" style={{ boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)' }}>
              {/* Header */}
              <div className="flex items-center gap-4 border-b border-[#0F172A]/8 pb-5 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#C9A55A] flex items-center justify-center shadow-md">
                      <Sparkles size={18} className="text-[#0F172A]"/>
                  </div>
                  <div>
                      <div className="text-base font-semibold text-[#0F172A] tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>Pholio Application</div>
                      <div className="text-xs text-[#475569] uppercase tracking-wider flex items-center gap-2 font-medium mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A55A] animate-pulse"></span>
                          Intake Process
                      </div>
                  </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 space-y-6 overflow-y-auto relative px-1" style={{ scrollbarWidth: 'thin' }}>
                  
                  {/* Message 1: AI Prompt */}
                  <motion.div style={{ opacity: chat1Opacity, x: useTransform(chat1Opacity, [0,1], [-20,0]) }} className="flex gap-3 max-w-[85%]">
                      <div className="px-5 py-4 bg-white rounded-2xl rounded-tl-sm border border-[#0F172A]/8 shadow-sm">
                          <span className="text-[#C9A55A] font-semibold block mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>System</span>
                          <p className="text-sm text-[#0F172A] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                              Let's digitize your profile. Upload your primary editorial shot.
                          </p>
                      </div>
                  </motion.div>

                  {/* Message 2: User Image Upload */}
                  <motion.div style={{ opacity: chat2Opacity, x: useTransform(chat2Opacity, [0,1], [20,0]) }} className="flex gap-3 max-w-[85%] ml-auto justify-end relative">
                      <div className="px-4 py-3 bg-white rounded-2xl rounded-tr-sm border border-[#0F172A]/8 shadow-sm">
                           <div className="w-36 h-44 bg-[#F8F8F7] rounded-lg overflow-hidden relative group border border-[#0F172A]/5">
                               <img src="https://picsum.photos/id/64/400/600" className="w-full h-full object-cover transition-opacity group-hover:opacity-95" alt="Model portrait"/>
                           </div>
                           <div className="text-[10px] text-right text-[#94A3B8] mt-2 font-mono">IMG_RAW_001.jpg</div>
                      </div>
                      
                      {/* FLYING IMAGE PARTICLE */}
                      <motion.div 
                        style={{ opacity: flyImageOpacity, x: flyImageX, y: flyImageY, scale: flyImageScale }}
                        className="absolute top-3 right-3 w-36 h-44 bg-[#C9A55A] z-[100] rounded-lg shadow-[0_0_40px_rgba(201,165,90,0.6)] border-2 border-white mix-blend-normal pointer-events-none"
                      >
                         <img src="https://picsum.photos/id/64/400/600" className="w-full h-full object-cover opacity-90" alt="Flying image"/>
                      </motion.div>
                  </motion.div>

                  {/* Message 3: AI Measurements Prompt */}
                  <motion.div style={{ opacity: chat3Opacity, x: useTransform(chat3Opacity, [0,1], [-20,0]) }} className="flex gap-3 max-w-[85%]">
                       <div className="px-5 py-4 bg-white rounded-2xl rounded-tl-sm border border-[#0F172A]/8 shadow-sm">
                          <span className="text-[#C9A55A] font-semibold block mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>System</span>
                          <p className="text-sm text-[#0F172A] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                              Analysis complete. Confirming biometrics: Height, Eyes, and Bio?
                          </p>
                      </div>
                  </motion.div>

                  {/* Message 4: User Text Response */}
                  <motion.div style={{ opacity: chat4Opacity, x: useTransform(chat4Opacity, [0,1], [20,0]) }} className="flex gap-3 max-w-[85%] ml-auto justify-end relative">
                      <div className="px-5 py-4 bg-[#C9A55A] rounded-2xl rounded-tr-sm text-[#0F172A] font-medium text-sm shadow-md">
                          <p className="leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                              6'1", Blue Eyes.
                          </p>
                          <p className="text-xs opacity-90 mt-1.5 block font-normal" style={{ fontFamily: "'Inter', sans-serif" }}>
                              Based in NYC. 5 years runway experience.
                          </p>
                      </div>

                      {/* FLYING TEXT PARTICLE */}
                      <motion.div 
                        style={{ opacity: flyTextOpacity, x: flyTextX, y: flyTextY, fontFamily: "'Inter', sans-serif" }}
                        className="absolute top-0 right-0 px-4 py-3 bg-white text-[#0F172A] text-xs font-semibold whitespace-nowrap z-[100] rounded-xl shadow-lg pointer-events-none flex items-center gap-2 border-2 border-[#C9A55A]"
                      >
                          <Fingerprint size={14} className="text-[#C9A55A]"/>
                          Syncing Bio Data...
                      </motion.div>
                  </motion.div>
                  
              </div>

              {/* Input Area */}
              <div className="mt-6 pt-5 border-t border-[#0F172A]/8 flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-full bg-white border border-[#0F172A]/8 flex items-center justify-center shadow-sm">
                     <User size={16} className="text-[#475569]"/>
                  </div>
                  <div className="flex-1 h-11 bg-white rounded-full border border-[#0F172A]/8 flex items-center px-5 justify-between shadow-sm">
                      <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#C9A55A] rounded-full animate-pulse"></span>
                          <span className="w-1.5 h-1.5 bg-[#C9A55A] rounded-full animate-pulse" style={{ animationDelay: '75ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-[#C9A55A] rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                      </div>
                      <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Processing</span>
                  </div>
                  <div className="w-11 h-11 bg-[#C9A55A]/10 rounded-full flex items-center justify-center border border-[#C9A55A]/20 shadow-sm">
                      <ArrowUp size={18} className="text-[#C9A55A]"/>
                  </div>
              </div>
          </div>

          {/* RIGHT: OUTPUT (Constructing Comp Card) */}
          <div className="flex justify-center h-full items-center relative">
               <PhoneFrame label="LIVE PREVIEW">
                   <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
                       
                       {/* Top Status Bar */}
                       <div className="absolute top-0 left-0 w-full z-20 p-5 flex justify-between items-start mix-blend-difference text-white">
                            <span className="font-bold tracking-[0.2em] text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>PHOLIO</span>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                       </div>

                       {/* COMP CARD CONTENT */}
                       <div className="w-full h-full relative">
                           
                           {/* Empty State */}
                           <motion.div 
                                style={{ opacity: useTransform(heroImageOpacity, [0, 1], [1, 0]) }}
                                className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center"
                           >
                                <div className="text-center">
                                    <div className="w-8 h-8 border-2 border-[#333] border-t-[#C9A55A] rounded-full animate-spin mx-auto mb-4"></div>
                                    <span className="text-[#444] text-[10px] tracking-[0.3em] uppercase block" style={{ fontFamily: "'Inter', sans-serif" }}>Awaiting Signal</span>
                                </div>
                           </motion.div>

                           {/* The Image (Revealed) */}
                           <motion.div style={{ opacity: heroImageOpacity }} className="absolute inset-0 z-10 bg-white">
                                <img 
                                    src="https://picsum.photos/id/64/800/1200" 
                                    alt="Model Portrait" 
                                    className="w-full h-full object-cover grayscale brightness-110 contrast-125"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                
                                {/* Overlay Name */}
                                <div className="absolute bottom-32 left-6 text-white mix-blend-overlay">
                                    <h2 className="text-5xl font-bold tracking-tighter leading-[0.85]" style={{ fontFamily: "'Noto Serif Display', serif" }}>JOHN<br/>DOE</h2>
                                </div>
                           </motion.div>

                           {/* The Stats & Bio (Revealed) */}
                           <motion.div 
                                style={{ opacity: statsOpacity, y: useTransform(statsOpacity, [0,1], [20,0]) }} 
                                className="absolute bottom-8 left-6 right-6 z-20 flex justify-between items-end"
                            >
                                <div className="flex gap-4 text-white">
                                    <div className="flex flex-col">
                                        <span className="text-[#C9A55A] text-[8px] font-bold uppercase tracking-wider mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Height</span>
                                        <span className="text-sm font-mono" style={{ fontFamily: "'Inter', sans-serif" }}>6'1"</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[#C9A55A] text-[8px] font-bold uppercase tracking-wider mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Eyes</span>
                                        <span className="text-sm font-mono" style={{ fontFamily: "'Inter', sans-serif" }}>Blue</span>
                                    </div>
                                </div>
                                
                                {/* Small Bio Badge */}
                                <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded border border-white/20 text-[9px] text-white/90 max-w-[100px] leading-tight shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    <div className="flex items-center gap-1 mb-1 text-[#C9A55A]"><Sparkles size={8}/> Bio</div>
                                    NYC Based<br/>5y Exp.
                                </div>
                           </motion.div>
                       </div>
                       
                       {/* Typing Indicator Overlay (Active during processing) */}
                       <motion.div 
                            style={{ opacity: typingOpacity }}
                            className="absolute bottom-0 left-0 w-full h-1 bg-[#111] z-30"
                        >
                            <div className="h-full bg-[#C9A55A] w-1/3 animate-[progress_2s_ease-in-out_infinite]"></div>
                       </motion.div>

                   </div>
               </PhoneFrame>
          </div>

       </div>
    </motion.section>
  );
};

