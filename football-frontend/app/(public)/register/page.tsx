'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import Dropdown from '../../../components/Dropdown';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    sessionId: '24-25',
    jerseyName: '',
    password: '',
  });

  const [sessions, setSessions] = useState<any[]>([]);
  const [phase, setPhase] = useState<string>('SETUP');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [sessionRes, configRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/sessions'),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`rules/config')
        ]);
        const sessionData = await sessionRes.json();
        const configData = await configRes.json();
        
        setSessions(sessionData);
        if (sessionData.length > 0) setFormData(prev => ({ ...prev, sessionId: sessionData[0].name }));
        setPhase(configData?.currentPhase || 'SETUP');
      } catch (e) {
        console.error('Failed to fetch init data', e);
      } finally {
        setIsInitializing(false);
      }
    };
    fetchInitData();
  }, []);
  const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'RW', 'LW', 'ST'];
  const [file, setFile] = useState<File | null>(null);
  const [primaryPos, setPrimaryPos] = useState('');
  const [secondaryPos, setSecondaryPos] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Profile image is required');
    setLoading(true);

    if (!primaryPos) return toast.error('Primary playing position is required');
    const posArray = [{ position: primaryPos, isPrimary: true }];
    if (secondaryPos && secondaryPos !== primaryPos) {
      posArray.push({ position: secondaryPos, isPrimary: false });
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('studentId', formData.studentId);
    data.append('sessionId', formData.sessionId);
    data.append('jerseyName', formData.jerseyName);
    data.append('password', formData.password);
    data.append('positions', JSON.stringify(posArray));
    data.append('image', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'}/`players', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        toast.success('Registration transmitted successfully!');
        // Optional: clear form
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Network error during transmission');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 text-chalk font-body relative z-0 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full mx-auto glass-panel p-6 sm:p-8 rounded-[2rem] border-gold/20 shadow-[0_0_50px_rgba(232,184,75,0.05)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold/10 blur-[60px] pointer-events-none" />
        
        <h1 className="font-display text-4xl md:text-5xl tracking-widest text-white mb-6 uppercase text-center relative z-10">
          PLAYER REGISTRATION
        </h1>

        {isInitializing ? (
          <div className="text-center py-20 text-chalkMuted animate-pulse font-bold tracking-widest uppercase">Initializing...</div>
        ) : phase !== 'REGISTRATION' ? (
          <div className="text-center py-10 relative z-10">
            <h2 className="font-display text-3xl tracking-widest text-danger mb-4">REGISTRATION CLOSED</h2>
            <p className="text-chalkMuted max-w-md mx-auto leading-relaxed">
              Player registration is only open during the <strong className="text-white">REGISTRATION</strong> phase. 
              The system is currently in the <strong className="text-gold">{phase}</strong> phase. 
              <br/><br/>
              Please check back later or contact the organizers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Full Name</label>
              <input required type="text" className="w-full h-11 bg-ink/50 border border-white/10 rounded-xl px-4 text-white focus:ring-2 focus:ring-gold outline-none transition shadow-inner" 
                value={formData.name}
                onChange={e => {
                  const val = e.target.value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                  setFormData({...formData, name: val});
                }} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Email</label>
              <input required type="email" className="w-full h-11 bg-ink/50 border border-white/10 rounded-xl px-4 text-white focus:ring-2 focus:ring-gold outline-none transition shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Student ID</label>
              <input required type="text" className="w-full h-11 bg-ink/50 border border-white/10 rounded-xl px-4 text-white focus:ring-2 focus:ring-gold outline-none transition shadow-inner" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value.toUpperCase()})} />
            </div>
            <div className="relative z-50">
              <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Session</label>
              <Dropdown
                options={sessions.map(s => ({ label: s.name, value: s.name }))}
                value={formData.sessionId}
                onChange={val => setFormData({...formData, sessionId: val})}
                placeholder="-- Select Session --"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Jersey Name</label>
              <input required type="text" className="w-full h-11 bg-ink/50 border border-white/10 rounded-xl px-4 text-white focus:ring-2 focus:ring-gold outline-none transition shadow-inner" 
                value={formData.jerseyName}
                onChange={e => setFormData({...formData, jerseyName: e.target.value.toUpperCase()})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Password (For Login)</label>
              <input required type="password" placeholder="Create a password" className="w-full h-11 bg-ink/50 border border-white/10 rounded-xl px-4 text-white focus:ring-2 focus:ring-gold outline-none transition shadow-inner" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="relative z-40">
              <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Primary Position</label>
              <Dropdown
                options={POSITIONS.map(p => ({ label: p, value: p }))}
                value={primaryPos}
                onChange={setPrimaryPos}
                placeholder="-- Select Primary --"
              />
            </div>
            <div className="relative z-40">
              <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Secondary Position (Optional)</label>
              <Dropdown
                options={POSITIONS.map(p => ({ label: p, value: p }))}
                value={secondaryPos}
                onChange={setSecondaryPos}
                placeholder="-- Select Secondary --"
              />
            </div>
          </div>


          <div>
            <label className="block text-xs font-bold text-chalkMuted mb-2 uppercase tracking-widest">Profile Photo (Max 5MB)</label>
            <div className="relative">
              <input 
                required 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={e => setFile(e.target.files?.[0] || null)} 
              />
              <div className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors ${file ? 'border-gold bg-gold/5' : 'border-white/20 bg-ink/30 group-hover:border-white/40'}`}>
                {file ? (
                  <>
                    <CheckCircle2 size={32} className="text-gold mb-2" />
                    <span className="text-gold font-bold">{file.name}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-chalkMuted mb-2" />
                    <span className="text-chalk font-semibold text-sm">Click or drag image to upload</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            type="submit" 
            className="w-full mt-4 py-3.5 bg-gold text-ink text-lg font-display tracking-widest rounded-xl transition shadow-[0_0_20px_rgba(232,184,75,0.3)] hover:shadow-[0_0_40px_rgba(232,184,75,0.5)] disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? 'TRANSMITTING...' : 'REGISTER FOR DRAFT'}
          </motion.button>
        </form>
        )}
      </motion.div>
    </div>
  );
}
