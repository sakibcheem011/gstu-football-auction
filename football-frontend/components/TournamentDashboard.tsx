'use client';
import { useState, useEffect } from 'react';
import { Shield, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accordion, AccordionItem } from './ui/accordion';

export function TournamentDashboard() {
  const [standings, setStandings] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/tournament/standings`).then(r => r.json()).then(setStandings).catch(console.error);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/tournament/fixtures`).then(r => r.json()).then(setFixtures).catch(console.error);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/teams`).then(r => r.json()).then(setTeams).catch(console.error);
  }, []);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="py-12 space-y-6 max-w-6xl mx-auto w-full">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2 text-chalk">Tournament Dashboard</h1>
        <p className="text-chalkMuted uppercase tracking-wider text-xs font-semibold">Live Matches & Standings</p>
      </div>

      {/* Featured Match Card */}
      {fixtures.length > 0 && (
        <div className="glass-panel p-8 relative overflow-hidden">
          {(() => {
            const featuredFixture = fixtures.find(f => f.matches.some((m:any) => m.status === 'IN_PROGRESS' || m.status === 'SCHEDULED')) || fixtures[fixtures.length - 1];
            const featuredMatch = featuredFixture?.matches.find((m:any) => m.status === 'IN_PROGRESS' || m.status === 'SCHEDULED') || featuredFixture?.matches[0];
            const tA = teams.find(t => t.id === featuredFixture?.teamAId);
            const tB = teams.find(t => t.id === featuredFixture?.teamBId);
            
            if (!tA || !tB) return null;

            const dateStr = featuredMatch?.scheduledAt 
              ? new Date(featuredMatch.scheduledAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
              : 'Upcoming Match';

            return (
              <>
                <div className="text-xs text-zinc-400 uppercase tracking-wider mb-6 border-b border-zinc-800 pb-4 flex justify-between absolute top-6 left-6 right-6">
                  <span>GSTU League · {dateStr}</span>
                  <span className="text-danger font-bold tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> LIVE</span>
                </div>
                
                <div className="flex items-center justify-between px-10 mb-10 mt-12">
                  <div className="flex flex-col items-center gap-4 w-1/3">
                    <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700 overflow-hidden">
                      {tA.logoUrl ? <img src={tA.logoUrl} alt={tA.name} className="w-full h-full object-cover" /> : <Shield size={32} className="text-zinc-600" />}
                    </div>
                    <div className="font-display font-bold text-xl text-white">{tA.name}</div>
                  </div>

                  <div className="flex flex-col items-center w-1/3">
                    <div className="text-3xl font-display font-bold text-white mb-2">
                      {featuredMatch.scoreA} - {featuredMatch.scoreB}
                    </div>
                    <div className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${featuredMatch.status === 'IN_PROGRESS' ? 'text-danger bg-danger/10 border-danger/20 animate-pulse' : featuredMatch.status === 'COMPLETED' ? 'text-success bg-success/10 border-success/20' : 'text-zinc-500 bg-zinc-800/50 border-zinc-700/50'}`}>
                      {featuredMatch.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 w-1/3">
                    <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700 overflow-hidden">
                      {tB.logoUrl ? <img src={tB.logoUrl} alt={tB.name} className="w-full h-full object-cover" /> : <Shield size={32} className="text-zinc-600" />}
                    </div>
                    <div className="font-display font-bold text-xl text-white">{tB.name}</div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Standings Table */}
      <div className="glass-panel p-8 h-fit">
        <h2 className="font-display font-bold text-xl text-white mb-6 border-b border-zinc-800 pb-4">Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
                <th className="pb-3 px-3">Club</th>
                <th className="pb-3 px-2 text-center">MP</th>
                <th className="pb-3 px-2 text-center">W</th>
                <th className="pb-3 px-2 text-center">D</th>
                <th className="pb-3 px-2 text-center">L</th>
                <th className="pb-3 px-2 text-center">GF</th>
                <th className="pb-3 px-2 text-center">GA</th>
                <th className="pb-3 px-2 text-center">GD</th>
                <th className="pb-3 px-3 text-center text-white font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, idx) => (
                <tr key={s.teamId} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors group">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-3">
                    <span className="text-xs w-4 text-zinc-500">{idx + 1}</span> 
                    {s.logoUrl ? <img src={s.logoUrl} alt={s.teamName} className="w-6 h-6 rounded-full object-cover" /> : <Shield size={16} className="text-zinc-500 group-hover:text-zinc-400 transition-colors" />}
                    {s.teamName}
                  </td>
                  <td className="py-3 px-2 text-center text-zinc-400 text-sm">{s.played}</td>
                  <td className="py-3 px-2 text-center text-zinc-400 text-sm">{s.won}</td>
                  <td className="py-3 px-2 text-center text-zinc-400 text-sm">{s.drawn}</td>
                  <td className="py-3 px-2 text-center text-zinc-400 text-sm">{s.lost}</td>
                  <td className="py-3 px-2 text-center text-zinc-400 text-sm">{s.gf}</td>
                  <td className="py-3 px-2 text-center text-zinc-400 text-sm">{s.ga}</td>
                  <td className="py-3 px-2 text-center text-zinc-400 text-sm">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                  <td className="py-3 px-3 text-center text-white font-bold text-lg">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {standings.length === 0 && <div className="text-center text-zinc-500 py-8 text-sm uppercase tracking-widest font-semibold">No Data Available</div>}
        </div>
      </div>

      {/* Split Fixtures Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Results */}
        <div className="glass-panel p-8 h-fit">
          <h2 className="font-display font-bold text-xl text-white mb-6 border-b border-zinc-800 pb-4">Recent Results</h2>
          <div className="space-y-4">
            {(() => {
              const allMatches = fixtures.flatMap(f => f.matches.map((m: any) => ({ match: m, fixture: f })));
              const completedMatches = allMatches.filter(m => m.match.status === 'COMPLETED').sort((a, b) => {
                const dA = a.match.scheduledAt ? new Date(a.match.scheduledAt).getTime() : 0;
                const dB = b.match.scheduledAt ? new Date(b.match.scheduledAt).getTime() : 0;
                return dB - dA; // Newest first
              });

              if (completedMatches.length === 0) {
                return <div className="text-center text-zinc-500 py-8 text-sm uppercase tracking-widest font-semibold opacity-50">No Results Yet</div>;
              }
              return completedMatches.map(mInfo => <MatchCard key={mInfo.match.id} matchInfo={mInfo} teams={teams} />);
            })()}
          </div>
        </div>

        {/* Upcoming Fixtures */}
        <div className="glass-panel p-8 h-fit">
          <h2 className="font-display font-bold text-xl text-white mb-6 border-b border-zinc-800 pb-4">Upcoming Fixtures</h2>
          <div className="space-y-4">
            {(() => {
              const allMatches = fixtures.flatMap(f => f.matches.map((m: any) => ({ match: m, fixture: f })));
              const upcomingMatches = allMatches.filter(m => m.match.status !== 'COMPLETED').sort((a, b) => {
                const dA = a.match.scheduledAt ? new Date(a.match.scheduledAt).getTime() : Infinity;
                const dB = b.match.scheduledAt ? new Date(b.match.scheduledAt).getTime() : Infinity;
                return dA - dB; // Soonest first
              });

              if (upcomingMatches.length === 0) {
                return <div className="text-center text-zinc-500 py-8 text-sm uppercase tracking-widest font-semibold opacity-50">No Upcoming Matches</div>;
              }
              return upcomingMatches.map(mInfo => <MatchCard key={mInfo.match.id} matchInfo={mInfo} teams={teams} />);
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MatchCard({ matchInfo, teams }: { matchInfo: any, teams: any[] }) {
  const { match, fixture } = matchInfo;
  const tA = teams.find(t => t.id === fixture.teamAId)?.name;
  const tB = teams.find(t => t.id === fixture.teamBId)?.name;
  
  return (
    <div className="flex flex-col p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
      <div className="text-xs text-zinc-500 mb-4 font-semibold uppercase tracking-widest border-b border-zinc-800/50 pb-2 flex items-center gap-2">
        <Calendar size={12} />
        {fixture.venue} {fixture.isTwoLegged ? `(Leg ${match.legNumber})` : ''}
      </div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col w-1/4">
          <div className="font-semibold text-zinc-300 text-sm">{match.scheduledAt ? new Date(match.scheduledAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'}</div>
          <div className="text-xs text-zinc-500">{match.scheduledAt ? new Date(match.scheduledAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}</div>
        </div>
        <div className="font-semibold w-1/4 text-right text-zinc-200 text-sm lg:text-base">{tA}</div>
        <div className="flex flex-col items-center px-4 w-1/4">
          <div className="bg-zinc-800 px-4 py-1.5 rounded-lg font-display tracking-wider text-lg text-white shadow-inner border border-zinc-700 min-w-[70px] flex justify-center">
            {match.status === 'SCHEDULED' ? 'v' : `${match.scoreA ?? 0} - ${match.scoreB ?? 0}`}
          </div>
          <div className={`text-[10px] uppercase mt-1 tracking-widest font-bold ${match.status === 'COMPLETED' ? 'text-success' : match.status === 'IN_PROGRESS' ? 'text-danger animate-pulse' : 'text-zinc-400'}`}>
            {match.status === 'IN_PROGRESS' ? 'Live' : match.status.replace('_', ' ')}
          </div>
        </div>
        <div className="font-semibold w-1/4 text-left text-zinc-200 text-sm lg:text-base">{tB}</div>
      </div>
    </div>
  );
}
