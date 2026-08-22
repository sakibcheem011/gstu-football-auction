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
    { name: 'Home', href: '/', icon: Trophy },
    { name: 'Players', href: '/players', icon: UserCircle }
  ];

  if (!token || (role !== 'SUPER_ADMIN' && role !== 'PODIUM_ADMIN' && role !== 'TEAM_MANAGER')) {
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
    <header className="sticky top-0 z-50 pt-6 px-6 md:px-12">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-screen-2xl mx-auto flex items-center justify-between"
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:scale-105 transition-transform">
            <Trophy size={16} strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            GSTU<span className="text-zinc-400 ml-1">LIGA</span>
          </span>
        </Link>
        
        {/* CENTER LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`transition-colors ${isActive ? 'text-white font-bold' : 'hover:text-white'}`}
              >
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
                <Link href="/manager" className="hidden sm:flex px-5 py-2 bg-white text-black rounded-lg text-sm font-semibold items-center gap-2 hover:bg-zinc-200 transition">
                  Manager Console
                </Link>
              )}
              {(role === 'SUPER_ADMIN' || role === 'PODIUM_ADMIN') && (
                <Link href="/podium" className="hidden sm:flex px-5 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold items-center gap-2 hover:bg-white/20 transition">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  Auction Live
                </Link>
              )}
              <button 
                onClick={logout} 
                className="text-zinc-400 hover:text-white transition p-2"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="flex px-5 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold items-center gap-2 hover:bg-white/20 transition shadow-lg shadow-blue-500/20"
            >
              Login
            </Link>
          )}
        </div>
      </motion.nav>
    </header>
  );
}
