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
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {selectedTeam ? (
          <motion.div
            key="roster-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl mx-auto"
          >
            <button
              onClick={() => setSelectedTeam(null)}
              className="flex items-center gap-2 text-chalkMuted hover:text-emerald-400 transition-colors mb-8 group uppercase tracking-widest font-bold text-xs"
            >
              <X size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Franchises
            </button>
            
            <div className="bg-panel border border-white/10 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
              <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-emerald-400 overflow-hidden shadow-2xl relative z-10 shrink-0">
                {selectedTeam.logoUrl ? (
                  <img src={selectedTeam.logoUrl} alt={selectedTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <ShieldCheck size={48} />
                )}
              </div>
              <div className="text-center md:text-left relative z-10 flex-1">
                <h2 className="text-white font-display text-4xl md:text-5xl font-bold tracking-wider mb-3">{selectedTeam.name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold uppercase tracking-widest text-emerald-400/80">
                  <span className="bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20"><Users size={14} className="inline mr-1" /> {selectedTeam.players?.length || 0} Players</span>
                  {selectedTeam.manager && (
                    <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-chalkMuted">Mgr: {selectedTeam.manager.name}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-2xl tracking-widest uppercase text-chalk mb-6 border-b border-white/10 pb-4">Team Roster</h3>
              
              {!selectedTeam.players || selectedTeam.players.length === 0 ? (
                <div className="text-center py-20 bg-panel border border-white/5 rounded-3xl">
                  <Users size={64} className="mx-auto mb-4 opacity-20 text-chalkMuted" />
                  <p className="text-chalkMuted text-lg italic">No players have been added to this roster yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTeam.players.map((player: any, index: number) => {
                    const primaryPos = player.positions?.find((p: any) => p.isPrimary)?.position;
                    const secondaryPos = player.positions?.filter((p: any) => !p.isPrimary).map((p: any) => p.position).join(', ');
                    
                    return (
                      <div 
                        key={player.id} 
                        className="flex items-center gap-5 p-4 rounded-2xl bg-panel border border-white/10 hover:border-emerald-500/30 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/5 text-chalkMuted flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                          {index + 1}
                        </div>
                        <img 
                          src={player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random`} 
                          alt={player.name}
                          className="w-14 h-14 rounded-full object-cover bg-black/20 shrink-0 ring-2 ring-white/5 group-hover:ring-emerald-500/30 transition-all" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-lg truncate group-hover:text-emerald-400 transition-colors">{player.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className="text-emerald-400/80 font-mono text-[10px] bg-emerald-400/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{player.studentId}</span>
                            {primaryPos && (
                              <span className="text-chalk font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{primaryPos}</span>
                            )}
                            {secondaryPos && (
                              <span className="text-chalkMuted font-mono text-[10px] bg-black/30 px-2 py-0.5 rounded uppercase tracking-wider">{secondaryPos}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-7xl mx-auto"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
