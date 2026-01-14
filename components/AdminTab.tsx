
import React, { useState, useEffect } from 'react';
import { getAllStats, updateAdminAccount, db, deleteOfficerRecords, OfficerStat } from '../services/firebase';
import { Users, Key, UserPlus, TrendingUp, UserCheck, GraduationCap, Filter, Trash2, Loader2, QrCode } from 'lucide-react';
import { AdminAccount } from '../types';

const AdminTab: React.FC<{ currentAdmin: string }> = ({ currentAdmin }) => {
  const [stats, setStats] = useState({ totalScans: 0, officers: {} as Record<string, OfficerStat[]> });
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [myAccount, setMyAccount] = useState({ username: currentAdmin, password: '' });
  const [msg, setMsg] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const unsub = getAllStats(setStats);
    return () => unsub();
  }, []);

  const handleUpdateSelf = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAdminAccount(currentAdmin, { 
        username: myAccount.username, 
        password: myAccount.password, 
        role: 'SUPER_ADMIN' 
      });
      setMsg('Akun diperbarui! Login ulang jika username berubah.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Gagal memperbarui akun.');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.password) return;
    try {
      await db.ref(`config/admins/${newAdmin.username}`).set({
        ...newAdmin,
        role: 'SUPER_ADMIN'
      });
      setMsg('Admin baru ditambahkan!');
      setNewAdmin({ username: '', password: '' });
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Gagal menambah admin.');
    }
  };

  const handleDeleteOfficer = async (name: string) => {
    if (confirm(`Hapus riwayat scan petugas "${name}"?`)) {
      setIsDeleting(name);
      try {
        await deleteOfficerRecords(name);
        setMsg(`Data petugas ${name} berhasil dibersihkan.`);
        setTimeout(() => setMsg(''), 3000);
      } catch (err) {
        alert("Gagal menghapus data petugas.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const availableClasses = Object.keys(stats.officers).sort();
  const totalOfficerCount = Object.values(stats.officers).reduce((acc: number, curr: OfficerStat[]) => acc + curr.length, 0);

  const filteredClassKeys = classFilter === 'ALL' 
    ? availableClasses 
    : availableClasses.filter(cls => cls === classFilter);

  return (
    <div className="space-y-6 pb-32 animate-fade-in-up">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 flex items-center gap-5 transition-colors duration-300">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">Global Scanned</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalScans}</h2>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 flex items-center gap-5 transition-colors duration-300">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">Petugas Aktif</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{totalOfficerCount}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 flex flex-col transition-colors duration-300">
          <div className="mb-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={16} className="text-emerald-500" /> Stats Per Petugas
            </h3>
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-[10px] font-black text-slate-900 dark:text-white transition-all cursor-pointer"
            >
              <option value="ALL">SEMUA KELAS</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>KELAS {cls}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2 flex-1">
            {filteredClassKeys.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-600 text-[10px] italic font-bold">Belum ada petugas.</p>
            ) : (
              filteredClassKeys.map(cls => (
                <div key={cls} className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <GraduationCap size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">KELAS {cls}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {stats.officers[cls].map(officer => (
                      <div key={officer.name} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between group border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center shadow-sm">
                            <span className="font-bold text-[10px] leading-none uppercase">{officer.name.charAt(0)}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-[10px] block">{officer.name}</span>
                            <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 uppercase">
                               <QrCode size={9} /> {officer.scanCount} Scans
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteOfficer(officer.name)}
                          disabled={isDeleting === officer.name}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          {isDeleting === officer.name ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {msg && (
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest text-center shadow-lg uppercase animate-bounce">
              {msg}
            </div>
          )}
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 transition-colors">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Key size={18} className="text-amber-500" /> Profil Admin Saya
            </h3>
            <form onSubmit={handleUpdateSelf} className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="group">
                 <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Username Baru</label>
                 <input type="text" placeholder="Ganti username" value={myAccount.username} onChange={e => setMyAccount({...myAccount, username: e.target.value})} className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white text-xs font-bold transition-all" />
               </div>
               <div className="group">
                 <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password Baru</label>
                 <input type="password" placeholder="Ganti password" value={myAccount.password} onChange={e => setMyAccount({...myAccount, password: e.target.value})} className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white text-xs font-bold transition-all" />
               </div>
               <button className="md:col-span-2 py-4 bg-slate-900 dark:bg-slate-700 text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-black transition-all shadow-lg active:scale-95">Simpan Perubahan Profil</button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 transition-colors">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <UserPlus size={18} className="text-blue-500" /> Tambah Admin Baru
            </h3>
            <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="group">
                 <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                 <input type="text" placeholder="Nama user" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white text-xs font-bold transition-all" />
               </div>
               <div className="group">
                 <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                 <input type="password" placeholder="Sandi user" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white text-xs font-bold transition-all" />
               </div>
               <button className="md:col-span-2 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-emerald-700 transition-all shadow-lg active:scale-95">Daftarkan Admin Baru</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTab;
