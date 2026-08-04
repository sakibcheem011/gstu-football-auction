'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, Trophy, MonitorPlay, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/me`, {
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
      <div className="flex-1 flex items-center justify-center bg-ink text-gold min-h-screen">
        <Loader2 className="animate-spin mr-3" size={32} />
        <span className="font-display tracking-widest text-2xl">LOADING COMMAND CENTER...</span>
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
    <div className="flex flex-col md:flex-row min-h-screen bg-ink text-chalk">
      
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-64 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0"
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <ShieldCheck className="text-gold" size={28} />
          <h1 className="font-display text-xl tracking-widest text-white">ADMIN</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold tracking-widest uppercase text-xs ${
                  isActive 
                    ? 'bg-gold text-ink shadow-[0_0_20px_rgba(232,184,75,0.2)]' 
                    : 'text-chalkMuted hover:bg-white/10 hover:text-white'
                }`}>
                  <Icon size={18} className={isActive ? 'text-ink' : 'text-gold'} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 p-4 rounded-xl mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-chalkMuted mb-1">Logged In As</div>
            <div className="text-sm font-bold text-white truncate">{user?.email}</div>
            <div className="text-xs text-gold mt-1 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</div>
          </div>
          
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl font-bold tracking-widest uppercase text-xs transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}
