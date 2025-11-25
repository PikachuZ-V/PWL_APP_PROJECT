import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
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

export default function UserDashboard() {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    // Form Data Laporan
    const { data: reportData, setData: setReportData } = useForm({
        title: '',
        date: '',
        description: '',
        image: null as File | null,
        latitude: '',
        longitude: ''
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Profile Data
    const [profileStep, setProfileStep] = useState('view');
    const [tempPhone, setTempPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');

    // --- DATA DUMMY (CHART & TABEL) ---
    // 1. Data Laporan (Untuk Tabel)
    const reports = [
        { 
            id: 1, 
            date: '25 Nov 2025', 
            title: 'Jalan berlubang di Jl. Sudirman', 
            desc: 'Lubang cukup dalam di tengah jalan, membahayakan.',
            status: 'Selesai', 
            resolution: {
                note: 'Lubang sudah ditambal dengan aspal baru.',
                image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop',
                operator: 'Admin Dinas PU'
            }
        },
        { 
            id: 2, 
            date: '24 Nov 2025', 
            title: 'Lampu PJU mati total di area Taman', 
            desc: 'Area taman gelap gulita saat malam.',
            status: 'Proses', 
            resolution: null
        },
        { 
            id: 3, 
            date: '22 Nov 2025', 
            title: 'Tumpukan sampah liar di pasar', 
            desc: 'Bau menyengat mengganggu warga.',
            status: 'Pending', 
            resolution: null
        },
    ];

    // 2. Data Chart Donut
    const donutData = {
        labels: ['Diterima', 'Sisa'],
        datasets: [{ data: [85, 15], backgroundColor: ['#0e7490', '#cbd5e1'], borderWidth: 0, cutout: '75%' }],
    };

    // 3. Data Chart Wave
    const waveData = {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [{
            fill: true,
            data: [12, 19, 15, 25, 22, 30, 28],
            borderColor: '#0891b2',
            backgroundColor: 'rgba(8, 145, 178, 0.2)',
            tension: 0.4,
            pointRadius: 4,
        }],
    };

    // --- LOGIC HANDLERS ---
    
    // Handler Peta Klik
    function LocationMarker() {
        const [position, setPosition] = useState<L.LatLng | null>(null);
        const map = useMapEvents({
            click(e) {
                setPosition(e.latlng);
                setReportData(data => ({ ...data, latitude: e.latlng.lat.toString(), longitude: e.latlng.lng.toString() }));
            },
        });
        return position === null ? null : <Marker position={position}></Marker>;
    }

    // Handler Upload Foto
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReportData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Handler Detail Laporan
    const handleOpenDetail = (report: any) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    // Handler OTP
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


    // --- RENDER SECTIONS ---

    // 1. DASHBOARD HOME
    const renderDashboard = () => (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-gradient-to-r from-cyan-800 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Halo, Andi Sanjaya! 👋</h2>
                    <p className="text-cyan-100 max-w-lg">
                        Laporanmu sangat berarti. Pantau terus perkembangan aduanmu di sini.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card Total */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="text-slate-500 text-sm font-medium mb-1">Total Laporanmu</div>
                    <div className="text-4xl font-extrabold text-slate-800">3</div>
                </div>

                {/* Card Donut Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-sm font-medium">Respon Cepat</div>
                        <div className="text-4xl font-extrabold text-slate-800 mt-1">85%</div>
                    </div>
                    <div className="h-20 w-20">
                         <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
                    </div>
                </div>

                {/* Card Wave Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
                    <div className="z-10">
                        <div className="text-slate-500 text-sm font-medium">Aktivitas Minggu Ini</div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-80">
                         <Line data={waveData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} />
                    </div>
                </div>
            </div>
        </div>
    );

    // 2. BUAT LAPORAN (FORM + MAPS + FOTO)
    const renderCreateReport = () => (
        <div className="animate-fade-in-up bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">📝 Form Pengaduan Baru</h2>
            <form className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Laporan</label>
                        <input type="text" value={reportData.title} onChange={e => setReportData('title', e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Kejadian</label>
                        <input type="date" value={reportData.date} onChange={e => setReportData('date', e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Detail</label>
                        <textarea rows={5} value={reportData.description} onChange={e => setReportData('description', e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"></textarea>
                    </div>
                </div>
                
                <div className="space-y-5 flex flex-col">
                    {/* Upload Foto */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Bukti Foto</label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl h-48 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <span className="text-3xl mb-2">📸</span>
                                    <span className="text-sm">Klik untuk upload foto</span>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Peta Leaflet */}
                    <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Lokasi (Klik di Peta)</label>
                         <div className="rounded-2xl h-64 w-full overflow-hidden border border-slate-200 z-0">
                            <MapContainer center={[-6.200000, 106.816666]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker />
                            </MapContainer>
                         </div>
                         <div className="mt-2 text-xs text-slate-500 flex space-x-4">
                             <span>Lat: {reportData.latitude || '-'}</span>
                             <span>Long: {reportData.longitude || '-'}</span>
                         </div>
                    </div>

                    <div className="flex-1 flex items-end">
                        <button type="button" onClick={() => alert("Laporan Terkirim (Simulasi)")} className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-700/30 transition-all">
                            Kirim Laporan Sekarang
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );

    // 3. PANTAU LAPORAN (TABEL)
    const renderMonitorReport = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Riwayat Pengaduan</h2>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                            <th className="p-5 font-bold">Tanggal</th>
                            <th className="p-5 font-bold">Judul Aduan</th>
                            <th className="p-5 font-bold text-center">Status</th>
                            <th className="p-5 font-bold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700">
                        {reports.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0">
                                <td className="p-5 font-medium">{item.date}</td>
                                <td className="p-5">{item.title}</td>
                                <td className="p-5 text-center"><StatusBadge status={item.status} /></td>
                                <td className="p-5 text-center">
                                    <button 
                                        onClick={() => handleOpenDetail(item)}
                                        className="text-cyan-600 hover:text-cyan-800 font-semibold text-xs border border-cyan-200 hover:border-cyan-400 px-4 py-2 rounded-lg transition-all"
                                    >
                                        Lihat Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <Head title="Dashboard User" />
            
            {/* SIDEBAR */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
                <div className="p-8 pb-4">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg"></div>
                        <span className="text-lg font-bold tracking-wide">Pengaduan.<span className="text-cyan-400">App</span></span>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-3">
                    <SidebarItem icon="🏠" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon="📝" label="Buat Laporan" active={activeTab === 'create'} onClick={() => setActiveTab('create')} />
                    <SidebarItem icon="👁️" label="Pantau Laporan" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
                </nav>
                <div className="p-6">
                    {/* BUTTON PROFILE */}
                    <div onClick={() => setIsProfileModalOpen(true)} className="bg-slate-800 rounded-2xl p-4 flex items-center space-x-3 cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white overflow-hidden">
                             <img src="https://ui-avatars.com/api/?name=Andi+Sanjaya&background=0D8ABC&color=fff" alt="Avatar" />
                         </div>
                         <div className="flex-1 overflow-hidden">
                             <div className="text-sm font-bold text-white truncate">Andi Sanjaya</div>
                             <div className="text-xs text-slate-400">Edit Profil ⚙️</div>
                         </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto relative">
                <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-10 py-5 flex justify-between items-center border-b border-slate-200">
                    <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1>
                </header>
                <div className="p-10 max-w-7xl mx-auto">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'create' && renderCreateReport()}
                    {activeTab === 'monitor' && renderMonitorReport()}
                </div>
            </main>

            {/* --- MODAL EDIT PROFIL & OTP --- */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">⚙️ Pengaturan Akun</h3>
                            <button onClick={() => { setIsProfileModalOpen(false); setProfileStep('view'); }} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        
                        <div className="p-6">
                            {/* STEP 1: VIEW PROFIL */}
                            {profileStep === 'view' && (
                                <div className="space-y-6 text-center">
                                    <div className="relative w-24 h-24 mx-auto group cursor-pointer">
                                        <img src="https://ui-avatars.com/api/?name=Andi+Sanjaya&background=0D8ABC&color=fff" className="w-full h-full rounded-full border-4 border-slate-100" />
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">Ubah Foto</div>
                                    </div>
                                    <div className="text-left space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase">Nama Lengkap</label>
                                            <input type="text" value="Andi Sanjaya" className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-cyan-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                            <input type="text" value="andi@example.com" disabled className="w-full border-b border-slate-200 py-2 text-slate-500 bg-slate-50" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase">No. WhatsApp</label>
                                            <div className="flex justify-between items-center border-b border-slate-200 py-2">
                                                <span>0812-3456-7890</span>
                                                <button onClick={() => setProfileStep('edit')} className="text-xs text-cyan-600 font-bold hover:underline">Ubah</button>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsProfileModalOpen(false)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-4">Simpan Perubahan</button>
                                </div>
                            )}

                            {/* STEP 2: EDIT NO HP */}
                            {profileStep === 'edit' && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800">Ubah Nomor Telepon</h4>
                                    <p className="text-xs text-slate-500">Kami akan mengirimkan kode OTP ke email Anda untuk verifikasi.</p>
                                    <input type="text" placeholder="Masukkan Nomor Baru" value={tempPhone} onChange={e => setTempPhone(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3" />
                                    <div className="flex space-x-2">
                                        <button onClick={() => setProfileStep('view')} className="w-1/2 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl">Batal</button>
                                        <button onClick={handleRequestOtp} className="w-1/2 py-3 text-white font-bold bg-cyan-600 rounded-xl">Kirim OTP</button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: INPUT OTP */}
                            {profileStep === 'otp' && (
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">🛡️</div>
                                    <h4 className="font-bold text-slate-800">Verifikasi OTP</h4>
                                    <p className="text-xs text-slate-500">Masukkan kode yang dikirim ke email <strong>andi@example.com</strong></p>
                                    <input type="text" placeholder="Kode OTP (Cth: 123456)" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full border-2 border-cyan-100 text-center text-2xl tracking-widest rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-0" maxLength={6} />
                                    <button onClick={handleVerifyOtp} className="w-full py-3 text-white font-bold bg-green-600 rounded-xl shadow-lg shadow-green-200">Verifikasi & Simpan</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL DETAIL LAPORAN --- */}
            {isDetailModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="h-48 bg-slate-200 relative group">
                            {selectedReport.status === 'Selesai' && selectedReport.resolution ? (
                                <>
                                    <img src={selectedReport.resolution.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Bukti" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                        <div className="text-white">
                                            <p className="text-xs font-bold bg-green-500 px-3 py-1 rounded-full inline-flex items-center mb-1 shadow-lg">
                                                <span className="mr-1">✓</span> BUKTI PENYELESAIAN
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                                    <span className="text-4xl mb-2">🗺️</span>
                                    <span>Lokasi / Foto Awal Laporan</span>
                                </div>
                            )}
                            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/50 transition-colors">✕</button>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedReport.title}</h2>
                                    <p className="text-slate-500 text-sm">Dikirim pada {selectedReport.date}</p>
                                </div>
                                <StatusBadge status={selectedReport.status} />
                            </div>
                            <hr className="border-slate-100 my-6" />
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Deskripsi Masalah</h4>
                                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">"{selectedReport.desc}"</p>
                            </div>
                            {selectedReport.status === 'Selesai' && selectedReport.resolution && (
                                <div className="bg-green-50 rounded-2xl p-6 border border-green-100 animate-fade-in-up">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs shadow-sm">✓</div>
                                        <h4 className="text-green-800 font-bold">Laporan Telah Diselesaikan</h4>
                                    </div>
                                    <p className="text-slate-700 text-sm mb-4 bg-white/50 p-3 rounded-lg border border-green-100/50 italic">"{selectedReport.resolution.note}"</p>
                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-green-200">
                                        <span>Petugas: <span className="font-bold text-slate-700">{selectedReport.resolution.operator}</span></span>
                                        <span>Terverifikasi Sistem</span>
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
        </div>
    );
}

// SUB COMPONENT
const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center px-6 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-cyan-600 shadow-lg text-white translate-x-2' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <span className="mr-4 text-xl">{icon}</span><span className="font-medium">{label}</span>
    </button>
);

const StatusBadge = ({ status }: { status: string }) => {
    let style = "bg-slate-100 text-slate-600";
    if (status === 'Pending') style = "bg-yellow-100 text-yellow-700 border border-yellow-200";
    if (status === 'Proses') style = "bg-blue-100 text-blue-700 border border-blue-200";
    if (status === 'Selesai') style = "bg-green-100 text-green-700 border border-green-200";
    return <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${style}`}>{status}</span>;
};