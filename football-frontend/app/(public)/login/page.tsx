'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        toast.success(`Welcome back, ${data.user.name}`);
        
        // Redirect based on exact PRD Role Permission Matrix
        switch (data.user.role) {
          case 'SUPER_ADMIN':
            router.push('/admin');
            break;
          case 'PODIUM_ADMIN':
            router.push('/podium');
            break;
          case 'TEAM_MANAGER':
            router.push('/manager');
            break;
          case 'PLAYER':
            router.push('/player');
            break;
          default:
            router.push('/');
        }
      } else {
        toast.error(data.error || 'Authentication failed');
      }
    } catch (err) {
      toast.error('Network error. Please check if backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 text-chalk font-body relative z-0 py-20">
      <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-5 pointer-events-none" />
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-panel border border-chalk/10 p-10 rounded-[2rem] relative overflow-hidden shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold text-chalk mb-1">Welcome Back</h2>
          <p className="text-chalkMuted text-sm font-medium">Access your franchise dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-wider">Operator Email</label>
            <input 
              type="email" 
              required
              placeholder="manager@franchise.com"
              className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3.5 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-wider">Passcode</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3.5 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit" 
            className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
