'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Target, Plus, Check, Trash2, Activity, X, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Dropdown from '../../../components/Dropdown';
import { AppleCalendarPicker } from '../../../components/ui/apple-calendar-picker';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-ink/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-panelLight w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center mx-auto mb-6">
          <Trash2 size={32} />
        </div>
        <h2 className="text-2xl font-display text-white mb-2">{title}</h2>
        <p className="text-chalkMuted mb-8 text-sm">{message}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-chalkMuted hover:text-white bg-white/5 hover:bg-white/10 transition font-bold w-full sm:w-auto">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-6 py-3 rounded-xl bg-zinc-800 text-white hover:bg-red-600 transition shadow-lg shadow-danger/20 font-bold w-full sm:w-auto">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerStatsModal({ match, teamA, teamB, onClose, token, refresh }: any) {
  const [stats, setStats] = useState<any[]>(match.stats || []);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(teamA.id);

  const handleStatChange = (playerId: string, field: string, value: number) => {
    setStats(prev => {
      const existing = prev.find(s => s.playerId === playerId);
      if (existing) {
        return prev.map(s => s.playerId === playerId ? { ...s, [field]: value } : s);
      }
      return [...prev, { playerId, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheet: false, [field]: value }];
    });
  };

  const saveStats = async () => {
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/tournament/matches/${match.id}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stats })
      });
      toast.success('Player stats saved');
      refresh();
      onClose();
    } catch (e) {
      toast.error('Failed to save stats');
    }
    setLoading(false);
  };

  const renderTeamStats = (team: any) => (
    <div className="space-y-3 mt-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
      {team.players.map((p: any) => {
        const pStat = stats.find(s => s.playerId === p.id) || { goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
        return (
          <div key={p.id} className="bg-ink border border-white/10 p-3 rounded-lg flex items-center justify-between gap-4">
            <div className="text-white font-bold w-1/3 truncate">{p.name} <span className="text-chalkMuted text-xs font-normal">({p.position})</span></div>
            <div className="flex gap-4 w-2/3 justify-end">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-chalkMuted mb-1">Goals</span>
                <input type="number" min="0" value={pStat.goals} onChange={e => handleStatChange(p.id, 'goals', parseInt(e.target.value) || 0)} className="w-12 bg-white/5 border border-white/20 rounded p-1 text-center text-white" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-chalkMuted mb-1">Assists</span>
                <input type="number" min="0" value={pStat.assists} onChange={e => handleStatChange(p.id, 'assists', parseInt(e.target.value) || 0)} className="w-12 bg-white/5 border border-white/20 rounded p-1 text-center text-white" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-chalkMuted mb-1">Yellow</span>
                <input type="number" min="0" value={pStat.yellowCards} onChange={e => handleStatChange(p.id, 'yellowCards', parseInt(e.target.value) || 0)} className="w-12 bg-white/5 border border-yellow-500/50 rounded p-1 text-center text-white" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-chalkMuted mb-1">Red</span>
                <input type="number" min="0" value={pStat.redCards} onChange={e => handleStatChange(p.id, 'redCards', parseInt(e.target.value) || 0)} className="w-12 bg-white/5 border border-red-500/50 rounded p-1 text-center text-zinc-500" />
              </div>
            </div>
          </div>
        );
      })}
      {team.players.length === 0 && <div className="text-chalkMuted text-center py-4">No players in this team</div>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-ink/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-panelLight w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="font-display tracking-widest text-xl text-white flex items-center gap-2">
            <Activity size={24} /> MATCH STATS (LEG {match.legNumber})
          </h2>
          <button onClick={onClose} className="text-chalkMuted hover:text-white transition"><X size={24} /></button>
        </div>
        
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-4 border-b border-white/10 pb-4">
            <button 
              onClick={() => setActiveTab(teamA.id)} 
              className={`flex-1 py-3 font-bold rounded-xl transition ${activeTab === teamA.id ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-chalkMuted hover:bg-white/10'}`}
            >
              {teamA.name}
            </button>
            <button 
              onClick={() => setActiveTab(teamB.id)} 
              className={`flex-1 py-3 font-bold rounded-xl transition ${activeTab === teamB.id ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-chalkMuted hover:bg-white/10'}`}
            >
              {teamB.name}
            </button>
          </div>
          
          {activeTab === teamA.id ? renderTeamStats(teamA) : renderTeamStats(teamB)}
        </div>
        
        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-lg text-chalkMuted hover:text-white font-bold transition">Cancel</button>
          <button onClick={saveStats} disabled={loading} className="px-6 py-3 bg-white text-black text-ink hover:bg-white text-black rounded-lg font-bold transition flex items-center gap-2">
            {loading ? 'Saving...' : 'Save Stats'}
          </button>
        </div>
      </div>
    </div>
  );
}


function MatchRow({ m, tA, tB, updateMatchScore, onOpenStats }: { m: any, tA: any, tB: any, updateMatchScore: any, onOpenStats: any }) {
  const [scoreA, setScoreA] = useState(m.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(m.scoreB ?? 0);
  const [status, setStatus] = useState(m.status);
  const [date, setDate] = useState<Date | null>(m.scheduledAt ? new Date(m.scheduledAt) : null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const formatDisplayDate = (d: Date) => {
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-ink/30 hover:bg-ink/50 border border-white/5 hover:border-white/10 rounded-xl p-3 flex flex-col xl:flex-row items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3 w-full xl:w-auto">
        <div className="bg-white/10 px-3 py-1.5 rounded text-xs font-bold text-white tracking-wider uppercase whitespace-nowrap">
          Leg {m.legNumber}
        </div>
        <div className="relative z-40 flex-1 xl:w-56">
          <button 
            onClick={() => setIsPickerOpen(true)}
            className="w-full bg-black/20 border border-white/10 text-white hover:bg-black/40 rounded-lg px-3 py-2 text-xs flex items-center justify-between transition outline-none"
          >
            <span className="font-medium whitespace-nowrap truncate mr-2">{date ? formatDisplayDate(date) : "Set Date"}</span>
            <Calendar size={14} className="text-chalkMuted shrink-0" />
          </button>
          <AppleCalendarPicker
            isOpen={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            initialDate={date}
            onDateTimeSelect={(d: Date) => setDate(d)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
        <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg border border-white/5">
          <input type="number" value={scoreA} onChange={e => setScoreA(parseInt(e.target.value) || 0)} className="w-8 bg-transparent text-white text-center text-lg font-bold outline-none" />
          <span className="text-chalkMuted text-sm font-bold">-</span>
          <input type="number" value={scoreB} onChange={e => setScoreB(parseInt(e.target.value) || 0)} className="w-8 bg-transparent text-white text-center text-lg font-bold outline-none" />
        </div>
        
        <div className="w-36 relative z-30 shrink-0">
          <Dropdown
            options={[
              { label: 'Scheduled', value: 'SCHEDULED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' }
            ]}
            value={status}
            onChange={setStatus}
            placeholder="Status"
          />
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => onOpenStats(m, tA, tB)}
            className="bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white p-2 rounded-lg flex items-center justify-center transition"
            title="Player Stats"
          >
            <Activity size={18} />
          </button>
          <button 
            onClick={() => updateMatchScore(m.id, scoreA, scoreB, status, date?.toISOString())}
            className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg flex items-center justify-center transition font-bold text-xs gap-1.5"
            title="Save Match Info"
          >
            <Check size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TournamentAdmin() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsModalData, setStatsModalData] = useState<{match: any, teamA: any, teamB: any} | null>(null);

  // Form State
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [venue, setVenue] = useState('Central Stadium');
  const [isTwoLegged, setIsTwoLegged] = useState(false);
  const [scheduledAt1, setScheduledAt1] = useState<Date | null>(null);
  const [scheduledAt2, setScheduledAt2] = useState<Date | null>(null);
  
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [fixtureToDelete, setFixtureToDelete] = useState<string | null>(null);

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
      body: JSON.stringify({ 
        teamAId, 
        teamBId, 
        isTwoLegged, 
        venue, 
        scheduledAt1: scheduledAt1?.toISOString(), 
        scheduledAt2: scheduledAt2?.toISOString() 
      })
    });
    
    // Reset Form
    setTeamAId('');
    setTeamBId('');
    setVenue('Central Stadium');
    setIsTwoLegged(false);
    setScheduledAt1(null);
    setScheduledAt2(null);
    
    fetchData(token!);
  };

  const deleteFixture = async (fixtureId: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/tournament/fixtures/${fixtureId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData(token!);
  };

  const updateMatchScore = async (matchId: string, scoreA: number, scoreB: number, status: string, scheduledAt?: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/tournament/matches/${matchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ scoreA, scoreB, status, scheduledAt })
    });
    toast.success('Match Updated');
    fetchData(token!);
  };

  const formatDisplayDate = (d: Date) => {
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading) return <div className="p-10 text-white font-display text-2xl">Loading Dashboard...</div>;

  return (
    <div className="flex-1 p-6 md:p-10 text-chalk font-body max-w-[1400px] mx-auto w-full">
      <ConfirmModal
        isOpen={!!fixtureToDelete}
        onClose={() => setFixtureToDelete(null)}
        onConfirm={() => deleteFixture(fixtureToDelete!)}
        title="Delete Fixture"
        message="Are you sure you want to permanently delete this fixture and its associated matches? This action cannot be undone."
      />

      {statsModalData && (
        <PlayerStatsModal 
          match={statsModalData.match} 
          teamA={statsModalData.teamA} 
          teamB={statsModalData.teamB} 
          onClose={() => setStatsModalData(null)}
          token={token}
          refresh={() => fetchData(token!)}
        />
      )}

      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-4xl lg:text-5xl text-white tracking-[0.1em]">TOURNAMENT MANAGER</h1>
        <Link href="/admin">
          <button className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 font-bold transition">
            Back to Hub
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CREATE FIXTURE */}
        <div className="glass-panel p-8 rounded-3xl h-fit border border-white/10 shadow-2xl bg-ink/80">
          <h2 className="font-display text-2xl text-white mb-8 flex items-center gap-3">
            <Plus size={24} /> CREATE FIXTURE
          </h2>
          <div className="space-y-6">
            <div className="relative z-[60]">
              <label className="text-sm font-bold text-chalkMuted mb-2 block">Team A (Home)</label>
              <Dropdown
                options={teams.map(t => ({ label: t.name, value: t.id }))}
                value={teamAId}
                onChange={setTeamAId}
                placeholder="Select Home Team"
              />
            </div>
            <div className="relative z-[50]">
              <label className="text-sm font-bold text-chalkMuted mb-2 block">Team B (Away)</label>
              <Dropdown
                options={teams.map(t => ({ label: t.name, value: t.id }))}
                value={teamBId}
                onChange={setTeamBId}
                placeholder="Select Away Team"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-chalkMuted mb-2 block">Venue</label>
              <input type="text" className="w-full bg-ink border border-white/20 rounded-xl p-4 text-white text-base focus:border-white outline-none transition" value={venue} onChange={e => setVenue(e.target.value)} />
            </div>
            <div className="relative z-[40]">
              <label className="text-sm font-bold text-chalkMuted mb-2 block">Date & Time (Leg 1)</label>
              <button 
                onClick={() => setActivePicker('leg1')}
                className="w-full bg-ink border border-white/20 text-white hover:border-white rounded-xl p-4 text-base flex items-center justify-between transition outline-none"
              >
                <span>{scheduledAt1 ? formatDisplayDate(scheduledAt1) : "Select Date & Time"}</span>
                <Calendar size={18} className="text-chalkMuted" />
              </button>
              <AppleCalendarPicker
                isOpen={activePicker === 'leg1'}
                onClose={() => setActivePicker(null)}
                initialDate={scheduledAt1}
                onDateTimeSelect={(d: Date) => setScheduledAt1(d)}
              />
            </div>
            
            <div className="flex items-center gap-3 py-2 bg-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/10 transition" onClick={() => setIsTwoLegged(!isTwoLegged)}>
              <input type="checkbox" className="w-5 h-5 accent-cyan-400 cursor-pointer" checked={isTwoLegged} onChange={() => {}} />
              <label className="text-base font-bold text-white cursor-pointer select-none">Two-Legged Tie</label>
            </div>
            
            {isTwoLegged && (
              <div className="relative z-[30]">
                <label className="text-sm font-bold text-chalkMuted mb-2 block">Date & Time (Leg 2)</label>
                <button 
                  onClick={() => setActivePicker('leg2')}
                  className="w-full bg-ink border border-white/20 text-white hover:border-white rounded-xl p-4 text-base flex items-center justify-between transition outline-none"
                >
                  <span>{scheduledAt2 ? formatDisplayDate(scheduledAt2) : "Select Date & Time"}</span>
                  <Calendar size={18} className="text-chalkMuted" />
                </button>
                <AppleCalendarPicker
                  isOpen={activePicker === 'leg2'}
                  onClose={() => setActivePicker(null)}
                  initialDate={scheduledAt2}
                  onDateTimeSelect={(d: Date) => setScheduledAt2(d)}
                />
              </div>
            )}
            
            <button onClick={createFixture} className="w-full py-4 bg-white text-black hover:bg-zinc-200 hover:text-black text-ink text-lg font-bold uppercase tracking-widest rounded-xl transition shadow-lg  mt-4">
              Add Fixture
            </button>
          </div>
        </div>

        {/* MANAGE MATCHES */}
        <div className="xl:col-span-2 glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl bg-ink/80">
          <h2 className="font-display text-2xl text-white mb-8 flex items-center gap-3">
            <Target size={24} /> MANAGE MATCHES
          </h2>
          <div className="space-y-8">
            {fixtures.map((fix: any) => {
              const tA = teams.find(t => t.id === fix.teamAId) || { name: 'Unknown', players: [] };
              const tB = teams.find(t => t.id === fix.teamBId) || { name: 'Unknown', players: [] };
              return (
                <div key={fix.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-4">
                    <span className="font-display text-2xl text-white flex items-center gap-3">
                      {tA.logoUrl && <img src={tA.logoUrl} className="w-8 h-8 rounded-full object-cover" />}
                      {tA.name} 
                      <span className="text-chalkMuted text-lg mx-2">vs</span> 
                      {tB.logoUrl && <img src={tB.logoUrl} className="w-8 h-8 rounded-full object-cover" />}
                      {tB.name}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-bold text-sm bg-white/10 px-4 py-2 rounded-lg">{fix.venue} • {fix.isTwoLegged ? '2 Legs' : 'Single'}</span>
                      <button onClick={() => setFixtureToDelete(fix.id)} className="text-zinc-400 bg-white/5 hover:bg-white/5 p-2 rounded-lg transition" title="Delete Fixture">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {fix.matches.map((m: any) => (
                      <MatchRow 
                        key={m.id} 
                        m={m} 
                        tA={tA} 
                        tB={tB} 
                        updateMatchScore={updateMatchScore} 
                        onOpenStats={(match: any, teamA: any, teamB: any) => setStatsModalData({ match, teamA, teamB })} 
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {fixtures.length === 0 && (
              <div className="text-center bg-white/5 rounded-2xl p-12 border border-white/10">
                <Target size={48} className="mx-auto text-chalkMuted opacity-50 mb-4" />
                <div className="text-chalkMuted text-lg font-bold">No fixtures scheduled yet.</div>
                <div className="text-chalkMuted text-sm mt-2">Use the panel on the left to create one.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
