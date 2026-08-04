'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, DollarSign, Target, Shield, Loader2, Settings, Trophy, MonitorPlay } from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
      return;
    }

    // Verify Role
    fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`auth/me', {
      headers: { Authorization: `Bearer ${t}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.role !== 'SUPER_ADMIN') {
        router.push('/login');
      } else {
        setToken(t);
        fetchData(t);
      }
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
      router.push('/login');
    });
  }, [router]);

  useEffect(() => {
    if (!token) return;
    const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`');
    socket.on('player_sold', () => {
      fetchData(token);
    });
    socket.on('data_updated', () => {
      fetchData(token);
    });
    return () => { socket.disconnect(); };
  }, [token]);

  const [config, setConfig] = useState<any>(null);

  const fetchData = async (t: string) => {
    try {
      const [resTeams, resPlayers, resConfig] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`teams'),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`auction/players', { headers: { Authorization: `Bearer ${t}` }}),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/config')
      ]);
      const dataTeams = await resTeams.json();
      const dataPlayers = await resPlayers.json();
      const dataConfig = await resConfig.json();
      setTeams(dataTeams);
      setPlayers(dataPlayers);
      setConfig(dataConfig);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gold">
        <Loader2 className="animate-spin mr-3" size={32} />
        <span className="font-display tracking-widest text-2xl">LOADING COMMAND CENTER...</span>
      </div>
    );
  }

  const safeTeams = Array.isArray(teams) ? teams : [];
  const baseBudget = config?.totalBudget || 1500000;
  const totalSpent = safeTeams.reduce((acc, t) => acc + (baseBudget - (t.remainingBudget || 0)), 0); 
  const totalPlayers = Array.isArray(players) ? players.length : 0;
  
  return (
    <div className="flex-1 p-6 md:p-10 text-chalk font-body relative z-0 flex flex-col">
      
      
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white tracking-[0.2em] mb-1">DASHBOARD</h1>
            <p className="text-chalkMuted text-sm font-bold tracking-widest uppercase">Overview & Analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <DollarSign className="text-gold mb-4" size={32} />
            <div className="text-sm uppercase tracking-widest text-chalkMuted font-bold mb-1">Total Market Spend</div>
            <div className="text-4xl font-display text-white tabular">TK {totalSpent.toLocaleString()}</div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Users className="text-cyan-400 mb-4" size={32} />
            <div className="text-sm uppercase tracking-widest text-chalkMuted font-bold mb-1">Players in Queue</div>
            <div className="text-4xl font-display text-white tabular">{totalPlayers}</div>
          </div>

          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-silver/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Shield className="text-silver mb-4" size={32} />
            <div className="text-sm uppercase tracking-widest text-chalkMuted font-bold mb-1">Active Franchises</div>
            <div className="text-4xl font-display text-white tabular">{teams.length}</div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group border-danger/30">
            <div className="absolute inset-0 bg-gradient-to-br from-danger/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Target className="text-danger mb-4" size={32} />
            <div className="text-sm uppercase tracking-widest text-chalkMuted font-bold mb-1">System Phase</div>
            <div className="text-2xl font-display text-danger tabular mt-2">{config?.currentPhase || 'LOADING'}</div>
          </div>
        </div>


        <div className="glass-panel rounded-[2rem] p-8 flex-1 mb-10">
          <h2 className="text-lg uppercase tracking-[0.2em] font-bold text-chalk mb-6 border-b border-white/10 pb-4">Franchise Economy</h2>
          
          {safeTeams.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-chalkMuted mb-4">No franchises have been approved yet.</div>
              <Link href="/admin/setup">
                <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold uppercase tracking-widest transition">
                  Go to Config Hub
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeTeams.map((team, idx) => {
              const TEAM_COLORS = ['#E8B84B', '#38BDF8', '#E4483B', '#A8AEB8', '#10B981', '#F472B6'];
              const colorCode = TEAM_COLORS[idx % TEAM_COLORS.length];
              const squadSize = team.players?.length || 0;
              return (
                <div key={team.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-20 pointer-events-none" style={{ background: colorCode }} />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ background: colorCode }} />
                    <h3 className="text-xl font-bold text-white">{team.name}</h3>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-chalkMuted uppercase tracking-widest mb-1">Treasury</div>
                      <div className="text-2xl font-display tabular tracking-wider" style={{ color: colorCode }}>TK {team.remainingBudget.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-chalkMuted uppercase tracking-widest mb-1">Squad</div>
                      <div className="text-xl font-bold tabular text-white">{squadSize} / 20</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
