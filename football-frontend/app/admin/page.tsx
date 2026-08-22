'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, DollarSign, Target, Shield, Loader2, Settings, Trophy, MonitorPlay, Wallet, Activity, Zap, BarChart3 } from 'lucide-react';

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
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/me`, {
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
    const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`);
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/teams`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auction/players`, { headers: { Authorization: `Bearer ${t}` }}),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/rules/config`)
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
      <div className="flex-1 flex items-center justify-center text-white">
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
            <h1 className="font-display text-3xl text-white font-bold tracking-tight mb-1">Dashboard</h1>
            <p className="text-zinc-500 text-sm font-semibold tracking-wider uppercase">Overview & Analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {/* Box 1: System Phase */}
          <div className="glass-panel p-8 col-span-1 md:col-span-2 md:row-span-2 relative overflow-hidden group border border-zinc-800/80 bg-zinc-900/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none transition-transform duration-700 group-hover:scale-110" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-12">
                <div className="text-sm uppercase tracking-widest text-zinc-500 font-bold mb-2 flex items-center gap-2">
                   Current Phase
                </div>
              </div>
              
              <div>
                <div className="text-4xl lg:text-5xl font-display text-white font-bold tracking-tight">
                  {config?.currentPhase?.replace('_', ' ') || 'LOADING'}
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Total Market Spend */}
          <div className="glass-panel p-8 col-span-1 md:col-span-2 relative overflow-hidden group hover:border-zinc-700 transition-all duration-300 bg-zinc-900/40">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-sm uppercase tracking-widest text-zinc-500 font-bold mb-2 flex items-center gap-2">
                  Total Market Spend
                </div>
                <div className="text-3xl font-display text-white font-bold tabular-nums tracking-tight">TK {totalSpent.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Box 3: Players in Queue */}
          <div className="glass-panel p-6 col-span-1 flex flex-col justify-center group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden bg-zinc-900/40">
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">Players Queue</div>
              <div className="text-3xl font-display text-white font-bold tabular-nums">{totalPlayers}</div>
            </div>
          </div>

          {/* Box 4: Active Franchises */}
          <div className="glass-panel p-6 col-span-1 flex flex-col justify-center group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden bg-zinc-900/40">
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">Franchises</div>
              <div className="text-3xl font-display text-white font-bold tabular-nums">{teams.length}</div>
            </div>
          </div>
        </div>


        <div className="glass-panel p-8 flex-1 mb-10">
          <h2 className="text-xl font-display font-bold text-white mb-6 border-b border-zinc-800 pb-4">Franchise Economy</h2>
          
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
                <div key={team.id} className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-5 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 overflow-hidden shrink-0">
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shield className="text-zinc-500 w-4 h-4" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-zinc-200">{team.name}</h3>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Treasury</div>
                      <div className="text-xl font-display tabular-nums tracking-wider text-white">TK {team.remainingBudget.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Squad</div>
                      <div className="text-lg font-bold tabular-nums text-zinc-400">{squadSize} / 20</div>
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
