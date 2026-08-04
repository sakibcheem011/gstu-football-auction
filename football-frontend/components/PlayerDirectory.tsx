'use client';
import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, User, Tag, Calendar, UserCheck, CheckCircle2, Goal, ArrowRight, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from './Dropdown';

interface PlayerDirectoryProps {
  players: any[];
  onAction?: (player: any) => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  actionCondition?: (player: any) => boolean;
  onSecondaryAction?: (player: any) => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: React.ReactNode;
  secondaryActionCondition?: (player: any) => boolean;
  showStatusFilter?: boolean;
  wishlistIds?: string[];
  onToggleWishlist?: (playerId: string) => void;
  showWishlistFilter?: boolean;
  enablePlayerModal?: boolean; // Enable clicking card to view full profile
}

export default function PlayerDirectory({ 
  players, onAction, actionLabel, actionIcon, actionCondition,
  onSecondaryAction, secondaryActionLabel, secondaryActionIcon, secondaryActionCondition,
  showStatusFilter = true,
  wishlistIds = [],
  onToggleWishlist,
  showWishlistFilter = false,
  enablePlayerModal = false
}: PlayerDirectoryProps) {
  const [search, setSearch] = useState('');
  const [session, setSession] = useState('');
  const [category, setCategory] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [showWishlistedOnly, setShowWishlistedOnly] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  // Extract unique options from players data
  const sessionOptions = useMemo(() => {
    const sessions = Array.from(new Set(players.map(p => p.sessionId).filter(Boolean)));
    return [{ label: 'All Sessions', value: '' }, ...sessions.map(s => ({ label: `Session ${s}`, value: s as string }))];
  }, [players]);

  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(players.map(p => p.category?.name).filter(Boolean)));
    return [{ label: 'All Tiers', value: '' }, ...cats.map(c => ({ label: c as string, value: c as string }))];
  }, [players]);

  const positionOptions = useMemo(() => {
    const posSet = new Set<string>();
    players.forEach(p => {
      p.positions?.forEach((pos: any) => posSet.add(pos.position));
    });
    return [{ label: 'All Positions', value: '' }, ...Array.from(posSet).map(p => ({ label: p, value: p }))];
  }, [players]);

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Unsold', value: 'UNSOLD' },
    { label: 'Sold', value: 'SOLD' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Pending', value: 'PENDING' }
  ];

  const sortOptions = [
    { label: 'Default Sorting', value: '' },
    { label: 'Price (High to Low)', value: 'price_desc' },
    { label: 'Price (Low to High)', value: 'price_asc' },
    { label: 'Name (A to Z)', value: 'name_asc' },
  ];

  const filteredAndSortedPlayers = useMemo(() => {
    let result = [...players];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.studentId.includes(q) || p.jerseyName?.toLowerCase().includes(q));
    }

    // Filters
    if (session) result = result.filter(p => p.sessionId === session);
    if (category) result = result.filter(p => p.category?.name === category);
    if (status) result = result.filter(p => p.status === status);
    if (position) result = result.filter(p => p.positions?.some((pos: any) => pos.position === position));
    if (showWishlistedOnly) result = result.filter(p => wishlistIds.includes(p.id));

    // Sort
    if (sortOrder === 'price_desc') {
      result.sort((a, b) => (b.soldPrice || b.category?.basePrice || 0) - (a.soldPrice || a.category?.basePrice || 0));
    } else if (sortOrder === 'price_asc') {
      result.sort((a, b) => (a.soldPrice || a.category?.basePrice || 0) - (b.soldPrice || b.category?.basePrice || 0));
    } else if (sortOrder === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [players, search, session, category, position, status, sortOrder]);

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="glass-panel relative z-40 p-6 rounded-[2rem] border-white/10 bg-white/[0.02] flex flex-col gap-4">
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-chalkMuted" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, student ID, or jersey..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 bg-ink/80 border border-white/10 rounded-xl pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          
          <div className="w-full md:w-64">
            <Dropdown 
              options={sortOptions} 
              value={sortOrder} 
              onChange={setSortOrder} 
              placeholder="Sort By..." 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
          <Dropdown options={categoryOptions} value={category} onChange={setCategory} placeholder="Any Tier" />
          <Dropdown options={positionOptions} value={position} onChange={setPosition} placeholder="Any Position" />
          <Dropdown options={sessionOptions} value={session} onChange={setSession} placeholder="Any Session" />
          {showStatusFilter && (
             <Dropdown options={statusOptions} value={status} onChange={setStatus} placeholder="Any Status" />
          )}
          {showWishlistFilter && (
            <button 
              onClick={() => setShowWishlistedOnly(!showWishlistedOnly)}
              className={`h-12 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
                showWishlistedOnly 
                  ? 'bg-gold text-ink border border-gold' 
                  : 'bg-white/5 text-chalk hover:bg-white/10 border border-white/10'
              }`}
            >
              <Star size={16} className={showWishlistedOnly ? 'fill-ink' : ''} />
              {showWishlistedOnly ? 'Wishlist Only' : 'All Players'}
            </button>
          )}
        </div>

      </div>

      {/* Results Meta */}
      <div className="flex justify-between items-center px-2">
        <div className="text-sm text-chalkMuted uppercase tracking-widest font-bold">
          Showing <span className="text-white">{filteredAndSortedPlayers.length}</span> players
        </div>
      </div>

      {/* Player Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[400px]">
        {filteredAndSortedPlayers.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredAndSortedPlayers.map(p => {
              const isWishlisted = wishlistIds.includes(p.id);
              return (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={p.id} 
                className={`glass-panel p-5 rounded-2xl flex flex-col group transition-all duration-300 ${enablePlayerModal ? 'cursor-pointer hover:border-gold/40 hover:shadow-xl' : ''}`}
                onClick={() => enablePlayerModal && setSelectedPlayer(p)}
              >
                <div className="flex items-start gap-4 mb-4 relative">
                  {onToggleWishlist && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }}
                      className={`absolute top-0 right-0 p-2 rounded-xl transition-all z-10 ${
                        isWishlisted ? 'bg-gold/20 text-gold hover:bg-gold/30' : 'bg-white/5 text-chalkMuted hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Star size={15} className={isWishlisted ? 'fill-gold' : ''} />
                    </button>
                  )}

                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 relative group-hover:border-gold/30 transition-colors">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={22} className="m-auto text-chalkMuted/40 mt-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-bold text-white text-base truncate group-hover:text-gold transition-colors">{p.name}</h3>
                    <div className="text-xs text-chalkMuted truncate mt-0.5">{p.studentId} • Session {p.sessionId}</div>
                    
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-semibold text-chalkMuted">{p.category?.name || 'Uncategorized'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide ${
                        p.status === 'SOLD' ? 'bg-gold/10 text-gold border border-gold/20' : 
                        p.status === 'UNSOLD' ? 'bg-danger/10 text-danger border border-danger/20' : 
                        p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-chalkMuted'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 border-t border-white/5 pt-3.5 flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-chalkMuted flex items-center gap-1.5"><Goal size={13} /> Positions</span>
                    <span className="font-semibold text-chalk truncate max-w-[120px]">
                      {p.positions?.sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map((pos: any) => `${pos.position}${pos.isPrimary ? '' : ' (S)'}`).join(', ') || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-chalkMuted flex items-center gap-1.5"><Tag size={13} /> {p.status === 'SOLD' ? 'Sold Price' : 'Base Price'}</span>
                    <span className="font-bold text-emerald-400 text-sm">TK {(p.soldPrice || p.category?.basePrice || 0).toLocaleString()}</span>
                  </div>

                  {p.team && (
                    <div className="flex justify-between items-center">
                      <span className="text-chalkMuted flex items-center gap-1.5"><UserCheck size={13} /> Franchise</span>
                      <span className="font-semibold text-gold truncate max-w-[120px]">{p.team.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-2 border-t border-white/5">
                  {onAction && (!actionCondition || actionCondition(p)) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAction(p); }}
                      className="w-full py-2.5 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,196,83,0.15)]"
                    >
                      {actionLabel || 'Action'} {actionIcon || <ArrowRight size={14} />}
                    </button>
                  )}
                  
                  {onSecondaryAction && (!secondaryActionCondition || secondaryActionCondition(p)) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSecondaryAction(p); }}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-chalk border border-white/10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      {secondaryActionLabel || 'View'} {secondaryActionIcon}
                    </button>
                  )}
                </div>

              </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-chalkMuted">
            <User size={48} className="mb-4 opacity-50" />
            <p className="font-display tracking-widest text-xl">NO PLAYERS FOUND</p>
            <p className="text-sm mt-2 opacity-80">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Full Player Profile Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-ink border border-white/10 rounded-3xl p-6 md:p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-chalkMuted hover:text-white transition"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden bg-black/50 border-4 border-white/10 shrink-0">
                  {selectedPlayer.imageUrl ? (
                    <img src={selectedPlayer.imageUrl} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="m-auto text-white/20 mt-16" />
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-gold mb-3">
                    {selectedPlayer.category?.name || 'Uncategorized'}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{selectedPlayer.name}</h2>
                  <p className="text-chalkMuted font-mono text-lg mb-6">{selectedPlayer.studentId} • Session {selectedPlayer.sessionId}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-xs text-chalkMuted uppercase tracking-widest font-bold mb-1 flex items-center gap-2 justify-center md:justify-start"><Goal size={14}/> Positions</div>
                      <div className="text-white font-bold">{selectedPlayer.positions?.sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map((pos: any) => `${pos.position}${pos.isPrimary ? '' : ' (S)'}`).join(', ') || 'N/A'}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-xs text-chalkMuted uppercase tracking-widest font-bold mb-1 flex items-center gap-2 justify-center md:justify-start"><Tag size={14}/> Base Price</div>
                      <div className="text-cyan-400 font-mono font-bold">TK {(selectedPlayer.category?.basePrice || 0).toLocaleString()}</div>
                    </div>
                    {selectedPlayer.status === 'SOLD' && (
                      <>
                        <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20">
                          <div className="text-xs text-gold/70 uppercase tracking-widest font-bold mb-1 flex items-center gap-2 justify-center md:justify-start"><Tag size={14}/> Sold Price</div>
                          <div className="text-gold font-mono font-bold">TK {(selectedPlayer.soldPrice || 0).toLocaleString()}</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="text-xs text-chalkMuted uppercase tracking-widest font-bold mb-1 flex items-center gap-2 justify-center md:justify-start"><UserCheck size={14}/> Franchise</div>
                          <div className="text-white font-bold">{selectedPlayer.team?.name}</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
