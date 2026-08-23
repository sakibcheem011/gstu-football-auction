'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { MonitorPlay, Clock, Users, Maximize, Minimize, Shield } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LiveSpectatorView() {
  const [config, setConfig] = useState<any>({});
  const [teams, setTeams] = useState<any[]>([]);
  const [auctionState, setAuctionState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) return <div className="min-h-screen bg-ink flex items-center justify-center p-10 text-chalk text-center font-display tracking-widest">CONNECTING TO LIVE SERVER...</div>;

  const { activePlayer, status, currentBid, highestBidderTeamId, timer } = auctionState || {};
  const leadingTeam = teams.find(t => t.id === highestBidderTeamId);

  return (
    <div className="min-h-screen bg-ink text-chalk font-body flex flex-col pt-24 px-6 pb-12">
      <Link href="/" className="absolute top-24 left-6 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/10 group z-50">
        <ArrowLeft size={20} className="text-chalk group-hover:text-emerald-400 transition-colors" />
      </Link>

      <motion.div 
        id="auction-spectator-view"
        initial={{opacity:0, y: 20}} 
        animate={{opacity:1, y: 0}} 
        exit={{opacity:0}} 
        className="space-y-6 relative max-w-7xl mx-auto w-full [&:fullscreen]:bg-ink [&:fullscreen]:p-8 [&:fullscreen]:max-w-none"
      >
        <style>{`
          #auction-spectator-view:fullscreen {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          #auction-spectator-view:fullscreen .auction-grid {
            flex: 1;
            min-height: 0;
            max-height: calc(100vh - 100px);
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
        <div className="bg-panel border border-chalk/10 text-chalkMuted p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="w-10 hidden sm:block"></div>
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            <span className="font-display tracking-widest text-lg sm:text-xl text-red-500 font-bold uppercase">LIVE AUCTION IN PROGRESS</span>
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
             className="p-2 bg-ink hover:bg-white/5 rounded-xl text-chalk transition flex items-center gap-2 border border-chalk/10"
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
          <div className="auction-main-view lg:col-span-2 bg-panel border border-chalk/10 p-8 rounded-[2rem] min-h-[500px] flex flex-col justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-5 pointer-events-none" />
            
            {!auctionState || status === 'IDLE' || !activePlayer ? (
               <div className="w-full flex flex-col items-center h-full relative z-10">
                 <div className="text-center text-chalkMuted opacity-50 mb-8 mt-4 shrink-0">
                   <MonitorPlay size={64} className="mx-auto mb-4" />
                   <h2 className="text-3xl font-display tracking-widest">WAITING FOR NEXT DRAFT</h2>
                 </div>
                 
                 <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-2">
                   <h3 className="font-display text-xl text-chalk tracking-widest mb-6 text-center border-b border-chalk/10 pb-4">FRANCHISE SQUADS SUMMARY</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {teams.map(t => (
                       <div key={t.id} className="bg-ink border border-chalk/10 p-5 rounded-2xl shadow-inner">
                         <div className="flex justify-between items-center mb-4 border-b border-chalk/5 pb-3">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full overflow-hidden bg-panel border border-chalk/10 shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                               {t.logoUrl ? (
                                 <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-chalk/30"><Shield size={14} /></div>
                               )}
                             </div>
                             <span className="font-bold text-chalk text-lg tracking-widest truncate max-w-[150px]">{t.name}</span>
                           </div>
                           <span className="bg-panelLight border border-chalk/10 text-xs px-2 py-1 rounded-md text-chalkMuted">{t.players?.length || 0} Players</span>
                         </div>
                         <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                           {t.players?.map((p: any) => (
                             <div key={p.id} className="flex justify-between items-center text-sm bg-panel border border-chalk/5 p-2 rounded-lg">
                               <div className="flex items-center gap-3 overflow-hidden">
                                 <div className="w-8 h-8 rounded-full overflow-hidden bg-ink shrink-0">
                                   {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover"/> : <Users size={14} className="m-auto text-chalk/20 mt-2"/>}
                                 </div>
                                 <span className="text-chalk truncate font-medium">{p.name}</span>
                               </div>
                               <span className="text-chalk font-mono font-bold shrink-0 bg-ink px-2 py-1 rounded-md">TK {p.soldPrice?.toLocaleString()}</span>
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
               <div className="text-center text-chalk opacity-80 relative z-10">
                 <Clock size={80} className="mx-auto mb-6 text-yellow-500" />
                 <h2 className="text-4xl font-display tracking-widest text-yellow-500">AUCTION PAUSED</h2>
                 <p className="mt-4 text-chalkMuted tracking-wider uppercase text-sm">Please wait for the auctioneer to resume</p>
               </div>
            ) : (
              <div className="w-full flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                <div className="w-64 h-64 rounded-3xl bg-ink border-2 border-chalk/10 overflow-hidden shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                   {activePlayer.imageUrl ? <img src={activePlayer.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-chalk/20"><Users size={64}/></div>}
                </div>
                <div className="flex-1 py-2 text-center md:text-left flex flex-col justify-between h-full min-h-[256px]">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Current Player
                    </div>
                    <h2 className="text-5xl md:text-6xl font-display text-chalk mb-3">{activePlayer.name}</h2>
                    <div className="text-sm text-chalkMuted uppercase tracking-widest mb-10 font-bold">Base Price: <span className="text-chalk">TK {(auctionState?.basePrice || 5000).toLocaleString()}</span></div>
                  </div>
                  
                  <div className="flex items-end justify-between bg-ink p-6 rounded-3xl border border-chalk/10 shadow-inner">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-2">Current Highest Bid</div>
                      <div className="text-6xl font-display text-emerald-400 tabular-nums font-bold drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">TK {currentBid?.toLocaleString()}</div>
                      <div className="text-sm font-bold text-chalk uppercase tracking-widest mt-2">{leadingTeam ? `by ${leadingTeam.name}` : 'No Bids Yet'}</div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-2 flex items-center gap-1">
                        <Clock size={14} /> Timer
                      </div>
                      <div className={`text-7xl font-display tabular-nums leading-none ${timer <= 5 ? 'text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-chalk'}`}>{timer}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Budgets Sidebar */}
          <div className="auction-sidebar bg-panel border border-chalk/10 p-6 rounded-[2rem] h-[600px] flex flex-col shadow-2xl">
            <h3 className="font-display tracking-widest text-xl mb-6 border-b border-chalk/10 pb-4 text-center">LIVE TEAM BUDGETS</h3>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {teams.map((t, idx) => {
                const TEAM_COLORS = ['#E8B84B', '#38BDF8', '#E4483B', '#A8AEB8', '#10B981', '#F472B6'];
                const color = TEAM_COLORS[idx % TEAM_COLORS.length];
                return (
                  <div key={t.id} className="bg-ink border border-chalk/10 p-4 rounded-xl flex items-center justify-between hover:border-chalk/20 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.05)] overflow-hidden bg-panel border border-chalk/5">
                        {t.logoUrl ? (
                          <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-chalk/30"><Shield size={14} /></div>
                        )}
                      </div>
                      <span className="font-bold text-chalk truncate max-w-[120px]" title={t.name}>{t.name}</span>
                    </div>
                    <div className="text-right shrink-0 pl-2 border-l border-chalk/5">
                      <div className="text-[10px] uppercase tracking-widest text-chalkMuted mb-0.5">Remaining</div>
                      <div className="font-display text-chalk tabular-nums text-lg font-bold">TK {t.remainingBudget?.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
