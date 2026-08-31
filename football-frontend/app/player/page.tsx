'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, User, Trophy, Shield, Goal, Flag, Edit2, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PlayerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editJerseyName, setEditJerseyName] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editSessionId, setEditSessionId] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');

  const openEdit = () => {
    if (user?.playerRecord) {
      setEditName(user.playerRecord.name || '');
      setEditJerseyName(user.playerRecord.jerseyName || '');
      setEditStudentId(user.playerRecord.studentId || '');
      setEditSessionId(user.playerRecord.sessionId || '');
      setEditFile(null);
      setIsEditing(true);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('jerseyName', editJerseyName);
    formData.append('studentId', editStudentId);
    formData.append('sessionId', editSessionId);
    if (editFile) {
      formData.append('image', editFile);
    }

    const toastId = toast.loading('Updating profile...');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/${user.playerRecord.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    
    toast.dismiss(toastId);
    if (res.ok) {
      const data = await res.json();
      toast.success('Profile updated successfully!');
      const updatedUser = { 
        ...user, 
        playerRecord: { 
          ...user.playerRecord, 
          name: editName, 
          jerseyName: editJerseyName, 
          studentId: editStudentId, 
          sessionId: editSessionId,
          imageUrl: data.imageUrl || user.playerRecord.imageUrl
        } 
      };
      setUser(updatedUser);
      setIsEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL }/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.role !== 'PLAYER') {
          router.push('/');
        } else {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push('/');
      });
  }, [router]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-gold font-display text-2xl">LOADING DASHBOARD...</div>;
  if (!user || !user.playerRecord) return <div className="flex-1 p-10 text-chalk text-center">Failed to load player data.</div>;

  const p = user.playerRecord;

  return (
    <div className="flex-1 p-6 md:p-10 text-chalk font-body relative z-0 flex flex-col min-h-screen bg-ink">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.2em] drop-shadow-md uppercase">PLAYER DASHBOARD</h1>
          <div className="flex gap-2 bg-ink/50 border border-white/5 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500 text-white shadow-lg' : 'text-chalkMuted hover:text-white'}`}
            >
              My Profile
            </button>
            <button 
              onClick={() => setActiveTab('vote')} 
              className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'vote' ? 'bg-emerald-500 text-white shadow-lg' : 'text-chalkMuted hover:text-white'}`}
            >
              Vote Jerseys
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-panel rounded-[2rem] p-8 border border-white/5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden h-full">
              {/* Subtle top accent line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
              
              <div className="absolute top-4 right-4 z-20">
                <button onClick={isEditing ? () => setIsEditing(false) : openEdit} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-chalkMuted hover:text-white transition-colors border border-white/5">
                  {isEditing ? <span className="text-xs uppercase font-bold tracking-widest">Cancel</span> : <Edit2 size={16} />}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="w-full mt-4 space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className="w-full bg-ink border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-widest ml-1">Student ID</label>
                    <input type="text" value={editStudentId} onChange={e => setEditStudentId(e.target.value)} required className="w-full bg-ink border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-widest ml-1">Session</label>
                    <input type="text" value={editSessionId} onChange={e => setEditSessionId(e.target.value)} required className="w-full bg-ink border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-widest ml-1">Jersey Name</label>
                    <input type="text" value={editJerseyName} onChange={e => setEditJerseyName(e.target.value)} className="w-full bg-ink border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-widest ml-1">Profile Photo</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        onChange={e => setEditFile(e.target.files?.[0] || null)} 
                      />
                      <div className={`w-full border border-dashed rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-300 ${editFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-ink group-hover:border-emerald-500/30'}`}>
                        {editFile ? (
                          <span className="text-emerald-400 font-bold text-xs">{editFile.name}</span>
                        ) : (
                          <span className="text-chalkMuted font-semibold text-xs group-hover:text-emerald-400 transition-colors">Click or drag image to change</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold uppercase tracking-widest rounded-xl border border-emerald-500/20 transition-colors mt-4">
                    Save Changes
                  </button>
                </form>
              ) : (
                <>
                  <div className="relative w-40 h-40 mb-8 mt-4">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative bg-ink flex items-center justify-center p-1">
                      <div className="w-full h-full rounded-full overflow-hidden bg-panel">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                          <User size={48} className="w-full h-full p-8 text-chalk/20" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider mb-2">{p.name}</h2>
                  <p className="text-emerald-400 font-mono text-sm mb-6 uppercase tracking-widest">{p.studentId} • Session {p.sessionId}</p>
                  
                  <div className="w-full h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0 my-4" />
                  
                  <div className="w-full space-y-4 my-2">
                    <div className="flex justify-between items-center px-4 bg-ink/50 p-3 rounded-xl border border-white/5">
                      <span className="text-xs uppercase tracking-widest text-chalkMuted">Jersey Name</span>
                      <span className="font-bold text-white uppercase">{p.jerseyName}</span>
                    </div>
                  </div>

                  {p.positions && p.positions.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-6 w-full px-4">
                      {p.positions.map((pos: any) => (
                        <span key={pos.id} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          {pos.position}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Status & Stats */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-panel rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-lg uppercase tracking-[0.2em] font-bold text-chalk mb-8 relative z-10">
                Auction Status
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                <div className="bg-ink border border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/20 transition-colors shadow-inner">
                  <div className="text-[10px] uppercase tracking-widest text-chalkMuted mb-3 font-bold">Current Status</div>
                  <div className={`text-2xl font-bold uppercase tracking-widest ${p.status === 'SOLD' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-cyan-400'}`}>
                    {p.status}
                  </div>
                </div>

                <div className="bg-ink border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-colors shadow-inner">
                  <div className="text-[10px] uppercase tracking-widest text-chalkMuted mb-3 font-bold">Franchise</div>
                  <div className="text-xl font-bold uppercase tracking-widest text-white">
                    {p.team?.name || '---'}
                  </div>
                </div>

                <div className="bg-ink border border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/20 transition-colors shadow-inner">
                  <div className="text-[10px] uppercase tracking-widest text-chalkMuted mb-3 font-bold">Sold For</div>
                  <div className={`text-2xl font-display tracking-widest ${p.soldPrice ? 'text-emerald-400' : 'text-chalkMuted'}`}>
                    {p.soldPrice ? `TK ${p.soldPrice.toLocaleString('en-IN')}` : '---'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-panel rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-lg uppercase tracking-[0.2em] font-bold text-chalk mb-8 relative z-10">
                Tournament Statistics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {[
                  { label: 'Goals', val: 0 },
                  { label: 'Assists', val: 0 },
                  { label: 'Yellow Cards', val: 0 },
                  { label: 'Clean Sheets', val: 0 }
                ].map((stat, i) => (
                  <div key={i} className="bg-ink border border-white/5 rounded-xl p-5 flex flex-col items-center hover:border-white/20 transition-colors shadow-inner group">
                    <span className="text-4xl font-display text-white mb-3 group-hover:scale-110 transition-transform">{stat.val}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-chalkMuted text-center">{stat.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-xs text-center text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl relative z-10 shadow-inner">
                Tournament Phase has not started yet.
              </div>
            </div>

            <div className="bg-panel rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-lg uppercase tracking-[0.2em] font-bold text-chalk mb-8 relative z-10 flex justify-between items-center">
                My Jersey Designs
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 relative z-10">
                {p.jerseyDesigns?.map((jd: any) => (
                  <div key={jd.id} className="relative group rounded-xl overflow-hidden border border-white/5 bg-ink aspect-[3/4]">
                    <img src={jd.imageUrl} alt="Jersey Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button 
                      onClick={() => setDeleteConfirm(jd.id)} 
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              
              <AnimatePresence>
                {deleteConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-panel border border-white/10 p-6 rounded-3xl max-w-sm w-full">
                      <h3 className="text-xl font-bold text-white mb-3">Delete Jersey?</h3>
                      <p className="text-chalk text-sm mb-6">
                        Are you sure you want to delete this jersey design? This action cannot be undone.
                      </p>
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={async () => {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jerseys/${deleteConfirm}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            if (res.ok) {
                              toast.success('Jersey deleted');
                              setUser({
                                ...user,
                                playerRecord: {
                                  ...p,
                                  jerseyDesigns: p.jerseyDesigns.filter((j: any) => j.id !== deleteConfirm)
                                }
                              });
                            }
                            setDeleteConfirm(null);
                          }}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              
              {(p.jerseyDesigns?.length || 0) >= 3 ? (
                <div className="relative z-10 w-full py-4 border border-white/5 bg-ink/50 rounded-xl flex flex-col items-center justify-center text-chalkMuted">
                  <span className="font-bold uppercase tracking-widest text-xs">Maximum 3 designs allowed</span>
                </div>
              ) : (
                <div className="relative z-10">
                  <input 
                    type="file" 
                    accept="image/*"
                    id="jersey-upload"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const formData = new FormData();
                      formData.append('image', file);
                      
                      const tId = toast.loading('Uploading jersey design...');
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jerseys`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        body: formData
                      });
                      
                      toast.dismiss(tId);
                      if (res.ok) {
                        const newJersey = await res.json();
                        toast.success('Jersey uploaded!');
                        setUser({
                          ...user,
                          playerRecord: {
                            ...p,
                            jerseyDesigns: [newJersey, ...(p.jerseyDesigns || [])]
                          }
                        });
                      } else {
                        const errData = await res.json().catch(() => ({}));
                        toast.error(errData.error || 'Upload failed');
                      }
                    }}
                  />
                  <label htmlFor="jersey-upload" className="w-full py-4 border-2 border-dashed border-emerald-500/30 rounded-xl flex flex-col items-center justify-center text-emerald-400/70 hover:text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/5 cursor-pointer transition-all">
                    <span className="font-bold uppercase tracking-widest text-xs">+ Upload New Jersey Design</span>
                  </label>
                </div>
              )}
            </div>

          </div>

          </div>
        ) : (
          <div className="bg-panel rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl uppercase tracking-[0.2em] font-bold text-white mb-2">Vote for Best Jerseys</h2>
            <p className="text-chalkMuted text-sm mb-8">You can vote for up to 5 jerseys. Explore and vote for your favorites!</p>
            <JerseyVotingPanel playerId={p.id} />
          </div>
        )}
      </div>
    </div>
  );
}

function JerseyVotingPanel({ playerId }: { playerId: string }) {
  const [jerseys, setJerseys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/jerseys`)
      .then(res => res.json())
      .then(data => {
        setJerseys(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleVote = async (jerseyId: string) => {
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Voting...');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jerseys/${jerseyId}/vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      toast.dismiss(toastId);
      
      if (res.ok) {
        toast.success(data.message);
        setJerseys(prev => prev.map(j => {
          if (j.id === jerseyId) {
            const hasVoted = j.votes?.some((v: any) => v.playerId === playerId);
            if (hasVoted) {
              return { ...j, _count: { ...j._count, votes: j._count.votes - 1 }, votes: j.votes.filter((v: any) => v.playerId !== playerId) };
            } else {
              return { ...j, _count: { ...j._count, votes: (j._count?.votes || 0) + 1 }, votes: [...(j.votes || []), { playerId }] };
            }
          }
          return j;
        }));
      } else {
        toast.error(data.error || 'Failed to vote');
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Network error');
    }
  };

  if (loading) return <div className="py-12 text-center text-emerald-400 animate-pulse">Loading jerseys...</div>;
  if (jerseys.length === 0) return <div className="py-12 text-center text-chalkMuted">No jerseys have been submitted yet.</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {jerseys.map((jersey, i) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          key={jersey.id} 
          className="bg-ink border border-white/5 rounded-xl overflow-hidden shadow-xl group hover:border-emerald-500/30 transition-all flex flex-col relative"
        >
          <div className="aspect-[3/4] w-full overflow-hidden bg-black/50 relative">
            <img src={jersey.imageUrl} alt="Jersey Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end">
              <div className="flex justify-between items-end opacity-90 group-hover:opacity-100 transition-opacity">
                <div>
                  <div className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-0.5">Total Votes</div>
                  <div className="text-white font-display text-2xl leading-none">{jersey._count?.votes || 0}</div>
                </div>
                <button 
                  onClick={() => toggleVote(jersey.id)}
                  className={`px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-all ${
                    jersey.votes?.some((v: any) => v.playerId === playerId) 
                      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'
                  }`}
                >
                  {jersey.votes?.some((v: any) => v.playerId === playerId) ? '✓ Voted' : 'Vote'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
