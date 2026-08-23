'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, LogIn, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AccessPortal() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        toast.success(`Welcome back, ${data.user.name}`);
        switch (data.user.role) {
          case 'SUPER_ADMIN': router.push('/admin'); break;
          case 'PODIUM_ADMIN': router.push('/podium'); break;
          case 'TEAM_MANAGER': router.push('/manager'); break;
          case 'PLAYER': router.push('/player'); break;
          default: router.push('/');
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
    <div className="flex-1 flex items-center justify-center p-6 text-chalk font-body py-12 relative">
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-panel border border-chalk/10 p-8 sm:p-10 rounded-[2rem] relative shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold text-chalk mb-2">Welcome to Liga</h2>
          <p className="text-chalkMuted text-sm font-medium">Access your account or join the league</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-ink rounded-xl p-1.5 mb-8 border border-chalk/5 relative z-10">
          <button 
            onClick={() => setMode('login')} 
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${mode === 'login' ? 'bg-panel text-chalk shadow-md' : 'text-chalkMuted hover:text-chalk'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('register')} 
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${mode === 'register' ? 'bg-panel text-chalk shadow-md' : 'text-chalkMuted hover:text-chalk'}`}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin} 
              className="space-y-5"
            >
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-chalkMuted">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    required
                    placeholder="Email Address"
                    className="w-full bg-ink border border-chalk/10 rounded-xl pl-11 pr-4 py-3.5 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-chalkMuted">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    placeholder="Password"
                    className="w-full bg-ink border border-chalk/10 rounded-xl pl-11 pr-4 py-3.5 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs font-semibold text-chalkMuted pt-1 pb-2">
                <label className="flex items-center gap-2 cursor-pointer hover:text-chalk transition-colors">
                  <input type="checkbox" className="rounded bg-ink border-chalk/20 text-emerald-500 focus:ring-emerald-500" />
                  Remember me
                </label>
                <a href="#" className="hover:text-chalk transition-colors">Forgot password?</a>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit" 
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[15px] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(5,150,105,0.2)] hover:shadow-[0_0_25px_rgba(5,150,105,0.4)]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>

              <div className="text-center text-sm text-chalkMuted mt-6">
                Don't have an account? <button type="button" onClick={() => setMode('register')} className="text-chalk font-bold hover:text-emerald-400 transition-colors">Sign up</button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-center text-sm text-chalkMuted mb-6">Select your account type to proceed with registration.</p>
              
              <Link href="/register" className="block">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-ink border border-chalk/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-panel flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-chalk text-[15px]">Player Registration</h3>
                    <p className="text-xs text-chalkMuted mt-0.5">Register for the upcoming draft</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto text-chalkMuted group-hover:text-emerald-500 transition-colors" />
                </div>
              </Link>

              <Link href="/manager-registration" className="block">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-ink border border-chalk/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-panel flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-chalk text-[15px]">Franchise Registration</h3>
                    <p className="text-xs text-chalkMuted mt-0.5">Register a new team & manager</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto text-chalkMuted group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
              
              <div className="text-center text-sm text-chalkMuted mt-8">
                Already have an account? <button type="button" onClick={() => setMode('login')} className="text-chalk font-bold hover:text-emerald-400 transition-colors">Sign in</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
