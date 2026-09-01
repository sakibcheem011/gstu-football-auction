'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Users, Wallet, X } from 'lucide-react';

export default function FranchisesPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`)
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
                onClick={() => setSelectedTeam(team)}
                className="bg-panel border border-chalk/10 p-8 rounded-3xl group hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden cursor-pointer flex flex-col h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-4 mb-6 relative z-10 flex-1">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 overflow-hidden shrink-0">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck size={32} />
                    )}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-chalk group-hover:text-emerald-400 transition-colors">{team.name}</h2>
                    {team.manager && (
                      <div className="text-xs uppercase tracking-widest text-chalkMuted font-semibold mt-1">
                        Mgr: {team.manager.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10 pt-6 border-t border-chalk/10 mb-4 shrink-0">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-1 flex items-center gap-1">
                      <Wallet size={12} /> Budget
                    </div>
                    <div className="font-display font-bold text-chalk tabular-nums">
                      TK {team.remainingBudget?.toLocaleString('en-IN') || 0}
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
                
                <div className="relative z-10 mt-auto shrink-0">
                   <button className="w-full py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest group-hover:bg-emerald-500/10 transition-colors">
                     View Roster
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTeam && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTeam(null)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-ink border-l border-white/5 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="relative p-8 border-b border-white/5 overflow-hidden shrink-0 bg-panel">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-chalk transition-colors z-10"
                >
                  <X size={20} />
                </button>
                
                <div className="flex flex-col gap-4 relative z-10 pt-4">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 overflow-hidden shadow-lg mx-auto">
                    {selectedTeam.logoUrl ? (
                      <img src={selectedTeam.logoUrl} alt={selectedTeam.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck size={40} />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-display text-2xl font-bold tracking-wider mb-2">{selectedTeam.name}</h3>
                    <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                      <span><Users size={12} className="inline mr-1" /> {selectedTeam.players?.length || 0} Players</span>
                      {selectedTeam.manager && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="text-chalkMuted">Mgr: {selectedTeam.manager.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Roster List */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-ink/50 relative">
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-ink/50 to-transparent pointer-events-none" />
                
                {!selectedTeam.players || selectedTeam.players.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <Users size={48} className="mx-auto mb-4 opacity-20 text-chalkMuted" />
                    <p className="text-chalkMuted text-sm italic">No players in this roster yet.</p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-3 pb-8">
                    {selectedTeam.players.map((player: any, index: number) => (
                      <motion.div 
                        key={player.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/5 border border-white/5 hover:border-emerald-500/20 hover:bg-white/10 transition-colors rounded-2xl p-4 flex items-center gap-4 group cursor-default"
                      >
                        <div className="w-8 h-8 rounded-full bg-black/30 text-chalkMuted flex items-center justify-center font-bold text-xs shrink-0 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                          {index + 1}
                        </div>
                        <img 
                          src={player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random`} 
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover bg-white/10 shrink-0 shadow-md ring-2 ring-white/5 group-hover:ring-emerald-500/30 transition-all" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate group-hover:text-emerald-400 transition-colors">{player.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-emerald-400/80 font-mono text-[9px] bg-emerald-400/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{player.studentId}</span>
                            <span className="text-chalkMuted font-mono text-[9px] uppercase tracking-wider bg-black/30 px-1.5 py-0.5 rounded">{player.sessionId}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
