
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { AttendanceRecord, AdminAccount } from '../types';

// Konfigurasi Firebase Anda (Pastikan sesuai dengan yang ada di Firebase Console > Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyDkmJDCUEN0FprTFKxlOEkaoU3JndvezAg",
  authDomain: "absen-4c88a.firebaseapp.com",
  databaseURL: "https://absen-4c88a-default-rtdb.firebaseio.com/",
  projectId: "absen-4c88a",
  storageBucket: "absen-4c88a.firebasestorage.app",
  messagingSenderId: "189025380230",
  appId: "1:189025380230:web:c15de7226d3ccfd42cae07"
};

// Inisialisasi Firebase
const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
export const db = app.database();

export interface OfficerStat {
  name: string;
  scanCount: number;
}

// Fungsi bantu untuk mendapatkan format tanggal YYYY-MM-DD lokal
export const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

// --- Logika Absensi ---
export const saveAttendance = async (record: Omit<AttendanceRecord, 'id'>, id?: string) => {
  const dateStr = getLocalDateString();
  const path = `absensi/${dateStr}`;
  if (id) {
    await db.ref(`${path}/${id}`).set(record);
  } else {
    await db.ref(path).push(record);
  }
};

export const checkIfAlreadyScanned = async (nama: string, kelas: string): Promise<AttendanceRecord | null> => {
  try {
    const dateStr = getLocalDateString();
    const snapshot = await db.ref(`absensi/${dateStr}`).once('value');
    const data = snapshot.val();
    if (!data) return null;
    const records = Object.entries(data).map(([key, value]: [string, any]) => ({ id: key, ...value }));
    return records.find(r => r.nama === nama && r.kelas === kelas) || null;
  } catch (e) { return null; }
};

export const subscribeToAttendance = (dateStr: string, callback: (data: AttendanceRecord[]) => void) => {
  const query = db.ref(`absensi/${dateStr}`).orderByChild('timestamp');
  const handler = query.on('value', (snapshot) => {
    const data = snapshot.val();
    const records = data ? Object.entries(data).map(([key, value]: [string, any]) => ({ id: key, ...value })) : [];
    // Selalu urutkan A-Z untuk tampilan Rekap
    callback(records.sort((a, b) => a.nama.localeCompare(b.nama)));
  });
  return () => query.off('value', handler);
};

// --- Logika Autentikasi ---
export const verifyOfficer = async (username: string, pass: string) => {
  const snapshot = await db.ref(`config/officers/${username}`).once('value');
  const data = snapshot.val();
  if (data && data.password === pass) return data;
  return null;
};

export const verifyAdmin = async (username: string, pass: string) => {
  const snapshot = await db.ref('config/admins').once('value');
  const admins = snapshot.val();
  
  // Login darurat untuk setup pertama kali
  if (!admins && username === 'admin' && pass === '123') {
    await db.ref('config/admins/admin').set({ username: 'admin', password: '123', role: 'SUPER_ADMIN' });
    return true;
  }
  
  return admins && Object.values(admins).some((a: any) => a.username === username && a.password === pass);
};

export const registerOfficer = async (u: string, p: string, k: string) => {
  const ref = db.ref(`config/officers/${u}`);
  const snap = await ref.once('value');
  if (snap.exists()) throw new Error("Username sudah terpakai.");
  await ref.set({ username: u, password: p, kelas: k, role: 'OFFICER' });
};

// --- Statistik & Leaderboard ---
export const getLeaderboards = (callback: (daily: OfficerStat[], weekly: OfficerStat[]) => void) => {
  const ref = db.ref('absensi');
  const handler = ref.on('value', (snap) => {
    const data = snap.val() || {};
    const today = getLocalDateString();
    const dailyCounts: Record<string, number> = {};
    const weeklyCounts: Record<string, number> = {};

    Object.entries(data).forEach(([dateStr, records]: [string, any]) => {
      Object.values(records).forEach((r: any) => {
        if (!r.scannedBy) return;
        if (dateStr === today) dailyCounts[r.scannedBy] = (dailyCounts[r.scannedBy] || 0) + 1;
        weeklyCounts[r.scannedBy] = (weeklyCounts[r.scannedBy] || 0) + 1;
      });
    });

    const format = (counts: Record<string, number>) => 
      Object.entries(counts)
        .map(([name, scanCount]) => ({ name, scanCount }))
        .sort((a, b) => b.scanCount - a.scanCount)
        .slice(0, 5);

    callback(format(dailyCounts), format(weeklyCounts));
  });
  return () => ref.off('value', handler);
};

export const getAllStats = (callback: (data: any) => void) => {
  const ref = db.ref('absensi');
  const handler = ref.on('value', (snap) => {
    const data = snap.val() || {};
    let total = 0;
    const officerMap: Record<string, Record<string, number>> = {};
    
    Object.values(data).forEach((dayRecords: any) => {
      Object.values(dayRecords).forEach((r: any) => {
        total++;
        if (r.scannedBy && r.officerKelas) {
          if (!officerMap[r.officerKelas]) officerMap[r.officerKelas] = {};
          const classStats = officerMap[r.officerKelas];
          // Perbaikan logika penghitungan
          classStats[r.scannedBy] = (classStats[r.scannedBy] || 0) + 1;
        }
      });
    });

    // Ubah ke format yang diharapkan komponen AdminTab
    const formattedOfficers: Record<string, OfficerStat[]> = {};
    Object.entries(officerMap).forEach(([kelas, officers]) => {
      formattedOfficers[kelas] = Object.entries(officers).map(([name, count]) => ({
        name,
        scanCount: count as number
      }));
    });

    callback({ totalScans: total, officers: formattedOfficers });
  });
  return () => ref.off('value', handler);
};

export const updateAdminAccount = async (oldU: string, data: AdminAccount) => {
  if (oldU !== data.username) await db.ref(`config/admins/${oldU}`).remove();
  await db.ref(`config/admins/${data.username}`).set(data);
};

export const deleteOfficerRecords = async (name: string) => {
  const snapshot = await db.ref('absensi').once('value');
  const data = snapshot.val();
  if (!data) return;
  const updates: any = {};
  Object.entries(data).forEach(([dateStr, dayRecords]: [string, any]) => {
    Object.entries(dayRecords).forEach(([key, record]: [string, any]) => {
      if (record.scannedBy === name) updates[`absensi/${dateStr}/${key}`] = null;
    });
  });
  await db.ref().update(updates);
  await db.ref(`config/officers/${name}`).remove();
};
