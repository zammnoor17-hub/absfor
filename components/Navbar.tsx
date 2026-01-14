
import React, { useState } from 'react';
import { Tab, UserRole } from '../types';
import { QrCode, ScanLine, ClipboardList, LayoutDashboard, ShieldCheck, Sun, Moon, LogOut, User as UserIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  role: UserRole;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: string;
  userClass: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, role, theme, toggleTheme, user, userClass, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block sticky top-4 z-50 px-6 mx-auto max-w-5xl">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl px-8 h-16 flex items-center justify-between border border-white dark:border-white/5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <ScanLine className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">X-PRAY</h1>
          </div>
          
          <div className="flex gap-2">
            <NavPill active={activeTab === Tab.DASHBOARD} onClick={() => setActiveTab(Tab.DASHBOARD)} label="Home" icon={<LayoutDashboard size={14} />} />
            <NavPill active={activeTab === Tab.SCAN} onClick={() => setActiveTab(Tab.SCAN)} label="Scan" icon={<ScanLine size={14} />} />
            <NavPill active={activeTab === Tab.REKAP} onClick={() => setActiveTab(Tab.REKAP)} label="Data" icon={<ClipboardList size={14} />} />
            <NavPill active={activeTab === Tab.GENERATOR} onClick={() => setActiveTab(Tab.GENERATOR)} label="Card" icon={<QrCode size={14} />} />
            {role === 'SUPER_ADMIN' && (
              <NavPill active={activeTab === Tab.ADMIN} onClick={() => setActiveTab(Tab.ADMIN)} label="Admin" icon={<ShieldCheck size={14} />} />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar (Profile, Logo, Theme) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[100] px-4 py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-100 dark:border-white/5 flex justify-between items-center transition-colors">
        <button 
          onClick={() => setShowProfile(true)}
          className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"
        >
          {user.charAt(0).toUpperCase()}
        </button>
        
        <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white tracking-tighter text-lg">X-PRAY</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-600 dark:text-amber-400 transition-all active:scale-90"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Mobile Profile Sheet Overlay */}
      <AnimatePresence>
        {showProfile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[150] md:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 z-[160] rounded-t-[2.5rem] p-8 md:hidden shadow-2xl border-t border-white/10"
            >
              <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8" />
              
              <div className="flex flex-col items-center text-center mb-8">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-white mb-4 shadow-xl ${role === 'SUPER_ADMIN' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                  {user.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user}</h3>
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                   {role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : `PETUGAS • KELAS ${userClass}`}
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={onLogout}
                  className="w-full py-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-black rounded-2xl flex items-center justify-center gap-3 text-[10px] tracking-widest uppercase transition-all active:scale-95"
                >
                  <LogOut size={16} /> Keluar Akun
                </button>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black rounded-2xl text-[10px] tracking-widest uppercase"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-[100]">
         <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] p-2 shadow-2xl flex justify-around items-center border border-white/10">
             <MobileBtn active={activeTab === Tab.DASHBOARD} onClick={() => setActiveTab(Tab.DASHBOARD)} icon={<LayoutDashboard size={20} />} label="Home" />
             <MobileBtn active={activeTab === Tab.SCAN} onClick={() => setActiveTab(Tab.SCAN)} icon={<ScanLine size={24} />} main />
             <MobileBtn active={activeTab === Tab.REKAP} onClick={() => setActiveTab(Tab.REKAP)} icon={<ClipboardList size={20} />} label="Data" />
             
             {role === 'SUPER_ADMIN' ? (
               <MobileBtn active={activeTab === Tab.ADMIN} onClick={() => setActiveTab(Tab.ADMIN)} icon={<ShieldCheck size={20} />} label="Admin" />
             ) : (
               <MobileBtn active={activeTab === Tab.GENERATOR} onClick={() => setActiveTab(Tab.GENERATOR)} icon={<QrCode size={20} />} label="ID Card" />
             )}
         </div>
      </div>
    </>
  );
};

const NavPill = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${active ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
    {icon} {label}
  </button>
);

const MobileBtn = ({ active, onClick, icon, main, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${active ? 'text-white' : 'text-slate-500'} ${main ? 'bg-emerald-600 text-white w-14 h-14 -mt-10 shadow-xl shadow-emerald-500/20 rounded-2xl' : ''}`}>
    {icon}
    {!main && <span className="text-[9px] font-black mt-1 uppercase tracking-widest opacity-80">{label}</span>}
  </button>
);

export default Navbar;
