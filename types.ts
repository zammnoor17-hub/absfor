
export interface StudentData {
  nama: string;
  kelas: string;
  gender: 'L' | 'P';
}

export interface AttendanceRecord extends StudentData {
  id?: string;
  timestamp: number;
  jam: string;
  status: 'HADIR' | 'HALANGAN' | 'TIDAK_SHOLAT';
  scannedBy: string;
  officerKelas?: string;
}

export interface AdminAccount {
  username: string;
  password: string;
  role: 'SUPER_ADMIN';
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  SCAN = 'SCAN',
  REKAP = 'REKAP',
  ADMIN = 'ADMIN'
}

export type UserRole = 'OFFICER' | 'SUPER_ADMIN';
