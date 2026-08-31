'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Heart, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JerseyShowcase() {
  const [jerseys, setJerseys] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [votingClosed, setVotingClosed] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.role === 'SUPER_ADMIN') setIsAdmin(true);
      if (u.role === 'PLAYER' && u.playerRecord) {
        setIsPlayer(true);
        setPlayerId(u.playerRecord.id);
      }
    }

    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/jerseys`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async res => {
        if (res.status === 403) {
          const data = await res.json();
          return { error: data.error, closed: true };
        }
        return res.json();
      })
      .then(data => {
        if (data.closed) {
          setJerseys([]);
          setVotingClosed(true);
        } else {
          setJerseys(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleVote = async (jerseyId: string) => {
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Voting...');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jerseys/${jerseyId}/vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      toast.dismiss(toastId);
      
      if (res.ok) {
        toast.success(data.message);
        // Optimistically update the UI
        setJerseys(prev => prev.map(j => {
          if (j.id === jerseyId) {
            const hasVoted = j.votes?.some((v: any) => v.playerId === playerId);
            if (hasVoted) {
              return { ...j, _count: { ...j._count, votes: j._count.votes - 1 }, votes: j.votes.filter((v: any) => v.playerId !== playerId) };
            } else {
              return { ...j, _count: { ...j._count, votes: (j._count?.votes || 0) + 1 }, votes: [...(j.votes || []), { playerId }] };
            }
          }
          return j;
        }));
      } else {
        toast.error(data.error || 'Failed to vote');
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Network error');
    }
  };

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
      ) : votingClosed ? (
        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl bg-panel">
          <Shirt className="text-chalkMuted mx-auto mb-4" size={48} opacity={0.5} />
          <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Showcase Closed</h3>
          <p className="text-chalkMuted">Jersey showcase and voting are currently closed by the Admin.</p>
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
              className="bg-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl group hover:border-emerald-500/30 transition-all flex flex-col relative"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-ink relative cursor-pointer" onClick={() => setSelectedImage(jersey.imageUrl)}>
                <img src={jersey.imageUrl} alt="Jersey Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end" onClick={(e) => e.stopPropagation()}>
                  <div className="opacity-90 group-hover:opacity-100 transition-opacity w-full">
                    {isPlayer && (
                      <button 
                        onClick={() => toggleVote(jersey.id)}
                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                          jersey.votes?.some((v: any) => v.playerId === playerId) 
                            ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                            : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'
                        }`}
                      >
                        {jersey.votes?.some((v: any) => v.playerId === playerId) ? '✓ Voted' : 'Vote'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {isAdmin && jersey.player && (
                <div className="p-4 bg-ink border-t border-white/5">
                  <p className="text-white font-bold uppercase tracking-wide text-sm truncate">{jersey.player.name}</p>
                  <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mt-1">{jersey.player.studentId} • {jersey.player.sessionId}</p>
                  <p className="text-chalkMuted text-xs mt-1">Printed Name: {jersey.player.jerseyName}</p>
                  {jersey.player.team ? (
                    <p className="text-cyan-400 text-[10px] font-bold uppercase mt-2 border border-cyan-400/20 bg-cyan-400/10 inline-block px-2 py-1 rounded">
                      Team: {jersey.player.team.name}
                    </p>
                  ) : (
                    <p className="text-chalkMuted text-[10px] font-bold uppercase mt-2 border border-white/10 bg-white/5 inline-block px-2 py-1 rounded">
                      Team: NULL
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-pointer"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Fullscreen Jersey"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}