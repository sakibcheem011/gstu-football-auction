'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, Trophy, MonitorPlay, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.role !== 'SUPER_ADMIN' && data.role !== 'PODIUM_ADMIN') {
        router.push('/login');
      } else {
        setUser(data);
        setLoading(false);
      }
    })
    .catch(() => {
      router.push('/login');
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-chalkMuted min-h-screen">
        <Loader2 className="animate-spin mr-3" size={32} />
        <span className="font-display tracking-widest text-xl font-bold uppercase">Loading Command Center...</span>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Config Hub', href: '/admin/setup', icon: Settings },
    { label: 'Tournament', href: '/admin/tournament', icon: Trophy },
    { label: 'Auctioneer', href: '/podium', icon: MonitorPlay },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-ink text-chalk pb-20 md:pb-0 relative">
      
      {/* Desktop Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex w-64 bg-panel border-r border-chalk/10 flex-col shrink-0 h-screen sticky top-0"
      >
        <div className="p-6 border-b border-chalk/10 flex items-center gap-3">
          <ShieldCheck className="text-accent" size={32} />
          <h1 className="font-display font-bold text-2xl tracking-wider text-white">ADMIN</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-base ${
                  isActive 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-chalkMuted hover:bg-panel hover:text-chalk border border-transparent'
                }`}>
                  <Icon size={20} className={isActive ? 'text-accent' : 'text-chalkMuted'} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-chalk/10">
          <div className="bg-panel border border-chalk/10 p-4 rounded-xl mb-4">
            <div className="text-sm font-semibold text-chalkMuted mb-1">Logged In As</div>
            <div className="text-base font-bold text-chalk truncate">{user?.email}</div>
            <div className="text-xs text-chalkMuted mt-1 uppercase tracking-wider font-bold">{user?.role?.replace('_', ' ')}</div>
          </div>
          
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-white/10 text-chalkMuted hover:text-chalk border border-chalk/10 rounded-xl font-semibold text-base transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-ink/95 backdrop-blur-xl border-t border-chalk/10 flex items-center justify-around p-2 z-[9999] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center p-2 rounded-xl transition ${isActive ? 'text-accent' : 'text-chalkMuted hover:text-chalk'}`}>
              <Icon size={22} className={isActive ? 'text-accent drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : ''} />
              <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isActive ? 'text-accent' : 'text-chalkMuted'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}

