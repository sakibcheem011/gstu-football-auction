'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { User, Coins, AlertCircle, Clock, CheckCircle2, Crown, EyeOff, Shield, Search, ListOrdered, ChevronRight, Activity, HandMetal, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerDirectory from '../../components/PlayerDirectory';
import WishlistPanel from '../../components/WishlistPanel';

export default function ManagerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [auctionState, setAuctionState] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isBidding, setIsBidding] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'auction' | 'database' | 'wishlist'>('auction');
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/login'); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/me`, { headers: { Authorization: `Bearer ${t}` }})
      .then(res => res.json())
      .then(data => {
        if (data.role !== 'TEAM_MANAGER' || !data.team) {
          router.push('/login');
        } else {
          setUser(data);
          setTeam(data.team);
          setLoading(false);
          initSocket(t);
        }
      }).catch(() => router.push('/login'));

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/rules/config`).then(res => res.json()).then(data => setConfig(data)).catch(console.error);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/players/public`).then(res => res.json()).then(data => setAllPlayers(data)).catch(console.error);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/teams/wishlist`, { headers: { Authorization: `Bearer ${t}` }})
      .then(res => res.json())
      .then(data => setWishlistIds(Array.isArray(data) ? data : []))
      .catch(console.error);
      
    // Refresh team data on player_sold event to update roster and budget
    const refreshInterval = setInterval(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/me`, { headers: { Authorization: `Bearer ${t}` }})
      .then(res => res.json())
      .then(data => { if(data.team) setTeam(data.team); })
      .catch(console.error);
    }, 5000);
    return () => clearInterval(refreshInterval);
  }, [router]);

  const initSocket = (t: string) => {
    const s = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`, { auth: { token: t } });
    s.on('auction_state_sync', (data) => {
      setAuctionState(data);
      setIsBidding(false);
    });
    s.on('auction_timer_tick', (data) => {
      setAuctionState((prev: any) => prev ? { ...prev, timer: data.timer } : null);
    });
    s.on('data_updated', () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/me`, { headers: { Authorization: `Bearer ${t}` }})
        .then(res => res.json())
        .then(data => { if(data.team) setTeam(data.team); })
        .catch(console.error);
    });
    s.on('bid_error', (data) => {
      toast.error(data.message);
      setIsBidding(false);
    });
    setSocket(s);
  };

  const handleBid = (amount: number) => {
    if (isBidding) return;
    setIsBidding(true);
    socket?.emit('place_bid', { amount });
  };

  const toggleWishlist = (playerId: string) => {
    const t = localStorage.getItem('token');
    if (!t) return;
    
    // Optimistic UI update
    setWishlistIds(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/teams/wishlist/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ playerId })
    }).catch(console.error);
  };

  if (loading || !team) return <div className="min-h-screen bg-ink flex items-center justify-center p-10 text-chalk text-2xl font-display uppercase tracking-widest">INITIALIZING MANAGER CONSOLE...</div>;

  const TEAM_COLORS = ['#E8B84B', '#38BDF8', '#E4483B', '#A8AEB8', '#10B981', '#F472B6'];
  const teamColor = TEAM_COLORS[0]; // You can derive this if team color is stored in DB

  const { activePlayer, status, currentBid, highestBidderTeamId, timer, mode, bidHistory } = auctionState || {};
  const isLeading = highestBidderTeamId === team.id;
  
  // Calculate recommended next bid
  const basePrice = auctionState?.basePrice || 5000;
  const nextBidAmount = auctionState?.nextValidBid || basePrice;
  
  const canAfford = nextBidAmount <= team.remainingBudget;

  return (
    <div className="flex flex-col min-h-screen bg-ink text-chalk font-body">
      {/* Header */}
      <header className="border-b border-white/10 bg-panel/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
              <ShieldAlert color={teamColor} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-0.5">Franchise Portal</div>
              <div className="text-xl md:text-2xl font-display text-white tracking-wide">{team.name}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-ink border border-white/10 rounded-2xl px-6 py-2 flex flex-col items-end">
              <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-1">Remaining Purse</div>
              <div className="text-2xl font-display tabular-nums text-gold">TK {team.remainingBudget.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 pb-4">
          <div className="flex gap-2 relative">
            {(['auction', 'database', 'wishlist'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 ${activeTab === tab ? 'text-white' : 'text-chalkMuted hover:text-chalk hover:bg-white/5'}`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeManagerTab"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === 'auction' && <Activity size={16} />}
                  {tab === 'database' && <Search size={16} />}
                  {tab === 'wishlist' && <ListOrdered size={16} />}
                  {tab === 'auction' ? 'Live Auction' : tab === 'database' ? 'Database' : 'Wishlist'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {activeTab === 'auction' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Live Auction Area */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-panel p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px] shadow-2xl">
                {mode === 'BLIND' && (
                  <div className="absolute top-6 left-6 bg-danger/10 text-danger border border-danger/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md">
                    <EyeOff size={16} /> Blind Mode
                  </div>
                )}
                
                {!auctionState || status === 'IDLE' || !activePlayer ? (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <Crown size={32} className="text-chalkMuted" />
                    </div>
                    <h2 className="text-3xl tracking-widest font-display text-white uppercase mb-2">Standby</h2>
                    <p className="text-sm text-chalkMuted tracking-wider uppercase font-semibold">Waiting for auctioneer</p>
                  </div>
                ) : status === 'PAUSED' ? (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-gold/10 rounded-full flex items-center justify-center mb-6 border border-gold/20">
                      <AlertCircle size={32} className="text-gold" />
                    </div>
                    <h2 className="text-3xl tracking-widest font-display text-white uppercase mb-2">Paused</h2>
                    <p className="text-sm text-chalkMuted tracking-wider uppercase font-semibold">Auction temporarily paused</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-48 h-48 rounded-3xl bg-ink border-2 border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl relative"
                      >
                        {activePlayer.imageUrl ? (
                          <img src={activePlayer.imageUrl} alt={activePlayer.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="text-white/20" size={64} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                          {activePlayer.positions?.[0]?.position || 'PLY'}
                        </div>
                      </motion.div>
                      
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div>
                          <div className="text-xs uppercase tracking-widest text-gold font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" /> Live Now
                          </div>
                          <h2 className="text-4xl md:text-5xl font-display text-white tracking-wide mb-2">{activePlayer.name}</h2>
                          <div className="text-sm text-chalkMuted uppercase tracking-wider font-semibold">Base Price: TK {basePrice.toLocaleString()}</div>
                        </div>
                        
                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center sm:items-end border-t border-white/10 pt-6 gap-6">
                          <div className="text-center sm:text-left">
                            <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-2">Current Highest Bid</div>
                            <div className="text-4xl md:text-5xl font-display text-white tabular-nums">
                              {mode === 'BLIND' && !isLeading ? '???' : `TK ${currentBid.toLocaleString()}`}
                            </div>
                            {isLeading && (
                              <motion.div initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} className="text-emerald-400 font-bold uppercase text-xs mt-3 tracking-widest flex items-center justify-center sm:justify-start gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit sm:mx-0 mx-auto">
                                <CheckCircle2 size={14} /> You are leading
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                            <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-2 flex items-center gap-1.5">
                              <Clock size={12} /> Timer
                            </div>
                            <div className={`text-6xl font-display tabular-nums leading-none ${timer <= 5 ? 'text-danger' : 'text-gold'}`}>
                              {timer}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bidding Controls */}
                    <div className="mt-12">
                      <motion.button
                        whileHover={(!isLeading && canAfford && !isBidding) ? { scale: 1.02 } : {}}
                        whileTap={(!isLeading && canAfford && !isBidding) ? { scale: 0.98 } : {}}
                        onClick={() => handleBid(nextBidAmount)}
                        disabled={isLeading || !canAfford || isBidding}
                        className={`w-full py-6 rounded-2xl font-display text-3xl md:text-4xl tracking-widest uppercase transition-all flex items-center justify-center gap-4 ${
                          isLeading 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                            : !canAfford 
                              ? 'bg-white/5 text-chalkMuted border border-white/5 opacity-50 cursor-not-allowed'
                              : 'bg-gold text-ink hover:bg-yellow-400 shadow-[0_8px_30px_rgba(244,196,83,0.3)]'
                        }`}
                      >
                        {isBidding ? (
                          <>
                            <div className="w-8 h-8 border-4 border-ink/30 border-t-ink rounded-full animate-spin"></div>
                            Bidding...
                          </>
                        ) : isLeading ? (
                          <>
                            <CheckCircle2 size={32} /> Winning
                          </>
                        ) : !canAfford ? (
                          'Insufficient Funds'
                        ) : (
                          <>
                            <HandMetal size={32} /> Bid TK {nextBidAmount.toLocaleString()}
                          </>
                        )}
                      </motion.button>
                      {!isLeading && canAfford && !isBidding && (
                        <p className="text-center text-[10px] uppercase tracking-widest text-chalkMuted mt-4 font-bold">
                          Next valid bid increment applied automatically
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Roster & History */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-auto lg:h-[700px]">
              {/* Bid History (If active) */}
              {status === 'ACTIVE' && activePlayer && bidHistory && bidHistory.length > 0 && (
                <div className="bg-panel p-6 rounded-3xl border border-white/10 flex flex-col max-h-[250px] shadow-xl">
                  <div className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="flex items-center gap-2"><TrendingUp size={14} /> Bid History</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white">{bidHistory.length} Bids</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    <AnimatePresence initial={false}>
                      {[...bidHistory].reverse().slice(0, 8).map((bid: any, idx: number) => (
                        <motion.div 
                          key={`${bid.teamId}-${bid.amount}-${idx}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex justify-between items-center text-sm p-3 rounded-xl border ${idx === 0 ? 'bg-gold/10 border-gold/20' : 'bg-ink border-white/5'}`}
                        >
                          <span className={`font-bold tracking-wide ${idx === 0 ? 'text-gold' : 'text-white'}`}>{bid.teamName}</span>
                          <span className={`font-display tracking-widest ${idx === 0 ? 'text-white' : 'text-chalkMuted'}`}>TK {bid.amount.toLocaleString()}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Roster */}
              <div className="bg-panel p-6 rounded-3xl border border-white/10 flex flex-col flex-1 shadow-xl min-h-[400px]">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                  <h3 className="font-display text-xl text-white tracking-widest">Team Roster</h3>
                  <span className="bg-white/10 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{team.players?.length || 0}/15 Players</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                  {team.players?.length > 0 ? team.players.map((p: any) => (
                    <div key={p.id} className="bg-ink border border-white/5 p-3 rounded-2xl flex items-center gap-4 group hover:border-white/20 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-panel border border-white/5 overflow-hidden shrink-0">
                        {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <User className="text-white/20 p-2 w-full h-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold truncate text-sm">{p.name}</div>
                        <div className="text-[10px] text-chalkMuted uppercase tracking-widest mt-1 font-semibold">{p.positions?.[0]?.position || 'PLY'}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-chalkMuted uppercase tracking-widest mb-1 font-semibold">Bought For</div>
                        <div className="text-gold font-display tracking-wider text-sm tabular-nums">TK {p.soldPrice?.toLocaleString()}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-chalkMuted opacity-50 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <User size={24} />
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-bold">Roster is empty</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'database' ? (
          <div className="h-[calc(100vh-220px)]">
            <PlayerDirectory 
              players={allPlayers} 
              showStatusFilter={true}
              enablePlayerModal={true}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
              showWishlistFilter={false}
            />
          </div>
        ) : (
          <div className="h-[calc(100vh-220px)]">
            <WishlistPanel
              wishlistIds={wishlistIds}
              allPlayers={allPlayers}
              teamId={team?.id}
              remainingBudget={team?.remainingBudget || 0}
              onRemove={toggleWishlist}
            />
          </div>
        )}

      </div>
    </div>
  );
}

// Simple fallback icon
function ShieldAlert({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
