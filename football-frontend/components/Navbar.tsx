'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, MonitorPlay, Settings, UserCircle, LogIn, Trophy, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
    if (t) {
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        setRole(payload.role);
      } catch (e) {
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRole(null);
    window.location.href = '/';
  };

  if (pathname === '/podium' || pathname.startsWith('/admin')) return null;

  const navLinks = [
    { name: 'Home', href: '/', icon: Trophy },
    { name: 'Players', href: '/players', icon: UserCircle }
  ];

  if (!token || (role !== 'SUPER_ADMIN' && role !== 'PODIUM_ADMIN')) {
    navLinks.push({ name: 'Player Draft', href: '/register', icon: UserCircle });
    navLinks.push({ name: 'Franchise', href: '/manager-registration', icon: Shield });
  }

  if (token) {
    if (role === 'SUPER_ADMIN' || role === 'PODIUM_ADMIN') {
      navLinks.push({ name: 'Auction Live', href: '/podium', icon: MonitorPlay });
      navLinks.push({ name: 'Dashboard', href: '/admin', icon: Settings });
    }
    if (role === 'TEAM_MANAGER') {
      navLinks.push({ name: 'Manager Console', href: '/manager', icon: Shield });
    }
  }

  return (
    <header className="sticky top-0 z-50 pt-4 px-4 sm:px-6">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto glass-panel rounded-2xl px-5 py-3 border border-white/10 flex items-center justify-between shadow-2xl"
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
            <Trophy size={16} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-chalk">GSTU <span className="text-gold">LIGA</span></span>
        </Link>
        
        <div className="flex items-center gap-1.5 text-xs font-semibold text-chalkMuted">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`relative px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  isActive ? 'text-chalk font-bold' : 'text-chalkMuted hover:text-chalk hover:bg-white/5'
                }`}
              >
                <Icon size={15} className={isActive ? "text-gold" : "opacity-70"} />
                <span>{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
          
          {token ? (
            <button 
              onClick={logout} 
              className="ml-2 flex items-center gap-1.5 text-xs text-danger/80 hover:text-danger hover:bg-danger/10 px-3 py-2 rounded-xl transition-all font-semibold"
            >
              <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link 
              href="/login" 
              className="ml-2 px-4 py-2 bg-gold hover:bg-yellow-400 text-ink rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(244,196,83,0.2)]"
            >
              Login
            </Link>
          )}
        </div>
      </motion.nav>
    </header>
  );
}
