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
          fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/sessions`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL }/rules/config`)
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL }/players`, {
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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 text-chalk font-body relative z-0 py-12 lg:py-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full mx-auto bg-panel p-8 sm:p-10 rounded-[2rem] border border-chalk/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-[60px] pointer-events-none" />
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-chalk mb-2">Player Registration</h1>
          <p className="text-chalkMuted text-sm font-medium">Join the draft pool for the upcoming season</p>
        </div>

        {isInitializing ? (
          <div className="text-center py-20 text-chalkMuted animate-pulse font-bold tracking-widest uppercase">Initializing...</div>
        ) : phase !== 'REGISTRATION' ? (
          <div className="text-center py-10 relative z-10">
            <h2 className="font-display text-2xl font-bold text-chalk mb-4">Registration Closed</h2>
            <p className="text-chalkMuted max-w-md mx-auto leading-relaxed text-sm">
              Player registration is only open during the <strong className="text-emerald-400">REGISTRATION</strong> phase. 
              The system is currently in the <strong className="text-emerald-400">{phase}</strong> phase. 
              <br/><br/>
              Please check back later or contact the organizers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Full Name</label>
                <input required type="text" className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" 
                  value={formData.name}
                  onChange={e => {
                    const val = e.target.value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    setFormData({...formData, name: val});
                  }} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Email Address</label>
                <input required type="email" className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Student ID</label>
                <input required type="text" className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" 
                  value={formData.studentId} 
                  onChange={e => setFormData({...formData, studentId: e.target.value.toUpperCase()})} 
                />
              </div>
              <div className="relative z-50">
                <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Session</label>
                <Dropdown
                  options={sessions.map(s => ({ label: s.name, value: s.name }))}
                  value={formData.sessionId}
                  onChange={val => setFormData({...formData, sessionId: val})}
                  placeholder="-- Select Session --"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Jersey Name</label>
                <input required type="text" className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" 
                  value={formData.jerseyName}
                  onChange={e => setFormData({...formData, jerseyName: e.target.value.toUpperCase()})} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Password</label>
                <input required type="password" placeholder="Create a password" className="w-full bg-ink border border-chalk/10 rounded-xl px-4 py-3 text-chalk placeholder:text-chalkMuted/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div className="relative z-40">
                <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Primary Position</label>
                <Dropdown
                  options={POSITIONS.map(p => ({ label: p, value: p }))}
                  value={primaryPos}
                  onChange={setPrimaryPos}
                  placeholder="-- Select Primary --"
                />
              </div>
              <div className="relative z-40">
                <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Secondary Position</label>
                <Dropdown
                  options={POSITIONS.map(p => ({ label: p, value: p }))}
                  value={secondaryPos}
                  onChange={setSecondaryPos}
                  placeholder="-- Optional --"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-bold text-chalkMuted mb-2 uppercase tracking-wider">Profile Photo (Max 5MB)</label>
              <div className="relative group">
                <input 
                  required 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  onChange={e => setFile(e.target.files?.[0] || null)} 
                />
                <div className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-300 ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-chalk/10 bg-ink group-hover:border-emerald-500/30'}`}>
                  {file ? (
                    <>
                      <CheckCircle2 size={28} className="text-emerald-500 mb-2" />
                      <span className="text-emerald-400 font-bold text-sm">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={28} className="text-chalkMuted mb-2 group-hover:text-emerald-400 transition-colors" />
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
              className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[15px] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(5,150,105,0.2)] hover:shadow-[0_0_25px_rgba(5,150,105,0.4)]"
            >
              {loading ? 'Submitting...' : 'Complete Registration'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
