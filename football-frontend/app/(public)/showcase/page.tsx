'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shirt } from 'lucide-react';

export default function JerseyShowcase() {
  const [jerseys, setJerseys] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.role === 'SUPER_ADMIN') setIsAdmin(true);
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/jerseys`)
      .then(res => res.json())
      .then(data => {
        setJerseys(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-widest mb-4 flex items-center justify-center gap-3">
          <Shirt className="text-emerald-400" size={40} />
          Jersey Showcase
        </h1>
        <p className="text-chalkMuted max-w-2xl mx-auto">Explore the custom jersey designs submitted by our talented players.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : jerseys.length === 0 ? (
        <div className="text-center py-20 text-chalkMuted border-2 border-dashed border-white/10 rounded-2xl">
          No jerseys have been submitted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {jerseys.map((jersey, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={jersey.id} 
              className="bg-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl group hover:border-emerald-500/30 transition-all"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-ink relative">
                <img src={jersey.imageUrl} alt="Jersey Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              {isAdmin && jersey.player && (
                <div className="p-4 bg-ink border-t border-white/5">
                  <p className="text-white font-bold uppercase tracking-wide text-sm truncate">{jersey.player.name}</p>
                  <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mt-1">{jersey.player.studentId} ? {jersey.player.sessionId}</p>
                  <p className="text-chalkMuted text-xs mt-1">Printed Name: {jersey.player.jerseyName}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}