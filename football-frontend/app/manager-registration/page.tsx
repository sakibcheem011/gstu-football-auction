'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Activity, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState<string>('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/config`)
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/auth/register-manager`, {
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
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-chalk font-body relative overflow-hidden py-12 lg:py-20">
      
      <Link href="/draft" className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/10 group z-10">
        <ArrowLeft size={20} className="text-chalk group-hover:text-blue-400 transition-colors" />
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-panel border border-chalk/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-[60px] pointer-events-none" />

        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mb-6 border border-blue-500/20">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-chalk mb-2">Franchise Application</h1>
          <p className="text-chalkMuted text-sm font-medium max-w-md mx-auto">
            {phase === 'SETUP' 
              ? 'Register your interest in managing a franchise for the upcoming season.'
              : 'Franchise Registration is currently closed.'}
          </p>
        </div>

        {phase === 'SETUP' ? (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Manager Full Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. Pep Guardiola"
                value={formData.name}
                onChange={e => {
                  const val = e.target.value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                  setFormData({...formData, name: val});
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="manager@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Phone Number</label>
              <input 
                type="text" 
                required
                className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Desired Franchise Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. Red Dragons FC"
                value={formData.desiredTeamName}
                onChange={e => {
                  setFormData({...formData, desiredTeamName: e.target.value});
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full bg-ink border border-chalk/10 rounded-xl pl-4 pr-12 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-chalkMuted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[15px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
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
          <div className="text-center relative z-10 py-8">
             <div className="text-chalkMuted mb-4">
                <Shield size={48} className="mx-auto opacity-50" />
             </div>
             <h2 className="text-2xl font-display text-chalk mb-2">Registration Closed</h2>
             <p className="text-chalkMuted text-sm max-w-sm mx-auto">
                We are no longer accepting franchise applications for the current season.
             </p>
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-chalkMuted relative z-10">
          Already approved? <Link href="/draft" className="text-chalk font-bold hover:text-blue-400 transition-colors">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
