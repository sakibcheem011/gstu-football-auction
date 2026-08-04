'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Users, MonitorPlay, LogIn, Clock, Activity, Target, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

export default function Home() {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [auctionState, setAuctionState] = useState<any>(null);

  useEffect(() => {
    const fetchData = () => {
      Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/rules/config`).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/teams`).then(r => r.json()),
      ]).then(([conf, tms]) => {
        if (conf) setConfig(conf);
        if (Array.isArray(tms)) setTeams(tms);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    };

    fetchData();

    const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`);
    socket.on('auction_state_sync', (data) => setAuctionState(data));
    socket.on('auction_timer_tick', (data) => {
      setAuctionState((prev: any) => prev ? { ...prev, timer: data.timer } : null);
    });
    socket.on('data_updated', () => {
      fetchData();
    });
    return () => { socket.disconnect(); };
  }, []);

  if (loading) return <div className="p-10 text-chalk text-center font-display tracking-widest mt-20">INITIALIZING GSTU AUCTION SYSTEM...</div>;

  const phase = config.currentPhase || 'SETUP';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-ink text-chalk font-body">
      {/* Phase Conditional Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <AnimatePresence mode="wait">
          {phase === 'SETUP' && <SetupPhase teams={teams} config={config} key="setup" />}
          {phase === 'REGISTRATION' && <RegistrationPhase config={config} key="reg" />}
          {phase === 'AUCTION' && <AuctionPhase teams={teams} auctionState={auctionState} config={config} key="auc" />}
          {phase === 'TOURNAMENT' && <TournamentPhase key="tourney" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- PHASE 1: SETUP ---
function SetupPhase({ teams, config }: { teams: any[], config: any }) {
  return (
    <motion.div initial="hidden" animate="show" exit={{opacity:0}} variants={{show: {transition: {staggerChildren: 0.1}}}} className="space-y-12 py-12">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl tracking-wider mb-6 leading-none">
          THE <span className="text-glow-gold text-gold">ULTIMATE</span><br /> FRANCHISE AUCTION
        </h1>
        <p className="text-xl text-chalkMuted leading-relaxed mb-10">
          The event is currently in the setup phase. Organizers are preparing the rules, budget, and franchises. Player registration will open shortly.
        </p>
      </div>

      <div className="text-center max-w-4xl mx-auto glass-panel p-12 rounded-3xl border-gold/30 shadow-[0_0_50px_rgba(232,184,75,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 blur-[100px] pointer-events-none" />
        
        <div className="inline-block px-4 py-1 bg-gold/20 text-gold rounded-full font-bold uppercase tracking-widest text-sm mb-6 relative z-10">
          Attention Managers
        </div>
        <h2 className="font-display text-4xl md:text-5xl tracking-wider mb-6 relative z-10 text-white">
          FRANCHISE <span className="text-gold">REGISTRATION</span> IS LIVE
        </h2>
        <p className="text-lg text-chalkMuted mb-10 max-w-2xl mx-auto relative z-10">
          Ready to build your dream squad? Submit your application to become a franchise manager and prepare for the biggest bidding war.
        </p>
        <div className="flex justify-center gap-4 relative z-10">
          <Link href="/manager-registration">
            <button className="px-8 py-4 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold uppercase tracking-widest transition text-lg flex items-center gap-3 shadow-[0_0_20px_rgba(232,184,75,0.2)]">
              Apply For Franchise <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8 rounded-3xl text-center">
          <MonitorPlay className="mx-auto text-cyan-400 mb-4" size={48} />
          <div className="font-display text-4xl text-white mb-2">TK {(config?.totalBudget || 0).toLocaleString()}</div>
          <div className="text-sm uppercase tracking-widest text-chalkMuted font-bold">Franchise Budget</div>
        </motion.div>
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8 rounded-3xl text-center">
          <Users className="mx-auto text-silver mb-4" size={48} />
          <div className="font-display text-4xl text-white mb-2">{config?.minRosterSize || 0}</div>
          <div className="text-sm uppercase tracking-widest text-chalkMuted font-bold">Minimum Squad Size</div>
        </motion.div>
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8 rounded-3xl text-center">
          <Trophy className="mx-auto text-gold mb-4" size={48} />
          <div className="font-display text-4xl text-white mb-2">{teams.length}</div>
          <div className="text-sm uppercase tracking-widest text-chalkMuted font-bold">Active Franchises</div>
        </motion.div>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        <h2 className="font-display text-2xl tracking-widest mb-6">REGISTERED FRANCHISES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t, idx) => {
            const TEAM_COLORS = ['#E8B84B', '#38BDF8', '#E4483B', '#A8AEB8', '#10B981', '#F472B6'];
            const color = TEAM_COLORS[idx % TEAM_COLORS.length];
            return (
              <div key={t.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 blur-[20px] opacity-20 pointer-events-none" style={{ background: color }} />
                <div className="w-4 h-4 rounded-full" style={{ background: color }} />
                <span className="font-bold text-lg">{t.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// --- PHASE 2: REGISTRATION ---
function RegistrationPhase({ config }: { config: any }) {
  return (
    <motion.div initial="hidden" animate="show" exit={{opacity:0}} variants={{show: {transition: {staggerChildren: 0.1}}}} className="py-12 space-y-12">
      <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="text-center max-w-4xl mx-auto glass-panel p-12 rounded-3xl border-gold/30 shadow-[0_0_50px_rgba(232,184,75,0.1)]">
        <div className="inline-block px-4 py-1 bg-gold/20 text-gold rounded-full font-bold uppercase tracking-widest text-sm mb-6">
          Phase 2 is Active
        </div>
        <h1 className="font-display text-5xl md:text-7xl tracking-wider mb-6">
          PLAYER <span className="text-gold">REGISTRATION</span> OPEN
        </h1>
        <p className="text-lg text-chalkMuted mb-10 max-w-2xl mx-auto">
          Calling all athletes! Register now to enter the auction pool. Set your profile, playing positions, and get verified by the organizers to be eligible for bidding.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <button className="px-8 py-4 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold uppercase tracking-widest transition text-lg flex items-center gap-3">
              Register Now <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8 rounded-3xl">
          <h2 className="font-display tracking-widest text-xl mb-4">NOTICE BOARD</h2>
          <ul className="space-y-4 text-chalkMuted">
            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <Activity className="shrink-0 text-cyan-400" />
              <div>
                <strong className="text-white block mb-1">Registration Deadline</strong>
                Make sure to submit your profile before the deadline. Late submissions will not be accepted.
              </div>
            </li>
            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <Target className="shrink-0 text-gold" />
              <div>
                <strong className="text-white block mb-1">Profile Verification</strong>
                All profiles are subject to review by the Super Admin before appearing in the auction draft.
              </div>
            </li>
          </ul>
        </motion.div>
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center text-center">
          <h2 className="font-display tracking-widest text-xl mb-6">EVENT COUNTDOWN</h2>
          <div className="flex gap-4 font-display text-4xl text-white">
            <div className="flex flex-col"><span className="text-5xl text-gold">05</span><span className="text-xs uppercase tracking-widest text-chalkMuted">Days</span></div>
            <span>:</span>
            <div className="flex flex-col"><span className="text-5xl text-gold">12</span><span className="text-xs uppercase tracking-widest text-chalkMuted">Hours</span></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// --- PHASE 3: AUCTION ---
function AuctionPhase({ teams, auctionState, config }: { teams: any[], auctionState: any, config: any }) {
  const { activePlayer, status, currentBid, highestBidderTeamId, timer } = auctionState || {};
  const leadingTeam = teams.find(t => t.id === highestBidderTeamId);

  return (
    <motion.div 
      id="auction-spectator-view"
      initial={{opacity:0}} 
      animate={{opacity:1}} 
      exit={{opacity:0}} 
      className="space-y-6 relative [&:fullscreen]:bg-ink [&:fullscreen]:p-8"
    >
      <style>{`
        #auction-spectator-view:fullscreen {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        #auction-spectator-view:fullscreen .auction-grid {
          flex: 1;
          min-height: 0;
        }
        #auction-spectator-view:fullscreen .auction-main-view,
        #auction-spectator-view:fullscreen .auction-sidebar {
          height: 100% !important;
        }
        #auction-spectator-view:fullscreen .fs-text-normal,
        #auction-spectator-view:fullscreen .fs-icon-normal {
          display: none !important;
        }
        #auction-spectator-view:fullscreen .fs-text-active,
        #auction-spectator-view:fullscreen .fs-icon-active {
          display: block !important;
        }
      `}</style>
      {/* Live Banner */}
      <div className="bg-danger/20 border border-danger/50 text-danger p-4 rounded-2xl flex items-center justify-between">
        <div className="w-10 hidden sm:block"></div>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-3 h-3 bg-danger rounded-full" />
          <span className="font-display tracking-widest text-lg sm:text-xl">LIVE AUCTION IN PROGRESS</span>
        </div>
        <button 
           onClick={() => {
             const el = document.getElementById('auction-spectator-view');
             if (el) {
               if (document.fullscreenElement) {
                 document.exitFullscreen().catch(console.error);
               } else {
                 el.requestFullscreen().catch(console.error);
               }
             }
           }}
           className="p-2 bg-danger/20 hover:bg-danger/40 rounded-xl text-danger transition flex items-center gap-2"
           title="Toggle Fullscreen"
        >
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:block fs-text-normal">Fullscreen</span>
          <span className="text-xs font-bold uppercase tracking-widest hidden fs-text-active">Exit</span>
          <Maximize size={18} className="fs-icon-normal" />
          <Minimize size={18} className="hidden fs-icon-active" />
        </button>
      </div>

      <div className="auction-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Spectator View */}
        <div className="auction-main-view lg:col-span-2 glass-panel p-8 rounded-3xl min-h-[500px] flex flex-col justify-center relative overflow-hidden">
          {!auctionState || status === 'IDLE' || !activePlayer ? (
             <div className="w-full flex flex-col items-center h-full">
               <div className="text-center text-chalkMuted opacity-50 mb-8 mt-4 shrink-0">
                 <MonitorPlay size={48} className="mx-auto mb-4" />
                 <h2 className="text-2xl font-display tracking-widest">WAITING FOR NEXT DRAFT</h2>
               </div>
               
               <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <h3 className="font-display text-xl text-white tracking-widest mb-6 text-center border-b border-white/10 pb-4">FRANCHISE SQUADS SUMMARY</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {teams.map(t => (
                     <div key={t.id} className="bg-ink/50 border border-white/10 p-5 rounded-2xl">
                       <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                         <span className="font-bold text-gold tracking-widest truncate max-w-[150px]">{t.name}</span>
                         <span className="bg-white/10 text-xs px-2 py-1 rounded-md">{t.players?.length || 0} Players</span>
                       </div>
                       <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                         {t.players?.map((p: any) => (
                           <div key={p.id} className="flex justify-between items-center text-sm bg-white/5 p-2 rounded-lg">
                             <div className="flex items-center gap-2 overflow-hidden">
                               <div className="w-6 h-6 rounded-full overflow-hidden bg-black shrink-0">
                                 {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover"/> : <Users size={12} className="m-auto text-white/20 mt-1"/>}
                               </div>
                               <span className="text-white truncate">{p.name}</span>
                             </div>
                             <span className="text-cyan-400 font-mono font-bold shrink-0">TK {p.soldPrice?.toLocaleString()}</span>
                           </div>
                         ))}
                         {(!t.players || t.players.length === 0) && (
                           <div className="text-center text-chalkMuted text-xs uppercase tracking-widest py-4 opacity-50">Empty Roster</div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          ) : status === 'PAUSED' ? (
             <div className="text-center text-gold opacity-80">
               <Clock size={64} className="mx-auto mb-6" />
               <h2 className="text-3xl font-display tracking-widest">AUCTION PAUSED</h2>
             </div>
          ) : (
            <div className="w-full flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-64 h-64 rounded-2xl bg-black/50 border border-white/10 overflow-hidden shrink-0 shadow-2xl">
                 {activePlayer.imageUrl ? <img src={activePlayer.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Users size={64}/></div>}
              </div>
              <div className="flex-1 py-2 text-center md:text-left">
                <div className="text-xs uppercase tracking-widest text-gold font-bold mb-2">Player</div>
                <h2 className="text-5xl font-display text-white mb-2">{activePlayer.name}</h2>
                <div className="text-sm text-chalkMuted uppercase tracking-widest mb-10">Base Price: TK {(auctionState?.basePrice || 5000).toLocaleString()}</div>
                
                <div className="flex items-end justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-2">Current Bid</div>
                    <div className="text-6xl font-display text-gold tabular">TK {currentBid?.toLocaleString()}</div>
                    <div className="text-sm font-bold text-cyan-400 uppercase tracking-widest mt-2">{leadingTeam ? `by ${leadingTeam.name}` : 'No Bids Yet'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-2">Timer</div>
                    <div className={`text-6xl font-display tabular ${timer <= 5 ? 'text-danger' : 'text-white'}`}>{timer}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Budgets Sidebar */}
        <div className="auction-sidebar glass-panel p-6 rounded-3xl h-[600px] flex flex-col">
          <h3 className="font-display tracking-widest text-xl mb-6 border-b border-white/10 pb-4">TEAM BUDGETS</h3>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {teams.map((t, idx) => {
              const TEAM_COLORS = ['#E8B84B', '#38BDF8', '#E4483B', '#A8AEB8', '#10B981', '#F472B6'];
              const color = TEAM_COLORS[idx % TEAM_COLORS.length];
              return (
                <div key={t.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span className="font-bold text-white">{t.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-chalkMuted">Remaining</div>
                    <div className="font-display text-gold tabular">TK {t.remainingBudget?.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- PHASE 4: TOURNAMENT ---
function TournamentPhase() {
  const [standings, setStandings] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/tournament/standings`).then(r => r.json()).then(setStandings).catch(console.error);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/tournament/fixtures`).then(r => r.json()).then(setFixtures).catch(console.error);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/teams`).then(r => r.json()).then(setTeams).catch(console.error);
  }, []);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="py-12 space-y-8">
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl tracking-widest mb-4">TOURNAMENT <span className="text-cyan-400">DASHBOARD</span></h1>
        <p className="text-chalkMuted uppercase tracking-widest">Live Standings and Fixtures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl h-fit">
          <h2 className="font-display tracking-widest text-xl text-gold mb-6 flex items-center gap-2"><Trophy size={20}/> POINTS TABLE</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-chalkMuted">
                  <th className="pb-3 px-2">Team</th>
                  <th className="pb-3 px-2 text-center">P</th>
                  <th className="pb-3 px-2 text-center">W</th>
                  <th className="pb-3 px-2 text-center">D</th>
                  <th className="pb-3 px-2 text-center">L</th>
                  <th className="pb-3 px-2 text-center">GD</th>
                  <th className="pb-3 px-2 text-center text-cyan-400 font-bold">PTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, idx) => (
                  <tr key={s.teamId} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-bold text-white flex items-center gap-2">
                      <span className="text-xs text-chalkMuted">{idx + 1}.</span> {s.teamName}
                    </td>
                    <td className="py-3 px-2 text-center text-chalkMuted tabular">{s.played}</td>
                    <td className="py-3 px-2 text-center text-gold tabular">{s.won}</td>
                    <td className="py-3 px-2 text-center text-chalkMuted tabular">{s.drawn}</td>
                    <td className="py-3 px-2 text-center text-danger tabular">{s.lost}</td>
                    <td className="py-3 px-2 text-center tabular">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                    <td className="py-3 px-2 text-center text-cyan-400 font-bold font-display text-xl tabular">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {standings.length === 0 && <div className="text-center text-chalkMuted py-4 text-sm uppercase tracking-widest opacity-50">No Data Available</div>}
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl h-fit">
          <h2 className="font-display tracking-widest text-xl text-cyan-400 mb-6">FIXTURES & RESULTS</h2>
          <div className="space-y-4">
            {fixtures.map(fix => {
              const tA = teams.find(t => t.id === fix.teamAId)?.name;
              const tB = teams.find(t => t.id === fix.teamBId)?.name;
              return (
                <div key={fix.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-chalkMuted uppercase tracking-widest mb-2 flex justify-between">
                    <span>{fix.venue}</span>
                    <span className="text-gold">{fix.isTwoLegged ? 'Two-Legged' : 'Single Tie'}</span>
                  </div>
                  {fix.matches.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between py-2 border-t border-white/5 first:border-0">
                      <div className="font-bold w-1/3 text-right">{tA}</div>
                      <div className="flex flex-col items-center px-4 w-1/3">
                        <div className="bg-ink px-3 py-1 rounded font-display tracking-wider text-xl text-white">
                          {m.status === 'SCHEDULED' ? 'v' : `${m.scoreA ?? 0} - ${m.scoreB ?? 0}`}
                        </div>
                        <div className={`text-[10px] uppercase mt-1 tracking-widest font-bold ${m.status === 'COMPLETED' ? 'text-chalkMuted' : m.status === 'IN_PROGRESS' ? 'text-danger' : 'text-cyan-400'}`}>
                          {m.status === 'IN_PROGRESS' ? 'Live' : m.status}
                        </div>
                      </div>
                      <div className="font-bold w-1/3 text-left">{tB}</div>
                    </div>
                  ))}
                </div>
              );
            })}
            {fixtures.length === 0 && <div className="text-center text-chalkMuted py-4 text-sm uppercase tracking-widest opacity-50">No Fixtures Generated</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
