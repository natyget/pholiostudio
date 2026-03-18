import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Image as ImageIcon } from 'lucide-react';

// Types for the adaptive input controller
type InputType = 
  | 'text'
  | 'email'
  | 'password'
  | 'measurements'
  | 'color-chips'
  | 'media-grid'
  | 'date'
  | 'textarea';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  inputType?: InputType; // What input type should be shown after this message
}

interface ProgressSection {
  id: string;
  label: string;
  completed: boolean;
  active: boolean;
}

export const ConversationalApply: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm here to help you create your Pholio comp card. Let's start with your name. What should I call you?",
      timestamp: new Date(),
      inputType: 'text'
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentInputType, setCurrentInputType] = useState<InputType>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Progress sections
  const [progressSections, setProgressSections] = useState<ProgressSection[]>([
    { id: 'account', label: 'Account', completed: false, active: true },
    { id: 'stats', label: 'Stats', completed: false, active: false },
    { id: 'media', label: 'Media', completed: false, active: false },
    { id: 'finalize', label: 'Finalize', completed: false, active: false }
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!currentInput.trim() && currentInputType !== 'media-grid') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    // TODO: Integrate with Vercel AI SDK
    // For now, simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Got it! What's your last name?",
        timestamp: new Date(),
        inputType: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
      if (aiResponse.inputType) {
        setCurrentInputType(aiResponse.inputType);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (value: string | any) => {
    if (typeof value === 'string') {
      setCurrentInput(value);
    } else {
      // Handle structured data (measurements, colors, etc.)
      setFormData(prev => ({ ...prev, ...value }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex">
      {/* Progress Tracker Sidebar */}
      <div className="w-64 border-r border-[#0F172A]/10 bg-white/50 backdrop-blur-sm p-6 hidden lg:block">
        <div className="sticky top-6">
          <h3 className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            Progress
          </h3>
          <div className="space-y-4">
            {progressSections.map((section, index) => (
              <div key={section.id} className="relative">
                {/* Connector Line */}
                {index < progressSections.length - 1 && (
                  <div 
                    className={`absolute left-[11px] top-8 w-0.5 h-8 ${
                      section.completed ? 'bg-[#C9A55A]' : 'bg-[#0F172A]/10'
                    }`}
                  />
                )}
                
                {/* Section Indicator */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      section.completed
                        ? 'bg-[#C9A55A] border-[#C9A55A]'
                        : section.active
                        ? 'bg-white border-[#C9A55A]'
                        : 'bg-white border-[#0F172A]/20'
                    }`}
                  >
                    {section.completed && (
                      <svg className="w-3 h-3 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      section.active
                        ? 'text-[#0F172A] font-semibold'
                        : section.completed
                        ? 'text-[#475569]'
                        : 'text-[#94A3B8]'
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {section.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="border-b border-[#0F172A]/10 bg-white/80 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A55A] flex items-center justify-center">
              <Sparkles size={20} className="text-[#0F172A]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0F172A]" style={{ fontFamily: "'Noto Serif Display', serif", fontWeight: 300 }}>
                Pholio Application
              </h1>
              <p className="text-xs text-[#475569] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                AI-Assisted Profile Creation
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%]"
            >
              <div className="w-8 h-8 rounded-full bg-[#FAF9F7] border border-[#0F172A]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-[#C9A55A]" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm border border-[#0F172A]/10 p-4 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#C9A55A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#C9A55A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#C9A55A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Adaptive Input Controller */}
        <div className="border-t border-[#0F172A]/10 bg-white/80 backdrop-blur-sm p-6">
          <AdaptiveInput
            type={currentInputType}
            value={currentInput}
            onChange={handleInputChange}
            onSubmit={handleSend}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

// Chat Message Component
const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse ml-auto max-w-[80%]'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isAssistant
            ? 'bg-[#FAF9F7] border border-[#0F172A]/10'
            : 'bg-[#C9A55A]'
        }`}
      >
        {isAssistant ? (
          <Sparkles size={16} className="text-[#C9A55A]" />
        ) : (
          <User size={16} className="text-[#0F172A]" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`rounded-2xl p-4 shadow-sm border ${
          isAssistant
            ? 'bg-white rounded-tl-sm border-[#0F172A]/10'
            : 'bg-[#C9A55A] rounded-tr-sm border-[#C9A55A] text-[#0F172A]'
        }`}
      >
        <p
          className={`text-sm leading-relaxed ${
            isAssistant ? 'text-[#0F172A]' : 'text-[#0F172A] font-medium'
          }`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {message.content}
        </p>
      </div>
    </motion.div>
  );
};

// Adaptive Input Controller Component
interface AdaptiveInputProps {
  type: InputType;
  value: string;
  onChange: (value: string | any) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const AdaptiveInput: React.FC<AdaptiveInputProps> = ({
  type,
  value,
  onChange,
  onSubmit,
  disabled
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type === 'text' || type === 'email') {
      inputRef.current?.focus();
    }
  }, [type]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Render different input types
  switch (type) {
    case 'text':
    case 'email':
      return (
        <div className="flex gap-3 items-end">
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder="Type your response..."
            className="flex-1 px-4 py-3 bg-[#FAF9F7] border border-[#0F172A]/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9A55A]/20 focus:border-[#C9A55A] transition-all"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem' }}
          />
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className="w-12 h-12 bg-[#C9A55A] text-[#0F172A] rounded-full flex items-center justify-center hover:bg-[#B8954A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      );

    case 'password':
      return (
        <div className="flex gap-3 items-end">
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder="Enter your password..."
            className="flex-1 px-4 py-3 bg-[#FAF9F7] border border-[#0F172A]/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9A55A]/20 focus:border-[#C9A55A] transition-all"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem' }}
          />
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className="w-12 h-12 bg-[#C9A55A] text-[#0F172A] rounded-full flex items-center justify-center hover:bg-[#B8954A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      );

    case 'textarea':
      return (
        <div className="flex gap-3 items-end">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                onSubmit();
              }
            }}
            disabled={disabled}
            placeholder="Tell us more..."
            rows={3}
            className="flex-1 px-4 py-3 bg-[#FAF9F7] border border-[#0F172A]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C9A55A]/20 focus:border-[#C9A55A] transition-all resize-none"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem' }}
          />
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className="w-12 h-12 bg-[#C9A55A] text-[#0F172A] rounded-full flex items-center justify-center hover:bg-[#B8954A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      );

    case 'measurements':
      return (
        <MeasurementsInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={disabled}
          measurementType="height"
        />
      );

    case 'color-chips':
      return (
        <ColorChipsInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      );

    case 'media-grid':
      return (
        <MediaGridInput
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <div className="flex gap-3 items-end">
          <input
            ref={inputRef}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="flex-1 px-4 py-3 bg-[#FAF9F7] border border-[#0F172A]/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9A55A]/20 focus:border-[#C9A55A] transition-all"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem' }}
          />
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className="w-12 h-12 bg-[#C9A55A] text-[#0F172A] rounded-full flex items-center justify-center hover:bg-[#B8954A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      );

    default:
      return null;
  }
};

// Measurements Input Component (Height, BWH, etc.)
const MeasurementsInput: React.FC<{
  value: string;
  onChange: (value: any) => void;
  onSubmit: () => void;
  disabled?: boolean;
  measurementType?: 'height' | 'bust' | 'waist' | 'hips' | 'shoe';
}> = ({ value, onChange, onSubmit, disabled, measurementType = 'height' }) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Generate values based on measurement type
  const getValues = () => {
    switch (measurementType) {
      case 'height':
        // Height in feet/inches or cm
        const feet = Array.from({ length: 8 }, (_, i) => i + 4); // 4' to 7'
        const inches = Array.from({ length: 12 }, (_, i) => i); // 0" to 11"
        return feet.map(f => inches.map(i => `${f}'${i}"`)).flat();
      case 'shoe':
        // Shoe sizes: US 5-15
        return Array.from({ length: 11 }, (_, i) => (i + 5).toString());
      case 'bust':
      case 'waist':
      case 'hips':
        // Measurements in inches: 24-48
        return Array.from({ length: 25 }, (_, i) => (i + 24).toString());
      default:
        return [];
    }
  };

  const values = getValues();
  const selectedIndex = values.indexOf(localValue);

  const handleScroll = (direction: 'up' | 'down') => {
    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(values.length - 1, currentIndex + 1);
    const newValue = values[newIndex];
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Scrollable Value Selector */}
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={() => handleScroll('up')}
            disabled={disabled || selectedIndex <= 0}
            className="w-10 h-10 rounded-full border border-[#0F172A]/20 hover:border-[#C9A55A] hover:bg-[#C9A55A]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <div className="w-32 text-center">
            <div className="text-3xl font-semibold text-[#0F172A] mb-1" style={{ fontFamily: "'Noto Serif Display', serif" }}>
              {localValue || values[Math.floor(values.length / 2)]}
            </div>
            <div className="text-xs text-[#475569] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
              {measurementType}
            </div>
          </div>

          <button
            onClick={() => handleScroll('down')}
            disabled={disabled || selectedIndex >= values.length - 1}
            className="w-10 h-10 rounded-full border border-[#0F172A]/20 hover:border-[#C9A55A] hover:bg-[#C9A55A]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Quick Select Chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {values.slice(Math.max(0, selectedIndex - 2), Math.min(values.length, selectedIndex + 3)).map((val, idx) => {
            const absIdx = Math.max(0, selectedIndex - 2) + idx;
            const isSelected = absIdx === selectedIndex;
            return (
              <button
                key={val}
                onClick={() => {
                  setLocalValue(val);
                  onChange(val);
                }}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  isSelected
                    ? 'bg-[#C9A55A] text-[#0F172A] font-semibold'
                    : 'bg-white text-[#0F172A] border border-[#0F172A]/10 hover:border-[#C9A55A]/40'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={disabled || !localValue}
        className="w-full py-3 bg-[#C9A55A] text-[#0F172A] rounded-full font-semibold hover:bg-[#B8954A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Continue
      </button>
    </div>
  );
};

// Color Chips Input Component
const ColorChipsInput: React.FC<{
  value: string;
  onChange: (value: any) => void;
  onSubmit: () => void;
  disabled?: boolean;
  colorType?: 'eye' | 'hair' | 'skin';
}> = ({ value, onChange, onSubmit, disabled, colorType = 'eye' }) => {
  const getColors = () => {
    switch (colorType) {
      case 'eye':
        return [
          { name: 'Brown', hex: '#8B4513', description: 'Brown' },
          { name: 'Blue', hex: '#4169E1', description: 'Blue' },
          { name: 'Green', hex: '#228B22', description: 'Green' },
          { name: 'Hazel', hex: '#D2691E', description: 'Hazel' },
          { name: 'Gray', hex: '#808080', description: 'Gray' },
          { name: 'Other', hex: '#D3D3D3', description: 'Other' }
        ];
      case 'hair':
        return [
          { name: 'Black', hex: '#000000', description: 'Black' },
          { name: 'Brown', hex: '#8B4513', description: 'Brown' },
          { name: 'Blonde', hex: '#F5DEB3', description: 'Blonde' },
          { name: 'Red', hex: '#A52A2A', description: 'Red' },
          { name: 'Gray', hex: '#808080', description: 'Gray' },
          { name: 'Other', hex: '#D3D3D3', description: 'Other' }
        ];
      case 'skin':
        return [
          { name: 'Fair', hex: '#F5DEB3', description: 'Fair' },
          { name: 'Light', hex: '#DEB887', description: 'Light' },
          { name: 'Medium', hex: '#CD853F', description: 'Medium' },
          { name: 'Tan', hex: '#D2691E', description: 'Tan' },
          { name: 'Dark', hex: '#8B4513', description: 'Dark' },
          { name: 'Other', hex: '#D3D3D3', description: 'Other' }
        ];
      default:
        return [];
    }
  };

  const colors = getColors();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => {
              onChange(color.name);
              setTimeout(onSubmit, 200);
            }}
            disabled={disabled}
            className={`group relative p-3 rounded-xl border-2 transition-all ${
              value === color.name
                ? 'border-[#C9A55A] bg-[#C9A55A]/10 shadow-md'
                : 'border-[#0F172A]/10 bg-white hover:border-[#C9A55A]/40'
            }`}
          >
            {/* Color Swatch */}
            <div
              className="w-full aspect-square rounded-lg mb-2 border border-[#0F172A]/10"
              style={{ backgroundColor: color.hex }}
            />
            {/* Label */}
            <div
              className={`text-xs font-medium text-center ${
                value === color.name ? 'text-[#0F172A]' : 'text-[#475569]'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {color.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Media Grid Input Component
const MediaGridInput: React.FC<{
  onChange: (value: any) => void;
  onSubmit: () => void;
  disabled?: boolean;
}> = ({ onChange, onSubmit, disabled }) => {
  const [uploadedImages, setUploadedImages] = useState<(File | null)[]>(Array(12).fill(null));
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>(Array(12).fill(null));

  const handleFileSelect = (index: number, file: File | null) => {
    const newImages = [...uploadedImages];
    newImages[index] = file;
    setUploadedImages(newImages);
    
    // Convert to FileList-like format for onChange
    const filesArray = newImages.filter(img => img !== null) as File[];
    onChange({ files: filesArray, fileCount: filesArray.length });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(index, file);
    }
  };

  const handleRemove = (index: number) => {
    handleFileSelect(index, null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#475569] text-center mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        Upload up to 12 photos. Drag and drop or click to select.
      </p>
      
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, index) => {
          const image = uploadedImages[index];
          const imageUrl = image ? URL.createObjectURL(image) : null;

          return (
            <div key={index} className="relative group">
              <input
                ref={(el) => { fileInputRefs.current[index] = el; }}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileSelect(index, file);
                }}
                className="hidden"
                disabled={disabled}
              />
              
              <div
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => !image && fileInputRefs.current[index]?.click()}
                className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                  image
                    ? 'border-2 border-[#C9A55A] shadow-md'
                    : 'bg-[#FAF9F7] border-2 border-dashed border-[#0F172A]/20 hover:border-[#C9A55A]/40'
                }`}
              >
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-[#0F172A]/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#0F172A]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} className="text-[#94A3B8]" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-sm text-[#475569]" style={{ fontFamily: "'Inter', sans-serif" }}>
          {uploadedImages.filter(img => img !== null).length} of 12 photos
        </span>
        <button
          onClick={onSubmit}
          disabled={disabled || uploadedImages.filter(img => img !== null).length === 0}
          className="px-6 py-3 bg-[#C9A55A] text-[#0F172A] rounded-full font-semibold hover:bg-[#B8954A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

