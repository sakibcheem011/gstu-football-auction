'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, User, Trophy, Shield, Goal, Flag } from 'lucide-react';

export default function PlayerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.role !== 'PLAYER') {
          router.push('/');
        } else {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push('/');
      });
  }, [router]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-gold font-display text-2xl">LOADING DASHBOARD...</div>;
  if (!user || !user.playerRecord) return <div className="flex-1 p-10 text-chalk text-center">Failed to load player data.</div>;

  const p = user.playerRecord;

  return (
    <div className="flex-1 p-6 md:p-10 text-chalk font-body relative z-0 flex flex-col">
      
      
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.2em] mb-8">PLAYER DASHBOARD</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="glass-panel rounded-[2rem] p-8 border-white/10 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6">
                <img src={p.imageUrl} className="w-full h-full object-cover" alt="Profile" />
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{p.name}</h2>
              <p className="text-chalkMuted font-mono text-sm mb-4">{p.studentId} • Session {p.sessionId}</p>
              
              <div className="w-full h-px bg-white/10 my-4" />
              
              <div className="w-full flex justify-between items-center px-4">
                <span className="text-xs uppercase tracking-widest text-chalkMuted">Jersey</span>
                <span className="font-bold text-white">{p.jerseyName}</span>
              </div>

              
              {p.positions && p.positions.length > 0 && (
                <div className="flex gap-2 justify-center mt-6">
                  {p.positions.map((pos: any) => (
                    <span key={pos.id} className="bg-white/10 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                      {pos.position}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status & Stats */}
          <div className="md:col-span-2 space-y-8">
            
            <div className="glass-panel rounded-[2rem] p-8 border-white/10">
              <h3 className="text-lg uppercase tracking-[0.2em] font-bold text-chalk mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                <Trophy className="text-gold" size={20} /> Auction Status
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-ink/50 border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-xs uppercase tracking-widest text-chalkMuted mb-2">Current Status</div>
                  <div className={`text-2xl font-bold uppercase tracking-widest ${p.status === 'SOLD' ? 'text-gold' : 'text-cyan-400'}`}>
                    {p.status}
                  </div>
                </div>

                <div className="bg-ink/50 border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-xs uppercase tracking-widest text-chalkMuted mb-2">Franchise</div>
                  <div className="text-xl font-bold uppercase tracking-widest text-white">
                    {p.team?.name || '---'}
                  </div>
                </div>

                <div className="bg-ink/50 border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-xs uppercase tracking-widest text-chalkMuted mb-2">Sold For</div>
                  <div className="text-xl font-display tracking-widest text-gold">
                    {p.soldPrice ? `TK ${p.soldPrice.toLocaleString()}` : '---'}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-8 border-white/10 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                <Goal size={200} />
              </div>
              <h3 className="text-lg uppercase tracking-[0.2em] font-bold text-chalk mb-6 border-b border-white/10 pb-4 flex items-center gap-2 relative z-10">
                <Flag className="text-gold" size={20} /> Tournament Statistics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {/* Placeholder Stats since Match schema isn't fully integrated yet */}
                {[
                  { label: 'Goals', val: 0 },
                  { label: 'Assists', val: 0 },
                  { label: 'Yellow Cards', val: 0 },
                  { label: 'Clean Sheets', val: 0 }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center">
                    <span className="text-4xl font-display text-white mb-2">{stat.val}</span>
                    <span className="text-[10px] uppercase tracking-widest text-chalkMuted text-center">{stat.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-xs text-center text-chalkMuted uppercase tracking-widest bg-ink/30 p-3 rounded-lg">
                Tournament Phase has not started yet.
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
