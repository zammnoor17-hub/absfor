
import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, User, RefreshCw, LayoutTemplate } from 'lucide-react';
import { StudentData } from '../types';

const GeneratorTab: React.FC = () => {
  const [formData, setFormData] = useState<StudentData>({
    nama: '',
    kelas: '',
    gender: 'L'
  });
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'kelas' ? value.toUpperCase() : value;
    setFormData({ ...formData, [name]: processedValue });
  };

  const drawCard = async () => {
    if (!formData.nama || !formData.kelas) return;
    setLoading(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, 220);
    ctx.bezierCurveTo(width, 220, width / 2, 280, 0, 220);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(width - 50, 50, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('X-PRAY', width / 2, 100);
    
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('KARTU ABSENSI SISWA', width / 2, 150);

    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = "#ffffff";
    ctx.roundRect((width - 440) / 2, 280, 440, 440, 20);
    ctx.fill();
    ctx.shadowColor = "transparent";

    const qrData = JSON.stringify(formData);
    try {
      const qrDataUrl = await QRCode.toDataURL(qrData, { 
        width: 400, 
        margin: 1,
        color: {
            dark: '#1e293b',
            light: '#ffffff'
        }
      });
      const qrImage = new Image();
      qrImage.src = qrDataUrl;
      
      await new Promise((resolve) => {
        qrImage.onload = () => {
          ctx.drawImage(qrImage, (width - 400) / 2, 300, 400, 400);
          resolve(null);
        };
      });
    } catch (err) {
      console.error(err);
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(formData.nama.toUpperCase(), width / 2, 780);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(formData.kelas.toUpperCase(), width / 2, 830);
    
    const genderColor = formData.gender === 'L' ? '#3b82f6' : '#ec4899';
    ctx.fillStyle = genderColor;
    ctx.beginPath();
    ctx.arc(width / 2, 860, 6, 0, Math.PI * 2);
    ctx.fill();

    setLoading(false);
  };

  useEffect(() => {
    if(formData.nama && formData.kelas) drawCard();
  }, []);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `XPRAY_${formData.nama.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 max-w-6xl mx-auto pb-24">
      <div className="flex-1 animate-fade-in-up">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-100 dark:bg-emerald-950 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
               <User className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Buat Kartu</h2>
               <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-1">Data Siswa Kelas 10</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
              <input type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="AHMAD FULAN" className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition font-bold text-slate-900 dark:text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Kelas</label>
                  <input type="text" name="kelas" value={formData.kelas} onChange={handleChange} placeholder="X.4" className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition font-black uppercase text-slate-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Jenis Kelamin</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition appearance-none font-bold text-slate-900 dark:text-white">
                      <option value="L">LAKI-LAKI</option>
                      <option value="P">PEREMPUAN</option>
                  </select>
                </div>
            </div>

            <button onClick={drawCard} disabled={!formData.nama || !formData.kelas} className="w-full py-4 bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-black rounded-2xl transition shadow-lg text-[10px] tracking-widest uppercase disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
               Update Preview
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start space-y-6">
        <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
             <div className="relative bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-2xl transition-colors duration-300 border border-slate-200 dark:border-white/5">
                {(!formData.nama || !formData.kelas) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 dark:bg-slate-800/90 rounded-lg z-10">
                        <div className="text-center p-4">
                            <LayoutTemplate className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase">Preview Kartu</p>
                        </div>
                    </div>
                )}
                <canvas ref={canvasRef} className="w-[300px] h-[450px] bg-white rounded-lg shadow-inner" />
             </div>
        </div>
        
        <button onClick={downloadImage} disabled={!formData.nama || !formData.kelas} className="px-10 py-4 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white font-black rounded-full transition flex items-center gap-3 shadow-lg text-[10px] tracking-widest uppercase disabled:opacity-50 active:scale-95">
          <Download className="w-5 h-5" />
          Simpan Kartu
        </button>
      </div>
    </div>
  );
};

export default GeneratorTab;
