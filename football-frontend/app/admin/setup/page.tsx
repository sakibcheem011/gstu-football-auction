'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Settings, Shield, Users, CheckCircle, ArrowLeft, BadgeCheck, Activity, DollarSign, Plus, UserPlus, Database, Trash2, Edit2, X } from 'lucide-react';
import { io } from 'socket.io-client';
import PlayerDirectory from '../../../components/PlayerDirectory';
import Dropdown from '../../../components/Dropdown';

export default function SuperAdminSetup() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTabState] = useState('config');

  useEffect(() => {
    const saved = localStorage.getItem('adminActiveTab');
    if (saved) setActiveTabState(saved);
  }, []);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem('adminActiveTab', tab);
  };
  
  // Data States
  const [config, setConfig] = useState<any>({});
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

  // Form States (Create)
  const [teamName, setTeamName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [teamPurse, setTeamPurse] = useState('');
  // New States
  const [pendingManagers, setPendingManagers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');

  const [tiers, setTiers] = useState<any[]>([]);
  const [tierMin, setTierMin] = useState('');
  const [tierMax, setTierMax] = useState('');
  const [tierRaise, setTierRaise] = useState('');

  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionName, setSessionName] = useState('');

  // Timer States
  const [defaultTimer, setDefaultTimer] = useState<number>(30);
  const [timerLocked, setTimerLocked] = useState<boolean>(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState<string>('150000');

  // Form States (Edit Manager)
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamPurse, setEditTeamPurse] = useState('');
  const [editManagerName, setEditManagerName] = useState('');
  const [editManagerEmail, setEditManagerEmail] = useState('');
  const [editManagerPhone, setEditManagerPhone] = useState('');
  const [editManagerPassword, setEditManagerPassword] = useState('');

  // Form States (Player Details / Edit)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerStudentId, setEditPlayerStudentId] = useState('');
  const [editPlayerSessionId, setEditPlayerSessionId] = useState('');
  const [editPlayerJerseyName, setEditPlayerJerseyName] = useState('');
  const [editPlayerPositions, setEditPlayerPositions] = useState<any[]>([]);
  const [editPlayerCategoryId, setEditPlayerCategoryId] = useState('');

  // Staff States
  const [staff, setStaff] = useState<any[]>([]);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('PODIUM_ADMIN');

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, message: string, onConfirm: () => void } | null>(null);

  // Approve Manager Modal State
  const [approveDialog, setApproveDialog] = useState<{ isOpen: boolean, manager: any } | null>(null);
  const [approveTeamName, setApproveTeamName] = useState('');
  const [approvePurse, setApprovePurse] = useState('1500000');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      fetchData(t);
    }

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`');
    socket.on('player_registered', (newPlayer) => {
      setPlayers((prev) => [...prev, newPlayer]);
      toast.success(`New player registered: ${newPlayer.name}`, { icon: '⚽' });
    });
    socket.on('data_updated', () => {
      if (t) fetchData(t);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchData = async (t: string) => {
    try {
      const [resConfig, resTeams, resPlayers, resStaff, resCat, resTier, resSess, resPending] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/config'),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`teams'),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`players', { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`auth/staff', { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/categories'),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/tiers'),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/sessions'),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`teams/pending-managers', { headers: { Authorization: `Bearer ${t}` } })
      ]);
      const dataConfig = await resConfig.json();
      const dataTeams = await resTeams.json();
      const dataPlayers = await resPlayers.json();
      const dataStaff = await resStaff.json();
      const dataPending = await resPending.json();
      
      setCategories(await resCat.json());
      setTiers(await resTier.json());
      setSessions(await resSess.json());
      
      setConfig(dataConfig);
      if (dataConfig) {
        setDefaultTimer(dataConfig.defaultTimer || 30);
        setTimerLocked(dataConfig.timerLocked || false);
        setTotalBudgetInput(dataConfig.totalBudget ? String(dataConfig.totalBudget) : '150000');
      }
      setTeams(Array.isArray(dataTeams) ? dataTeams : []);
      setPlayers(Array.isArray(dataPlayers) ? dataPlayers : []);
      setStaff(Array.isArray(dataStaff) ? dataStaff : []);
      setPendingManagers(Array.isArray(dataPending) ? dataPending : []);
    } catch (e) {
      console.error(e);
    }
  };

  const updatePhase = async (phase: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/phase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ phase })
    });
    if (res.ok) {
      toast.success(`Phase changed to ${phase}`);
      setConfig({ ...config, currentPhase: phase });
    } else {
      toast.error('Failed to update phase');
    }
  };

  const updateTimerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/timer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ defaultTimer, timerLocked })
    });
    if (res.ok) {
      toast.success('Timer settings updated');
      fetchData(token!);
    } else {
      toast.error('Failed to update timer settings');
    }
  };

  const updateBudgetConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/budget', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ totalBudget: parseInt(totalBudgetInput) || 150000 })
    });
    if (res.ok) {
      toast.success('League Total Budget updated');
      fetchData(token!);
    } else {
      toast.error('Failed to update total budget');
    }
  };



  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: catName, basePrice: catPrice })
    });
    if (res.ok) { toast.success('Category Added'); setCatName(''); setCatPrice(''); fetchData(token!); }
  };

  const deleteCategory = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/rules/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchData(token!);
  };

  const createTier = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/tiers', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ minPct: tierMin, maxPct: tierMax, raisePct: tierRaise })
    });
    if (res.ok) { toast.success('Tier Added'); setTierMin(''); setTierMax(''); setTierRaise(''); fetchData(token!); }
  };

  const deleteTier = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/rules/tiers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchData(token!);
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/sessions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: sessionName })
    });
    if (res.ok) { toast.success('Session Added'); setSessionName(''); fetchData(token!); }
  };

  const deleteSession = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/rules/sessions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchData(token!);
  };

  const openApproveModal = (manager: any) => {
    setApproveTeamName(manager.desiredTeamName || '');
    setApprovePurse(config?.totalBudget ? String(config.totalBudget) : '1500000');
    setApproveDialog({ isOpen: true, manager });
  };

  const executeApproveManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveDialog || !approveTeamName) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`teams/approve-manager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        userId: approveDialog.manager.id,
        teamName: approveTeamName,
        purse: approvePurse || undefined
      })
    });
    if (res.ok) {
      toast.success('Manager Approved & Franchise Established!');
      setApproveDialog(null);
      fetchData(token!);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to approve manager');
    }
  };

  const openEditManager = (team: any) => {
    setEditingTeam(team);
    setEditTeamName(team.name || '');
    setEditTeamPurse(team.remainingBudget ? String(team.remainingBudget) : '');
    setEditManagerName(team.manager?.name || '');
    setEditManagerEmail(team.manager?.email || '');
    setEditManagerPhone(team.manager?.phone || '');
    setEditManagerPassword('');
  };

  const updateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/teams/${editingTeam.id}/manager`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        teamName: editTeamName,
        purse: editTeamPurse || undefined,
        name: editManagerName, 
        email: editManagerEmail, 
        phone: editManagerPhone || undefined,
        password: editManagerPassword || undefined
      })
    });
    
    if (res.ok) {
      toast.success('Franchise updated!');
      setEditingTeam(null);
      fetchData(token!);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to update franchise');
    }
  };

  const deleteTeam = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to delete this franchise and its manager?",
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/teams/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Franchise deleted');
          fetchData(token!);
        } else {
          toast.error('Failed to delete team');
        }
      }
    });
  };

  const createStaffAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`auth/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: staffName, email: staffEmail, password: staffPassword, role: staffRole })
    });
    if (res.ok) {
      toast.success('Staff Account Created');
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      fetchData(token!);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to create staff');
    }
  };

  const deleteStaff = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to delete this staff member?",
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/auth/staff/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Staff deleted');
          fetchData(token!);
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to delete staff');
        }
      }
    });
  };

  const openPlayerDetails = (player: any) => {
    setSelectedPlayer(player);
    setIsEditingPlayer(false);
    setEditPlayerName(player.name);
    setEditPlayerStudentId(player.studentId);
    setEditPlayerSessionId(player.sessionId || '');
    setEditPlayerJerseyName(player.jerseyName || '');
    setEditPlayerPositions(player.positions || []);
    setEditPlayerCategoryId(player.categoryId || '');
  };

  const togglePosition = (posStr: string) => {
    setEditPlayerPositions(prev => {
      if (prev.some(p => p.position === posStr)) {
        const next = prev.filter(p => p.position !== posStr);
        if (next.length > 0) next[0].isPrimary = true;
        return next;
      }
      if (prev.length < 2) {
        return [...prev, { position: posStr, isPrimary: prev.length === 0 }];
      }
      // If already 2, replace the secondary
      return [prev[0], { position: posStr, isPrimary: false }];
    });
  };

  const updatePlayerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/players/${selectedPlayer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: editPlayerName,
        studentId: editPlayerStudentId,
        sessionId: editPlayerSessionId,
        jerseyName: editPlayerJerseyName,
        positions: editPlayerPositions,
        categoryId: editPlayerCategoryId || undefined
      })
    });
    if (res.ok) {
      toast.success('Player updated');
      setIsEditingPlayer(false);
      setSelectedPlayer({ ...selectedPlayer, name: editPlayerName, studentId: editPlayerStudentId, sessionId: editPlayerSessionId, jerseyName: editPlayerJerseyName, positions: editPlayerPositions, categoryId: editPlayerCategoryId || null });
      fetchData(token!);
    } else {
      toast.error('Failed to update player');
    }
  };

  const deletePlayer = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to completely delete this player? This cannot be undone.",
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/players/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Player deleted');
          setSelectedPlayer(null);
          fetchData(token!);
        } else {
          toast.error('Failed to delete player');
        }
      }
    });
  };

  const approvePlayer = async (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    if (!player.categoryId) {
      toast.error('Please assign a Player Category before approving.');
      openPlayerDetails(player);
      setIsEditingPlayer(true);
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'UNSOLD' })
    });
    if (res.ok) {
      toast.success('Player Approved for Auction');
      fetchData(token!);
    }
  };

  const executeSystemReset = async (level: number) => {
    setConfirmDialog({
      isOpen: true,
      message: `WARNING: You are about to execute a Level ${level} System Reset. This action is irreversible. Are you sure?`,
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/system/reset/level${level}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message);
          fetchData(token!);
        } else {
          toast.error(data.error || 'Failed to execute reset');
        }
      }
    });
  };

  if (!token) return <div className="p-10 font-display text-2xl text-chalk">Access Denied</div>;

  const tabs = [
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'teams', label: 'Franchises', icon: Shield },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'staff', label: 'Podium & Admin', icon: BadgeCheck },
    { id: 'danger', label: 'Data Management', icon: Trash2 }
  ];

  return (
    <div className="flex-1 p-6 md:p-10 text-chalk font-body relative z-0 flex flex-col min-h-screen bg-ink">
      
      
      {/* Edit Manager Modal */}
      <AnimatePresence>
        {editingTeam && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-panel border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setEditingTeam(null)} className="absolute top-6 right-6 text-chalkMuted hover:text-white transition">
                <X size={24} />
              </button>
              
              <h2 className="text-xl font-display text-white mb-2">Edit {editingTeam.name}</h2>
              <p className="text-xs text-chalkMuted uppercase tracking-widest mb-6">Update franchise and manager info</p>
              
              <form onSubmit={updateManager} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Team Name</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editTeamName} onChange={e => setEditTeamName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Purse Budget (TK )</label>
                    <input type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editTeamPurse} onChange={e => setEditTeamPurse(e.target.value)} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Manager Name</label>
                  <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editManagerName} onChange={e => setEditManagerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Email / Login ID</label>
                  <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editManagerEmail} onChange={e => setEditManagerEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Phone Number (Optional)</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editManagerPhone} onChange={e => setEditManagerPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">New Password (Optional)</label>
                  <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editManagerPassword} onChange={e => setEditManagerPassword(e.target.value)} placeholder="Leave blank to keep current" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full px-8 py-3.5 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-gold/20">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Details Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-panel border border-white/10 rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 right-6 text-chalkMuted hover:text-white transition z-10 bg-black/50 p-2 rounded-full">
                <X size={20} />
              </button>
              
              <div className="h-48 w-full relative overflow-hidden bg-white/5 shrink-0">
                <img src={selectedPlayer.imageUrl} alt={selectedPlayer.name} className="w-full h-full object-cover opacity-60 blur-sm" />
                <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-ink via-ink/80 to-transparent">
                  <div className="flex items-center gap-6">
                    <img src={selectedPlayer.imageUrl} alt={selectedPlayer.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl" />
                    <div>
                      <h2 className="text-2xl font-display text-white">{selectedPlayer.name}</h2>
                      <div className="text-chalkMuted font-mono text-sm">{selectedPlayer.studentId}  {selectedPlayer.sessionId}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    {selectedPlayer.positions?.map((pos: any, idx: number) => (
                      <span key={pos.id || pos.position || idx} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-chalk">
                        {pos.position}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsEditingPlayer(!isEditingPlayer)} 
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ${isEditingPlayer ? 'bg-white text-ink' : 'bg-white/5 hover:bg-white/10 text-chalk'}`}
                    >
                      {isEditingPlayer ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                    <button 
                      onClick={() => deletePlayer(selectedPlayer.id)}
                      className="px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {isEditingPlayer ? (
                  <form onSubmit={updatePlayerDetails} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editPlayerName} onChange={e => setEditPlayerName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Student ID</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editPlayerStudentId} onChange={e => setEditPlayerStudentId(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Session</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editPlayerSessionId} onChange={e => setEditPlayerSessionId(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Jersey Name</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editPlayerJerseyName} onChange={e => setEditPlayerJerseyName(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2 relative z-50">
                      <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Player Category (Required for Auction)</label>
                      <Dropdown
                        options={categories.map(c => ({
                          label: `${c.name} (Base: TK ${c.basePrice.toLocaleString()})`,
                          value: c.id
                        }))}
                        value={editPlayerCategoryId}
                        onChange={setEditPlayerCategoryId}
                        placeholder="-- Select Category --"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Playing Positions</label>
                      <div className="flex flex-wrap gap-2">
                        {['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'].map(pos => {
                          const selectedPos = editPlayerPositions.find(p => p.position === pos);
                          const isSelected = !!selectedPos;
                          const isPrimary = selectedPos?.isPrimary;
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => togglePosition(pos)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors border flex items-center gap-1 ${isSelected ? (isPrimary ? 'bg-gold text-ink border-gold' : 'bg-gold/20 text-gold border-gold/50') : 'bg-white/5 text-chalkMuted border-white/10 hover:border-white/30 hover:text-white'}`}
                            >
                              {pos}
                              {isSelected && (
                                <span className="text-[9px] opacity-70">
                                  ({isPrimary ? 'P' : 'S'})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="pt-2">
                      <button type="submit" className="w-full px-8 py-3.5 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold uppercase tracking-widest transition-all">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="text-[10px] font-bold text-chalkMuted uppercase tracking-widest mb-1">Status</div>
                        <div className={`text-sm font-bold uppercase tracking-widest ${selectedPlayer.status === 'SOLD' ? 'text-gold' : selectedPlayer.status === 'UNSOLD' ? 'text-cyan-400' : 'text-chalk'}`}>
                          {selectedPlayer.status}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="text-[10px] font-bold text-chalkMuted uppercase tracking-widest mb-1">Team</div>
                        <div className="text-sm font-bold uppercase tracking-widest text-white">
                          {selectedPlayer.team ? selectedPlayer.team.name : 'None'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col lg:flex-row gap-8 pb-10">
        
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0">
          <h1 className="font-display text-4xl text-white tracking-[0.2em] mb-8 lg:mb-12">CONFIG HUB</h1>
          
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 scrollbar-hide sticky top-24">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold tracking-widest text-xs uppercase transition-all duration-300 shrink-0 text-left group ${
                    isActive 
                      ? 'bg-gold text-ink shadow-[0_4px_20px_rgba(232,184,75,0.3)]' 
                      : 'bg-panel text-chalkMuted hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-ink' : 'text-chalkMuted group-hover:text-white transition-colors'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            
            {activeTab === 'config' && (
              <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                
                <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8 flex items-center gap-3">
                    <Activity className="text-cyan-400" size={18} /> Tournament Pipeline
                  </h2>
                  
                  <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full"></div>
                    
                    {['SETUP', 'REGISTRATION', 'AUCTION'].map((phase, index) => {
                      const isCurrent = config?.currentPhase === phase;
                      const isPast = ['SETUP', 'REGISTRATION', 'AUCTION'].indexOf(config?.currentPhase || 'SETUP') > index;
                      
                      return (
                        <div key={phase} className="relative z-10 flex flex-col items-center gap-4">
                          <button
                            onClick={() => updatePhase(phase)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-xl
                              ${isCurrent ? 'bg-cyan-500 text-ink ring-4 ring-cyan-500/30 scale-110' : 
                                isPast ? 'bg-gold text-ink' : 'bg-ink border-2 border-white/20 text-chalk hover:border-gold/50'}`}
                          >
                            {isPast ? <CheckCircle size={20} /> : index + 1}
                          </button>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCurrent ? 'text-cyan-400' : isPast ? 'text-gold' : 'text-chalkMuted'}`}>
                            {phase}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-10 grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="bg-ink border border-white/5 rounded-xl p-4 shadow-lg text-center shadow-inner">
                      <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-1">Min Roster Size</div>
                      <div className="text-2xl font-bold text-white">{config?.minRosterSize || 15}</div>
                    </div>
                    <div className="bg-ink border border-white/5 rounded-xl p-4 shadow-lg text-center shadow-inner relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="text-[10px] uppercase tracking-widest text-chalkMuted font-bold mb-1 relative z-10">Max Roster Size</div>
                      <div className="text-2xl font-bold text-cyan-400 relative z-10">{config?.maxRosterSize || 18}</div>
                      <div className="text-[9px] text-chalkMuted mt-1 relative z-10">Dynamically Calculated</div>
                    </div>
                  </div>
                </section>


                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl">
                    <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8">Player Categories (Tiers)</h2>
                    <form onSubmit={createCategory} className="flex flex-wrap gap-4 mb-6">
                      <input type="text" placeholder="Tier Name (e.g. Platinum)" required className="flex-1 min-w-[180px] bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={catName} onChange={e => setCatName(e.target.value)} />
                      <input type="number" placeholder="Base Price" required className="flex-1 sm:flex-none sm:w-32 min-w-[120px] bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={catPrice} onChange={e => setCatPrice(e.target.value)} />
                      <button type="submit" className="px-6 py-3 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap shrink-0 transition-colors">Add</button>
                    </form>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {categories.map(c => (
                        <div key={c.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                          <div>
                            <span className="font-bold text-white mr-4">{c.name}</span>
                            <span className="text-cyan-400 font-semibold">TK {c.basePrice.toLocaleString()}</span>
                          </div>
                          <button onClick={() => deleteCategory(c.id)} className="text-danger hover:text-red-400"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="space-y-8">
                    <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl">
                      <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8">Bidding Raise Tiers</h2>
                      <form onSubmit={createTier} className="flex flex-wrap gap-4 mb-6">
                        <div className="flex gap-4 flex-1 min-w-[180px]">
                          <input type="number" step="0.1" placeholder="Min %" required className="w-1/2 bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={tierMin} onChange={e => setTierMin(e.target.value)} />
                          <input type="number" step="0.1" placeholder="Max %" required className="w-1/2 bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={tierMax} onChange={e => setTierMax(e.target.value)} />
                        </div>
                        <input type="number" step="0.01" placeholder="Raise %" required className="flex-1 sm:flex-none sm:w-32 min-w-[120px] bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={tierRaise} onChange={e => setTierRaise(e.target.value)} />
                        <button type="submit" className="px-6 py-3 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap shrink-0 transition-colors">Add</button>
                      </form>
                      <div className="space-y-2">
                        {tiers.map(t => (
                          <div key={t.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                            <div>
                              <span className="font-bold text-white mr-4">{t.minPct}% - {t.maxPct}%</span>
                              <span className="text-cyan-400 font-semibold">Raise {t.raisePct}%</span>
                            </div>
                            <button onClick={() => deleteTier(t.id)} className="text-danger hover:text-red-400"><Trash2 size={16}/></button>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl">
                      <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8">Academic Sessions</h2>
                      <form onSubmit={createSession} className="flex flex-wrap gap-4 mb-6">
                        <input type="text" placeholder="e.g. 2020-21" required className="flex-1 min-w-[180px] bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={sessionName} onChange={e => setSessionName(e.target.value)} />
                        <button type="submit" className="px-6 py-3 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap shrink-0 transition-colors">Add</button>
                      </form>
                      <div className="flex flex-wrap gap-2">
                        {sessions.map(s => (
                          <div key={s.id} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-chalk">
                            {s.name}
                            <button onClick={() => deleteSession(s.id)} className="text-danger hover:text-red-400 ml-2"><X size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>

                <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl max-w-2xl">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8 flex items-center gap-3">
                    <Settings className="text-gold" size={18} /> Auction Timer Settings
                  </h2>
                  <form onSubmit={updateTimerConfig} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Default Timer Duration (Sec)</label>
                        <input 
                          type="number" 
                          required 
                          className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" 
                          value={defaultTimer} 
                          onChange={e => setDefaultTimer(parseInt(e.target.value) || 0)} 
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-end pb-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-12 h-6 rounded-full transition-colors relative ${timerLocked ? 'bg-gold' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${timerLocked ? 'translate-x-6' : ''}`} />
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={timerLocked} 
                            onChange={e => setTimerLocked(e.target.checked)} 
                          />
                          <div>
                            <div className="font-bold text-white text-sm">Lock Timer Duration</div>
                            <div className="text-[10px] text-chalkMuted">Prevent Podium from changing timer</div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <button type="submit" className="w-full px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors border border-white/10">
                      Save Timer Settings
                    </button>
                  </form>
                </section>

                <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl max-w-2xl">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8 flex items-center gap-3">
                    <DollarSign className="text-gold" size={18} /> League Standard Total Budget
                  </h2>
                  <form onSubmit={updateBudgetConfig} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">
                        Global Standard Purse Budget (TK)
                      </label>
                      <input 
                        type="number" 
                        required 
                        className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" 
                        value={totalBudgetInput} 
                        onChange={e => setTotalBudgetInput(e.target.value)} 
                      />
                      <p className="text-[11px] text-chalkMuted mt-1">
                        This budget is used to calculate percentage-based bidding raise tiers for all auction blocks.
                      </p>
                    </div>
                    <button type="submit" className="w-full px-8 py-3 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(232,184,75,0.2)]">
                      Save League Budget
                    </button>
                  </form>
                </section>
              </motion.div>
            )}

            {activeTab === 'teams' && (
              <motion.div key="teams" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8 flex items-center gap-3">
                    <UserPlus className="text-gold" size={18} /> Pending Manager Registrations
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingManagers.map(m => (
                      <div key={m.id} className="bg-ink border border-gold/30 shadow-lg rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span className="font-bold text-lg text-white block mb-1">{m.name}</span>
                            <div className="text-[10px] text-chalkMuted">
                              <div>Email: {m.email}</div>
                              <div>Phone: {m.phone || 'N/A'}</div>
                            </div>
                          </div>
                          <button onClick={() => openApproveModal(m)} className="px-4 py-2 bg-gold hover:bg-yellow-400 text-ink rounded-lg font-bold uppercase tracking-widest text-xs transition">
                            Approve
                          </button>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl mt-2">
                          <span className="text-[10px] text-chalkMuted uppercase tracking-widest mb-1 block">Desired Franchise</span>
                          <span className="text-white font-bold">{m.desiredTeamName || 'Not Specified'}</span>
                        </div>
                      </div>
                    ))}
                    {pendingManagers.length === 0 && <div className="col-span-full py-8 text-center text-chalkMuted italic text-sm">No pending managers found.</div>}
                  </div>
                </section>

                <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8">Active Franchises ({teams.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map(t => (
                      <div key={t.id} className="bg-ink border border-white/5 shadow-lg hover:border-gold/30 rounded-2xl p-5 flex flex-col justify-between transition-colors group">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span className="font-bold text-lg text-white group-hover:text-gold transition-colors block mb-1">{t.name}</span>
                            {t.manager && (
                              <div className="text-[10px] text-chalkMuted">
                                <div>Mgr: {t.manager.name}</div>
                                <div>ID: {t.manager.phone || t.manager.email}</div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditManager(t)} className="p-2 bg-white/5 hover:bg-white/10 hover:text-white text-chalkMuted rounded-lg transition" title="Edit Manager">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteTeam(t.id)} className="p-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg transition" title="Delete Franchise">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-start bg-white/5 p-3 rounded-xl">
                          <span className="text-[10px] text-chalkMuted uppercase tracking-widest mb-1">Purse</span>
                          <span className="text-cyan-400 font-mono font-bold">TK {t.remainingBudget.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {teams.length === 0 && <div className="col-span-full py-8 text-center text-chalkMuted italic text-sm">No franchises established.</div>}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'players' && (
              <motion.div key="players" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-panel rounded-3xl border border-white/10 shadow-xl p-8 h-[calc(100vh-250px)]">
                  <div className="border-b border-white/5 pb-4 mb-4">
                    <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk flex items-center gap-3">
                      <CheckCircle className="text-cyan-400" size={18} /> Approval Queue & Database
                    </h2>
                  </div>
                  <PlayerDirectory 
                    players={players} 
                    onAction={(p) => { openPlayerDetails(p); setIsEditingPlayer(true); }}
                    actionLabel="Categorize Player"
                    actionCondition={(p) => !p.categoryId}
                    onSecondaryAction={(p) => openPlayerDetails(p)}
                    secondaryActionLabel="Edit / View Details"
                    showStatusFilter={true}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'staff' && (
              <motion.div key="staff" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8 flex items-center gap-3">
                    <UserPlus className="text-gold" size={18} /> Invite Staff Member
                  </h2>
                  <form onSubmit={createStaffAccount} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Name</label>
                      <input type="text" required className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-gold outline-none transition-all" value={staffName} onChange={e => {
                        const val = e.target.value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                        setStaffName(val);
                      }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Email</label>
                      <input type="email" required className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-gold outline-none transition-all" value={staffEmail} onChange={e => setStaffEmail(e.target.value.toLowerCase())} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Password</label>
                      <input type="password" required className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-gold outline-none transition-all" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2 col-span-full">
                      <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Access Level</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setStaffRole('PODIUM_ADMIN')}
                          className={`p-4 rounded-xl border text-left transition-all ${staffRole === 'PODIUM_ADMIN' ? 'bg-gold/10 border-gold/50 text-white shadow-[0_0_15px_rgba(232,184,75,0.1)]' : 'bg-ink/50 border-white/10 text-chalkMuted hover:border-white/30'}`}
                        >
                          <div className={`font-bold text-sm mb-1 ${staffRole === 'PODIUM_ADMIN' ? 'text-gold' : 'text-chalk'}`}>Podium Admin</div>
                          <div className="text-[10px] uppercase tracking-widest opacity-80">Auctioneer Access</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStaffRole('SUPER_ADMIN')}
                          className={`p-4 rounded-xl border text-left transition-all ${staffRole === 'SUPER_ADMIN' ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-ink/50 border-white/10 text-chalkMuted hover:border-white/30'}`}
                        >
                          <div className={`font-bold text-sm mb-1 ${staffRole === 'SUPER_ADMIN' ? 'text-cyan-400' : 'text-chalk'}`}>Super Admin</div>
                          <div className="text-[10px] uppercase tracking-widest opacity-80">Full System Control</div>
                        </button>
                      </div>
                    </div>
                    <div className="col-span-full pt-2">
                      <button type="submit" className="w-full md:w-auto px-8 py-3.5 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold uppercase tracking-widest transition-all text-xs shadow-lg shadow-gold/20">
                        Create Access
                      </button>
                    </div>
                  </form>
                </section>

                <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8">Registered Personnel ({staff.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staff.map(s => (
                      <div key={s.id} className="bg-ink border border-white/5 shadow-lg rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-lg text-white block mb-1">{s.name}</span>
                          <span className="text-[10px] text-chalkMuted uppercase tracking-widest">{s.email}</span>
                          <span className={`mt-2 block text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg w-max ${s.role === 'SUPER_ADMIN' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                            {s.role.replace('_', ' ')}
                          </span>
                        </div>
                        <button onClick={() => deleteStaff(s.id)} className="p-3 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl transition" title="Delete Staff">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {staff.length === 0 && <div className="col-span-full py-8 text-center text-chalkMuted italic text-sm">No staff members found.</div>}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'danger' && (
              <motion.div key="danger" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <section className="glass-panel p-8 rounded-[2rem] border-danger/30 bg-danger/5">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-danger mb-8 flex items-center gap-3">
                    <Trash2 size={18} /> System Reset Options
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-ink/50 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-white mb-1">Level 1: Soft Reset (Economy & Tournaments)</h3>
                        <p className="text-xs text-chalkMuted tracking-wide">Clears all match fixtures, results, and statistics. Resets franchise budgets and reverts all players to unsold status. Auction history is cleared.</p>
                      </div>
                      <button onClick={() => executeSystemReset(1)} className="px-6 py-3 bg-white/5 hover:bg-danger/20 text-danger border border-danger/20 hover:border-danger/50 rounded-xl font-bold uppercase tracking-widest text-xs transition whitespace-nowrap">
                        Execute Soft Reset
                      </button>
                    </div>

                    <div className="bg-ink/50 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-gold mb-1">Level 2: Hard Reset (Players & Franchises)</h3>
                        <p className="text-xs text-chalkMuted tracking-wide">Performs a soft reset and additionally deletes all player registrations and their uploaded media. Reverts the system phase to Registration.</p>
                      </div>
                      <button onClick={() => executeSystemReset(2)} className="px-6 py-3 bg-white/5 hover:bg-gold/20 text-gold border border-gold/20 hover:border-gold/50 rounded-xl font-bold uppercase tracking-widest text-xs transition whitespace-nowrap">
                        Execute Hard Reset
                      </button>
                    </div>

                    <div className="bg-ink/50 border border-danger/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-danger/20 to-transparent pointer-events-none" />
                      <div className="relative z-10">
                        <h3 className="font-bold text-lg text-danger mb-1">Level 3: Factory Reset</h3>
                        <p className="text-xs text-chalkMuted tracking-wide">Complete system wipe. Deletes all players, franchises, managers, categories, and settings. Reverts the system to its initial setup state. Only Super Admin accounts are preserved.</p>
                      </div>
                      <button onClick={() => executeSystemReset(3)} className="px-6 py-3 bg-danger hover:bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] whitespace-nowrap relative z-10">
                        Factory Reset
                      </button>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-panel border border-white/10 p-8 rounded-3xl max-w-sm w-full">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Action</h3>
              <p className="text-chalk mb-8">
                {confirmDialog.message}
              </p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className="px-6 py-2 bg-danger hover:bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approve Manager Dialog */}
      <AnimatePresence>
        {approveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-panel border border-white/10 p-8 rounded-3xl max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Establish Franchise</h3>
              
              <form onSubmit={executeApproveManager} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Franchise Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" 
                    value={approveTeamName} 
                    onChange={e => setApproveTeamName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Team Purse (TK)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" 
                    value={approvePurse} 
                    onChange={e => setApprovePurse(e.target.value)} 
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setApproveDialog(null)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold text-xs uppercase tracking-widest transition"
                  >
                    Approve
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
