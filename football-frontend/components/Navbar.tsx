'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, MonitorPlay, Settings, UserCircle, LogIn, Trophy, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

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
    { name: 'Home', href: '/' },
    { name: 'Tournament', href: '/tournament' },
    { name: 'Franchises', href: '/franchises' },
    { name: 'Players', href: '/players' }
  ];

  if (!token || (role !== 'SUPER_ADMIN' && role !== 'PODIUM_ADMIN' && role !== 'TEAM_MANAGER')) {
    // Only unified portal button on the right is needed
  }

  if (token) {
    if (role === 'SUPER_ADMIN' || role === 'PODIUM_ADMIN') {
      navLinks.push({ name: 'Dashboard', href: '/admin', icon: Settings });
    }
  }

  return (
    <header className="z-50 py-6 px-6 md:px-12 sticky top-0 bg-ink">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-screen-2xl mx-auto flex items-center justify-between"
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-end gap-1 group-hover:scale-105 transition-transform mr-1 h-6">
            <div className="w-1.5 h-4 bg-[#ff4b44] rounded-full transform -skew-x-12 -mb-0.5"></div>
            <div className="w-1.5 h-6 bg-[#ff4b44] rounded-full transform -skew-x-12"></div>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-chalk">
            GSTU<span className="text-chalkMuted ml-1">LIGA</span>
          </span>
        </Link>
        
        {/* CENTER LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-chalk/80">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href} className={`flex items-center gap-2 hover:text-chalk transition-colors ${isActive ? 'text-chalk' : ''}`}>
                {link.name}
              </Link>
            );
          })}
        </div>
        
        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          {token ? (
            <>
              {role === 'TEAM_MANAGER' && (
                <Link href="/manager" className="hidden sm:flex px-5 py-2 bg-chalk text-ink rounded-lg text-sm font-semibold items-center gap-2 hover:bg-zinc-200 transition">
                  Manager Console
                </Link>
              )}
              {(role === 'SUPER_ADMIN' || role === 'PODIUM_ADMIN') && (
                <Link href="/podium" className="hidden sm:flex px-5 py-2 bg-chalk/20 text-chalk rounded-lg text-sm font-semibold items-center gap-2 hover:bg-chalk/20 transition">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  Auction Live
                </Link>
              )}
              <button 
                onClick={logout} 
                className="text-chalkMuted hover:text-chalk transition p-2"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link 
              href="/draft" 
              className="flex px-5 py-2 bg-chalk/10 hover:bg-chalk/20 text-chalk rounded-lg text-sm font-semibold items-center gap-2 transition shadow-lg"
            >
              Login / Register
            </Link>
          )}
        </div>
      </motion.nav>
    </header>
  );
}
