"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { Search, MapPin, Filter } from "lucide-react";

export function SceneAgencySearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "-20% 0px -20% 0px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Animations
  const searchBarWidth = useTransform(scrollYProgress, [0.1, 0.3], ["0%", "100%"]);
  const resultsOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const resultsY = useTransform(scrollYProgress, [0.3, 0.5], [50, 0]);
  
  const textTyped = "Redhead, Editorial, NYC";

  return (
    <div ref={containerRef} className="min-h-[150vh] w-full bg-ink relative flex flex-col items-center justify-center py-20 overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-cream text-5xl md:text-7xl font-serif mb-6">
            THE GATEKEEPERS
          </h2>
          <p className="text-ink-muted text-xl max-w-lg mx-auto">
            Agencies don't browse. They hunt. <br/>
            We built them the ultimate scope.
          </p>
        </motion.div>

        {/* The Search UI Mockup */}
        <div className="bg-cream rounded-xl shadow-2xl overflow-hidden border border-ink-soft/20">
            
            {/* Window Controls */}
            <div className="h-10 border-b border-ink-soft/10 flex items-center px-4 gap-2 bg-cream-soft">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>

            {/* Application UI */}
            <div className="p-8 md:p-12 min-h-[400px]">
                
                {/* Search Bar - Animated */}
                <motion.div 
                    className="flex items-center gap-4 border-b-2 border-ink pb-4 mb-12"
                    style={{ width: searchBarWidth }}
                >
                    <Search className="w-6 h-6 text-ink" />
                    <div className="text-2xl md:text-4xl text-ink font-serif tracking-tight w-full truncate">
                       {/* Simulating typing effect could go here, for now static text revealed by width */}
                       <span className="opacity-50 mr-2">Find:</span> 
                       {textTyped}
                    </div>
                    <Filter className="w-6 h-6 text-ink opacity-50 ml-auto" />
                </motion.div>

                {/* Results Grid - Staggered */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    style={{ opacity: resultsOpacity, y: resultsY }}
                >
                    {/* Result 1: The User (Highlighted) */}
                    <motion.div 
                        className="col-span-1 md:col-span-3 bg-gold/10 border border-gold p-4 rounded-lg flex items-center gap-6"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden shrink-0">
                           {/* Placeholder Avatar */}
                           <div className="w-full h-full bg-slate-400" /> 
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-xl font-bold text-ink">Sophia M.</h4>
                                <span className="bg-gold text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Studio+</span>
                            </div>
                            <p className="text-ink-muted text-sm flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> NYC • 5'10" • Editorial
                            </p>
                        </div>
                        <div className="ml-auto text-gold text-2xl font-serif font-bold">
                            98% Match
                        </div>
                    </motion.div>

                    {/* Faded other results */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="opacity-30 grayscale border border-ink-soft/20 p-4 rounded-lg flex flex-col gap-4">
                            <div className="w-full h-32 bg-gray-200 rounded-md"></div>
                            <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                            <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                        </div>
                    ))}
                </motion.div>

            </div>
        </div>

      </div>
    </div>
  );
}
