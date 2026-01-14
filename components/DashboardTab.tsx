
import React, { useState, useEffect } from 'react';
import { subscribeToAttendance, getLocalDateString, getLeaderboards, OfficerStat } from '../services/firebase';
import { AttendanceRecord, Tab } from '../types';
import { Users, Clock, Calendar, Activity, Sparkles, Zap, ArrowUpRight, Trophy, TrendingUp, X, Crown, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardTab: React.FC<{ changeTab: (tab: Tab) => void; userName: string }> = ({ changeTab, userName }) => {
  const [stats, setStats] = useState({ hadir: 0, halangan: 0, bolos: 0, total: 0 });
  const [dailyLB, setDailyLB] = useState<OfficerStat[]>([]);
  const [weeklyLB, setWeeklyLB] = useState<OfficerStat[]>([]);
  const [recent, setRecent] = useState<AttendanceRecord[]>([]);
  const [lbType, setLbType] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [loading, setLoading] = useState(true);

  const TARGET = 45; 

  useEffect(() => {
    const unsubA = subscribeToAttendance(getLocalDateString(), (records) => {
      setStats({
        hadir: records.filter(r => r.status === 'HADIR').length,
        halangan: records.filter(r => r.status === 'HALANGAN').length,
        bolos: records.filter(r => r.status === 'TIDAK_SHOLAT').length,
        total: records.length
      });
      setRecent(records.slice(-5).reverse());
      setLoading(false);
    });

    const unsubL = getLeaderboards((d, w) => { setDailyLB(d); setWeeklyLB(w); });

    return () => { unsubA(); unsubL(); };
  }, []);

  const progress = Math.min((stats.hadir / TARGET) * 100, 100);
  const activeLB = lbType === 'DAILY' ? dailyLB : weeklyLB;

  return (
    <div className="space-y-6 pb-24 px-2 max-w-lg mx-auto">
      {/* Premium Hero Card */}
      <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="glass-card rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group border border-white/20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-200 dark:border-emerald-800">
              <Sparkles size={12} /> XPRAY SYSTEM
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 leading-tight">Halo, {userName}!</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Target Hari Ini: <span className="text-emerald-600 font-black">{TARGET} SISWA</span></p>
            
            <button onClick={() => changeTab(Tab.SCAN)} className="px-10 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.5rem] font-black text-[11px] tracking-widest uppercase flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all">
              Buka Scanner <ArrowUpRight size={16} />
            </button>
          </div>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="42%" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" stroke="currentColor" />
              <motion.circle cx="50%" cy="50%" r="42%" strokeWidth="12" fill="transparent" strokeDasharray="264%" initial={{ strokeDashoffset: '264%' }} animate={{ strokeDashoffset: `${264 - (264 * progress) / 100}%` }} className="text-emerald-500" strokeLinecap="round" stroke="currentColor" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{Math.round(progress)}%</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hadir</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modern Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Scan" value={stats.total} icon={<Users size={22}/>} color="emerald" />
        <StatCard label="Hadir Sholat" value={stats.hadir} icon={<Zap size={22}/>} color="indigo" />
        <StatCard label="Bolos" value={stats.bolos} icon={<X size={22}/>} color="red" />
        <StatCard label="Halangan" value={stats.halangan} icon={<Activity size={22}/>} color="amber" />
      </div>

      {/* Leaderboard Card */}
      <div className="glass-card rounded-[3rem] p-8 shadow-2xl border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-[0.2em] flex items-center gap-3">
            <Trophy size={20} className="text-amber-500" /> Leaderboard Petugas
          </h3>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            {['DAILY', 'WEEKLY'].map(type => (
              <button key={type} onClick={() => setLbType(type as any)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${lbType === type ? 'bg-white dark:bg-slate-700 shadow-lg text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {type === 'DAILY' ? 'HARIAN' : 'MINGGUAN'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {activeLB.length === 0 ? (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-12">
                <Medal size={48} className="text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum Ada Data Scan</p>
              </motion.div>
            ) : (
              activeLB.map((officer, i) => (
                <motion.div initial={{x:-20, opacity:0}} animate={{x:0, opacity:1}} transition={{delay: i*0.1}} key={officer.name} className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-[1.8rem] border border-transparent hover:border-emerald-500/20 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[12px] shadow-sm ${ i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : 'bg-white dark:bg-slate-700 text-slate-500' }`}>#{i+1}</div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-tight mb-0.5">{officer.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Officer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg leading-none">{officer.scanCount}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Scans</p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recent History */}
      <div className="glass-card rounded-[3rem] p-8 shadow-2xl border border-white/10">
        <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
          <Clock size={20} className="text-emerald-500" /> Histori Terbaru
        </h3>
        <div className="space-y-4">
          {recent.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-[1.8rem] border border-transparent hover:bg-white dark:hover:bg-slate-800 transition-all border-white/5">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${record.gender === 'L' ? 'bg-blue-600' : 'bg-pink-600'}`}>{record.nama.charAt(0)}</div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-slate-800 dark:text-white text-[12px] uppercase truncate max-w-[120px] mb-0.5">{record.nama}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{record.kelas} • {record.jam}</p>
                </div>
              </div>
              <div className={`text-[9px] font-black px-5 py-2.5 rounded-2xl shadow-sm ${
                record.status === 'HADIR' ? 'bg-emerald-600 text-white' : 
                record.status === 'TIDAK_SHOLAT' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {record.status === 'HADIR' ? 'SHOLAT' : record.status === 'TIDAK_SHOLAT' ? 'BOLOS' : 'UDZUR'}
              </div>
            </div>
          ))}
          {recent.length === 0 && <p className="text-center py-10 text-[10px] font-black uppercase text-slate-400 tracking-widest">Belum Ada Scan Hari Ini</p>}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => {
  const themes: any = {
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
    red: 'text-red-600 bg-red-50 dark:bg-red-950/40'
  };
  return (
    <motion.div whileHover={{ y: -5 }} className="glass-card rounded-[2.5rem] p-6 shadow-xl border border-white/10 hover:border-emerald-500/30 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${themes[color]}`}>{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
    </motion.div>
  );
};

export default DashboardTab;
