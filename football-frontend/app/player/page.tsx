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

    fetch(`/auth/me`, {
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
    <div className="flex-1 p-6 md:p-10 text-chalk font-body relative z-0 flex flex-col min-h-screen bg-ink">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col relative z-10">
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.2em] mb-8 drop-shadow-md">PLAYER DASHBOARD</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-panel rounded-[2rem] p-8 border border-white/5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden h-full">
              {/* Subtle top accent line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
              
              <div className="relative w-40 h-40 mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative bg-ink flex items-center justify-center p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-panel">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <User size={48} className="w-full h-full p-8 text-chalk/20" />
                    )}
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider mb-2">{p.name}</h2>
              <p className="text-emerald-400 font-mono text-sm mb-6 uppercase tracking-widest">{p.studentId} • Session {p.sessionId}</p>
              
              <div className="w-full h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0 my-4" />
              
              <div className="w-full space-y-4 my-2">
                <div className="flex justify-between items-center px-4 bg-ink/50 p-3 rounded-xl border border-white/5">
                  <span className="text-xs uppercase tracking-widest text-chalkMuted">Jersey Name</span>
                  <span className="font-bold text-white uppercase">{p.jerseyName}</span>
                </div>
              </div>

              {p.positions && p.positions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-6 w-full px-4">
                  {p.positions.map((pos: any) => (
                    <span key={pos.id} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      {pos.position}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status & Stats */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-panel rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-lg uppercase tracking-[0.2em] font-bold text-chalk mb-8 relative z-10">
                Auction Status
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                <div className="bg-ink border border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/20 transition-colors shadow-inner">
                  <div className="text-[10px] uppercase tracking-widest text-chalkMuted mb-3 font-bold">Current Status</div>
                  <div className={`text-2xl font-bold uppercase tracking-widest ${p.status === 'SOLD' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-cyan-400'}`}>
                    {p.status}
                  </div>
                </div>

                <div className="bg-ink border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-colors shadow-inner">
                  <div className="text-[10px] uppercase tracking-widest text-chalkMuted mb-3 font-bold">Franchise</div>
                  <div className="text-xl font-bold uppercase tracking-widest text-white">
                    {p.team?.name || '---'}
                  </div>
                </div>

                <div className="bg-ink border border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/20 transition-colors shadow-inner">
                  <div className="text-[10px] uppercase tracking-widest text-chalkMuted mb-3 font-bold">Sold For</div>
                  <div className={`text-2xl font-display tracking-widest ${p.soldPrice ? 'text-emerald-400' : 'text-chalkMuted'}`}>
                    {p.soldPrice ? `TK ${p.soldPrice.toLocaleString()}` : '---'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-panel rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-lg uppercase tracking-[0.2em] font-bold text-chalk mb-8 relative z-10">
                Tournament Statistics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {[
                  { label: 'Goals', val: 0 },
                  { label: 'Assists', val: 0 },
                  { label: 'Yellow Cards', val: 0 },
                  { label: 'Clean Sheets', val: 0 }
                ].map((stat, i) => (
                  <div key={i} className="bg-ink border border-white/5 rounded-xl p-5 flex flex-col items-center hover:border-white/20 transition-colors shadow-inner group">
                    <span className="text-4xl font-display text-white mb-3 group-hover:scale-110 transition-transform">{stat.val}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-chalkMuted text-center">{stat.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-xs text-center text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl relative z-10 shadow-inner">
                Tournament Phase has not started yet.
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
