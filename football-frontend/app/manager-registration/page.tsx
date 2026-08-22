'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ManagerRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    desiredTeamName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState<string>('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/rules/config`)
      .then(res => res.json())
      .then(data => setPhase(data.currentPhase))
      .catch(console.error);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'TEAM_MANAGER') router.push('/manager');
        if (payload.role === 'SUPER_ADMIN' || payload.role === 'PODIUM_ADMIN') router.push('/admin');
      } catch (e) {}
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/register-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message, { duration: 5000 });
        router.push('/');
      } else {
        toast.error(data.error || 'Failed to register');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gold/10 blur-[150px] rounded-full pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/10 group z-10">
        <ArrowLeft size={20} className="text-chalk group-hover:text-gold transition-colors" />
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-6 border border-gold/20 shadow-[0_0_30px_rgba(232,184,75,0.2)]">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-display text-white mb-4 tracking-[0.1em]">Franchise Application</h1>
          <p className="text-chalkMuted text-sm max-w-md mx-auto leading-relaxed">
            {phase === 'SETUP' 
              ? 'Register your interest in managing a franchise for the upcoming season. Your application will be reviewed by the League Administration.'
              : 'Franchise Registration is currently closed.'}
          </p>
        </div>

        {phase === 'SETUP' ? (
          <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-8 rounded-[2rem] border-white/10 shadow-2xl space-y-4 bg-white/[0.02]">
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Manager Full Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold transition-all outline-none"
                placeholder="e.g. Pep Guardiola"
                value={formData.name}
                onChange={e => {
                  const val = e.target.value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                  setFormData({...formData, name: val});
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold transition-all outline-none"
                placeholder="manager@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Phone Number</label>
              <input 
                type="text" 
                required
                className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold transition-all outline-none"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Desired Franchise Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold transition-all outline-none"
                placeholder="e.g. Red Dragons FC"
                value={formData.desiredTeamName}
                onChange={e => {
                  setFormData({...formData, desiredTeamName: e.target.value});
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-chalkMuted uppercase tracking-[0.2em] ml-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-gold transition-all outline-none"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(232,184,75,0.2)] hover:shadow-[0_0_30px_rgba(232,184,75,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Activity className="animate-spin" size={18} /> Submitting...</>
                ) : (
                  <>Submit Application <ArrowRight size={18} /></>
                )}
              </button>
            </div>
            
          </form>
        ) : (
          <div className="glass-panel p-8 rounded-3xl border-white/10 shadow-2xl text-center">
             <div className="text-white/50 mb-6">
                <Shield size={48} className="mx-auto opacity-50" />
             </div>
             <h2 className="text-2xl font-display text-white mb-2">Registration Closed</h2>
             <p className="text-chalkMuted text-sm max-w-sm mx-auto">
                We are no longer accepting franchise applications for the current season.
             </p>
          </div>
        )}
        
        <div className="mt-8 text-center text-xs text-chalkMuted">
          Already approved? <Link href="/admin" className="text-gold hover:underline">Sign in here</Link>
        </div>
      </motion.div>
    </div>
  );
}
