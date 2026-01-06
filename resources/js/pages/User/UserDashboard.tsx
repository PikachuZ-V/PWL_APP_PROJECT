import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet';
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
    Filler 
} from 'chart.js';

// --- CSS LEAFLET ---
import 'leaflet/dist/leaflet.css';

// --- SETUP LEAFLET ICON FIX ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- KOMPONEN PETA UNTUK DETAIL (Static View) ---
function DetailMapHandler({ lat, lng }: { lat: string, lng: string }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            const center: [number, number] = [parseFloat(lat), parseFloat(lng)];
            map.setView(center, 16);
            setTimeout(() => map.invalidateSize(), 400);
        }
    }, [lat, lng, map]);
    return <Marker position={[parseFloat(lat), parseFloat(lng)]}><Popup>Lokasi TKP Laporan</Popup></Marker>;
}

// --- KOMPONEN PETA UNTUK INPUT (Interactive) ---
function MapHandler({ lat, lng, setData }: { lat: string, lng: string, setData: any }) {
    const map = useMap();
    useMapEvents({
        click(e) {
            setData((prev: any) => ({ 
                ...prev, 
                latitude: e.latlng.lat.toString(), 
                longitude: e.latlng.lng.toString() 
            }));
        },
    });
    useEffect(() => {
        if (lat && lng) map.flyTo([parseFloat(lat), parseFloat(lng)], 15);
    }, [lat, lng, map]);
    return lat && lng ? <Marker position={[parseFloat(lat), parseFloat(lng)]} /> : null;
}

interface Report {
    id: number; title: string; date: string; desc: string; description?: string;
    location_address?: string; latitude?: string; longitude?: string;
    status: 'Pending' | 'Proses' | 'Selesai'; images: string[];
    resolution?: { note: string; images?: string[]; }; 
}

interface Props { reports: Report[]; stats: any; auth: any; }

export default function UserDashboard({ reports, stats, auth }: Props) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filterStatus, setFilterStatus] = useState('All');

    // Chatbot State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([{ id: 1, sender: 'bot', text: 'Halo! Ada yang bisa kami bantu terkait laporan Anda? 🤖' }]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Media State
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isChatOpen]);

    // --- FORMS ---
    const profileForm = useForm({
        name: auth.user.name || '',
        phone: auth.user.phone || '',
        address: auth.user.address || '',
    });

    const reportForm = useForm({
        title: '', date: new Date().toISOString().split('T')[0],
        description: '', location_address: '', images: [] as File[],
        latitude: '', longitude: ''
    });

    // --- ACTIONS ---
    const handleLogout = () => { if (confirm('Keluar dari aplikasi?')) router.post(route('logout')); };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), {
            onSuccess: () => {
                alert('Profil Berhasil Diperbarui! ✨');
                setIsEditingProfile(false);
            },
        });
    };

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            if (reportForm.data.images.length + newFiles.length > 5) return alert("Maksimal 5 foto.");
            reportForm.setData('images', [...reportForm.data.images, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
        e.target.value = ''; 
    };

    const submitReport = (e: React.FormEvent) => {
        e.preventDefault();
        if(reportForm.data.images.length === 0) return alert("Wajib lampirkan foto bukti.");
        if(!reportForm.data.latitude) return alert("Klik lokasi di peta.");
        reportForm.post(route('reports.store'), {
            forceFormData: true,
            onSuccess: () => { alert('Laporan Terkirim!'); reportForm.reset(); setImagePreviews([]); setActiveTab('monitor'); },
        });
    };

    const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // 1. Simpan pesan dari User
    const userMessage = { id: Date.now(), sender: 'user', text: chatInput };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = chatInput.toLowerCase(); // Ubah ke kecil agar mudah dicek
    setChatInput('');

    // 2. Simulasi Bot sedang "berpikir"
    setTimeout(() => {
        let botReply = "";

        // 3. Logika Respon Dinamis
        if (currentInput.includes("halo") || currentInput.includes("p")) {
            botReply = "Halo! Ada yang bisa kami bantu terkait laporan Anda?";
        } else if (currentInput.includes("status") || currentInput.includes("cek") || currentInput.includes("status laporan saya")) {
            botReply = "Untuk mengecek status, silakan buka menu 'Laporan Saya' di dashboard.";
        } else if (currentInput.includes("darurat") || currentInput.includes("bahaya")) {
            botReply = "🚨 Peringatan: Jika ini keadaan darurat medis atau kriminal, segera hubungi 112!";
        } else if (currentInput.includes("terima kasih") || currentInput.includes("thanks")) {
            botReply = "Sama-sama! Senang bisa membantu Anda. 🙏";
        } else {
            botReply = "Mohon maaf, saya belum mengerti. Pesan Anda telah kami teruskan ke petugas untuk tindak lanjut manual.";
        }

        // 4. Kirim respon Bot
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            sender: 'bot', 
            text: botReply 
        }]);
    }, 1000);
};

    const weeklyLiveStats = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        monday.setHours(0, 0, 0, 0);
        (reports || []).forEach(r => {
            const d = new Date(r.date);
            const diff = Math.floor((d.getTime() - monday.getTime()) / (1000 * 3600 * 24));
            if (diff >= 0 && diff <= 6) counts[diff]++;
        });
        return counts;
    }, [reports]);

    // --- RENDERERS ---
    const renderDashboard = () => (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto font-sans">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Halo, {auth.user.name.split(' ')[0]}! 👋</h2>
                    <p className="opacity-80 max-w-md font-medium text-sm">Pantau status laporan Anda secara transparan bersama SobatLapor.</p>
                    <button onClick={() => setActiveTab('create')} className="mt-8 bg-white text-blue-700 px-8 py-3 rounded-2xl font-bold shadow-lg transition-all hover:scale-105 text-xs uppercase tracking-widest">📝 Buat Laporan Baru</button>
                </div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Menunggu" val={reports.filter(r=>r.status==='Pending').length} icon="⏳" color="border-orange-400" />
                <StatCard label="Diproses" val={reports.filter(r=>r.status==='Proses').length} icon="⚡" color="border-blue-400" />
                <StatCard label="Selesai" val={reports.filter(r=>r.status==='Selesai').length} icon="✅" color="border-green-400" />
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">📊 Statistik Laporan Mingguan</h3>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Live Activity</span>
                </div>
                <div className="h-64">
                    <Line data={{
                        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                        datasets: [{ fill: true, label: 'Laporan', data: weeklyLiveStats, borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.05)', tension: 0.4, pointRadius: 4, pointBackgroundColor: '#4f46e5' }]
                    }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-700 overflow-hidden leading-normal">
            <Head title="Citizen Dashboard | LaporPak." />

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl transition-transform md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-10 border-b border-white/5 font-black text-2xl">🚨 SobatLapor!</div>
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    <SidebarBtn icon="🏠" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false)}} />
                    <SidebarBtn icon="📝" label="Buat Laporan" active={activeTab === 'create'} onClick={() => {setActiveTab('create'); setIsMobileMenuOpen(false)}} />
                    <SidebarBtn icon="👁️" label="Monitor Laporan" active={activeTab === 'monitor'} onClick={() => {setActiveTab('monitor'); setIsMobileMenuOpen(false)}} />
                </nav>
                <div className="p-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {setIsProfileModalOpen(true); setIsEditingProfile(false);}}>
                        <img src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=6366f1&color=fff`} className="w-11 h-11 rounded-xl border-2 border-white/10 group-hover:border-blue-400 transition-all shadow-sm" alt="profile" />
                        <div className="overflow-hidden"><div className="font-bold text-sm truncate">{auth.user.name}</div><div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Pengaturan Akun</div></div>
                    </div>
                    <button onClick={handleLogout} className="w-full py-4 bg-red-500/10 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Logout Sesi</button>
                </div>
            </aside>
            
            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>}

            <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen scroll-smooth custom-scrollbar">
                <header className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-0 z-30">
                    <span className="font-black">SobatLapor</span>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-500">☰</button>
                </header>

                {activeTab === 'dashboard' && renderDashboard()}
                
                {activeTab === 'create' && (
                    <div className="animate-slide-up bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden max-w-5xl mx-auto">
                        <div className="p-8 border-b bg-slate-50/50 font-bold text-xl">📝 Buat Pengaduan Baru</div>
                        <form onSubmit={submitReport} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Judul Laporan</label><input type="text" value={reportForm.data.title} onChange={e => reportForm.setData('title', e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" required /></div>
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Alamat Kejadian (TKP)</label><textarea rows={3} value={reportForm.data.location_address} onChange={e => reportForm.setData('location_address', e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" required /></div>
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Kronologi Masalah</label><textarea rows={6} value={reportForm.data.description} onChange={e => reportForm.setData('description', e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" required /></div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                                    <label className="text-[10px] font-bold block mb-4 text-slate-400 uppercase tracking-widest">📸 Dokumentasi Foto</label>
                                    <div className="flex gap-3 justify-center mb-6">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-white border font-bold text-xs rounded-xl shadow-sm hover:bg-slate-100">🖼️ Galeri</button>
                                        <button type="button" onClick={() => cameraInputRef.current?.click()} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg">📸 Kamera</button>
                                    </div>
                                    <input type="file" multiple ref={fileInputRef} onChange={handleAddImages} className="hidden" accept="image/*" />
                                    <input type="file" multiple capture="environment" ref={cameraInputRef} onChange={handleAddImages} className="hidden" accept="image/*" />
                                    <div className="grid grid-cols-5 gap-2">{imagePreviews.map((src, i) => (<div key={i} className="relative aspect-square rounded-xl overflow-hidden border"><img src={src} className="w-full h-full object-cover" /><button type="button" onClick={() => {setImagePreviews(imagePreviews.filter((_,idx)=>idx!==i)); reportForm.setData('images', reportForm.data.images.filter((_,idx)=>idx!==i))}} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black uppercase">Hapus</button></div>))}</div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">📍 Lokasi GPS</label>
                                    <div className="h-64 rounded-[2.5rem] overflow-hidden border-2 relative z-0 shadow-inner">
                                        {mounted && <MapContainer center={[-6.20, 106.81]} zoom={13} style={{ height: '100%', width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapHandler lat={reportForm.data.latitude} lng={reportForm.data.longitude} setData={reportForm.setData} /></MapContainer>}
                                    </div>
                                </div>
                                <button type="submit" disabled={reportForm.processing} className="w-full bg-[#0f172a] text-white py-5 rounded-2xl font-black shadow-xl uppercase tracking-widest text-xs active:scale-95">🚀 Kirim Laporan Sekarang</button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'monitor' && (
                    <div className="animate-slide-up space-y-6 max-w-6xl mx-auto pb-20 font-sans">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6"><h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase tracking-widest">Riwayat Laporan</h2><div className="flex bg-white p-1 rounded-2xl shadow-sm border">{['All', 'Pending', 'Proses', 'Selesai'].map((s) => (<button key={s} onClick={() => setFilterStatus(s)} className={`px-5 py-2 text-[10px] font-bold rounded-xl transition-all ${filterStatus === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{s === 'All' ? 'Semua' : s}</button>))}</div></div>
                        <div className="grid grid-cols-1 gap-4">{reports.filter(r => filterStatus==='All' || r.status===filterStatus).map((r) => (
                            <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                                <div><h4 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{r.title}</h4><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">📅 {r.date} • 📍 {r.location_address || 'Detail TKP'}</p></div>
                                <div className="flex items-center gap-4"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${r.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : r.status === 'Proses' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{r.status}</span><button onClick={() => { setSelectedReport(r); setIsDetailModalOpen(true); }} className="bg-slate-50 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">👁️ Detail</button></div>
                            </div>
                        ))}</div>
                    </div>
                )}
            </main>

            {/* --- MODAL DETAIL (Note Petugas + Multi Foto) --- */}
            {isDetailModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col border-4 border-slate-50 animate-slide-up">
                        <div className="p-8 border-b bg-white flex justify-between items-center sticky top-0 z-10">
                            <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Laporan #LP-{selectedReport.id}</span><h3 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight uppercase">{selectedReport.title}</h3></div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:bg-red-50 transition-all border text-2xl active:scale-90">×</button>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar space-y-10 bg-slate-50/20 font-sans">
                            <div className="flex flex-wrap gap-4 items-center bg-white p-5 rounded-2xl border shadow-sm"><div className="text-xs font-bold text-slate-500 uppercase tracking-widest">📅 {selectedReport.date}</div><div className="text-xs font-bold text-slate-500 uppercase tracking-widest">📍 {selectedReport.location_address || 'Detail TKP'}</div><span className={`ml-auto px-6 py-2 rounded-full text-[10px] font-black uppercase border tracking-widest ${selectedReport.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700'}`}>{selectedReport.status}</span></div>
                            
                            {/* Peta TKP */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">📍 Titik Koordinat Kejadian</h4>
                                <div className="h-64 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative z-0">
                                    {selectedReport.latitude && (
                                        <MapContainer center={[parseFloat(selectedReport.latitude), parseFloat(selectedReport.longitude)]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                                            <DetailMapHandler lat={selectedReport.latitude} lng={selectedReport.longitude} />
                                        </MapContainer>
                                    )}
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Kronologi Laporan</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">"{selectedReport.desc || selectedReport.description}"</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">📸 Foto Lampiran Anda</h4>
                                    <div className="flex gap-3 overflow-x-auto pb-4 snap-x custom-scrollbar">
                                        {selectedReport.images?.map((img, i) => (<img key={i} src={img} className="h-44 w-auto rounded-2xl object-cover border-4 border-white shadow-lg snap-start cursor-zoom-in" alt="Evidence" onClick={() => window.open(img, '_blank')} />))}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION TANGGAPAN PETUGAS (DIPERBAIKI: Ramping & Multi-foto) */}
                            {selectedReport.status === 'Selesai' && selectedReport.resolution && (
                                <div className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-6 space-y-5 animate-slide-up">
                                    <div className="flex items-center gap-3 text-emerald-800">
                                        <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md">✓</div>
                                        <h4 className="text-xs font-black uppercase tracking-wider italic">Tanggapan Petugas Lapangan</h4>
                                    </div>
                                    <div className="bg-white/80 p-5 rounded-2xl text-[13px] font-bold text-slate-700 border border-emerald-200 shadow-sm leading-relaxed">
                                        "{selectedReport.resolution.note}"
                                    </div>
                                    {selectedReport.resolution.images && selectedReport.resolution.images.length > 0 && (
                                        <div className="space-y-3">
                                            <h5 className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Foto Bukti dari Petugas</h5>
                                            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                                                {selectedReport.resolution.images.map((resImg, idx) => (
                                                    <img key={idx} src={resImg} className="h-44 w-auto rounded-2xl border-4 border-white shadow-xl snap-start cursor-pointer hover:scale-105 transition-all" alt="Proof" onClick={() => window.open(resImg, '_blank')} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t bg-white"><button onClick={() => setIsDetailModalOpen(false)} className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-indigo-600 transition-all active:scale-95 shadow-lg">Tutup Informasi</button></div>
                    </div>
                </div>
            )}

            {/* --- MODAL EDIT PROFILE LENGKAP (FIX AKSES) --- */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in shadow-2xl">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative border-4 border-slate-50 animate-slide-up shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
                        <button onClick={() => {setIsProfileModalOpen(false); setIsEditingProfile(false);}} className="absolute top-8 right-8 w-11 h-11 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90 border">×</button>
                        <div className="text-center font-sans">
                            <img src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=0f172a&color=fff&size=128&bold=true`} className="w-28 h-28 rounded-full mx-auto mb-6 border-8 border-slate-50 shadow-xl" alt="Avatar" />
                            {!isEditingProfile ? (
                                <div className="space-y-6">
                                    <div><h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tighter">{auth.user.name}</h3><div className="bg-indigo-50 text-indigo-600 px-5 py-1.5 rounded-full inline-block text-[11px] font-black uppercase tracking-widest mt-2 border border-indigo-100">{auth.user.email}</div></div>
                                    <div className="bg-slate-50 rounded-[2rem] p-8 text-left border space-y-5 shadow-inner">
                                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">📞 Nomor Telepon</p><p className="text-slate-800 font-bold text-lg">{auth.user.phone || '—'}</p></div>
                                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">🏠 Alamat Domisili</p><p className="text-slate-800 font-bold leading-relaxed">{auth.user.address || '—'}</p></div>
                                    </div>
                                    <button onClick={() => setIsEditingProfile(true)} className="w-full py-5 bg-[#0f172a] text-white rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-[10px] active:scale-95">Update Informasi Profil ✨</button>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateProfile} className="space-y-5 text-left animate-fade-in font-sans">
                                    <h3 className="text-xl font-bold text-center mb-8 uppercase tracking-tighter italic text-indigo-600">Edit Data Profil</h3>
                                    <div><label className="text-[10px] font-black text-slate-400 uppercase ml-2 block mb-1 tracking-widest italic">Nama Lengkap</label><input type="text" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 shadow-inner" /></div>
                                    <div><label className="text-[10px] font-black text-slate-400 uppercase ml-2 block mb-1 tracking-widest italic">No. WhatsApp</label><input type="tel" value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 shadow-inner" /></div>
                                    <div><label className="text-[10px] font-black text-slate-400 uppercase ml-2 block mb-1 tracking-widest italic">Alamat Lengkap</label><textarea rows={3} value={profileForm.data.address} onChange={e => profileForm.setData('address', e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 shadow-inner" /></div>
                                    <div className="flex gap-4 mt-8"><button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Batal</button><button type="submit" disabled={profileForm.processing} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px] active:scale-95 disabled:opacity-50">Simpan ✨</button></div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- CHATBOT SUPPORT--- */}
            <div className="fixed bottom-8 right-8 z-[120] flex flex-col items-end group font-sans">
                {isChatOpen && (
                    <div className="bg-white w-[24rem] h-[34rem] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-slate-100 mb-6 flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
                        <div className="bg-[#0f172a] text-white p-7 font-bold flex justify-between items-center shadow-lg"><div className="flex items-center gap-3 italic text-sm tracking-widest"><span>🤖</span> CS SobatLapor Support</div><button onClick={() => setIsChatOpen(false)} className="w-9 h-9 bg-white/10 rounded-full hover:bg-white/20 transition active:scale-90 flex items-center justify-center text-xl">×</button></div>
                        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 space-y-5 custom-scrollbar">{messages.map(m => (<div key={m.id} className={`flex ${m.sender==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[85%] p-5 rounded-[2rem] text-xs leading-relaxed shadow-sm font-bold ${m.sender==='user'?'bg-indigo-600 text-white rounded-tr-none':'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>{m.text}</div></div>))}<div ref={chatEndRef} /></div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(e); }} className="p-5 border-t bg-white flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Tulis keluhan..." className="flex-1 bg-slate-100 border-none rounded-2xl px-6 text-xs font-bold focus:ring-4 focus:ring-indigo-100" /><button type="submit" className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all font-bold active:scale-90">➤</button></form>
                    </div>
                )}
                <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-indigo-600 text-white w-16 h-16 rounded-[2rem] shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center justify-center text-3xl hover:scale-110 active:scale-90 transition-all border-4 border-white relative z-10">💬</button>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---
const SidebarBtn = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all font-black group relative overflow-hidden ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-950/40 scale-[1.05]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
        <span className={`text-xl transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
        <span className="uppercase tracking-widest text-[11px]">{label}</span>
    </button>
);

const StatCard = ({ icon, label, val, color, onClick }: any) => (
    <div onClick={onClick} className={`bg-white p-8 rounded-[2.5rem] shadow-sm border-l-[12px] ${color} flex items-center gap-6 cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden border border-slate-50`}>
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">{icon}</div>
        <div><div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">{label}</div><div className="text-3xl font-black text-slate-800 tracking-tighter">{val}</div></div>
    </div>
);