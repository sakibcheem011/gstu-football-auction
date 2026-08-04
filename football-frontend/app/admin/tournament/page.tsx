'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Target, Plus, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Dropdown from '../../../components/Dropdown';

export default function TournamentAdmin() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [venue, setVenue] = useState('Central Stadium');
  const [isTwoLegged, setIsTwoLegged] = useState(false);
  const [matchStatuses, setMatchStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
      return;
    }
    setToken(t);
    fetchData(t);
  }, [router]);

  const fetchData = async (t: string) => {
    try {
      const [resTeams, resFixtures] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/teams`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/tournament/fixtures`)
      ]);
      setTeams(await resTeams.json());
      setFixtures(await resFixtures.json());
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const createFixture = async () => {
    if (!teamAId || !teamBId || teamAId === teamBId) {
      toast.error('Invalid teams selected.');
      return;
    }
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/tournament/fixtures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teamAId, teamBId, isTwoLegged, venue })
    });
    fetchData(token!);
  };

  const updateMatchScore = async (matchId: string, scoreA: string, scoreB: string, status: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`}/tournament/matches/${matchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ scoreA: parseInt(scoreA), scoreB: parseInt(scoreB), status })
    });
    fetchData(token!);
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="flex-1 p-6 text-chalk font-body max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-white tracking-[0.2em]">TOURNAMENT MANAGER</h1>
        <Link href="/admin">
          <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 uppercase tracking-widest text-xs font-bold transition">
            Back to Dashboard
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl h-fit">
          <h2 className="font-display tracking-widest text-xl text-gold mb-6 border-b border-white/10 pb-4">CREATE FIXTURE</h2>
          <div className="space-y-4">
            <div className="relative z-50">
              <label className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-1 block">Team A (Home)</label>
              <Dropdown
                options={teams.map(t => ({ label: t.name, value: t.id }))}
                value={teamAId}
                onChange={setTeamAId}
                placeholder="Select Team"
              />
            </div>
            <div className="relative z-40">
              <label className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-1 block">Team B (Away)</label>
              <Dropdown
                options={teams.map(t => ({ label: t.name, value: t.id }))}
                value={teamBId}
                onChange={setTeamBId}
                placeholder="Select Team"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-chalkMuted font-bold mb-1 block">Venue</label>
              <input type="text" className="w-full bg-ink border border-white/20 rounded-lg p-3 text-white" value={venue} onChange={e => setVenue(e.target.value)} />
            </div>
            <div className="flex items-center gap-3 py-2">
              <input type="checkbox" className="w-5 h-5" checked={isTwoLegged} onChange={e => setIsTwoLegged(e.target.checked)} />
              <label className="text-sm font-bold uppercase tracking-widest text-white">Two-Legged Tie</label>
            </div>
            <button onClick={createFixture} className="w-full py-3 bg-gold hover:bg-yellow-400 text-ink font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2">
              <Plus size={18} /> Add Fixture
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h2 className="font-display tracking-widest text-xl text-cyan-400 mb-6 border-b border-white/10 pb-4">MANAGE MATCHES</h2>
          <div className="space-y-6">
            {fixtures.map((fix: any) => {
              const tA = teams.find(t => t.id === fix.teamAId)?.name || 'Unknown';
              const tB = teams.find(t => t.id === fix.teamBId)?.name || 'Unknown';
              return (
                <div key={fix.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs uppercase tracking-widest text-chalkMuted mb-4 flex justify-between">
                    <span>{tA} VS {tB}</span>
                    <span className="text-gold">{fix.venue} {fix.isTwoLegged ? '(2 Legs)' : '(Single)'}</span>
                  </div>
                  <div className="space-y-4">
                    {fix.matches.map((m: any) => (
                      <div key={m.id} className="bg-ink/50 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
                        <div className="text-sm font-bold w-16">Leg {m.legNumber}</div>
                        <div className="flex items-center gap-2">
                          <input type="number" id={`sA-${m.id}`} defaultValue={m.scoreA ?? 0} className="w-16 bg-ink border border-white/20 text-white rounded p-2 text-center" />
                          <span>-</span>
                          <input type="number" id={`sB-${m.id}`} defaultValue={m.scoreB ?? 0} className="w-16 bg-ink border border-white/20 text-white rounded p-2 text-center" />
                        </div>
                        <div className="flex-1 relative z-30">
                          <Dropdown
                            options={[
                              { label: 'Scheduled', value: 'SCHEDULED' },
                              { label: 'In Progress', value: 'IN_PROGRESS' },
                              { label: 'Completed', value: 'COMPLETED' }
                            ]}
                            value={matchStatuses[m.id] || m.status}
                            onChange={(val) => setMatchStatuses(prev => ({ ...prev, [m.id]: val }))}
                            placeholder="Match Status"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const sa = (document.getElementById(`sA-${m.id}`) as HTMLInputElement).value;
                            const sb = (document.getElementById(`sB-${m.id}`) as HTMLInputElement).value;
                            const st = matchStatuses[m.id] || m.status;
                            updateMatchScore(m.id, sa, sb, st);
                          }}
                          className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 p-2 rounded shrink-0 h-12 w-12 flex items-center justify-center"
                        >
                          <Check size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {fixtures.length === 0 && <div className="text-center text-chalkMuted py-10 opacity-50 uppercase tracking-widest text-sm">No fixtures created yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
