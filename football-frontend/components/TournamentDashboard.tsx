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
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">Tournament Dashboard</h1>
        <p className="text-zinc-400 uppercase tracking-wider text-xs font-semibold">Live Matches & Standings</p>
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

      {/* Full Fixtures List */}
      <div className="glass-panel p-8 h-fit">
        <h2 className="font-display font-bold text-xl text-white mb-6 border-b border-zinc-800 pb-4">All Fixtures</h2>
        <div className="space-y-4">
          <Accordion type="single">
            {fixtures.sort((a, b) => {
              const dateA = a.matches[0]?.scheduledAt ? new Date(a.matches[0].scheduledAt).getTime() : 0;
              const dateB = b.matches[0]?.scheduledAt ? new Date(b.matches[0].scheduledAt).getTime() : 0;
              return dateA - dateB;
            }).map(fix => {
              const tA = teams.find(t => t.id === fix.teamAId)?.name;
              const tB = teams.find(t => t.id === fix.teamBId)?.name;
              return (
                <AccordionItem 
                  key={fix.id} 
                  id={fix.id} 
                  title={`Matchday: ${fix.venue} ${fix.isTwoLegged ? '(Two-Legged)' : '(Single Tie)'}`}
                  icon={Calendar}
                >
                  <div className="space-y-2 mt-2">
                    {fix.matches.sort((a:any, b:any) => a.legNumber - b.legNumber).map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-zinc-800 hover:bg-black/60 transition-colors">
                        <div className="flex flex-col w-1/4">
                          <div className="font-semibold text-zinc-300 text-sm">{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'}</div>
                          <div className="text-xs text-zinc-500">{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}</div>
                        </div>
                        <div className="font-semibold w-1/4 text-right text-zinc-200 text-sm lg:text-base">{tA}</div>
                        <div className="flex flex-col items-center px-4 w-1/4">
                          <div className="bg-zinc-800 px-4 py-1.5 rounded-lg font-display tracking-wider text-lg text-white shadow-inner border border-zinc-700">
                            {m.status === 'SCHEDULED' ? 'v' : `${m.scoreA ?? 0} - ${m.scoreB ?? 0}`}
                          </div>
                          <div className={`text-[10px] uppercase mt-1 tracking-widest font-bold ${m.status === 'COMPLETED' ? 'text-success' : m.status === 'IN_PROGRESS' ? 'text-danger animate-pulse' : 'text-zinc-400'}`}>
                            {m.status === 'IN_PROGRESS' ? 'Live' : m.status.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="font-semibold w-1/4 text-left text-zinc-200 text-sm lg:text-base">{tB}</div>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
          {fixtures.length === 0 && <div className="text-center text-zinc-500 py-4 text-sm uppercase tracking-widest font-semibold opacity-50">No Fixtures Scheduled</div>}
        </div>
      </div>
    </motion.div>
  );
}
