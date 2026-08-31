'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Settings, Shield, Users, CheckCircle, ArrowLeft, BadgeCheck, Activity, DollarSign, Plus, UserPlus, Database, Trash2, Edit2, X, Image as ImageIcon, ListOrdered, User, Shirt, Heart } from 'lucide-react';
import { io } from 'socket.io-client';
import PlayerDirectory from '../../../components/PlayerDirectory';
import Dropdown from '../../../components/Dropdown';
import MultiSelectDropdown from '../../../components/MultiSelectDropdown';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SetupContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');

  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTabState] = useState('config');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [votersModal, setVotersModal] = useState<{ isOpen: boolean; votes: any[] }>({ isOpen: false, votes: [] });

  useEffect(() => {
    if (urlTab) {
      setActiveTabState(urlTab);
      localStorage.setItem('adminActiveTab', urlTab);
    } else {
      const saved = localStorage.getItem('adminActiveTab');
      if (saved) setActiveTabState(saved);
    }
  }, [urlTab]);

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
  const [totalBudgetInput, setTotalBudgetInput] = useState<string>('1,50,000');
  const [minRosterSizeInput, setMinRosterSizeInput] = useState<string>('15');
  const [maxRosterSizeInput, setMaxRosterSizeInput] = useState<string>('18');

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
  const [isCategorizingPlayer, setIsCategorizingPlayer] = useState(false);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerStudentId, setEditPlayerStudentId] = useState('');
  const [editPlayerSessionId, setEditPlayerSessionId] = useState('');
  const [editPlayerJerseyName, setEditPlayerJerseyName] = useState('');
  const [editPlayerJerseyNumber, setEditPlayerJerseyNumber] = useState('');
  const [editPrimaryPos, setEditPrimaryPos] = useState<string>('');
  const [editSecondaryPos, setEditSecondaryPos] = useState<string[]>([]);
  const [editPlayerCategoryId, setEditPlayerCategoryId] = useState('');

  // Staff States
  const [staff, setStaff] = useState<any[]>([]);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('PODIUM_ADMIN');

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, message: string, onConfirm: () => void } | null>(null);

  // Edit Tiers / Categories
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editTierMin, setEditTierMin] = useState('');
  const [editTierMax, setEditTierMax] = useState('');
  const [editTierRaise, setEditTierRaise] = useState('');
  
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatPrice, setEditCatPrice] = useState('');

  // Logo Upload Modal State
  const [logoDialog, setLogoDialog] = useState<{ isOpen: boolean, team: any } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

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

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL }`);
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

  const [jerseys, setJerseys] = useState<any[]>([]);

  const fetchData = async (t: string) => {
    try {
      const [resConfig, resTeams, resPlayers, resStaff, resCat, resTier, resSess, resPending, resJerseys] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/config`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/players`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/auth/staff`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/categories`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/tiers`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/sessions`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams/pending-managers`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL }/jerseys?timestamp=${Date.now()}`, { headers: { Authorization: `Bearer ${t}` } })
      ]);
      const dataConfig = await resConfig.json();
      const dataTeams = await resTeams.json();
      const dataPlayers = await resPlayers.json();
      const dataStaff = await resStaff.json();
      const dataPending = await resPending.json();
      const dataJerseys = await resJerseys.json();
      
      setCategories(await resCat.json());
      setTiers(await resTier.json());
      setSessions(await resSess.json());
      setJerseys(dataJerseys || []);
      
      setConfig(dataConfig);
      if (dataConfig) {
        setDefaultTimer(dataConfig.defaultTimer || 30);
        setTimerLocked(dataConfig.timerLocked || false);
        setTotalBudgetInput(dataConfig.totalBudget ? Number(dataConfig.totalBudget).toLocaleString('en-IN') : '1,50,000');
        setMinRosterSizeInput(dataConfig.minRosterSize ? String(dataConfig.minRosterSize) : '15');
        setMaxRosterSizeInput(dataConfig.maxRosterSize ? String(dataConfig.maxRosterSize) : '18');
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/phase`, {
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

  const updateAuctionMode = async (mode: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/mode`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ auctionMode: mode })
    });
    if (res.ok) {
      toast.success(`Auction Mode changed to ${mode}`);
      setConfig({ ...config, auctionMode: mode });
    } else {
      toast.error('Failed to update auction mode');
    }
  };

  const updateDraftOrder = async (order: any[]) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/draft-order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ order })
    });
    if (res.ok) {
      toast.success('Draft Order updated');
    } else {
      toast.error('Failed to update draft order');
    }
  };

  const updateTimerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/timer`, {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/budget`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ totalBudget: parseInt(totalBudgetInput.replace(/,/g, '')) || 150000 })
    });
    if (res.ok) {
      toast.success('League Total Budget updated');
      fetchData(token!);
    } else {
      toast.error('Failed to update total budget');
    }
  };

  const updateRosterLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/roster-limits`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ minRosterSize: parseInt(minRosterSizeInput), maxRosterSize: parseInt(maxRosterSizeInput) })
    });
    if (res.ok) {
      toast.success('Roster limits updated manually');
      fetchData(token!);
    } else {
      toast.error('Failed to update roster limits');
    }
  };

  const saveEditedTier = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/tiers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ minPct: parseFloat(editTierMin), maxPct: parseFloat(editTierMax), raisePct: parseFloat(editTierRaise) })
    });
    if (res.ok) {
      toast.success('Tier Updated');
      setEditingTierId(null);
      fetchData(token!);
    } else {
      toast.error('Failed to update tier');
    }
  };

  const saveEditedCategory = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: editCatName, basePrice: parseInt(editCatPrice.replace(/,/g, '')) })
    });
    if (res.ok) {
      toast.success('Category Updated');
      setEditingCategoryId(null);
      fetchData(token!);
    } else {
      toast.error('Failed to update category');
    }
  };
  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/categories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: catName, basePrice: catPrice })
    });
    if (res.ok) { toast.success('Category Added'); setCatName(''); setCatPrice(''); fetchData(token!); }
  };

  const deleteCategory = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/rules/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchData(token!);
  };

  const createTier = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/tiers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ minPct: tierMin, maxPct: tierMax, raisePct: tierRaise })
    });
    if (res.ok) { toast.success('Tier Added'); setTierMin(''); setTierMax(''); setTierRaise(''); fetchData(token!); }
  };

  const deleteTier = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/rules/tiers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchData(token!);
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/sessions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: sessionName })
    });
    if (res.ok) { toast.success('Session Added'); setSessionName(''); fetchData(token!); }
  };

  const deleteSession = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/rules/sessions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams/approve-manager`, {
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
      toast.error('Failed to approve manager');
    }
  };

  const executeRejectManager = async (managerId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to reject and delete this manager application?',
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams/reject-manager/${managerId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Manager application rejected.');
          fetchData(token!);
        } else {
          toast.error('Failed to reject manager');
        }
      }
    });
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/teams/${editingTeam.id}/manager`, {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/teams/${id}`, {
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

  const uploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoDialog || !logoFile) return;

    const formData = new FormData();
    formData.append('image', logoFile);

    const toastId = toast.loading('Uploading logo...');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/teams/${logoDialog.team.id}/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      toast.success('Logo uploaded successfully!', { id: toastId });
      setLogoDialog(null);
      setLogoFile(null);
      fetchData(token!);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to upload logo', { id: toastId });
    }
  };

  const createStaffAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/auth/staff`, {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/auth/staff/${id}`, {
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
    setIsCategorizingPlayer(false);
    setEditPlayerName(player.name);
    setEditPlayerStudentId(player.studentId);
    setEditPlayerSessionId(player.sessionId || '');
    setEditPlayerJerseyName(player.jerseyName || '');
    
    const primary = player.positions?.find((p: any) => p.isPrimary)?.position || '';
    const secondary = player.positions?.filter((p: any) => !p.isPrimary).map((p: any) => p.position) || [];
    setEditPrimaryPos(primary);
    setEditSecondaryPos(secondary);
    
    setEditPlayerCategoryId(player.categoryId || '');
  };
  useEffect(() => {
    if (editPrimaryPos && editSecondaryPos.includes(editPrimaryPos)) {
      setEditSecondaryPos(prev => prev.filter(p => p !== editPrimaryPos));
    }
  }, [editPrimaryPos, editSecondaryPos]);

  const updatePlayerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    
    const posArray: any[] = [];
    if (editPrimaryPos) posArray.push({ position: editPrimaryPos, isPrimary: true });
    editSecondaryPos.forEach(p => {
      if (p !== editPrimaryPos) posArray.push({ position: p, isPrimary: false });
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/players/${selectedPlayer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: editPlayerName,
        studentId: editPlayerStudentId,
        sessionId: editPlayerSessionId,
        jerseyName: editPlayerJerseyName,
        positions: posArray,
        categoryId: editPlayerCategoryId || undefined
      })
    });
    if (res.ok) {
      toast.success('Player updated');
      setIsEditingPlayer(false);
      setIsCategorizingPlayer(false);
      setSelectedPlayer({ ...selectedPlayer, name: editPlayerName, studentId: editPlayerStudentId, sessionId: editPlayerSessionId, jerseyName: editPlayerJerseyName, positions: posArray, categoryId: editPlayerCategoryId || null });
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/players/${id}`, {
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/players/${id}`, {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}/system/reset/level${level}`, {
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
    { id: 'jerseys', label: 'Jerseys', icon: Shirt },
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Team Name</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editTeamName} onChange={e => setEditTeamName(e.target.value)} />
                  </div>
                  <div className="space-y-2 opacity-60">
                    <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Purse Budget (Fixed)</label>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none cursor-not-allowed" 
                      value={editTeamPurse ? Number(editTeamPurse).toLocaleString('en-IN') : ''} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Manager Name</label>
                  <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editManagerName} onChange={e => setEditManagerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Email / Login ID</label>
                  <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editManagerEmail} onChange={e => setEditManagerEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Phone Number (Optional)</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editManagerPhone} onChange={e => setEditManagerPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">New Password (Optional)</label>
                  <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editManagerPassword} onChange={e => setEditManagerPassword(e.target.value)} placeholder="Leave blank to keep current" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full px-8 py-3.5 bg-white text-black hover:bg-zinc-200 hover:text-black text-ink rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo Upload Modal */}
      <AnimatePresence>
        {logoDialog && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-panel border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button onClick={() => { setLogoDialog(null); setLogoFile(null); }} className="absolute top-6 right-6 text-chalkMuted hover:text-white transition">
                <X size={24} />
              </button>
              
              <h2 className="text-xl font-display text-white mb-2">Upload Logo for {logoDialog.team.name}</h2>
              <p className="text-xs text-chalkMuted uppercase tracking-widest mb-6">Choose an image file</p>
              
              <form onSubmit={uploadLogo} className="space-y-4">
                <div className="space-y-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    required 
                    onChange={e => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-chalkMuted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition cursor-pointer"
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full px-8 py-3.5 bg-white text-black hover:bg-white text-black text-ink rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg">
                    Upload
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
                {selectedPlayer.imageUrl ? (
                  <img src={selectedPlayer.imageUrl} alt={selectedPlayer.name} className="w-full h-full object-cover opacity-60 blur-sm" />
                ) : (
                  <div className="w-full h-full bg-black/40" />
                )}
                <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-ink via-ink/80 to-transparent">
                  <div className="flex items-center gap-6">
                    {selectedPlayer.imageUrl ? (
                      <img src={selectedPlayer.imageUrl} alt={selectedPlayer.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl bg-black/50 shrink-0" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl border-2 border-white/20 shadow-xl bg-black/50 flex items-center justify-center shrink-0">
                        <User size={32} className="text-white/20" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="text-2xl font-display text-white truncate">{selectedPlayer.name}</h2>
                      <div className="text-chalkMuted font-mono text-sm truncate">{selectedPlayer.studentId}  {selectedPlayer.sessionId}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 gap-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayer.positions?.map((pos: any, idx: number) => (
                      <span key={pos.id || pos.position || idx} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-chalk">
                        {pos.position}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!isEditingPlayer && !isCategorizingPlayer && (
                      <button 
                        onClick={() => setIsCategorizingPlayer(true)}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 shrink-0"
                      >
                        Categorize
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (isCategorizingPlayer) setIsCategorizingPlayer(false);
                        else setIsEditingPlayer(!isEditingPlayer);
                      }} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shrink-0 ${isEditingPlayer || isCategorizingPlayer ? 'bg-white text-ink' : 'bg-white/5 hover:bg-white/10 text-chalk'}`}
                    >
                      {isEditingPlayer ? 'Cancel Edit' : isCategorizingPlayer ? 'Cancel' : 'Edit Profile'}
                    </button>
                    <button 
                      onClick={() => deletePlayer(selectedPlayer.id)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/5 text-zinc-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {isCategorizingPlayer ? (
                  <form onSubmit={updatePlayerDetails} className="space-y-4 mt-6">
                    <div className="space-y-2 relative z-50">
                      <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Player Category (Required for Auction)</label>
                      <Dropdown
                        options={categories.map(c => ({
                          label: `${c.name} (Base: TK ${c.basePrice.toLocaleString('en-IN')})`,
                          value: c.id
                        }))}
                        value={editPlayerCategoryId}
                        onChange={setEditPlayerCategoryId}
                        placeholder="-- Select Category --"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-40">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Primary Position</label>
                        <Dropdown
                          options={['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'].map(p => ({ label: p, value: p }))}
                          value={editPrimaryPos}
                          onChange={setEditPrimaryPos}
                          placeholder="-- Select Primary --"
                        />
                      </div>
                      <div className="space-y-2 relative z-30">
                        <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Secondary Position(s)</label>
                        <MultiSelectDropdown
                          options={['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'].filter(p => p !== editPrimaryPos).map(p => ({ label: p, value: p }))}
                          value={editSecondaryPos}
                          onChange={setEditSecondaryPos}
                          placeholder="-- Select Optional --"
                        />
                      </div>
                    </div>
                    <div className="pt-6 pb-48">
                      <button type="submit" className="w-full px-8 py-3.5 bg-white text-black hover:bg-zinc-200 hover:text-black text-ink rounded-xl font-bold uppercase tracking-widest transition-all">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : isEditingPlayer ? (
                  <form onSubmit={updatePlayerDetails} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editPlayerName} onChange={e => setEditPlayerName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Student ID</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editPlayerStudentId} onChange={e => setEditPlayerStudentId(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Session</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editPlayerSessionId} onChange={e => setEditPlayerSessionId(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Jersey Name</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editPlayerJerseyName} onChange={e => setEditPlayerJerseyName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Jersey Number</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" value={editPlayerJerseyNumber} onChange={e => setEditPlayerJerseyNumber(e.target.value)} placeholder="e.g. 10" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="w-full px-8 py-3.5 bg-white text-black hover:bg-zinc-200 hover:text-black text-ink rounded-xl font-bold uppercase tracking-widest transition-all">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="text-xs font-bold text-chalkMuted uppercase tracking-widest mb-1">Status</div>
                        <div className={`text-sm font-bold uppercase tracking-widest ${selectedPlayer.status === 'SOLD' ? 'text-white' : selectedPlayer.status === 'UNSOLD' ? 'text-white' : 'text-chalk'}`}>
                          {selectedPlayer.status}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="text-xs font-bold text-chalkMuted uppercase tracking-widest mb-1">Team</div>
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
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-w-0 pb-10 px-4">
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold tracking-widest text-[10px] uppercase transition-all flex-1 justify-center min-w-[140px] ${
                  isActive 
                    ? 'bg-white text-ink' 
                    : 'bg-panel text-chalkMuted border border-white/5'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-4xl text-white tracking-[0.2em] mb-8">CONFIG HUB</h1>
          <AnimatePresence mode="wait">
            
            {activeTab === 'config' && (
              
              <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                
                {/* 1. TOURNAMENT PIPELINE (MACRO CONTROL) */}
                <section className="glass-panel p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-400 flex items-center gap-3">
                      <Activity className="text-white" size={16} /> System Pipeline Status
                    </h2>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white border border-white/10">
                      Live Control
                    </div>
                  </div>
                  
                  <div className="relative flex justify-between items-center max-w-3xl mx-auto py-4">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 z-0"></div>
                    
                    {['SETUP', 'REGISTRATION', 'AUCTION', 'TOURNAMENT'].map((phase, index) => {
                      const isCurrent = config?.currentPhase === phase;
                      const isPast = ['SETUP', 'REGISTRATION', 'AUCTION', 'TOURNAMENT'].indexOf(config?.currentPhase || 'SETUP') > index;
                      
                      return (
                        <div key={phase} className="relative z-10 flex flex-col items-center gap-4">
                          <button
                            onClick={() => updatePhase(phase)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-xl
                              ${isCurrent ? 'bg-white text-black ring-4 ring-white/20 scale-110' : 
                                isPast ? 'bg-zinc-800 text-white border border-white/20' : 'bg-ink border border-white/10 text-zinc-600 hover:border-white/30'}`}
                          >
                            {isPast ? <CheckCircle size={24} /> : index + 1}
                          </button>
                          <span className={`text-xs font-bold uppercase tracking-[0.2em] ${isCurrent ? 'text-white' : isPast ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            {phase}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 1.5 AUCTION MODE */}
                <section className="glass-panel p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-400 flex items-center gap-3">
                      <Activity className="text-white" size={16} /> Auction Strategy
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <button
                      onClick={() => updateAuctionMode('OPEN')}
                      className={`p-6 rounded-2xl flex flex-col items-center gap-4 text-center border-2 transition-all ${
                        config?.auctionMode !== 'ROUND_ROBIN' 
                          ? 'bg-ink border-white/50 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                          : 'bg-black/50 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                      }`}
                    >
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <Users size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Open Bidding</h3>
                        <p className="text-xs opacity-70">Standard competitive bidding for all teams simultaneously.</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => updateAuctionMode('ROUND_ROBIN')}
                      className={`p-6 rounded-2xl flex flex-col items-center gap-4 text-center border-2 transition-all ${
                        config?.auctionMode === 'ROUND_ROBIN' 
                          ? 'bg-ink border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                          : 'bg-black/50 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                      }`}
                    >
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                        <ListOrdered size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Round Robin Draft</h3>
                        <p className="text-xs opacity-70">Teams take turns picking players sequentially.</p>
                      </div>
                    </button>
                  </div>
                </section>

                {/* 2. CORE CONSTRAINTS (TIMER, BUDGET, ROSTER) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Timer Settings */}
                  <section className="glass-panel p-8 flex flex-col justify-between">
                    <div>
                      <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-400 mb-6 flex items-center gap-3">
                        <Settings className="text-white" size={16} /> Auction Timer
                      </h2>
                      <form id="timerForm" onSubmit={updateTimerConfig} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Base Duration (Sec)</label>
                          <input 
                            type="number" required 
                            className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-white outline-none font-display text-xl" 
                            value={defaultTimer} onChange={e => setDefaultTimer(parseInt(e.target.value) || 0)} 
                          />
                        </div>
                        <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                          <div className={`w-10 h-5 rounded-full transition-colors relative ${timerLocked ? 'bg-white' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-black transition-transform ${timerLocked ? 'translate-x-5' : 'bg-zinc-400'}`} />
                          </div>
                          <input type="checkbox" className="hidden" checked={timerLocked} onChange={e => setTimerLocked(e.target.checked)} />
                          <div>
                            <div className="font-bold text-white text-xs tracking-wide">Lock Controls</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Prevent podium edits</div>
                          </div>
                        </label>
                      </form>
                    </div>
                    <button type="submit" form="timerForm" className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-colors border border-white/10">
                      Save Timer
                    </button>
                  </section>

                  {/* League Budget */}
                  <section className="glass-panel p-8 flex flex-col justify-between">
                    <div>
                      <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-400 mb-6 flex items-center gap-3">
                        <span className="text-white font-display text-lg">৳</span> Global Budget
                      </h2>
                      <form id="budgetForm" onSubmit={updateBudgetConfig} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Standard Purse (TK)</label>
                          <input 
                            type="text" required 
                            className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-white outline-none font-display text-2xl tracking-tight" 
                            value={totalBudgetInput} 
                            onChange={e => {
                              const val = e.target.value.replace(/,/g, '');
                              if (!isNaN(Number(val))) {
                                setTotalBudgetInput(val ? Number(val).toLocaleString('en-IN') : '');
                              }
                            }} 
                          />
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Dictates the starting treasury for all franchises and calculates dynamic bidding raise tiers.
                        </p>
                      </form>
                    </div>
                    <button type="submit" form="budgetForm" className="w-full mt-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold text-sm uppercase tracking-widest transition-colors shadow-lg">
                      Save Budget
                    </button>
                  </section>

                  {/* Roster Size */}
                  <section className="glass-panel p-8 flex flex-col justify-between">
                    <div>
                      <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-400 mb-6 flex items-center gap-3">
                        <Users className="text-white" size={16} /> Roster Limits
                      </h2>
                      <form id="rosterForm" onSubmit={updateRosterLimits} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Min Size</label>
                          <input 
                            type="number" required min="1"
                            className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-white outline-none font-display text-2xl tracking-tight" 
                            value={minRosterSizeInput} onChange={(e) => setMinRosterSizeInput(e.target.value)} 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Max Size</label>
                          <input 
                            type="number" required min="1"
                            className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-white outline-none font-display text-2xl tracking-tight" 
                            value={maxRosterSizeInput} onChange={(e) => setMaxRosterSizeInput(e.target.value)} 
                          />
                        </div>
                      </form>
                    </div>
                    <button type="submit" form="rosterForm" className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-colors border border-white/10">
                      Save Limits
                    </button>
                  </section>
                </div>

                {/* 3. TAXONOMY (TIERS & CATEGORIES) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Bidding Raise Tiers */}
                  <section className="glass-panel p-8">
                    <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-400 mb-6 flex items-center gap-3">
                      <Activity className="text-white" size={16} /> Bidding Engine Logic
                    </h2>
                    <form onSubmit={createTier} className="flex flex-wrap sm:flex-nowrap gap-3 mb-6">
                      <div className="flex gap-2 w-full sm:w-auto flex-1">
                        <input type="number" step="0.1" placeholder="Min %" required className="w-1/2 bg-ink/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/30" value={tierMin} onChange={e => setTierMin(e.target.value)} />
                        <input type="number" step="0.1" placeholder="Max %" required className="w-1/2 bg-ink/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/30" value={tierMax} onChange={e => setTierMax(e.target.value)} />
                      </div>
                      <input type="number" step="0.01" placeholder="Raise %" required className="w-full sm:w-28 bg-ink/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/30" value={tierRaise} onChange={e => setTierRaise(e.target.value)} />
                      <button type="submit" className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-xs uppercase tracking-widest shrink-0 transition-colors">Add</button>
                    </form>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {tiers.map(t => (
                        <div key={t.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-white/5 border border-white/5 p-4 rounded-xl group hover:border-white/10 transition-colors">
                          {editingTierId === t.id ? (
                            <div className="flex flex-wrap items-center gap-2 w-full">
                              <input type="number" step="0.1" className="w-16 bg-ink/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" value={editTierMin} onChange={e => setEditTierMin(e.target.value)} />
                              <span className="text-white text-xs">&rarr;</span>
                              <input type="number" step="0.1" className="w-16 bg-ink/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" value={editTierMax} onChange={e => setEditTierMax(e.target.value)} />
                              <span className="text-xs text-zinc-400">Raise</span>
                              <input type="number" step="0.01" className="w-20 bg-ink/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" value={editTierRaise} onChange={e => setEditTierRaise(e.target.value)} />
                              <div className="ml-auto flex gap-2">
                                <button onClick={() => saveEditedTier(t.id)} className="px-3 py-1 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-xs transition">Save</button>
                                <button onClick={() => setEditingTierId(null)} className="px-2 py-1 bg-white/10 text-white hover:bg-white/20 rounded-lg transition"><X size={14}/></button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <span className="font-bold text-white text-sm">{t.minPct}% &rarr; {t.maxPct}%</span>
                                <span className="text-xs text-zinc-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">Raise {t.raisePct}%</span>
                              </div>
                              <div className="flex items-center mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingTierId(t.id); setEditTierMin(String(t.minPct)); setEditTierMax(String(t.maxPct)); setEditTierRaise(String(t.raisePct)); }} className="text-zinc-500 hover:text-white transition-colors p-2"><Edit2 size={14}/></button>
                                <button onClick={() => deleteTier(t.id)} className="text-zinc-500 hover:text-red-400 transition-colors p-2"><Trash2 size={14}/></button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Player Categories */}
                  <section className="glass-panel p-8">
                    <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-400 mb-6 flex items-center gap-3">
                      <BadgeCheck className="text-white" size={16} /> Player Taxonomies
                    </h2>
                    <form onSubmit={createCategory} className="flex flex-wrap sm:flex-nowrap gap-3 mb-6">
                      <input type="text" placeholder="Tier Name (e.g. A)" required className="w-full sm:flex-1 bg-ink/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/30" value={catName} onChange={e => setCatName(e.target.value)} />
                      <input type="number" placeholder="Base Price" required className="w-full sm:w-32 bg-ink/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/30" value={catPrice} onChange={e => setCatPrice(e.target.value)} />
                      <button type="submit" className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-xs uppercase tracking-widest shrink-0 transition-colors">Add</button>
                    </form>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {categories.map(c => (
                        <div key={c.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-white/5 border border-white/5 p-4 rounded-xl group hover:border-white/10 transition-colors">
                          {editingCategoryId === c.id ? (
                            <div className="flex flex-wrap items-center gap-2 w-full">
                              <input type="text" className="flex-1 min-w-[100px] bg-ink/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" value={editCatName} onChange={e => setEditCatName(e.target.value)} />
                              <div className="flex items-center gap-1">
                                <span className="text-white text-xs font-bold">TK</span>
                                <input type="text" className="w-24 bg-ink/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" value={editCatPrice} onChange={e => {
                                  const val = e.target.value.replace(/,/g, '');
                                  if (!isNaN(Number(val))) setEditCatPrice(val ? Number(val).toLocaleString('en-IN') : '');
                                }} />
                              </div>
                              <div className="ml-auto flex gap-2">
                                <button onClick={() => saveEditedCategory(c.id)} className="px-3 py-1 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-xs transition">Save</button>
                                <button onClick={() => setEditingCategoryId(null)} className="px-2 py-1 bg-white/10 text-white hover:bg-white/20 rounded-lg transition"><X size={14}/></button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between w-full sm:pr-4">
                                <span className="font-bold text-white text-sm">{c.name}</span>
                                <span className="text-sm font-bold text-zinc-400">TK {c.basePrice.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex items-center mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={() => { setEditingCategoryId(c.id); setEditCatName(c.name); setEditCatPrice(c.basePrice.toLocaleString('en-IN')); }} className="text-zinc-500 hover:text-white transition-colors p-2"><Edit2 size={14}/></button>
                                <button onClick={() => deleteCategory(c.id)} className="text-zinc-500 hover:text-red-400 transition-colors p-2"><Trash2 size={14}/></button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* 4. MISCELLANEOUS (SESSIONS) */}
                <section className="glass-panel p-8">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-400 mb-6 flex items-center gap-3">
                    <Database className="text-white" size={16} /> Academic Sessions
                  </h2>
                  <form onSubmit={createSession} className="flex flex-wrap sm:flex-nowrap gap-3 mb-6 max-w-sm">
                    <input type="text" placeholder="e.g. 2020-21" required className="w-full sm:flex-1 bg-ink/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/30" value={sessionName} onChange={e => setSessionName(e.target.value)} />
                    <button type="submit" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs uppercase tracking-widest border border-white/10 shrink-0 transition-colors">Add</button>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {sessions.map(s => (
                      <div key={s.id} className="flex items-center gap-2 bg-white/5 border border-white/10 pl-4 pr-2 py-1.5 rounded-full text-xs font-bold tracking-wide text-zinc-300">
                        {s.name}
                        <button onClick={() => deleteSession(s.id)} className="text-zinc-600 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><X size={12}/></button>
                      </div>
                    ))}
                  </div>
                </section>

              </motion.div>
            )}

            {activeTab === 'teams' && (
              <motion.div key="teams" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <section className="bg-panel p-8 rounded-3xl border border-white/10 shadow-xl">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk mb-8 flex items-center gap-3">
                    <UserPlus className="text-white" size={18} /> Pending Manager Registrations
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingManagers.map(m => (
                      <div key={m.id} className="bg-ink border border-white/20 shadow-lg rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span className="font-bold text-lg text-white block mb-1">{m.name}</span>
                            <div className="text-xs text-chalkMuted">
                              <div>Email: {m.email}</div>
                              <div>Phone: {m.phone || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => executeRejectManager(m.id)} className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-bold uppercase tracking-widest text-xs transition border border-red-500/20">
                              Reject
                            </button>
                            <button onClick={() => openApproveModal(m)} className="px-4 py-2 bg-white text-black hover:bg-zinc-200 hover:text-black text-ink rounded-lg font-bold uppercase tracking-widest text-xs transition">
                              Approve
                            </button>
                          </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl mt-2">
                          <span className="text-xs text-chalkMuted uppercase tracking-widest mb-1 block">Desired Franchise</span>
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
                      <div key={t.id} className="bg-ink border border-white/5 shadow-lg hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between transition-colors group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center border border-white/10 overflow-hidden shrink-0 shadow-inner">
                              {t.logoUrl ? <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" /> : <Shield size={20} className="text-zinc-500" />}
                            </div>
                            <div>
                              <span className="font-bold text-lg text-white group-hover:text-white transition-colors block mb-1">{t.name}</span>
                              {t.manager && (
                                <div className="text-xs text-chalkMuted leading-tight">
                                  <div className="mb-0.5">Mgr: {t.manager.name}</div>
                                  <div>ID: {t.manager.phone || t.manager.email}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setLogoDialog({ isOpen: true, team: t })} className="p-2 bg-white/5 hover:bg-white/10 hover:text-white text-chalkMuted rounded-lg transition" title="Upload Logo">
                              <ImageIcon size={16} />
                            </button>
                            <button onClick={() => openEditManager(t)} className="p-2 bg-white/5 hover:bg-white/10 hover:text-white text-chalkMuted rounded-lg transition" title="Edit Manager">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteTeam(t.id)} className="p-2 bg-white/5 hover:bg-white/5 text-zinc-400 rounded-lg transition" title="Delete Franchise">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-start bg-white/5 p-3 rounded-xl">
                          <span className="text-xs text-chalkMuted uppercase tracking-widest mb-1">Purse</span>
                          <span className="text-white text-sm font-bold">TK {t.remainingBudget.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                    {teams.length === 0 && <div className="col-span-full py-8 text-center text-chalkMuted italic text-sm">No franchises established.</div>}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'players' && (
              <motion.div key="players" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                <div className="border-b border-white/5 pb-4 mb-4 mt-4 md:mt-0">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-chalk flex items-center gap-3">
                    <CheckCircle className="text-emerald-400" size={18} /> Approval Queue & Database
                  </h2>
                </div>
                <div className="w-full">
                  <PlayerDirectory 
                    players={players} 
                    onAction={(p) => { openPlayerDetails(p); setIsCategorizingPlayer(true); }}
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
                    <UserPlus className="text-white" size={18} /> Invite Staff Member
                  </h2>
                  <form onSubmit={createStaffAccount} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Name</label>
                      <input type="text" required className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-gold outline-none transition-all" value={staffName} onChange={e => {
                        const val = e.target.value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                        setStaffName(val);
                      }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Email</label>
                      <input type="email" required className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-gold outline-none transition-all" value={staffEmail} onChange={e => setStaffEmail(e.target.value.toLowerCase())} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Password</label>
                      <input type="password" required className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-gold outline-none transition-all" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2 col-span-full">
                      <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Access Level</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setStaffRole('PODIUM_ADMIN')}
                          className={`p-4 rounded-xl border text-left transition-all ${staffRole === 'PODIUM_ADMIN' ? 'bg-white/10 border-white/20 text-white ' : 'bg-ink/50 border-white/10 text-chalkMuted hover:border-white/30'}`}
                        >
                          <div className={`font-bold text-sm mb-1 ${staffRole === 'PODIUM_ADMIN' ? 'text-white' : 'text-chalk'}`}>Podium Admin</div>
                          <div className="text-xs uppercase tracking-widest opacity-80">Auctioneer Access</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStaffRole('SUPER_ADMIN')}
                          className={`p-4 rounded-xl border text-left transition-all ${staffRole === 'SUPER_ADMIN' ? 'bg-white/10 border-white/20 text-white ' : 'bg-ink/50 border-white/10 text-chalkMuted hover:border-white/30'}`}
                        >
                          <div className={`font-bold text-sm mb-1 ${staffRole === 'SUPER_ADMIN' ? 'text-white' : 'text-chalk'}`}>Super Admin</div>
                          <div className="text-xs uppercase tracking-widest opacity-80">Full System Control</div>
                        </button>
                      </div>
                    </div>
                    <div className="col-span-full pt-2">
                      <button type="submit" className="w-full md:w-auto px-8 py-3.5 bg-white text-black hover:bg-zinc-200 hover:text-black text-ink rounded-xl font-bold uppercase tracking-widest transition-all text-xs shadow-lg">
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
                          <span className="text-xs text-chalkMuted uppercase tracking-widest">{s.email}</span>
                          <span className={`mt-2 block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg w-max ${s.role === 'SUPER_ADMIN' ? 'bg-white/10 text-white border border-white/20' : 'bg-white/10 text-white border border-white/20'}`}>
                            {s.role.replace('_', ' ')}
                          </span>
                        </div>
                        <button onClick={() => deleteStaff(s.id)} className="p-3 bg-white/5 hover:bg-white/5 text-zinc-400 rounded-xl transition" title="Delete Staff">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {staff.length === 0 && <div className="col-span-full py-8 text-center text-chalkMuted italic text-sm">No staff members found.</div>}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'jerseys' && (
              <motion.div key="jerseys" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-center bg-panel border border-white/5 p-6 rounded-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
                      <Shirt className="text-emerald-400" /> Jersey Showcase
                    </h3>
                    <p className="text-chalkMuted text-sm mt-1">Manage jerseys uploaded by players</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase tracking-widest ${config?.jerseyVotingOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                      {config?.jerseyVotingOpen ? 'Voting Open' : 'Voting Closed'}
                    </span>
                    <button
                      onClick={async () => {
                        const toastId = toast.loading('Updating...');
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ jerseyVotingOpen: !config?.jerseyVotingOpen })
                        });
                        toast.dismiss(toastId);
                        if (res.ok) {
                          const newConfig = await res.json();
                          setConfig(newConfig);
                          toast.success(`Jersey voting ${newConfig.jerseyVotingOpen ? 'opened' : 'closed'}`);
                        } else {
                          toast.error('Failed to update config');
                        }
                      }}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        config?.jerseyVotingOpen ? 'bg-emerald-500' : 'bg-red-500/50'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          config?.jerseyVotingOpen ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-12">
                  {jerseys.length === 0 ? (
                    <div className="py-8 text-center text-chalkMuted italic text-sm">No jerseys uploaded yet.</div>
                  ) : (
                    (() => {
                      const jerseysByPlayer = jerseys.reduce((acc: any, jersey: any) => {
                        const playerId = jersey.playerId || 'unknown';
                        if (!acc[playerId]) {
                          acc[playerId] = {
                            player: jersey.player,
                            jerseys: [],
                            totalVotes: 0
                          };
                        }
                        acc[playerId].jerseys.push(jersey);
                        acc[playerId].totalVotes += (jersey._count?.votes || 0);
                        return acc;
                      }, {});
                      
                      const sortedGroups = Object.values(jerseysByPlayer).sort((a: any, b: any) => b.totalVotes - a.totalVotes);
                      
                      return sortedGroups.map((group: any, idx: number) => (
                        <div key={idx} className="bg-ink/50 border border-white/5 rounded-2xl p-6">
                          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-white/10 gap-4">
                            <div>
                              <h4 className="text-xl font-bold text-white uppercase tracking-wider">{group.player?.name || 'Unknown Player'}</h4>
                              <p className="text-emerald-400 font-mono text-xs mt-1 uppercase tracking-widest">{group.player?.studentId} • {group.player?.sessionId}</p>
                              {group.player?.team ? (
                                <p className="text-cyan-400 text-[10px] font-bold uppercase mt-2 border border-cyan-400/20 bg-cyan-400/10 inline-block px-2 py-1 rounded">
                                  Team: {group.player.team.name}
                                </p>
                              ) : (
                                <p className="text-chalkMuted text-[10px] font-bold uppercase mt-2 border border-white/10 bg-white/5 inline-block px-2 py-1 rounded">
                                  Team: NULL
                                </p>
                              )}
                            </div>
                            <div className="bg-panel border border-white/10 px-4 py-2 rounded-xl text-center">
                              <p className="text-[10px] text-chalkMuted uppercase tracking-widest mb-1">Total Votes</p>
                              <p className="text-2xl font-display text-emerald-400 leading-none">{group.totalVotes}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {group.jerseys.sort((a: any, b: any) => (b._count?.votes || 0) - (a._count?.votes || 0)).map((jersey: any) => (
                              <div key={jersey.id} className="bg-panel border border-white/5 rounded-xl overflow-hidden shadow-lg group relative aspect-[3/4] cursor-pointer" onClick={() => setSelectedImage(jersey.imageUrl)}>
                                <img src={jersey.imageUrl} alt="Jersey" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                
                                <div className="absolute top-2 left-2 bg-ink/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 z-20">
                                  <span className="text-[10px] text-chalkMuted uppercase tracking-widest">Votes</span>
                                  <span className="text-emerald-400">{jersey._count?.votes || 0}</span>
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex gap-2 w-full">
                                    {jersey.votes && (
                                      <button
                                        onClick={() => setVotersModal({ isOpen: true, votes: jersey.votes })}
                                        className="flex-1 py-2 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors backdrop-blur-md flex items-center justify-center gap-1.5"
                                      >
                                        <Users className="w-3.5 h-3.5" /> List
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => {
                                        setConfirmDialog({
                                          isOpen: true,
                                          message: 'Are you sure you want to delete this jersey? This action cannot be undone.',
                                          onConfirm: async () => {
                                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jerseys/${jersey.id}`, {
                                              method: 'DELETE',
                                              headers: { Authorization: `Bearer ${token}` }
                                            });
                                            if (res.ok) {
                                              toast.success('Jersey deleted');
                                              setJerseys(jerseys.filter((j: any) => j.id !== jersey.id));
                                            }
                                            setConfirmDialog(null);
                                          }
                                        });
                                      }}
                                      className="flex-1 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors backdrop-blur-md"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'danger' && (
              <motion.div key="danger" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <section className="glass-panel p-8 rounded-[2rem] border-white/10 bg-white/5">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-400 mb-8 flex items-center gap-3">
                    <Trash2 size={18} /> System Reset Options
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-ink/50 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-white mb-1">Level 1: Soft Reset (Economy & Tournaments)</h3>
                        <p className="text-xs text-chalkMuted tracking-wide">Clears all match fixtures, results, and statistics. Resets franchise budgets and reverts all players to unsold status. Auction history is cleared.</p>
                      </div>
                      <button onClick={() => executeSystemReset(1)} className="px-6 py-3 bg-white/5 hover:bg-white/5 text-zinc-400 border border-white/10 hover:border-white/10 rounded-xl font-bold uppercase tracking-widest text-xs transition whitespace-nowrap">
                        Execute Soft Reset
                      </button>
                    </div>

                    <div className="bg-ink/50 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-white mb-1">Level 2: Hard Reset (Players & Franchises)</h3>
                        <p className="text-xs text-chalkMuted tracking-wide">Performs a soft reset and additionally deletes all player registrations and their uploaded media. Reverts the system phase to Registration.</p>
                      </div>
                      <button onClick={() => executeSystemReset(2)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/20 rounded-xl font-bold uppercase tracking-widest text-xs transition whitespace-nowrap">
                        Execute Hard Reset
                      </button>
                    </div>

                    <div className="bg-ink/50 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-danger/20 to-transparent pointer-events-none" />
                      <div className="relative z-10">
                        <h3 className="font-bold text-lg text-zinc-400 mb-1">Level 3: Factory Reset</h3>
                        <p className="text-xs text-chalkMuted tracking-wide">Complete system wipe. Deletes all players, franchises, managers, categories, and settings. Reverts the system to its initial setup state. Only Super Admin accounts are preserved.</p>
                      </div>
                      <button onClick={() => executeSystemReset(3)} className="px-6 py-3 bg-zinc-800 hover:bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition  hover: whitespace-nowrap relative z-10">
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
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className="px-6 py-2 bg-zinc-800 hover:bg-red-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition"
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
                  <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Franchise Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold outline-none" 
                    value={approveTeamName} 
                    onChange={e => setApproveTeamName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2 opacity-60">
                  <label className="text-xs font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Team Purse (Fixed from Global Budget)</label>
                  <input 
                    type="text" 
                    readOnly
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none cursor-not-allowed" 
                    value={approvePurse ? Number(approvePurse).toLocaleString('en-IN') : ''} 
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setApproveDialog(null)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-white text-black hover:bg-zinc-200 hover:text-black text-ink rounded-xl font-bold text-sm uppercase tracking-widest transition"
                  >
                    Approve
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-pointer"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Fullscreen Jersey"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {votersModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVotersModal({ isOpen: false, votes: [] })}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-ink border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                <h3 className="text-white font-bold uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Voters List
                </h3>
                <button
                  onClick={() => setVotersModal({ isOpen: false, votes: [] })}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-chalk transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {votersModal.votes.length > 0 ? (
                  <div className="space-y-2">
                    {votersModal.votes.map((vote: any) => (
                      <div key={vote.playerId} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-3">
                        <div>
                          <p className="text-white font-medium text-sm truncate">{vote.player?.name || 'Unknown'}</p>
                          <p className="text-chalkMuted text-xs">{vote.player?.sessionId || 'Unknown Session'}</p>
                        </div>
                        <span className="text-emerald-400 font-mono text-xs font-bold uppercase bg-emerald-400/10 px-2 py-1 rounded">
                          {vote.player?.studentId || 'ID'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-chalkMuted text-sm italic">No votes have been cast for this jersey yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SuperAdminSetup() {
  return (
    <Suspense fallback={<div className="p-8 text-chalk">Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}
