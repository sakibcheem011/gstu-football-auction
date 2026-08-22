'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Gavel, Play, Pause, Plus, CheckCircle2, Search, X, RotateCcw, Clock, PlayCircle, XOctagon, Activity, ChevronRight, TrendingUp } from 'lucide-react';
import PlayerDirectory from '../../components/PlayerDirectory';
import { io, Socket } from 'socket.io-client';

export default function AdminAuctionDashboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [auctionState, setAuctionState] = useState<any>(null);
  
  const [manualBidAmount, setManualBidAmount] = useState<number>(0);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [config, setConfig] = useState<any>(null);
  
  const [selectedForPodium, setSelectedForPodium] = useState<any>(null);
  const [timerDuration, setTimerDuration] = useState<number>(60);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const fetchPlayers = async () => {
    if (!token) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auction/players`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setPlayers(data);
  };

  const fetchTeams = async () => {
    if (!token) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/teams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setTeams(data);
  };

  useEffect(() => {
    if (token) {
      fetchPlayers();
      fetchTeams();
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/rules/config`).then(res => res.json()).then(data => {
        setConfig(data);
        if (data?.defaultTimer) setTimerDuration(data.defaultTimer);
      }).catch(console.error);
      
      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`, {
        auth: { token }
      });
      
      newSocket.on('auction_state_sync', (state) => {
        setAuctionState(state);
        if (state.activePlayer && state.currentBid) {
          setManualBidAmount(state.currentBid + 500); // Default next bid increment
        }
      });
      
      newSocket.on('auction_timer_tick', (data) => {
        setAuctionState((prev: any) => prev ? { ...prev, timer: data.timer } : prev);
      });
      
      newSocket.on('data_updated', () => {
        fetchPlayers();
        fetchTeams();
      });
      
      newSocket.on('manager_passed', (data: { teamId: string, teamName: string }) => {
        toast.custom((t) => (
          <div className="bg-ink border-2 border-zinc-700 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4">
            <XOctagon className="text-zinc-400" size={24} />
            <div>
              <div className="font-bold uppercase tracking-widest text-sm text-zinc-400">{data.teamName}</div>
              <div className="text-xs text-chalkMuted">Has passed on the current player</div>
            </div>
          </div>
        ), { duration: 5000 });
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [token]);

  const startAuction = async (playerId: string, timer: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auction/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ playerId, timer })
    });
    if (res.ok) {
      toast.success('Auction started! Player is on the podium.');
      setSelectedForPodium(null);
      fetchPlayers();
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  const cancelAuction = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auction/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success('Auction Cancelled');
      fetchPlayers();
    } else {
      toast.error('Failed to cancel auction');
    }
  };

  const sellPlayer = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auction/sell`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success('Player Sold! Hammer dropped.');
      fetchPlayers();
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  const markUnsold = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auction/unsold`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.error('Marked Unsold');
      fetchPlayers();
    }
  };

  const handleManualBid = () => {
    if (!socket || !selectedTeamId || manualBidAmount <= 0) return;
    const team = teams.find(t => t.id === selectedTeamId);
    if (!team) return;
    
    socket.emit('podium_manual_bid', { teamId: team.id, teamName: team.name, amount: manualBidAmount });
  };

  if (!token) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 font-sans text-chalk relative overflow-hidden bg-ink">
      <h1 className="text-4xl font-display text-zinc-400 mb-4 tracking-widest uppercase">ACCESS DENIED</h1>
      <p className="text-chalkMuted">Please login as Super Admin to access the Auctioneer Console.</p>
    </div>
  );

  const isActive = auctionState && auctionState.status !== 'IDLE' && auctionState.activePlayer;

  return (
    <div className="flex-1 p-6 md:p-10 text-chalk font-body relative z-0 flex flex-col">
      <div className={`absolute top-0 left-0 w-full h-96 transition-colors duration-1000 -z-10 ${isActive ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-ink to-ink' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/5 via-ink to-ink'}`} />

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col pt-4">
        <div className="flex justify-end mb-4">
          <Link href="/admin">
            <button className="px-6 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 font-bold transition text-sm">
              Back to Admin
            </button>
          </Link>
        </div>
        {/* Header */}
        <div className="bg-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-white/20">
              <Activity className="text-white" size={28} />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-white tracking-wide flex items-center gap-3">
                Auctioneer Console
              </h1>
              <p className="text-danger mt-1 tracking-wider uppercase text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> Live Broadcast Control
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <motion.button 
              whileHover={{ scale: isActive ? 1.02 : 1 }}
              whileTap={{ scale: isActive ? 0.98 : 1 }}
              onClick={sellPlayer} 
              disabled={!isActive}
              className={`px-8 py-3.5 rounded-xl font-bold transition-all uppercase tracking-widest flex items-center gap-2 text-sm ${isActive ? 'bg-white text-black text-ink shadow-[0_4px_20px_rgba(244,196,83,0.3)] hover:bg-zinc-200 hover:text-black cursor-pointer' : 'bg-white/5 text-chalkMuted cursor-not-allowed border border-white/5'}`}
            >
              <Gavel size={18} /> Final Sale
            </motion.button>
            <motion.button 
              whileHover={{ scale: isActive ? 1.02 : 1 }}
              whileTap={{ scale: isActive ? 0.98 : 1 }}
              onClick={markUnsold} 
              disabled={!isActive}
              className={`px-6 py-3.5 rounded-xl font-bold transition-all uppercase tracking-widest flex items-center gap-2 text-sm ${isActive ? 'bg-panel border border-zinc-700 text-zinc-400 hover:bg-white/5 shadow-[0_4px_20px_rgba(228,72,59,0.15)] cursor-pointer' : 'bg-white/5 text-chalkMuted border border-white/5 cursor-not-allowed'}`}
            >
              <XOctagon size={18} /> Mark Unsold
            </motion.button>
            <motion.button 
              whileHover={{ scale: isActive ? 1.02 : 1 }}
              whileTap={{ scale: isActive ? 0.98 : 1 }}
              onClick={cancelAuction} 
              disabled={!isActive}
              className={`px-6 py-3.5 rounded-xl font-bold transition-all uppercase tracking-widest flex items-center gap-2 text-sm ${isActive ? 'bg-panel border border-white/10 text-white hover:bg-white/5 cursor-pointer' : 'bg-white/5 text-chalkMuted border border-white/5 cursor-not-allowed'}`}
            >
              <X size={18} /> Cancel
            </motion.button>
          </div>
        </div>

        {isActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Active Player Broadcast Display */}
            <div className="lg:col-span-8 bg-panel p-8 md:p-12 rounded-3xl border border-white/10 flex flex-col items-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-6 flex gap-3">
                <div className="bg-ink/80 backdrop-blur-md px-4 py-1.5 rounded-full font-display text-xs tracking-widest uppercase border border-white/10 text-chalk flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${auctionState.status === 'ACTIVE' ? 'bg-white' : 'bg-white text-black'}`} />
                  {auctionState.status}
                </div>
              </div>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="w-56 h-56 rounded-full p-2 border-2 border-white/20 mb-8 bg-ink/50 relative group"
              >
                <div className="absolute inset-0 rounded-full border-t-2 border-white animate-[spin_4s_linear_infinite]" />
                <img src={auctionState.activePlayer.imageUrl} alt={auctionState.activePlayer.name} className="w-full h-full rounded-full object-cover shadow-2xl" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-black text-ink font-bold px-5 py-1.5 rounded-full text-xs uppercase tracking-widest shadow-lg">
                  {auctionState.activePlayer.positions?.sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map((p: any) => `${p.position}${p.isPrimary ? '' : ' (S)'}`).join(', ') || 'N/A'}
                </div>
              </motion.div>
              
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-display text-white tracking-wide mb-3">{auctionState.activePlayer.name}</h2>
                <div className="flex items-center justify-center gap-3">
                  {auctionState.activePlayer.category && (
                    <span className="bg-white/5 text-white border border-white/10 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                      {auctionState.activePlayer.category.name}
                    </span>
                  )}
                  <span className="text-chalkMuted tracking-wider uppercase text-sm font-semibold">
                    {auctionState.activePlayer.jerseyName} • ID: {auctionState.activePlayer.studentId}
                  </span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-ink border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <span className="text-xs uppercase tracking-widest text-chalkMuted mb-2 font-semibold">Current Bid</span>
                  <div className="flex items-end gap-2">
                    <span className="text-sm font-bold text-white mb-2">TK</span>
                    <span className="text-5xl font-display text-white tracking-tight">{auctionState.currentBid?.toLocaleString() || 0}</span>
                  </div>
                  <span className="text-sm uppercase tracking-wider text-white mt-3 font-bold flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                    {auctionState.bidHistory?.[0]?.teamName || 'NO BIDS YET'}
                  </span>
                </div>
                
                <div className={`bg-ink border rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${auctionState.timer <= 5 ? 'border-white/10 bg-white/5' : 'border-white/5'}`}>
                  {auctionState.timer <= 5 && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
                  <span className="text-xs uppercase tracking-widest text-chalkMuted mb-2 font-semibold z-10">Time Remaining</span>
                  <div className="flex items-end gap-1 z-10">
                    <span className={`text-6xl font-display tracking-tight tabular-nums ${auctionState.timer <= 5 ? 'text-zinc-400' : 'text-white'}`}>
                      {auctionState.timer}
                    </span>
                    <span className={`text-xl font-bold mb-2 ${auctionState.timer <= 5 ? 'text-zinc-400' : 'text-chalkMuted'}`}>s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panel: Controls & History */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              
              {/* Timer Controls */}
              <div className="bg-panel p-6 rounded-3xl border border-white/10 shadow-xl">
                <h3 className="text-xs uppercase tracking-widest font-bold text-chalkMuted mb-4 flex items-center gap-2">
                  <Clock size={16} /> Timer Controls
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {auctionState.status === 'ACTIVE' ? (
                    <button onClick={() => socket?.emit('podium_pause')} className="py-3.5 bg-ink border border-white/10 hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                      <Pause size={16} /> Pause
                    </button>
                  ) : (
                    <button onClick={() => socket?.emit('podium_resume')} className="py-3.5 bg-white text-black hover:bg-zinc-200 hover:text-black text-ink rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                      <Play size={16} /> Resume
                    </button>
                  )}
                  {!config?.timerLocked && (
                    <button onClick={() => socket?.emit('podium_extend_timer', { seconds: 15 })} className="py-3.5 bg-ink border border-white/10 hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-chalk">
                      <Plus size={16} /> Add 15s
                    </button>
                  )}
                </div>
              </div>

              {/* Admin Override */}
              <div className="bg-panel p-6 rounded-3xl border border-white/10 shadow-xl">
                <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                  <RotateCcw size={16} /> Admin Override
                </h3>
                
                <button 
                  onClick={() => socket?.emit('podium_rollback_bid')}
                  className="w-full py-3.5 bg-white/5 text-zinc-400 hover:bg-white/5 border border-white/10 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw size={16} /> Undo Last Bid
                </button>
              </div>
              
              {/* Bid History Feed */}
              <div className="bg-panel p-6 rounded-3xl border border-white/10 shadow-xl flex-1 flex flex-col overflow-hidden min-h-[250px]">
                <h3 className="text-xs uppercase tracking-widest font-bold text-chalkMuted mb-4 flex items-center gap-2">
                  <TrendingUp size={16} /> Live Bid History
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  <AnimatePresence initial={false}>
                    {auctionState.bidHistory?.map((bid: any, index: number) => (
                      <motion.div 
                        key={`${bid.teamId}-${bid.amount}-${index}`}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`p-4 rounded-xl border ${index === 0 ? 'bg-white/10 border-white/20' : 'bg-ink border-white/5'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-bold uppercase tracking-wider ${index === 0 ? 'text-white' : 'text-chalk'}`}>
                            {bid.teamName}
                          </span>
                          <span className={`font-display tracking-wider ${index === 0 ? 'text-white' : 'text-chalkMuted'}`}>
                            TK {bid.amount.toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {(!auctionState.bidHistory || auctionState.bidHistory.length === 0) && (
                      <div className="flex flex-col items-center justify-center h-full text-chalkMuted opacity-50 space-y-2 pt-10">
                        <Gavel size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest">No Bids Yet</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-panel rounded-3xl border border-white/10 p-8 shadow-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ink border border-white/10 flex items-center justify-center">
                  <Users className="text-chalk" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-display uppercase tracking-wide text-white">Player Queue</h2>
                  <p className="text-xs text-chalkMuted font-semibold uppercase tracking-wider">{players.length} Players Available</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <PlayerDirectory 
                players={players} 
                onAction={(p) => {
                  setSelectedForPodium(p);
                  if (config?.defaultTimer) setTimerDuration(config.defaultTimer);
                }}
                actionLabel="Send to Podium"
                actionIcon={<ChevronRight size={16} />}
                showStatusFilter={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Timer Modal */}
      <AnimatePresence>
        {selectedForPodium && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-panel border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedForPodium(null)}
                className="absolute top-4 right-4 p-2 text-chalkMuted hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-ink border-2 border-white/20 p-1 mb-4">
                  <img src={selectedForPodium.imageUrl} alt={selectedForPodium.name} className="w-full h-full rounded-full object-cover" />
                </div>
                <h2 className="text-2xl font-display text-white mb-1 tracking-wide">{selectedForPodium.name}</h2>
                <p className="text-xs text-chalkMuted uppercase tracking-widest font-semibold">Start Auction</p>
              </div>
              
              <div className="bg-ink rounded-2xl p-6 border border-white/5 mb-6">
                <label className="text-[10px] uppercase tracking-widest font-bold text-chalkMuted mb-4 flex items-center justify-center gap-2">
                  <Clock size={12} /> Set Timer {config?.timerLocked && <span className="text-white">(Locked)</span>}
                </label>
                <div className="flex items-center justify-center gap-3">
                  <button 
                    disabled={config?.timerLocked} 
                    onClick={() => setTimerDuration(Math.max(15, timerDuration - 15))} 
                    className="w-10 h-10 rounded-xl bg-panel border border-white/5 hover:border-white/20 disabled:opacity-30 text-white flex items-center justify-center transition shrink-0"
                  >-</button>
                  <input 
                    type="number" 
                    disabled={config?.timerLocked}
                    value={timerDuration || ''} 
                    onChange={(e) => setTimerDuration(parseInt(e.target.value) || 0)} 
                    className="w-24 bg-transparent text-center text-4xl font-display text-white tabular-nums outline-none hide-arrows disabled:opacity-50" 
                  />
                  <button 
                    disabled={config?.timerLocked} 
                    onClick={() => setTimerDuration(timerDuration + 15)} 
                    className="w-10 h-10 rounded-xl bg-panel border border-white/5 hover:border-white/20 disabled:opacity-30 text-white flex items-center justify-center transition shrink-0"
                  >+</button>
                </div>
              </div>
              
              <button 
                onClick={() => startAuction(selectedForPodium.id, timerDuration)}
                className="w-full py-4 bg-white text-black hover:bg-zinc-200 hover:text-black text-ink rounded-xl font-bold uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(244,196,83,0.3)] flex justify-center items-center gap-2"
              >
                <Play size={18} /> Confirm Start
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

