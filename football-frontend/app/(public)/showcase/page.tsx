'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shirt, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JerseyShowcase() {
  const [jerseys, setJerseys] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                {isAdmin && (
                  <div className="bg-ink/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white font-bold text-xs flex items-center gap-1">
                    <Heart size={14} className="text-emerald-400 fill-emerald-400" /> {jersey._count?.votes || 0}
                  </div>
                )}
                {isPlayer && (
                  <button 
                    onClick={() => toggleVote(jersey.id)}
                    className="bg-ink/80 backdrop-blur-md hover:bg-ink px-3 py-1.5 rounded-full border border-white/10 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Heart size={14} className={jersey.votes?.some((v: any) => v.playerId === playerId) ? "text-emerald-400 fill-emerald-400" : "text-chalkMuted"} />
                    {jersey._count?.votes || 0}
                  </button>
                )}
              </div>
              <div className="aspect-[3/4] w-full overflow-hidden bg-ink relative">
                <img src={jersey.imageUrl} alt="Jersey Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              {isAdmin && jersey.player && (
                <div className="p-4 bg-ink border-t border-white/5">
                  <p className="text-white font-bold uppercase tracking-wide text-sm truncate">{jersey.player.name}</p>
                  <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mt-1">{jersey.player.studentId} • {jersey.player.sessionId}</p>
                  <p className="text-chalkMuted text-xs mt-1">Printed Name: {jersey.player.jerseyName}</p>
                  {jersey.player.team && (
                    <p className="text-cyan-400 text-xs font-bold uppercase mt-2 border border-cyan-400/20 bg-cyan-400/10 inline-block px-2 py-1 rounded">
                      {jersey.player.team.name}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}