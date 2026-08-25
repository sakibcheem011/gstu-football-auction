'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { User, Coins, AlertCircle, Clock, CheckCircle2, Crown, EyeOff, Shield, ShieldAlert, Search, ListOrdered, ChevronRight, Activity, HandMetal, TrendingUp, Image as ImageIcon, X, Gavel } from 'lucide-react';
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
  const [hasFolded, setHasFolded] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isBidding, setIsBidding] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'auction' | 'database' | 'wishlist'>('auction');
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [logoDialog, setLogoDialog] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/login'); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL }/auth/me`, { headers: { Authorization: `Bearer ${t}` }})
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

    fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/config`).then(res => res.json()).then(data => setConfig(data)).catch(console.error);
    fetch(`${process.env.NEXT_PUBLIC_API_URL }/players/public`).then(res => res.json()).then(data => setAllPlayers(data)).catch(console.error);
    fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams/wishlist`, { headers: { Authorization: `Bearer ${t}` }})
      .then(res => res.json())
      .then(data => setWishlistIds(Array.isArray(data) ? data : []))
      .catch(console.error);
      
      // Refresh team data on player_sold event to update roster and budget
      const refreshInterval = setInterval(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/auth/me`, { headers: { Authorization: `Bearer ${t}` }})
        .then(res => res.json())
        .then(data => { if(data.team) setTeam(data.team); })
        .catch(console.error);
      }, 5000);
      return () => clearInterval(refreshInterval);
    }, [router]);
  
    useEffect(() => {
      if (config?.auctionMode === 'ROUND_ROBIN' && activeTab === 'auction') {
        setActiveTab('database');
      }
    }, [config?.auctionMode, activeTab]);

  const initSocket = (t: string) => {
    const s = io(`${process.env.NEXT_PUBLIC_API_URL }`, { auth: { token: t } });
    s.on('auction_state_sync', (data) => {
      if (auctionState?.activePlayer?.id !== data?.activePlayer?.id) {
        setHasFolded(false);
      }
      setAuctionState(data);
      setIsBidding(false);
    });
    s.on('auction_timer_tick', (data) => {
      setAuctionState((prev: any) => prev ? { ...prev, timer: data.timer } : null);
    });
    s.on('data_updated', () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL }/auth/me`, { headers: { Authorization: `Bearer ${t}` }})
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
    if (isBidding || hasFolded) return;
    setIsBidding(true);
    socket?.emit('place_bid', { amount });
  };

  const handleFold = () => {
    setHasFolded(true);
    socket?.emit('manager_pass');
  };

  const handleDraftPlayer = async (player: any) => {
    const t = localStorage.getItem('token');
    const toastId = toast.loading('Drafting player...');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/auction/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ playerId: player.id })
    });
    if (res.ok) {
      toast.success(`Drafted ${player.name} successfully!`, { id: toastId });
      // Remove from allPlayers or update status
      setAllPlayers(prev => prev.map(p => p.id === player.id ? { ...p, status: 'SOLD' } : p));
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to draft player', { id: toastId });
    }
  };

  const toggleWishlist = (playerId: string) => {
    const t = localStorage.getItem('token');
    if (!t) return;
    
    // Optimistic UI update
    setWishlistIds(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );

    fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams/wishlist/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ playerId })
    }).catch(console.error);
  };

  const uploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = localStorage.getItem('token');
    if (!logoFile || !t || !team) return;

    const formData = new FormData();
    formData.append('image', logoFile);

    const toastId = toast.loading('Uploading logo...');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams/${team.id}/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: formData
    });

    if (res.ok) {
      toast.success('Logo uploaded successfully!', { id: toastId });
      setLogoDialog(false);
      setLogoFile(null);
      // Fetch fresh team data
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/auth/me`, { headers: { Authorization: `Bearer ${t}` }}).then(r => r.json());
      if (data.team) setTeam(data.team);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to upload logo', { id: toastId });
    }
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
            <button 
              onClick={() => setLogoDialog(true)} 
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group transition-transform hover:scale-105 shadow-xl"
              title="Edit Team Logo"
            >
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                <ShieldAlert color={teamColor} />
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-ink/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <ImageIcon size={20} className="text-white drop-shadow-md" />
              </div>
            </button>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-0.5">
                Franchise Portal
              </div>
              <div className="text-xl md:text-2xl font-display text-white tracking-wide">{team.name}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-ink border border-white/10 rounded-2xl px-6 py-2 flex flex-col items-end">
              <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-1">Remaining Purse</div>
              <div className="text-2xl font-display tabular-nums text-white">TK {team.remainingBudget.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 pb-4">
          <div className="flex gap-2 relative">
            {(['auction', 'database', 'wishlist'] as const)
              .filter(tab => !(tab === 'auction' && config?.auctionMode === 'ROUND_ROBIN'))
              .map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 ${activeTab === tab ? 'text-white' : 'text-chalkMuted hover:text-chalk hover:bg-panelLight'}`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeManagerTab"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === 'auction' && <Gavel size={16} />}
                  {tab === 'database' && <Search size={16} />}
                  {tab === 'wishlist' && <ListOrdered size={16} />}
                  {tab === 'auction' ? 'Live Auction' : tab === 'database' ? 'Players' : 'Wishlist'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Logo Upload Modal */}
      <AnimatePresence>
        {logoDialog && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-panel border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button onClick={() => { setLogoDialog(false); setLogoFile(null); }} className="absolute top-6 right-6 text-chalkMuted hover:text-white transition">
                <X size={24} />
              </button>
              
              <h2 className="text-xl font-display text-white mb-2">Upload Team Logo</h2>
              <p className="text-xs text-chalkMuted uppercase tracking-widest mb-6">Choose an image file for {team.name}</p>
              
              <form onSubmit={uploadLogo} className="space-y-4">
                <div className="space-y-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    required 
                    onChange={e => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-chalkMuted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition cursor-pointer"
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full px-8 py-3.5 bg-white text-black hover:bg-white text-black text-ink rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg">
                    Upload Logo
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {activeTab === 'auction' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Live Auction Area */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-panel p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px] shadow-2xl">
                {mode === 'BLIND' && (
                  <div className="absolute top-6 left-6 bg-panelLight text-chalkMuted border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md">
                    <EyeOff size={16} /> Blind Mode
                  </div>
                )}
                
                {!auctionState || status === 'IDLE' || !activePlayer ? (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-panelLight rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <Crown size={32} className="text-chalkMuted" />
                    </div>
                    <h2 className="text-3xl tracking-widest font-display text-white uppercase mb-2">Standby</h2>
                    <p className="text-sm text-chalkMuted tracking-wider uppercase font-semibold">Waiting for auctioneer</p>
                  </div>
                ) : status === 'PAUSED' ? (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20">
                      <AlertCircle size={32} className="text-white" />
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
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 whitespace-nowrap overflow-hidden text-ellipsis max-w-[90%] text-center">
                          {activePlayer.positions?.sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map((pos: any) => `${pos.position}${pos.isPrimary ? '' : ' (S)'}`).join(', ') || 'PLY'}
                        </div>
                      </motion.div>
                      
                      <div className="flex-1 flex flex-col justify-between py-2 min-w-0">
                        <div>
                          <div className="text-xs uppercase tracking-widest text-white font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                            <span className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> Live Now
                          </div>
                          <h2 className="text-4xl md:text-5xl font-display text-white tracking-wide mb-2 truncate">{activePlayer.name}</h2>
                          <div className="text-sm text-chalkMuted uppercase tracking-wider font-semibold">Base Price: TK {basePrice.toLocaleString('en-IN')}</div>
                        </div>
                        
                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center sm:items-end border-t border-white/10 pt-6 gap-6">
                          <div className="text-center sm:text-left">
                            <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-2">Current Highest Bid</div>
                            <div className="text-4xl md:text-5xl font-display text-white tabular-nums">
                              {mode === 'BLIND' && !isLeading ? '???' : `TK ${currentBid.toLocaleString('en-IN')}`}
                            </div>
                            {isLeading && (
                              <motion.div initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} className="text-white font-bold uppercase text-xs mt-3 tracking-widest flex items-center justify-center sm:justify-start gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 w-fit sm:mx-0 mx-auto">
                                <CheckCircle2 size={14} /> You are leading
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="text-center sm:text-right flex flex-col items-center sm:items-end shrink-0">
                            <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-2 flex items-center gap-1.5">
                              <Clock size={12} /> Timer
                            </div>
                            <div className={`text-6xl font-display tabular-nums leading-none ${timer <= 5 ? 'text-chalkMuted' : 'text-white'}`}>
                              {timer}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bidding Controls */}
                    <div className="mt-12">
                      <div className="flex gap-4">
                        <motion.button
                          whileHover={(!isLeading && canAfford && !isBidding && !hasFolded) ? { scale: 1.02 } : {}}
                          whileTap={(!isLeading && canAfford && !isBidding && !hasFolded) ? { scale: 0.98 } : {}}
                          onClick={() => handleBid(nextBidAmount)}
                          disabled={isLeading || !canAfford || isBidding || hasFolded}
                          className={`flex-1 py-6 rounded-2xl font-display text-3xl md:text-4xl tracking-widest uppercase transition-all flex items-center justify-center gap-4 ${
                            isLeading 
                              ? 'bg-white/10 text-white border border-white/20 '
                              : !canAfford 
                                ? 'bg-panelLight text-chalkMuted border border-white/5 opacity-50 cursor-not-allowed'
                                : hasFolded
                                  ? 'bg-panelLight text-chalkMuted border border-white/10 opacity-50 cursor-not-allowed'
                                  : 'bg-white text-black text-ink hover:bg-zinc-200 hover:text-black shadow-[0_8px_30px_rgba(244,196,83,0.3)]'
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
                          ) : hasFolded ? (
                            'Folded'
                          ) : (
                            <>
                              Bid TK {nextBidAmount.toLocaleString('en-IN')}
                            </>
                          )}
                        </motion.button>

                        {!isLeading && canAfford && !hasFolded && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleFold}
                            className="px-8 py-6 rounded-2xl font-display text-xl tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-1 bg-panelLight text-chalkMuted hover:bg-panelLight hover:text-chalkMuted border border-white/10 hover:border-white/10 shrink-0"
                          >
                            <AlertCircle size={24} />
                            Fold
                          </motion.button>
                        )}
                      </div>
                      
                      {!isLeading && canAfford && !isBidding && !hasFolded && (
                        <div className="mt-4 flex flex-col md:flex-row gap-4 items-center">
                          <div className="relative flex-1 w-full group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-chalkMuted font-bold">TK</span>
                            <input 
                              type="text" 
                              value={bidAmount}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if (val) {
                                  setBidAmount(parseInt(val, 10).toLocaleString('en-IN'));
                                } else {
                                  setBidAmount('');
                                }
                              }}
                              placeholder="Custom Amount..."
                              className="w-full h-14 bg-ink border border-white/5 rounded-xl pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-ink shadow-inner transition-all font-display tracking-widest"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const amount = parseInt(bidAmount.replace(/,/g, ''), 10);
                              if (amount >= nextBidAmount && amount <= team.remainingBudget) {
                                handleBid(amount);
                                setBidAmount('');
                              } else if (amount > team.remainingBudget) {
                                toast.error(`Insufficient funds. Your remaining purse is TK ${team.remainingBudget.toLocaleString('en-IN')}`);
                              } else {
                                toast.error(`Custom bid must be at least TK ${nextBidAmount.toLocaleString('en-IN')}`);
                              }
                            }}
                            disabled={!bidAmount || isBidding}
                            className="h-14 w-full md:w-auto px-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold tracking-widest uppercase transition-all disabled:opacity-50 border border-white/10 shrink-0"
                          >
                            Custom Bid
                          </button>
                        </div>
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
                          className={`flex justify-between items-center text-sm p-3 rounded-xl border ${idx === 0 ? 'bg-white/10 border-white/20' : 'bg-ink border-white/5'}`}
                        >
                          <span className={`font-bold tracking-wide ${idx === 0 ? 'text-white' : 'text-white'}`}>{bid.teamName}</span>
                          <span className={`font-display tracking-widest ${idx === 0 ? 'text-white' : 'text-chalkMuted'}`}>TK {bid.amount.toLocaleString('en-IN')}</span>
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
                        <div className="text-white font-display tracking-wider text-sm tabular-nums">TK {p.soldPrice?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-chalkMuted opacity-50 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-panelLight flex items-center justify-center">
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
          <div className="w-full">
            {config?.auctionMode === 'ROUND_ROBIN' && config?.draftOrder?.[config?.currentDraftTurn] === team?.id && (
               <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-4 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                 <ListOrdered size={24} />
                 <span className="font-bold uppercase tracking-widest text-sm">It's Your Turn to Draft!</span>
               </div>
            )}
            <PlayerDirectory 
              players={allPlayers} 
              showStatusFilter={true}
              enablePlayerModal={true}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
              showWishlistFilter={false}
              onAction={config?.auctionMode === 'ROUND_ROBIN' ? handleDraftPlayer : undefined}
              actionLabel="DRAFT"
              actionIcon={<ListOrdered size={16} />}
              actionCondition={(p) => p.status === 'UNSOLD' && config?.auctionMode === 'ROUND_ROBIN' && config?.draftOrder?.[config?.currentDraftTurn] === team?.id}
            />
          </div>
        ) : (
          <div className="w-full">
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



