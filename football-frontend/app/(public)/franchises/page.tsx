'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Wallet } from 'lucide-react';

export default function FranchisesPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTeams(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-ink text-chalk font-body py-12 px-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-[0.2em] mb-4 uppercase">Franchises</h1>
          <p className="text-chalkMuted max-w-2xl mx-auto">
            Meet the official franchises competing in GSTU LIGA. Discover their team rosters, remaining budgets, and manager details.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-chalkMuted font-display tracking-widest uppercase">
            Loading Franchises...
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20 text-chalkMuted border border-chalk/10 rounded-3xl bg-panel">
            <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-display uppercase tracking-widest">No Franchises Registered</h2>
            <p className="text-sm mt-2">Check back later when the setup phase is complete.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team, idx) => (
              <motion.div 
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-panel border border-chalk/10 p-8 rounded-3xl group hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 overflow-hidden shrink-0">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck size={32} />
                    )}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-chalk">{team.name}</h2>
                    {team.manager && (
                      <div className="text-xs uppercase tracking-widest text-chalkMuted font-semibold mt-1">
                        Mgr: {team.manager.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10 pt-6 border-t border-chalk/10">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-1 flex items-center gap-1">
                      <Wallet size={12} /> Budget
                    </div>
                    <div className="font-display font-bold text-chalk tabular-nums">
                      TK {team.remainingBudget?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-1 flex items-center gap-1">
                      <Users size={12} /> Squad Size
                    </div>
                    <div className="font-display font-bold text-chalk tabular-nums">
                      {team.players?.length || 0}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
