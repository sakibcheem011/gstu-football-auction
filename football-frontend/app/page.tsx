'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Users, MonitorPlay, LogIn, Clock, Activity, Target, Maximize, Minimize, Shield, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { Accordion, AccordionItem } from '../components/ui/accordion';
import { TournamentDashboard } from '../components/TournamentDashboard';
import { LandingHero } from '../components/LandingHero';

export default function Home() {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [auctionState, setAuctionState] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        setRole(payload.role);
      } catch (e) {}
    }
    const fetchData = () => {
      Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/config`).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams`).then(r => r.json()),
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

    const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL }`);
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
    <div className="flex-1 flex flex-col bg-ink text-chalk font-body">
      <LandingHero phase={phase} />
    </div>
  );
}

// --- PHASE 1: SETUP ---
function SetupPhase({ teams, config, role }: { teams: any[], config: any, role?: string | null }) {
  return (
    <motion.div initial="hidden" animate="show" exit={{opacity:0}} variants={{show: {transition: {staggerChildren: 0.1}}}} className="space-y-12">
      <div className="max-w-6xl mx-auto glass-panel p-12 relative overflow-hidden">
        
        {role === 'TEAM_MANAGER' ? (
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-chalk/10 text-zinc-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 relative z-10">
              Welcome Manager
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 relative z-10 text-chalk">
              Your Portal is Ready
            </h2>
            <p className="text-chalkMuted mb-8 max-w-xl mx-auto relative z-10">
              Head over to your Manager Console to customize your team logo, review your wishlist, and prepare your bidding strategy.
            </p>
            <div className="flex justify-center relative z-10">
              <Link href="/manager">
                <button className="px-6 py-3 bg-chalk text-ink hover:bg-zinc-200 rounded-lg font-semibold transition flex items-center gap-2">
                  Manager Console <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        ) : role === 'SUPER_ADMIN' || role === 'PODIUM_ADMIN' ? (
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-chalk/10 text-chalkMuted rounded-full text-xs font-semibold uppercase tracking-wider mb-6 relative z-10">
              System Admin
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 relative z-10 text-chalk">
              League Setup Active
            </h2>
            <p className="text-chalkMuted mb-8 max-w-xl mx-auto relative z-10">
              The setup phase is active. Configure teams, approve managers, and set the tournament rules from the Admin Dashboard.
            </p>
            <div className="flex justify-center relative z-10">
              <Link href="/admin">
                <button className="px-6 py-3 bg-chalk/20 text-chalk hover:bg-chalk/20 rounded-lg font-semibold transition flex items-center gap-2">
                  Admin Dashboard <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-chalk/10 text-zinc-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 relative z-10">
              Attention Managers
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 relative z-10 text-chalk">
              Franchise Registration is Live
            </h2>
            <p className="text-chalkMuted mb-8 max-w-xl mx-auto relative z-10">
              Ready to build your dream squad? Submit your application to become a franchise manager and prepare for the biggest bidding war.
            </p>
            <div className="flex justify-center relative z-10">
              <Link href="/manager-registration">
                <button className="px-6 py-3 bg-chalk text-ink hover:bg-zinc-200 rounded-lg font-semibold transition flex items-center gap-2">
                  Apply For Franchise <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mt-12 max-w-6xl mx-auto">
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8 text-center">
          <MonitorPlay className="mx-auto text-chalkMuted mb-4" size={32} />
          <div className="font-display text-3xl font-bold text-chalk mb-2">TK {(config?.totalBudget || 0).toLocaleString()}</div>
          <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Franchise Budget</div>
        </motion.div>
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8 text-center">
          <Users className="mx-auto text-chalkMuted mb-4" size={32} />
          <div className="font-display text-3xl font-bold text-chalk mb-2">{config?.minRosterSize || 0}</div>
          <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Minimum Squad Size</div>
        </motion.div>
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8 text-center">
          <Trophy className="mx-auto text-chalk mb-4" size={32} />
          <div className="font-display text-3xl font-bold text-chalk mb-2">{teams.length}</div>
          <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Active Franchises</div>
        </motion.div>
      </div>

      <div className="glass-panel p-8 relative z-10 max-w-6xl mx-auto">
        <h2 className="font-display text-xl font-bold tracking-tight mb-6">Registered Franchises</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t, idx) => {
            return (
              <div key={t.id} className="bg-zinc-800/30 border border-zinc-700/50 p-4 rounded-xl flex items-center gap-4 hover:bg-zinc-800/60 transition">
                <div className="w-3 h-3 rounded-full bg-chalk/20" />
                <span className="font-semibold text-zinc-200">{t.name}</span>
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
    <motion.div initial="hidden" animate="show" exit={{opacity:0}} variants={{show: {transition: {staggerChildren: 0.1}}}} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8">
          <h2 className="font-display font-bold text-xl mb-4 text-chalk">Notice Board</h2>
          <Accordion type="multiple" defaultValue={['deadline']}>
            <AccordionItem id="deadline" title="Registration Deadline" icon={Activity}>
              <p className="text-chalkMuted text-sm mt-2">
                Make sure to submit your profile before the deadline. Late submissions will not be accepted under any circumstances.
              </p>
            </AccordionItem>
            <AccordionItem id="verification" title="Profile Verification" icon={Target}>
              <p className="text-chalkMuted text-sm mt-2">
                All profiles are subject to review by the Super Admin before appearing in the auction draft.
              </p>
            </AccordionItem>
          </Accordion>
        </motion.div>
        <motion.div variants={{hidden: {opacity:0, y:20}, show: {opacity:1, y:0}}} className="glass-panel p-8 flex flex-col items-center justify-center text-center">
          <h2 className="font-display font-bold text-xl mb-6 text-chalk">Event Countdown</h2>
          <div className="flex gap-6 font-display text-4xl text-chalk">
            <div className="flex flex-col"><span className="text-5xl font-bold text-chalk">05</span><span className="text-xs uppercase tracking-wider text-zinc-500 mt-1">Days</span></div>
            <span className="text-zinc-600 font-light">:</span>
            <div className="flex flex-col"><span className="text-5xl font-bold text-chalk">12</span><span className="text-xs uppercase tracking-wider text-zinc-500 mt-1">Hours</span></div>
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
      <div className="bg-chalk/5 border border-chalk/10 text-chalkMuted p-4 rounded-2xl flex items-center justify-between">
        <div className="w-10 hidden sm:block"></div>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-3 h-3 bg-danger rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <span className="font-display tracking-widest text-lg sm:text-xl text-danger">LIVE AUCTION IN PROGRESS</span>
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
           className="p-2 bg-chalk/5 hover:bg-chalk/5 rounded-xl text-chalkMuted transition flex items-center gap-2"
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
                 <h3 className="font-display text-xl text-chalk tracking-widest mb-6 text-center border-b border-chalk/10 pb-4">FRANCHISE SQUADS SUMMARY</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {teams.map(t => (
                     <div key={t.id} className="bg-ink/50 border border-chalk/10 p-5 rounded-2xl">
                       <div className="flex justify-between items-center mb-4 border-b border-chalk/5 pb-2">
                         <span className="font-bold text-chalk tracking-widest truncate max-w-[150px]">{t.name}</span>
                         <span className="bg-chalk/10 text-xs px-2 py-1 rounded-md">{t.players?.length || 0} Players</span>
                       </div>
                       <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                         {t.players?.map((p: any) => (
                           <div key={p.id} className="flex justify-between items-center text-sm bg-chalk/5 p-2 rounded-lg">
                             <div className="flex items-center gap-2 overflow-hidden">
                               <div className="w-6 h-6 rounded-full overflow-hidden bg-black shrink-0">
                                 {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover"/> : <Users size={12} className="m-auto text-chalk/20 mt-1"/>}
                               </div>
                               <span className="text-chalk truncate">{p.name}</span>
                             </div>
                             <span className="text-chalk font-mono font-bold shrink-0">TK {p.soldPrice?.toLocaleString()}</span>
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
             <div className="text-center text-chalk opacity-80">
               <Clock size={64} className="mx-auto mb-6" />
               <h2 className="text-3xl font-display tracking-widest">AUCTION PAUSED</h2>
             </div>
          ) : (
            <div className="w-full flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-64 h-64 rounded-2xl bg-black/50 border border-chalk/10 overflow-hidden shrink-0 shadow-2xl">
                 {activePlayer.imageUrl ? <img src={activePlayer.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-chalk/20"><Users size={64}/></div>}
              </div>
              <div className="flex-1 py-2 text-center md:text-left">
                <div className="text-xs uppercase tracking-widest text-chalk font-bold mb-2">Player</div>
                <h2 className="text-5xl font-display text-chalk mb-2">{activePlayer.name}</h2>
                <div className="text-sm text-chalkMuted uppercase tracking-widest mb-10">Base Price: TK {(auctionState?.basePrice || 5000).toLocaleString()}</div>
                
                <div className="flex items-end justify-between bg-chalk/5 p-6 rounded-2xl border border-chalk/10">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-2">Current Bid</div>
                    <div className="text-6xl font-display text-chalk tabular">TK {currentBid?.toLocaleString()}</div>
                    <div className="text-sm font-bold text-chalk uppercase tracking-widest mt-2">{leadingTeam ? `by ${leadingTeam.name}` : 'No Bids Yet'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-2">Timer</div>
                    <div className={`text-6xl font-display tabular ${timer <= 5 ? 'text-chalkMuted' : 'text-chalk'}`}>{timer}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Budgets Sidebar */}
        <div className="auction-sidebar glass-panel p-6 rounded-3xl h-[600px] flex flex-col">
          <h3 className="font-display tracking-widest text-xl mb-6 border-b border-chalk/10 pb-4">TEAM BUDGETS</h3>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {teams.map((t, idx) => {
              const TEAM_COLORS = ['#E8B84B', '#38BDF8', '#E4483B', '#A8AEB8', '#10B981', '#F472B6'];
              const color = TEAM_COLORS[idx % TEAM_COLORS.length];
              return (
                <div key={t.id} className="bg-chalk/5 border border-chalk/10 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span className="font-bold text-chalk">{t.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-chalk/60">Remaining</div>
                    <div className="font-display text-chalk tabular text-xl">TK {t.remainingBudget?.toLocaleString()}</div>
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
