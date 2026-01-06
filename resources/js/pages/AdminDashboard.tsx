import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// --- ASSETS & CONFIG ---
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Komponen Re-center Peta agar tidak blank saat modal dibuka
function MapResizer({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 15);
            setTimeout(() => { map.invalidateSize(); }, 400);
        }
    }, [center, map]);
    return null;
}

interface Props {
  stats: any;
  reportsData: any[];
  usersData: any[];
  auth: any;
}

export default function AdminDashboard({ stats, reportsData, usersData, auth }: Props) {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [completionNote, setCompletionNote] = useState('');
  const [completionImages, setCompletionImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/admin/notifications'); 
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) { console.error("Notif error:", err); }
  };

  const renderUrgencyBadge = (level: string) => {
    const styles: any = {
        'Critical': 'bg-red-600 text-white shadow-lg animate-pulse',
        'High': 'bg-orange-500 text-white',
        'Medium': 'bg-yellow-400 text-yellow-900',
        'Low': 'bg-slate-200 text-slate-600'
    };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[level] || styles['Low']}`}>{level}</span>;
  };

  const handleLogout = () => router.post(route('logout'));

  const handleProcess = (id: number) => {
    if (confirm('Tandai laporan ini sedang diproses?')) {
      router.patch(route('reports.process', id), {}, { preserveScroll: true });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        const newFiles = Array.from(files);
        if (completionImages.length + newFiles.length > 3) return alert("Maksimal 3 foto bukti.");
        setCompletionImages([...completionImages, ...newFiles]);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const handleCompleteSubmit = () => {
    if (!completionNote || completionImages.length === 0) return alert("Wajib isi catatan dan foto bukti!");
    const formData = new FormData();
    formData.append('note', completionNote);
    completionImages.forEach((file, i) => formData.append(`images[${i}]`, file));
    
    router.post(route('reports.complete', selectedReport.id), formData as any, {
      forceFormData: true,
      onSuccess: () => {
        setIsCompleteOpen(false);
        setCompletionImages([]);
        setImagePreviews([]);
        setCompletionNote('');
        alert('🎉 Laporan Berhasil Diselesaikan!');
      }
    });
  };

  const handleUserUpdate = () => {
    router.patch(route('admin.users.update', selectedUser.id), {
      name: selectedUser.name, phone: selectedUser.phone, address: selectedUser.address, status: selectedUser.status 
    }, { onSuccess: () => { setIsUserEditOpen(false); alert('Data diperbarui!'); } });
  };

  // --- RENDERS ---
  const renderTable = (status: string, title: string) => {
    const data = (reportsData || []).filter(r => status === 'all' ? true : r.status === status);
    return (
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-slide-up pb-10">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/30 font-sans">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tighter">{title}</h2>
          <span className="bg-white border text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">{data.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <tr><th className="p-6">Prioritas</th><th className="p-6">Informasi</th><th className="p-6">Pelapor</th><th className="p-6 text-center">Tindakan</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6 align-middle">{renderUrgencyBadge(item.urgency)}</td>
                  <td className="p-6"><div className="font-bold text-slate-800 group-hover:text-indigo-600">{item.title}</div><div className="text-xs text-slate-400 mt-1">{item.date_incident || item.date}</div></td>
                  <td className="p-6 text-slate-600 font-bold uppercase text-[11px]">{item.reporter?.name}</td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setSelectedReport(item); setIsDetailOpen(true); }} className="p-2.5 bg-slate-100 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-500 shadow-sm">👁️</button>
                      {item.status === 'Pending' && <button onClick={() => handleProcess(item.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg">Proses</button>}
                      {item.status === 'Proses' && <button onClick={() => { setSelectedReport(item); setIsCompleteOpen(true); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg">Selesai</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in pb-20 font-sans">
      <div className="bg-[#0f172a] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group border border-slate-700">
        <div className="relative z-10 transition-transform duration-500">
          <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Dashboard Control</h2>
          <p className="text-slate-400 mt-2 text-lg font-medium opacity-80 uppercase tracking-widest text-xs">Pusat Manajemen Laporan.</p>
        </div>
        <div className="absolute right-0 top-0 h-64 w-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
        <CardStat title="Total Laporan" value={stats?.total} icon="📂" gradient="from-slate-700 to-slate-800" />
        <CardStat title="Menunggu" value={stats?.pending} icon="⏳" gradient="from-orange-500 to-orange-600" onClick={() => setActiveTab('incoming')} />
        <CardStat title="Diproses" value={stats?.process} icon="⚡" gradient="from-blue-600 to-indigo-600" onClick={() => setActiveTab('process')} />
        <CardStat title="Selesai" value={stats?.completed} icon="✅" gradient="from-emerald-500 to-teal-600" onClick={() => setActiveTab('completed')} />
      </div>

      {/* Live Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">📊 Analitik Penanganan</h3>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">Live Status</span>
            </div>
            <div className="h-80">
                <Bar data={{ 
                    labels: ['Masuk', 'Proses', 'Selesai'], 
                    datasets: [{ 
                        label: 'Laporan',
                        data: [stats?.pending, stats?.process, stats?.completed], 
                        backgroundColor: ['#f97316', '#4f46e5', '#10b981'], 
                        borderRadius: 12 
                    }] 
                }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md">
            <h3 className="font-bold text-slate-800 text-lg mb-6 text-center tracking-tight">🎯 Rasio Tuntas</h3>
            <div className="h-64 w-64 relative">
                <Doughnut data={{ 
                    labels: ['Belum', 'Selesai'], 
                    datasets: [{ 
                        data: [(stats?.total - stats?.completed), stats?.completed], 
                        backgroundColor: ['#f1f5f9', '#10b981'], 
                        borderWidth: 0, 
                        cutout: '85%' 
                    }] 
                }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-800">{stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden leading-normal">
      <Head title="Admin Console | LaporPak." />

      {/* SIDEBAR */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-[100] w-72 bg-[#0F172A] text-white flex flex-col shadow-2xl transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex-shrink-0`}>
        <div className="p-10 border-b border-white/5 font-black text-2xl">Admin Dashboard</div>
        
        {/* NAV UTAMA (Operasional) */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto font-sans">
          <NavItem icon="🏠" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}} />
          <NavItem icon="📥" label="Incoming" count={stats?.pending} active={activeTab === 'incoming'} onClick={() => {setActiveTab('incoming'); setIsMobileMenuOpen(false);}} />
          <NavItem icon="⚡" label="Processing" count={stats?.process} active={activeTab === 'process'} onClick={() => {setActiveTab('process'); setIsMobileMenuOpen(false);}} />
          <NavItem icon="✅" label="Resolved" count={stats?.completed} active={activeTab === 'completed'} onClick={() => {setActiveTab('completed'); setIsMobileMenuOpen(false);}} />
        </nav>

        {/* --- REVISI: DATABASE USER DI ATAS LOGOUT --- */}
        <div className="px-4 py-2 border-t border-white/5 pt-4">
           <NavItem 
              icon="👥" 
              label="Database User" 
              active={activeTab === 'users'} 
              onClick={() => {setActiveTab('users'); setIsMobileMenuOpen(false);}} 
            />
        </div>

        <div className="p-6 pt-2">
            <button onClick={handleLogout} className="w-full py-4 bg-red-500/10 text-red-400 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-sm tracking-widest">Logout Admin</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative font-sans">
        <header className="h-24 flex items-center justify-between px-10 bg-white border-b border-slate-100 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2.5 bg-slate-50 rounded-xl text-slate-500 border shadow-sm">☰</button>
            <h1 className="text-xl font-bold text-slate-800 capitalize tracking-tight font-sans uppercase">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block"><p className="text-sm font-bold text-slate-800 uppercase tracking-tighter">{auth.user.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p></div>
              <img src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=6366f1&color=fff`} className="w-11 h-11 rounded-full border-4 border-slate-50 shadow-sm" alt="profile" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar scroll-smooth">
          {activeTab === 'dashboard' && renderDashboard()}
          {(activeTab === 'incoming' || activeTab === 'process' || activeTab === 'completed') && renderTable(activeTab === 'incoming' ? 'Pending' : activeTab === 'process' ? 'Proses' : 'Selesai', activeTab)}
          
          {activeTab === 'users' && usersData && (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto animate-fade-in">
                 <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest"><tr><th className="p-6">Informasi Warga</th><th className="p-6 text-center">Status</th><th className="p-6 text-center">Aksi</th></tr></thead>
                  <tbody className="divide-y divide-slate-50 text-sm font-medium">
                    {usersData.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 font-bold text-slate-800 uppercase tracking-tighter text-sm">{u.name}<div className="text-[10px] text-slate-400 font-medium normal-case tracking-normal">{u.email}</div></td>
                        <td className="p-6 text-center"><span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border ${u.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{u.status || 'Verified'}</span></td>
                        <td className="p-6 text-center"><button onClick={() => { setSelectedUser(u); setIsUserEditOpen(true); }} className="text-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">Edit Status</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>
      </main>

      {/* --- MODAL DETAIL + TANGGAPAN PETUGAS --- */}
      {isDetailOpen && selectedReport && (
        <Modal onClose={() => setIsDetailOpen(false)} title="Detail Informasi Laporan">
          <div className="space-y-8 font-sans pb-10">
            <div className="flex justify-between items-start border-b pb-6">
                <div className="max-w-[70%]"><span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Issue Headline</span><h2 className="text-3xl font-bold text-slate-800 leading-tight uppercase tracking-tighter">{selectedReport.title}</h2></div>
                {renderUrgencyBadge(selectedReport.urgency)}
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📍 Titik Lokasi Kejadian (TKP)</label>
                    <button onClick={() => window.open(`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`, '_blank')} className="text-[10px] bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-bold border border-blue-100 transition-all hover:bg-blue-100 uppercase">🗺️ Buka di Google Maps</button>
                </div>
                <div className="h-80 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-xl relative z-0">
                    {selectedReport.latitude && (
                        <MapContainer key={`detail-map-${selectedReport.id}`} center={[parseFloat(selectedReport.latitude), parseFloat(selectedReport.longitude)]} zoom={15} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[parseFloat(selectedReport.latitude), parseFloat(selectedReport.longitude)]} />
                            <MapResizer center={[parseFloat(selectedReport.latitude), parseFloat(selectedReport.longitude)]} />
                        </MapContainer>
                    )}
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border text-sm font-bold text-slate-700 shadow-inner flex items-center gap-3 italic">📌 {selectedReport.location_address || 'Detail alamat tidak ada.'}</div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 pt-4">
                <div className="bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100">
                    <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-4 italic">Informasi Pelapor</label>
                    <div className="flex items-center gap-4">
                        <img src={selectedReport.reporter?.avatar || `https://ui-avatars.com/api/?name=${selectedReport.reporter?.name}`} className="w-16 h-16 rounded-full border-4 border-white shadow-md" />
                        <div><p className="font-bold text-slate-800 uppercase tracking-tighter">{selectedReport.reporter?.name}</p><p className="text-xs text-slate-400 font-bold">{selectedReport.reporter?.phone || '-'}</p></div>
                    </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border shadow-inner"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4 italic">Deskripsi Laporan</label><p className="text-sm text-slate-700 leading-loose font-medium opacity-80">"{selectedReport.desc || selectedReport.description}"</p></div>
            </div>

            <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-4 ml-2 italic">🖼️ Bukti Lampiran Warga</span>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
                    {selectedReport.images?.map((img: string, i: number) => (<img key={i} src={img} className="h-56 w-auto rounded-3xl object-cover shadow-2xl border-4 border-white snap-center cursor-zoom-in hover:scale-[1.02] transition-transform" onClick={() => window.open(img, '_blank')} />))}
                </div>
            </div>

            {/* DATA PENYELESAIAN PETUGAS */}
            {selectedReport.status === 'Selesai' && selectedReport.resolution && (
              <div className="bg-emerald-50 rounded-[3rem] border-2 border-emerald-100 p-8 space-y-6 animate-slide-up shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg font-bold">✓</div>
                  <div><h4 className="text-lg font-black text-emerald-900 uppercase tracking-tighter">Laporan Tuntas</h4><p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Detail Penanganan Lapangan</p></div>
                </div>
                <div className="bg-white/80 p-6 rounded-[2rem] border border-emerald-200 shadow-inner"><p className="text-sm text-slate-700 font-bold leading-relaxed">"{selectedReport.resolution.note || 'Tuntas dikerjakan.'}"</p></div>
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x custom-scrollbar">
                  {selectedReport.resolution.images?.map((resImg: string, idx: number) => (
                    <img key={idx} src={resImg} className="h-56 w-auto rounded-[2rem] border-4 border-white shadow-xl snap-start cursor-pointer hover:scale-105 transition-all" onClick={() => window.open(resImg, '_blank')} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* --- MODAL SELESAIKAN (3 FOTO + KAMERA) --- */}
      {isCompleteOpen && selectedReport && (
        <Modal onClose={() => setIsCompleteOpen(false)} title="Penyelesaian Laporan">
          <div className="space-y-8 font-sans">
            <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100 text-emerald-800 text-sm font-bold border-l-[10px] border-l-emerald-500 shadow-sm leading-relaxed"><p>Status akan diubah ke <span className="underline uppercase tracking-widest font-black">SELESAI</span>. Wajib lampirkan foto bukti pengerjaan (Maks. 3).</p></div>
            <div className="space-y-5">
                <div className="flex justify-between items-center px-1 font-sans"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Dokumentasi Lapangan</label><button type="button" onClick={() => cameraInputRef.current?.click()} className="text-[10px] bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-black shadow-sm border border-blue-100 hover:bg-blue-100 active:scale-90 transition-all uppercase">📸 Ambil Kamera</button></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {imagePreviews.map((src, i) => (<div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-xl border-2 border-white group"><img src={src} className="w-full h-full object-cover" /><button type="button" onClick={() => { setCompletionImages(completionImages.filter((_, idx) => idx !== i)); setImagePreviews(imagePreviews.filter((_, idx) => idx !== i)); }} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 font-black transition-all text-[10px] italic">HAPUS</button></div>))}
                    {completionImages.length < 3 && (
                        <div className="relative aspect-square border-4 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:border-indigo-400 cursor-pointer bg-slate-50 group">
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/><div className="text-3xl mb-1 group-hover:scale-110 transition-transform">🖼️</div><span className="text-[9px] font-black uppercase">Pilih File</span>
                        </div>
                    )}
                </div>
                <input type="file" capture="environment" accept="image/*" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
            </div>
            <textarea className="w-full border-2 border-slate-100 rounded-[2rem] p-6 text-sm focus:ring-4 focus:ring-indigo-100 outline-none font-medium bg-slate-50 shadow-inner" rows={4} placeholder="Catatan hasil penanganan..." value={completionNote} onChange={(e) => setCompletionNote(e.target.value)}></textarea>
            <button onClick={handleCompleteSubmit} className="bg-[#0F172A] text-white w-full py-5 rounded-[2rem] font-bold shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest text-xs active:scale-95">Simpan & Selesaikan Laporan ✨</button>
          </div>
        </Modal>
      )}

      {/* --- MODAL EDIT USER --- */}
      {isUserEditOpen && selectedUser && (
        <Modal onClose={() => setIsUserEditOpen(false)} title="Manajemen Akun">
          <div className="space-y-8 font-sans py-4 text-center">
             <img src={`https://ui-avatars.com/api/?name=${selectedUser.name}&size=128&background=random&bold=true`} className="w-28 h-28 rounded-full border-8 border-slate-50 shadow-2xl mx-auto" alt="avatar" />
             <h3 className="font-bold text-2xl text-slate-800 uppercase tracking-tighter">{selectedUser.name}</h3>
             <div className="space-y-6 text-left">
                <select value={selectedUser.status} onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl px-6 py-5 bg-indigo-50 font-black text-indigo-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer appearance-none shadow-inner uppercase tracking-widest text-xs font-sans">
                    <option value="Verified">✅ Verified Citizen</option><option value="Pending">⏳ Pending Approval</option><option value="Banned">🚫 Account Banned</option>
                </select>
                <button onClick={handleUserUpdate} className="bg-indigo-600 text-white w-full py-5 rounded-[2.2rem] font-bold shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs font-sans">Simpan Perubahan</button>
             </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// --- SUB COMPONENTS ---
const NavItem = ({ icon, label, count, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4.5 rounded-[1.3rem] transition-all mb-2 group ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-950/40 scale-[1.03]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    <div className="flex items-center space-x-4 font-sans"><span className="text-xl group-hover:scale-110 transition-transform">{icon}</span><span className="font-bold text-xs uppercase tracking-[0.1em]">{label}</span></div>
    {count > 0 && <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${active ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>{count}</span>}
  </button>
);

const CardStat = ({ title, value, icon, gradient, onClick }: any) => (
  <div onClick={onClick} className={`bg-gradient-to-br ${gradient} p-8 rounded-[2.5rem] shadow-2xl flex justify-between items-center cursor-pointer hover:-translate-y-2 transition-all duration-500 group border-b-8 border-black/10 font-sans`}>
    <div className="text-white font-sans">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-60">Admin Metrics</div>
        <div className="text-[11px] font-bold uppercase mb-1">{title}</div>
        <div className="text-4xl font-black tracking-tighter">{value || 0}</div>
    </div>
    <div className="text-5xl bg-white/20 p-4 rounded-[2rem] text-white shadow-lg group-hover:scale-110 transition-transform">{icon}</div>
  </div>
);

const Modal = ({ children, onClose, title }: any) => (
  <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-fade-in shadow-2xl overflow-hidden font-sans">
    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden transform transition-all max-h-[92vh] flex flex-col border-8 border-slate-100 font-sans">
      <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-white sticky top-0 z-[80] shadow-sm font-sans">
        <h3 className="font-bold text-2xl text-slate-800 tracking-tight uppercase font-sans italic">{title}</h3>
        <button type="button" onClick={onClose} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-inner text-2xl font-light active:scale-90 border border-slate-100">×</button>
      </div>
      <div className="p-10 overflow-y-auto custom-scrollbar bg-white flex-1 font-sans">{children}</div>
    </div>
  </div>
);