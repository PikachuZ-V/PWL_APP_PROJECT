import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
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

// Registrasi ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
    // --- STATE UTAMA ---
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // State Modal
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

    // State Data Seleksi
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // State Form Penyelesaian
    const [completionNote, setCompletionNote] = useState('');
    const [completionImage, setCompletionImage] = useState<string | null>(null);

    // State Pencarian User
    const [searchQuery, setSearchQuery] = useState('');

    // --- DATA STATE (Agar bisa diedit secara Real-time) ---
    
    // 1. Data Laporan
    const [reports, setReports] = useState([
        { 
            id: 1, date: '25 Nov 2025', name: 'Budi Santoso', title: 'Jalan rusak parah di Kec. Sukamaju', 
            desc: 'Lubang besar membahayakan pengendara motor.', status: 'Pending', resolution: null 
        },
        { 
            id: 2, date: '24 Nov 2025', name: 'Siti Aminah', title: 'Sampah menumpuk di pasar', 
            desc: 'Bau busuk sangat menyengat.', status: 'Pending', resolution: null 
        },
        { 
            id: 3, date: '22 Nov 2025', name: 'Andi Sanjaya', title: 'Penganiaayaan berat...', 
            desc: 'Kejadian di pos ronda malam hari.', status: 'Proses', resolution: null 
        },
        { 
            id: 4, date: '20 Nov 2025', name: 'Joko', title: 'Lampu jalan mati', 
            desc: 'Gelap gulita.', status: 'Selesai', 
            resolution: {
                note: 'Lampu sudah diganti baru.',
                image: 'https://images.unsplash.com/photo-1563544955328-fefce27148a7?q=80&w=600&auto=format&fit=crop',
                operator: 'Petugas Lapangan A',
                timestamp: '21 Nov 2025, 14:30 WIB'
            } 
        },
    ]);

    // 2. Data User
    const [users, setUsers] = useState([
        { id: 1, name: 'Andi Sanjaya', email: 'andi@example.com', phone: '0812-3456-7890', joined: '20 Nov 2025', status: 'Verified', avatar: 'https://ui-avatars.com/api/?name=Andi+Sanjaya&background=0D8ABC&color=fff' },
        { id: 2, name: 'Budi Santoso', email: 'budi@example.com', phone: '0812-9876-5432', joined: '21 Nov 2025', status: 'Pending', avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=facc15&color=fff' },
        { id: 3, name: 'Siti Aminah', email: 'siti@example.com', phone: '0857-1234-5678', joined: '22 Nov 2025', status: 'Verified', avatar: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=10b981&color=fff' },
        { id: 4, name: 'Rina Wati', email: 'rina@example.com', phone: '0899-1111-2222', joined: '23 Nov 2025', status: 'Verified', avatar: 'https://ui-avatars.com/api/?name=Rina+Wati&background=EC4899&color=fff' },
    ]);

    // --- LOGIC HANDLERS ---

    // A. Handler Selesaikan Laporan
    const openCompleteModal = (report: any) => {
        setSelectedReport(report);
        setCompletionNote('');
        setCompletionImage(null);
        setIsCompleteModalOpen(true);
    };

    const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
        if (file) setCompletionImage(URL.createObjectURL(file));
    };

    const submitCompletion = () => {
        if (!completionNote || !completionImage) return alert("Wajib upload bukti foto dan isi catatan!");

        const now = new Date();
        const timeString = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

        const updatedReports = reports.map(r => {
            if (r.id === selectedReport.id) {
                return {
                    ...r,
                    status: 'Selesai',
                    resolution: {
                        note: completionNote,
                        image: completionImage,
                        operator: 'Admin (Anda)',
                        timestamp: timeString // Waktu Real-time
                    }
                };
            }
            return r;
        });

        setReports(updatedReports);
        setIsCompleteModalOpen(false);
        alert(`Laporan berhasil diselesaikan pada ${timeString}`);
    };

    // B. Handler Edit User
    const openEditUserModal = (user: any) => {
        setSelectedUser({ ...user }); // Copy object agar tidak edit langsung sebelum save
        setIsEditUserModalOpen(true);
    };

    const saveUserChanges = () => {
        const updatedUsers = users.map(u => u.id === selectedUser.id ? selectedUser : u);
        setUsers(updatedUsers);
        setIsEditUserModalOpen(false);
        alert("Data user berhasil diperbarui!");
    };

    // C. Handler Statistik Real-time
    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'Pending').length,
        process: reports.filter(r => r.status === 'Proses').length,
        completed: reports.filter(r => r.status === 'Selesai').length,
    };

    // D. Filter Pencarian User
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );


    // --- RENDER SECTIONS ---

    const renderHome = () => (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex justify-between items-center">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Dashboard Admin</h2>
                    <p className="text-slate-400">Pantau dan kelola laporan masyarakat dengan efisien.</p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Laporan" value={stats.total} icon="📂" color="bg-white text-slate-800" />
                <StatCard title="Aduan Masuk" value={stats.pending} icon="📩" color="bg-yellow-50 text-yellow-700 border-yellow-100" />
                <StatCard title="Diproses" value={stats.process} icon="⚙️" color="bg-blue-50 text-blue-700 border-blue-100" />
                <StatCard title="Selesai" value={stats.completed} icon="✅" color="bg-green-50 text-green-700 border-green-100" />
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-4">Statistik Real-time</h3>
                    <div className="h-64">
                        <Bar data={{
                            labels: ['Masuk', 'Diproses', 'Selesai'],
                            datasets: [{ label: 'Jumlah', data: [stats.pending, stats.process, stats.completed], backgroundColor: ['#facc15', '#3b82f6', '#10b981'], borderRadius: 8 }]
                        }} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-700 mb-4">Persentase Selesai</h3>
                    <div className="h-48 w-48">
                         <Doughnut data={{
                             labels: ['Sisa', 'Selesai'],
                             datasets: [{ data: [stats.total - stats.completed, stats.completed], backgroundColor: ['#e2e8f0', '#10b981'], borderWidth: 0 }]
                         }} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTable = (statusFilter: string, title: string) => {
        const filteredData = reports.filter(item => statusFilter === 'all' ? true : item.status === statusFilter);
        return (
            <div className="animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg">+ Export PDF</button>
                </div>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-5 font-bold">Tanggal</th>
                                <th className="p-5 font-bold">Pelapor</th>
                                <th className="p-5 font-bold">Judul Aduan</th>
                                <th className="p-5 font-bold text-center">Status</th>
                                <th className="p-5 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700">
                            {filteredData.length > 0 ? filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0">
                                    <td className="p-5 font-medium text-slate-500">{item.date}</td>
                                    <td className="p-5 font-bold text-slate-800">{item.name}</td>
                                    <td className="p-5">{item.title}</td>
                                    <td className="p-5 text-center"><StatusBadge status={item.status} /></td>
                                    <td className="p-5 text-center flex justify-center space-x-2">
                                        <button onClick={() => { setSelectedReport(item); setIsDetailModalOpen(true); }} className="text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-2 rounded-lg text-xs font-bold transition-all">
                                            👁️ Detail
                                        </button>
                                        
                                        {statusFilter === 'Proses' && (
                                            <button onClick={() => openCompleteModal(item)} className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all border border-green-200">
                                                ✅ Selesaikan
                                            </button>
                                        )}
                                        {statusFilter === 'Pending' && (
                                            <button onClick={() => alert("Laporan dipindahkan ke Proses (Simulasi)")} className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all border border-blue-200">
                                                ⚡ Proses
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-400">Tidak ada data laporan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderUserDatabase = () => (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Database Pengguna</h2>
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="Cari nama user..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 w-64 shadow-sm" 
                    />
                </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="p-5 font-bold">User</th>
                            <th className="p-5 font-bold">Kontak</th>
                            <th className="p-5 font-bold">Tanggal Gabung</th>
                            <th className="p-5 font-bold text-center">Status</th>
                            <th className="p-5 font-bold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700">
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0">
                                <td className="p-5">
                                    <div className="flex items-center space-x-3">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="font-bold text-slate-800">{user.name}</div>
                                            <div className="text-xs text-slate-400">ID: #{user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="text-slate-600">{user.email}</div>
                                    <div className="text-xs text-slate-400">{user.phone}</div>
                                </td>
                                <td className="p-5 text-slate-500">{user.joined}</td>
                                <td className="p-5 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {user.status === 'Verified' ? 'Terverifikasi' : 'Belum Verifikasi'}
                                    </span>
                                </td>
                                <td className="p-5 text-center">
                                    <button onClick={() => openEditUserModal(user)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-400">User tidak ditemukan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <Head title="Admin Dashboard" />
            
            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20">
                <div className="p-8 pb-4">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="text-lg font-bold text-slate-800 tracking-wide">Admin.<span className="text-indigo-600">Panel</span></span>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <SidebarItem icon="🏠" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Manajemen Aduan</div>
                    <SidebarItem icon="📩" label="Aduan Masuk" active={activeTab === 'incoming'} count={stats.pending} onClick={() => setActiveTab('incoming')} />
                    <SidebarItem icon="⚙️" label="Sedang Diproses" active={activeTab === 'process'} count={stats.process} onClick={() => setActiveTab('process')} />
                    <SidebarItem icon="✅" label="Aduan Selesai" active={activeTab === 'completed'} count={stats.completed} onClick={() => setActiveTab('completed')} />
                    
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Management</div>
                    <SidebarItem icon="👥" label="Database User" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto relative">
                <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-4 flex justify-between items-center border-b border-slate-200">
                    <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}</h1>
                    <button className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">Logout</button>
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    {activeTab === 'dashboard' && renderHome()}
                    {activeTab === 'incoming' && renderTable('Pending', 'Daftar Aduan Masuk')}
                    {activeTab === 'process' && renderTable('Proses', 'Sedang Ditindaklanjuti')}
                    {activeTab === 'completed' && renderTable('Selesai', 'Riwayat Aduan Selesai')}
                    {activeTab === 'users' && renderUserDatabase()}
                </div>
            </main>

            {/* --- MODAL 1: FORM PENYELESAIAN --- */}
            {isCompleteModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-green-50 p-6 border-b border-green-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-green-800">✅ Selesaikan Aduan</h3>
                            <button onClick={() => setIsCompleteModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500">Anda akan menyelesaikan laporan: <span className="font-bold text-slate-800">"{selectedReport.title}"</span></p>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Bukti Foto (Wajib)</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 relative">
                                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                    {completionImage ? <img src={completionImage} className="h-32 mx-auto rounded-lg object-cover" /> : <div className="text-slate-400"><span>📸</span><p className="text-xs">Klik untuk upload</p></div>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan Petugas</label>
                                <textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-green-500" rows={3} placeholder="Jelaskan tindakan..." value={completionNote} onChange={(e) => setCompletionNote(e.target.value)}></textarea>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 flex justify-end space-x-3">
                            <button onClick={() => setIsCompleteModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Batal</button>
                            <button onClick={submitCompletion} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg">Kirim & Selesaikan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: DETAIL LAPORAN --- */}
            {isDetailModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="h-48 bg-slate-200 relative">
                            {selectedReport.status === 'Selesai' && selectedReport.resolution ? (
                                <>
                                    <img src={selectedReport.resolution.image} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                        <p className="text-white text-xs font-bold bg-green-500 px-2 py-1 rounded">✓ BUKTI PENYELESAIAN</p>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">Foto Laporan Awal</div>
                            )}
                            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center">✕</button>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div><h2 className="text-2xl font-bold text-slate-800">{selectedReport.title}</h2><p className="text-slate-500 text-sm">{selectedReport.date}</p></div>
                                <StatusBadge status={selectedReport.status} />
                            </div>
                            <div className="mb-6"><h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Deskripsi</h4><p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">"{selectedReport.desc}"</p></div>
                            
                            {selectedReport.status === 'Selesai' && selectedReport.resolution && (
                                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                                    <div className="flex items-center space-x-2 mb-3"><div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">✓</div><h4 className="text-green-800 font-bold">Laporan Selesai</h4></div>
                                    <p className="text-slate-700 text-sm mb-4">"{selectedReport.resolution.note}"</p>
                                    <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-green-200">
                                        <span>Oleh: <strong>{selectedReport.resolution.operator}</strong></span>
                                        <span>{selectedReport.resolution.timestamp}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 3: EDIT USER --- */}
            {isEditUserModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">✏️ Edit Data User</h3>
                            <button onClick={() => setIsEditUserModalOpen(false)} className="text-indigo-200 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nama Lengkap</label>
                                <input type="text" value={selectedUser.name} onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})} className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nomor Telepon</label>
                                <input type="text" value={selectedUser.phone} onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})} className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status Akun</label>
                                <select value={selectedUser.status} onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})} className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-indigo-500 bg-white">
                                    <option value="Verified">Verified</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Banned">Banned</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 flex justify-end space-x-3">
                            <button onClick={() => setIsEditUserModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Batal</button>
                            <button onClick={saveUserChanges} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg">Simpan Perubahan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// SUB KOMPONEN KECIL
const StatCard = ({ title, value, icon, color }: any) => (
    <div className={`p-6 rounded-3xl border shadow-sm flex items-center justify-between ${color}`}>
        <div><div className="text-sm font-medium opacity-80">{title}</div><div className="text-3xl font-extrabold mt-1">{value}</div></div>
        <div className="text-3xl opacity-50">{icon}</div>
    </div>
);
const SidebarItem = ({ icon, label, active, onClick, count }: any) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
        <div className="flex items-center"><span className="mr-3 text-lg">{icon}</span><span className="font-medium text-sm">{label}</span></div>
        {count && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100'}`}>{count}</span>}
    </button>
);
const StatusBadge = ({ status }: { status: string }) => {
    let style = "bg-slate-100 text-slate-600";
    if (status === 'Pending') style = "bg-yellow-100 text-yellow-700";
    if (status === 'Proses') style = "bg-blue-100 text-blue-700";
    if (status === 'Selesai') style = "bg-green-100 text-green-700";
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${style}`}>{status}</span>;
};