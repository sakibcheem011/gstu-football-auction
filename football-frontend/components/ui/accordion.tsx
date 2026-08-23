"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LucideIcon } from "lucide-react";
import clsx from "clsx";

interface AccordionItemProps {
  id: string;
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  isOpen?: boolean;
  onClick?: () => void;
}

export function AccordionItem({ id, title, icon: Icon, children, isOpen, onClick }: AccordionItemProps) {
  return (
    <div className="flex flex-col mb-1 last:mb-0">
      <button
        onClick={onClick}
        className={clsx(
          "flex items-center justify-between p-4 rounded-xl transition-all duration-300 text-left w-full border backdrop-blur-sm group relative overflow-hidden",
          isOpen 
            ? "bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
            : "bg-black/20 text-zinc-400 border-white/5 hover:text-white hover:bg-white/5 hover:border-white/10"
        )}
      >
        {isOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
        )}
        <div className="flex items-center gap-4 relative z-10">
          {Icon && (
            <div className={clsx(
              "p-2 rounded-lg transition-colors",
              isOpen ? "bg-white/20 text-white" : "bg-black/40 text-zinc-500 group-hover:text-zinc-300"
            )}>
              <Icon size={18} />
            </div>
          )}
          <span className="font-display font-semibold tracking-wide text-lg">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={clsx(
            "relative z-10 transition-colors",
            isOpen ? "text-white" : "text-zinc-500 group-hover:text-white"
          )}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pl-6 ml-3 my-2 border-l border-zinc-800/80 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AccordionProps {
  children: React.ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string | string[];
}

export function Accordion({ children, type = "single", defaultValue }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(
      Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
    )
  );

  const handleItemClick = (id: string) => {
    setOpenItems((prev) => {
      const newOpenItems = new Set(prev);
      if (type === "single") {
        if (newOpenItems.has(id)) {
          newOpenItems.delete(id);
        } else {
          newOpenItems.clear();
          newOpenItems.add(id);
        }
      } else {
        if (newOpenItems.has(id)) {
          newOpenItems.delete(id);
        } else {
          newOpenItems.add(id);
        }
      }
      return newOpenItems;
    });
  };

  return (
    <div className="w-full">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = (child as React.ReactElement<any>).props;
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen: openItems.has(childProps.id),
            onClick: () => handleItemClick(childProps.id),
          });
        }
        return child;
      })}
    </div>
  );
}
