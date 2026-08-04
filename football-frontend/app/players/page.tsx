'use client';
import { useState, useEffect } from 'react';
import PlayerDirectory from '../../components/PlayerDirectory';
import { Loader2 } from 'lucide-react';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`players/public')
      .then(res => res.json())
      .then(data => {
        // Public directory should only show approved or auctioned players
        const visiblePlayers = data.filter((p: any) => p.status !== 'PENDING');
        setPlayers(visiblePlayers);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col h-[calc(100vh-80px)] mt-4">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.2em] mb-2 uppercase">PLAYER DATABASE</h1>
        <p className="text-chalkMuted">Browse all approved and auctioned players in the system.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gold">
          <Loader2 className="animate-spin mr-3" size={32} />
          <span className="font-display tracking-widest text-xl">LOADING PLAYERS...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <PlayerDirectory players={players} showStatusFilter={true} enablePlayerModal={true} />
        </div>
      )}
    </div>
  );
}
