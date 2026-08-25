'use client';
import { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { User, Tag, Trash2, GripVertical, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface WishlistPanelProps {
  wishlistIds: string[];
  allPlayers: any[];
  teamId: string;
  remainingBudget: number;
  onRemove: (playerId: string) => void;
}

export default function WishlistPanel({ wishlistIds, allPlayers, teamId, remainingBudget, onRemove }: WishlistPanelProps) {
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  // Sync with incoming wishlistIds, but preserve local order if possible
  useEffect(() => {
    // Load saved order from local storage if exists
    const saved = localStorage.getItem(`wishlist_order_${teamId}`);
    let initialOrder = saved ? JSON.parse(saved) : [];
    
    // Merge: add new ids that are in wishlistIds but not in initialOrder
    const newIds = wishlistIds.filter(id => !initialOrder.includes(id));
    // Remove ids that are in initialOrder but no longer in wishlistIds
    const validOrder = initialOrder.filter((id: string) => wishlistIds.includes(id));
    
    const finalOrder = [...validOrder, ...newIds];
    setOrderedIds(finalOrder);
  }, [wishlistIds, teamId]);

  const handleReorder = (newOrder: string[]) => {
    setOrderedIds(newOrder);
    localStorage.setItem(`wishlist_order_${teamId}`, JSON.stringify(newOrder));
  };

  const wishlistPlayers = orderedIds.map(id => allPlayers.find(p => p.id === id)).filter(Boolean);
  
  const totalBasePrice = wishlistPlayers
    .filter(p => p.status === 'UNSOLD')
    .reduce((sum, p) => sum + (p.category?.basePrice || 0), 0);

  const budgetWarning = totalBasePrice > remainingBudget;

  if (wishlistPlayers.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Tag size={32} className="text-white/20" />
        </div>
        <h2 className="text-2xl font-display text-white tracking-widest mb-2 uppercase">Your Wishlist is Empty</h2>
        <p className="text-chalkMuted max-w-md mx-auto">
          Go to the Player Database to discover talents and add them to your tactical wishlist.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Left: Interactive Reorderable List */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="font-display text-xl tracking-widest text-white uppercase">Prioritized Targets</h2>
          <span className="text-xs font-bold text-chalkMuted uppercase tracking-widest">Drag to rank</span>
        </div>
        
        <Reorder.Group axis="y" values={orderedIds} onReorder={handleReorder} className="space-y-3 pr-2 w-full">
          <AnimatePresence>
            {wishlistPlayers.map((p, index) => {
              const isSoldToMe = p.status === 'SOLD' && p.teamId === teamId;
              const isSoldToOther = p.status === 'SOLD' && p.teamId !== teamId;
              
              return (
                <Reorder.Item 
                  key={p.id} 
                  value={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white/5 border p-4 rounded-2xl flex items-center gap-4 group transition-all relative overflow-hidden ${
                    isSoldToMe ? 'border-green-500/30 bg-green-500/5' : 
                    isSoldToOther ? 'border-danger/30 bg-danger/5 opacity-50' : 
                    'border-white/10 hover:bg-white/10 hover:border-gold/30 cursor-grab active:cursor-grabbing'
                  }`}
                >
                  <div className="text-white/20 group-hover:text-gold/50 cursor-grab active:cursor-grabbing px-1">
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="font-display text-2xl text-white/20 w-8 text-center shrink-0">
                    {index + 1}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black/50 shrink-0 border border-white/10">
                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <User className="m-auto w-full h-full p-2 text-white/20"/>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-lg truncate flex items-center gap-2">
                      {p.name}
                      {isSoldToMe && <CheckCircle2 size={16} className="text-green-400" />}
                      {isSoldToOther && <XCircle size={16} className="text-danger" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs mt-1">
                      <span className="text-chalkMuted font-mono uppercase">{p.positions?.[0]?.position || 'PLY'}</span>
                      <span className="text-gold/70 font-bold uppercase">{p.category?.name || 'Uncategorized'}</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0 px-4">
                    <div className="text-[10px] text-chalkMuted uppercase tracking-widest font-bold mb-1">
                      {p.status === 'SOLD' ? 'Sold For' : 'Base Price'}
                    </div>
                    <div className={`font-mono font-bold text-lg ${p.status === 'SOLD' ? 'text-white' : 'text-cyan-400'}`}>
                      TK {(p.soldPrice || p.category?.basePrice || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onRemove(p.id)}
                    className="p-3 text-danger/50 hover:text-danger hover:bg-danger/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      </div>

      {/* Right: Strategy & Finance Panel */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="glass-panel p-6 rounded-3xl border-white/10">
          <h3 className="font-display text-lg tracking-widest text-white uppercase mb-6 flex items-center gap-2">
            <Tag size={18} className="text-gold" /> Strategy Board
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-xs text-chalkMuted uppercase tracking-widest font-bold mb-1">Targets (Unsold)</div>
              <div className="text-2xl font-bold text-white">
                {wishlistPlayers.filter(p => p.status === 'UNSOLD').length}
              </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-xs text-chalkMuted uppercase tracking-widest font-bold mb-1">Acquired</div>
              <div className="text-2xl font-bold text-green-400">
                {wishlistPlayers.filter(p => p.status === 'SOLD' && p.teamId === teamId).length}
              </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-xs text-chalkMuted uppercase tracking-widest font-bold mb-1">Missed</div>
              <div className="text-2xl font-bold text-danger">
                {wishlistPlayers.filter(p => p.status === 'SOLD' && p.teamId !== teamId).length}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-chalkMuted uppercase tracking-widest font-bold">Total Base Value</span>
              <span className="font-mono font-bold text-cyan-400">TK {totalBasePrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-chalkMuted uppercase tracking-widest font-bold">Remaining Purse</span>
              <span className="font-mono font-bold text-gold">TK {remainingBudget.toLocaleString('en-IN')}</span>
            </div>
            
            {budgetWarning && (
              <div className="bg-danger/20 text-danger border border-danger/30 p-3 rounded-xl flex gap-3 items-start text-xs leading-relaxed">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>The total base price of your targets exceeds your remaining purse. Prioritize your draft!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
