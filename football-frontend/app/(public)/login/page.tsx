'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`auth/login', {
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
        className="w-full max-w-md glass-panel p-10 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gold shadow-[0_0_20px_rgba(232,184,75,0.6)]" />
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center text-gold shadow-[0_0_15px_rgba(232,184,75,0.3)]">
            <Shield size={32} />
          </div>
        </div>

        <h2 className="font-display text-4xl text-white mb-8 tracking-[0.3em] text-center">SECURE LOGIN</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Operator Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-gold outline-none transition shadow-inner" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Passcode</label>
            <input 
              type="password" 
              required
              className="w-full bg-ink/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-gold outline-none transition shadow-inner" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit" 
            className="w-full mt-4 py-4 bg-white/10 text-white border border-white/20 hover:bg-gold hover:text-ink hover:border-gold rounded-xl font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
