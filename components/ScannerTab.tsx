
import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { StudentData, AttendanceRecord } from '../types';
import { saveAttendance, checkIfAlreadyScanned } from '../services/firebase';
import { Check, Camera, Sparkles, X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScannerTab: React.FC<{ currentUser: string; officerClass: string }> = ({ currentUser, officerClass }) => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [duplicate, setDuplicate] = useState<AttendanceRecord | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'confirming'>('idle');
  const [msg, setMsg] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("reader", { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] });
    startCamera();
    return () => { scannerRef.current?.stop().catch(() => {}); };
  }, []);

  const startCamera = async () => {
    try {
      await scannerRef.current?.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: 250, aspectRatio: 1.0 },
        (text) => onScanSuccess(text),
        () => {}
      );
    } catch (e) { setMsg("Gagal akses kamera."); }
  };

  const onScanSuccess = async (text: string) => {
    try {
      if (status !== 'idle') return;
      
      const data: StudentData = JSON.parse(text);
      if (!data.nama || !data.kelas) throw new Error();

      // Pause scanner immediately to avoid multiple scans
      await scannerRef.current?.pause();
      setStatus('checking');

      const existing = await checkIfAlreadyScanned(data.nama, data.kelas);
      
      setTimeout(() => {
        if (existing) {
          setDuplicate(existing);
        } else {
          setStudent(data);
        }
        setStatus('confirming');
      }, 600);

    } catch (e) {
      setMsg("Format QR tidak dikenali!");
      setTimeout(() => setMsg(""), 2000);
    }
  };

  const handleAttendance = async (pilihan: 'HADIR' | 'HALANGAN' | 'TIDAK_SHOLAT') => {
    const target = student || duplicate;
    if (!target) return;

    try {
      const now = new Date();
      const record = {
        nama: target.nama,
        kelas: target.kelas,
        gender: target.gender,
        timestamp: now.getTime(),
        jam: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: pilihan,
        scannedBy: currentUser,
        officerKelas: officerClass
      };

      await saveAttendance(record, duplicate?.id);
      
      setMsg(duplicate ? "DATA DIPERBARUI!" : "ABSENSI BERHASIL!");
      resetScanner();
      
      setTimeout(() => {
        setMsg("");
        scannerRef.current?.resume();
      }, 1500);
    } catch (e) { setMsg("Gagal menyimpan data."); }
  };

  const resetScanner = () => {
    setStudent(null);
    setDuplicate(null);
    setStatus('idle');
  };

  const cancel = () => {
    resetScanner();
    scannerRef.current?.resume();
  };

  return (
    <div className="flex flex-col items-center py-6 px-4 max-w-md mx-auto">
      {/* Status Header */}
      <div className="w-full glass-card p-5 rounded-[2.5rem] flex items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <Camera size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Scanner Aktif</p>
              <p className="text-sm font-black text-slate-800 dark:text-white uppercase">{officerClass || 'ADMIN'}</p>
           </div>
        </div>
        <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black animate-pulse">LIVE</div>
      </div>

      {/* QR Container */}
      <div className="relative w-full aspect-square bg-slate-900 rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl">
        <div id="reader" className="w-full h-full"></div>
        {status === 'idle' && <div className="scan-line" />}
      </div>

      <AnimatePresence>
        {status === 'checking' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Memproses Data...</p>
            </div>
          </motion.div>
        )}

        {status === 'confirming' && (
          <motion.div initial={{y:50, opacity:0}} animate={{y:0, opacity:1}} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              
              {duplicate && (
                <div className="mb-6 py-2 px-4 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center gap-2 border border-amber-100 dark:border-amber-900/30">
                  <AlertTriangle size={14} /> <span className="text-[10px] font-black uppercase tracking-tight">Sudah Absen Jam {duplicate.jam}</span>
                </div>
              )}

              <div className={`w-28 h-28 mx-auto mb-6 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl transform rotate-3 ${ (student?.gender || duplicate?.gender) === 'L' ? 'bg-blue-600' : 'bg-pink-600' }`}>
                {(student?.nama || duplicate?.nama || '?').charAt(0)}
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight mb-1">{(student?.nama || duplicate?.nama)}</h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-8 uppercase tracking-widest">{(student?.kelas || duplicate?.kelas)}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button onClick={() => handleAttendance('HADIR')} className="py-6 bg-emerald-600 text-white rounded-[2rem] flex flex-col items-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">
                  <Check size={28} strokeWidth={3} /> <span className="text-[10px] font-black uppercase tracking-widest">SHOLAT</span>
                </button>
                <button onClick={() => handleAttendance('TIDAK_SHOLAT')} className="py-6 bg-red-600 text-white rounded-[2rem] flex flex-col items-center gap-2 shadow-xl shadow-red-600/20 active:scale-95 transition-all">
                  <X size={28} strokeWidth={3} /> <span className="text-[10px] font-black uppercase tracking-widest">BOLOS</span>
                </button>
              </div>
              
              <button onClick={() => handleAttendance('HALANGAN')} className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] mb-6 hover:bg-slate-200 transition-colors">HALANGAN / UDZUR</button>
              
              <button onClick={cancel} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Batal</button>
            </div>
          </motion.div>
        )}

        {msg && (
          <motion.div initial={{y:-100, opacity:0}} animate={{y:0, opacity:1}} className="fixed top-28 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[11px] font-black tracking-[0.2em] uppercase shadow-2xl flex items-center gap-3 z-[100]">
            <Sparkles size={18} className="text-emerald-400" /> {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScannerTab;
