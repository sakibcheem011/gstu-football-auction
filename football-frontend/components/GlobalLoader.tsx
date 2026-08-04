'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function GlobalLoader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let requestCount = 0;
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const options = args[1] as RequestInit | undefined;
      const method = options?.method?.toUpperCase() || 'GET';
      
      const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

      if (isMutation) {
        requestCount++;
        setLoading(true);
      }

      try {
        return await originalFetch(...args);
      } finally {
        if (isMutation) {
          requestCount = Math.max(0, requestCount - 1);
          if (requestCount === 0) {
            setLoading(false);
          }
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-ink border border-gold/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(232,184,75,0.2)] flex flex-col items-center"
          >
            <Loader2 size={40} className="text-gold animate-spin mb-4" />
            <div className="font-display text-lg text-white tracking-[0.2em] uppercase">Processing</div>
            <div className="text-chalkMuted text-[10px] mt-1 uppercase tracking-[0.2em]">Please Wait</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
