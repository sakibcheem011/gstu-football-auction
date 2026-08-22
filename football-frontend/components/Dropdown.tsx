'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Dropdown({ options, value, onChange, placeholder = 'Select...', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 bg-panel border border-borderSubtle hover:border-accent/30 rounded-xl px-4 text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 text-xs font-semibold"
      >
        <span className={`truncate mr-2 ${selectedOption ? 'text-chalk font-bold' : 'text-chalkMuted'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={15} className={`text-chalkMuted shrink-0 transition-transform duration-250 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 w-full mt-2 bg-panelLight border border-borderSubtle rounded-xl shadow-2xl overflow-hidden py-1.5 backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-zinc-500/10 transition-colors ${
                    value === option.value ? 'text-accent font-bold bg-accent/10' : 'text-chalk'
                  }`}
                >
                  <span className="truncate pr-2">{option.label}</span>
                  {value === option.value && <Check size={14} className="text-accent shrink-0" />}
                </button>
              ))}
              {options.length === 0 && (
                <div className="px-4 py-3 text-xs text-chalkMuted italic">No options available</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
