import React from 'react';

interface DeviceProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export const LaptopFrame: React.FC<DeviceProps> = ({ children, className = '', label }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <div className="mb-6 text-xs tracking-[0.2em] text-neutral-500 uppercase font-medium">
          {label}
        </div>
      )}
      {/* Screen Lid */}
      <div className="relative w-full max-w-[800px] aspect-[16/10] bg-[#1a1a1a] rounded-t-2xl border-[1px] border-[#333] shadow-2xl overflow-hidden ring-1 ring-white/5">
         {/* Webcam / Bezel */}
         <div className="absolute top-0 w-full h-3 bg-black z-20 flex justify-center items-center">
            {/* Camera dot */}
         </div>
        
        {/* Screen Content */}
        <div className="absolute inset-[3px] bg-[#0F0F0F] rounded-t-xl overflow-hidden">
           {children}
        </div>
        
        {/* Reflection Glare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none z-30 opacity-50"></div>
      </div>
      
      {/* Bottom Deck */}
      <div className="relative w-[110%] max-w-[900px] h-4 bg-[#1a1a1a] rounded-b-xl border-t border-[#222] shadow-xl flex justify-center items-start">
         <div className="w-1/3 h-[4px] bg-[#2a2a2a] rounded-b-md"></div>
      </div>
    </div>
  );
};

export const PhoneFrame: React.FC<DeviceProps> = ({ children, className = '', label }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <div className="mb-6 text-xs tracking-[0.2em] text-neutral-500 uppercase font-medium">
          {label}
        </div>
      )}
      <div className="relative w-[280px] h-[580px] bg-[#1a1a1a] rounded-[40px] border-[4px] border-[#2a2a2a] shadow-2xl ring-1 ring-white/10 overflow-hidden transform-gpu">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-20"></div>

        {/* Screen Content */}
        <div className="absolute inset-[2px] bg-[#0F0F0F] rounded-[36px] overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Reflection Glare */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-30 opacity-40 rounded-[40px]"></div>
      </div>
    </div>
  );
};

export const BrowserWindowFrame: React.FC<DeviceProps> = ({ children, className = '', label }) => {
  return (
    <div className={`flex flex-col items-center w-full h-full ${className}`}>
       {label && (
        <div className="mb-4 text-xs tracking-[0.2em] text-neutral-500 uppercase font-medium">
          {label}
        </div>
      )}
      <div className="relative w-full h-full bg-[#1a1a1a] rounded-lg border border-[#333] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/5">
        {/* Title Bar */}
        <div className="h-8 bg-[#111] border-b border-[#222] flex items-center px-4 gap-2 shrink-0">
            <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
            </div>
            <div className="flex-1 flex justify-center">
                 <div className="w-1/2 h-4 bg-[#1a1a1a] rounded-sm border border-[#222]"></div>
            </div>
        </div>
        {/* Browser Content */}
        <div className="flex-1 bg-[#0F0F0F] overflow-hidden relative">
            {children}
        </div>
      </div>
    </div>
  );
};