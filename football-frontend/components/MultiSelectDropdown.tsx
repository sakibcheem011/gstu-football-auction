'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelectDropdown({ options, value = [], onChange, placeholder = 'Select...', className = '' }: MultiSelectDropdownProps) {
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

  const toggleOption = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const selectedLabels = value.map(v => options.find(o => o.value === v)?.label).filter(Boolean).join(', ');

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] bg-panel border border-borderSubtle hover:border-accent/30 rounded-xl px-4 py-2 text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 text-xs font-semibold"
      >
        <span className={`mr-2 leading-tight ${value.length > 0 ? 'text-chalk font-bold' : 'text-chalkMuted'}`}>
          {value.length > 0 ? selectedLabels : placeholder}
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
              {options.length === 0 ? (
                <div className="px-4 py-3 text-xs font-semibold text-chalkMuted text-center">No options available</div>
              ) : (
                options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleOption(option.value);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all text-left hover:bg-white/5"
                    >
                      <span className={isSelected ? 'text-accent' : 'text-chalkMuted hover:text-chalk'}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-accent">
                          <Check size={16} strokeWidth={3} />
                        </motion.div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
