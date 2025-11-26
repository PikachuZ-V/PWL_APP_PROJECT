import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Doughnut, Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';

// --- SETUP LEAFLET ICON ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- SETUP CHARTJS ---
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

// --- TIPE PROPS ---
interface Props {
    reports: any[];
    stats: any;
    auth: any;
}

export default function UserDashboard({ reports, stats, auth }: Props) {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    // --- DATA REAL-TIME (Safe Check) ---
    const reportList = reports || [];
    
    // Hitung jumlah status untuk kartu interaktif
    const pendingCount = reportList.filter(r => r.status === 'Pending').length;
    const processCount = reportList.filter(r => r.status === 'Proses').length;
    const doneCount = reportList.filter(r => r.status === 'Selesai').length;

    // --- FORM DATA ---
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '', date: '', description: '', image: null as File | null, latitude: '', longitude: ''
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // --- PROFILE STATE ---
    const [profileStep, setProfileStep] = useState('view');
    const [tempPhone, setTempPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');

    // --- CHART DATA ---
    const donutData = {
        labels: ['Selesai', 'Proses', 'Pending'],
        datasets: [{ 
            data: [doneCount, processCount, pendingCount], 
            backgroundColor: ['#10b981', '#3b82f6', '#eab308'], 
            borderWidth: 0, 
            cutout: '75%' 
        }],
    };
    const waveData = {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [{
            fill: true,
            label: 'Total Laporan',
            data: [0, 1, 0, 2, 1, 0, reportList.length], // Data visualisasi
            borderColor: '#0891b2',
            backgroundColor: 'rgba(8, 145, 178, 0.1)',
            tension: 0.4,
            pointRadius: 4,
        }],
    };

    // --- HANDLERS ---

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setData('image', file); setImagePreview(URL.createObjectURL(file)); }
    };

    function LocationMarker() {
        const [position, setPosition] = useState<L.LatLng | null>(null);
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                setData(prevData => ({ ...prevData, latitude: e.latlng.lat.toString(), longitude: e.latlng.lng.toString() }));
            },
        });
        return position === null ? null : <Marker position={position}></Marker>;
    }

    const submitReport = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('reports.store'), {
            forceFormData: true,
            onSuccess: () => { alert('Laporan Berhasil Dikirim!'); reset(); setImagePreview(null); setActiveTab('monitor'); },
            onError: () => alert('Gagal mengirim. Periksa inputan.')
        });
    };

    const handleOpenDetail = (report: any) => { setSelectedReport(report); setIsDetailModalOpen(true); };
    const handleLogout = () => { router.post(route('logout')); };
    
    const handleUpdateProfile = () => {
        router.patch(route('profile.update'), { name: auth.user.name }, {
            onSuccess: () => { alert("Profil Berhasil Diupdate!"); setIsProfileModalOpen(false); }
        });
    };

    const handleRequestOtp = () => {
        if(!tempPhone) return alert("Masukkan nomor baru!");
        setProfileStep('otp');
        alert(`[SIMULASI] Kode OTP dikirim: 123456`);
    };
    const handleVerifyOtp = () => {
        if(otpCode === '123456') {
            alert("Nomor Berhasil Diubah!");
            setProfileStep('view');
        } else {
            alert("Kode OTP Salah!");
        }
    };

    // --- RENDERERS ---

    const renderDashboard = () => (
        <div className="space-y-8 animate-fade-in-up">
            {/* 1. Welcome Banner */}
            <div className="bg-gradient-to-r from-cyan-800 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Halo, {auth?.user?.name || 'Warga'}! 👋</h2>
                    <p className="text-cyan-100 max-w-lg">Laporanmu sangat berarti. Pantau terus perkembangan aduanmu di sini.</p>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            </div>

            {/* 2. Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1" onClick={() => setActiveTab('monitor')}>
                    <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-2xl">⏳</div>
                    <div><div className="text-slate-500 text-xs font-bold uppercase">Menunggu</div><div className="text-3xl font-extrabold text-slate-800">{pendingCount}</div></div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1" onClick={() => setActiveTab('monitor')}>
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">⚙️</div>
                    <div><div className="text-slate-500 text-xs font-bold uppercase">Diproses</div><div className="text-3xl font-extrabold text-slate-800">{processCount}</div></div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1" onClick={() => setActiveTab('monitor')}>
                    <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-2xl">✅</div>
                    <div><div className="text-slate-500 text-xs font-bold uppercase">Selesai</div><div className="text-3xl font-extrabold text-slate-800">{doneCount}</div></div>
                </div>
            </div>

            {/* 3. Charts & Timeline Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Kolom Kiri: Statistik */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-700 text-lg">Statistik Aktivitas</h3>
                        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-semibold">7 Hari Terakhir</span>
                    </div>
                    <div className="h-64 w-full">
                         <Line data={waveData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} />
                    </div>
                </div>

                {/* Kolom Kanan: Timeline Terbaru (INTERAKTIF) */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
                    <h3 className="font-bold text-slate-700 text-lg mb-4">Riwayat Terbaru</h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                        {reportList.length > 0 ? reportList.slice(0, 4).map((report) => (
                            <div key={report.id} onClick={() => handleOpenDetail(report)} className="group flex items-center space-x-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                                {/* Indikator Warna */}
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${
                                    report.status === 'Selesai' ? 'bg-green-500' : 
                                    report.status === 'Proses' ? 'bg-blue-500' : 'bg-yellow-500'
                                }`}></div>
                                
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 truncate group-hover:text-cyan-700 transition-colors">{report.title}</p>
                                    <p className="text-xs text-slate-400">{report.date}</p>
                                </div>
                                
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg">Lihat</span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                                <span className="text-2xl mb-2">📭</span>
                                Belum ada laporan.
                            </div>
                        )}
                    </div>
                    
                    <button onClick={() => setActiveTab('monitor')} className="w-full mt-4 py-3 text-xs font-bold text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                        Lihat Semua Riwayat →
                    </button>
                </div>
            </div>
        </div>
    );

    const renderCreateReport = () => (
        <div className="animate-fade-in-up bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">📝 Buat Laporan Baru</h2>
            <form onSubmit={submitReport} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Laporan</label>
                        <input type="text" placeholder="Contoh: Jalan rusak di..." value={data.title} onChange={e => setData('title', e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" required />
                        {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Kejadian</label>
                        <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Detail</label>
                        <textarea rows={6} placeholder="Jelaskan kronologi secara rinci..." value={data.description} onChange={e => setData('description', e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" required></textarea>
                    </div>
                </div>
                
                <div className="space-y-6 flex flex-col">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Bukti Foto</label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl h-48 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden group">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center group-hover:scale-105 transition-transform">
                                    <span className="text-4xl block mb-2">📸</span>
                                    <span className="text-sm font-medium">Klik untuk upload foto</span>
                                </div>
                            )}
                        </div>
                        {errors.image && <div className="text-red-500 text-xs mt-1">{errors.image}</div>}
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Lokasi Kejadian</label>
                         <div className="rounded-2xl flex-1 min-h-[200px] overflow-hidden border border-slate-200 z-0 relative">
                            <MapContainer center={[-6.200000, 106.816666]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker />
                            </MapContainer>
                            <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-lg text-xs font-mono text-slate-600 z-[400] shadow-sm">
                                {data.latitude ? `${data.latitude.substring(0,7)}, ${data.longitude.substring(0,7)}` : 'Klik peta untuk pin lokasi'}
                            </div>
                         </div>
                    </div>

                    <button type="submit" disabled={processing} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-700/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none">
                        {processing ? 'Sedang Mengirim...' : 'Kirim Laporan Sekarang 🚀'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderMonitorReport = () => (
        <div className="animate-fade-in-up bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Riwayat Pengaduan Anda</h2>
                <button onClick={() => setActiveTab('create')} className="bg-cyan-50 text-cyan-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-cyan-100 transition-colors">+ Buat Baru</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-500 border-b border-slate-100">
                            <th className="p-4 font-semibold">Tanggal</th>
                            <th className="p-4 font-semibold">Judul Laporan</th>
                            <th className="p-4 font-semibold text-center">Status</th>
                            <th className="p-4 font-semibold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {reportList.length > 0 ? reportList.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-500">{item.date}</td>
                                <td className="p-4 font-bold text-slate-700">{item.title}</td>
                                <td className="p-4 text-center"><StatusBadge status={item.status} /></td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleOpenDetail(item)} className="text-cyan-600 hover:text-cyan-800 font-bold text-xs border border-cyan-200 hover:border-cyan-400 px-4 py-2 rounded-lg transition-all">
                                        Lihat Detail
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-10 text-center text-slate-400 bg-slate-50 rounded-xl mt-2">Belum ada laporan yang dibuat.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <Head title="Dashboard User" />
            {/* SIDEBAR (USER THEME - BIRU) */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col z-20">
                <div className="p-8"><h1 className="text-xl font-bold">Pengaduan.<span className="text-cyan-400">App</span></h1></div>
                <nav className="flex-1 px-4 space-y-2">
                    {['Dashboard', 'Buat Laporan', 'Pantau Laporan'].map((menu, idx) => {
                        const keys = ['dashboard', 'create', 'monitor'];
                        const icons = ['🏠', '📝', '👁️'];
                        return (
                            <button key={menu} onClick={() => setActiveTab(keys[idx])} className={`w-full text-left px-6 py-4 rounded-xl flex items-center space-x-4 transition-all ${activeTab === keys[idx] ? 'bg-cyan-700 shadow-lg shadow-cyan-900/50 translate-x-2' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
                                <span className="text-xl">{icons[idx]}</span>
                                <span className="font-medium">{menu}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-6 border-t border-slate-700" onClick={() => setIsProfileModalOpen(true)}>
                    <div className="flex items-center space-x-3 cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">{auth?.user?.name?.[0] || 'U'}</div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-bold truncate group-hover:text-cyan-400 transition-colors">{auth?.user?.name}</div>
                            <div className="text-xs text-slate-400">Edit Profil ⚙️</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-4 flex justify-between items-center border-b border-slate-200">
                    <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2">
                        <span>🚪</span> Logout
                    </button>
                </header>
                <div className="p-8 max-w-6xl mx-auto">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'create' && renderCreateReport()}
                    {activeTab === 'monitor' && renderMonitorReport()}
                </div>
            </main>

            {/* MODAL DETAIL */}
            {isDetailModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transform transition-all">
                        <div className="h-56 bg-slate-200 relative group">
                            {selectedReport.status === 'Selesai' && selectedReport.resolution ? (
                                <><img src={selectedReport.resolution.image} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6"><div className="text-white"><p className="text-xs font-bold bg-green-500 px-3 py-1 rounded-full inline-block mb-2 shadow-lg">✓ SELESAI</p><p className="text-sm opacity-90">Bukti penyelesaian oleh petugas</p></div></div></>
                            ) : selectedReport.image ? (
                                <img src={selectedReport.image} className="w-full h-full object-cover" />
                            ) : (<div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100"><span className="text-5xl mb-2">🗺️</span><span>Lokasi Kejadian</span></div>)}
                            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">✕</button>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedReport.title}</h2>
                                    <p className="text-slate-500 text-sm flex items-center gap-2">📅 {selectedReport.date}</p>
                                </div>
                                <StatusBadge status={selectedReport.status} />
                            </div>
                            
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Deskripsi Masalah</h4>
                                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">"{selectedReport.desc}"</p>
                            </div>

                            {selectedReport.status === 'Selesai' && selectedReport.resolution && (
                                <div className="bg-green-50 rounded-2xl p-5 border border-green-100 animate-fade-in-up">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs shadow-sm">✓</div>
                                        <h4 className="text-green-800 font-bold">Laporan Ditangani</h4>
                                    </div>
                                    <p className="text-slate-700 text-sm mb-4 pl-8">"{selectedReport.resolution.note}"</p>
                                    <div className="flex justify-between text-xs text-slate-500 pt-3 border-t border-green-200 pl-8">
                                        <span>Petugas: <strong>{selectedReport.resolution.operator}</strong></span>
                                        <span>{selectedReport.resolution.timestamp}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="mt-8 flex justify-end">
                                <button onClick={() => setIsDetailModalOpen(false)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Tutup</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* MODAL PROFILE */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-0 overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">⚙️ Pengaturan Akun</h3>
                            <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-8">
                            <div className="space-y-5">
                                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Nama Lengkap</label><input type="text" defaultValue={auth.user.name} className="w-full border-b-2 border-slate-100 py-2 focus:outline-none focus:border-cyan-500 font-medium text-slate-700"/></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label><input type="text" value={auth.user.email} disabled className="w-full border-b-2 border-slate-100 py-2 text-slate-400 bg-transparent cursor-not-allowed"/></div>
                            </div>
                            <div className="mt-8 flex justify-end space-x-3">
                                <button onClick={() => setIsProfileModalOpen(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                                <button onClick={handleUpdateProfile} className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 shadow-lg shadow-cyan-200 transition-all">Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-200 group ${active ? 'bg-cyan-700 shadow-lg shadow-cyan-900/50 translate-x-2' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="font-medium">{label}</span>
    </button>
);
const StatusBadge = ({ status }: { status: string }) => {
    let style = "bg-slate-100 text-slate-600";
    if (status === 'Pending') style = "bg-yellow-50 text-yellow-700 border border-yellow-100";
    if (status === 'Proses') style = "bg-blue-50 text-blue-700 border border-blue-100";
    if (status === 'Selesai') style = "bg-green-50 text-green-700 border border-green-100";
    return <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${style}`}>{status}</span>;
};