import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
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

// Definisi Tipe Props
interface Props {
    stats: any;
    reportsData: any[];
    usersData: any[];
    auth: any;
}

export default function AdminDashboard({ stats, reportsData, usersData, auth }: Props) {
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
    const [completionImage, setCompletionImage] = useState<File | null>(null); 
    const [completionImagePreview, setCompletionImagePreview] = useState<string | null>(null); 

    // State Pencarian User
    const [searchQuery, setSearchQuery] = useState('');

    // --- LOGIC HANDLERS ---

    const handleLogout = () => {
        router.post(route('logout'));
    };

    // 1. Handler PROSES Laporan (Pending -> Proses) -- [DITAMBAHKAN]
    const handleProcess = (id: number) => {
        if (confirm('Apakah Anda yakin ingin memproses laporan ini?')) {
            router.patch(route('reports.process', id), {}, {
                onSuccess: () => alert('Laporan dipindahkan ke status Diproses.'),
                onError: () => alert('Gagal memproses laporan.')
            });
        }
    };

    // 2. Handler SELESAIKAN Laporan (Proses -> Selesai)
    const openCompleteModal = (report: any) => {
        setSelectedReport(report);
        setCompletionNote('');
        setCompletionImage(null);
        setCompletionImagePreview(null);
        setIsCompleteModalOpen(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCompletionImage(file);
            setCompletionImagePreview(URL.createObjectURL(file));
        }
    };

    const submitCompletion = () => {
        if (!completionNote || !completionImage) return alert("Wajib upload bukti foto dan isi catatan!");

        router.post(route('reports.complete', selectedReport.id), {
            note: completionNote,
            image: completionImage,
            _method: 'POST'
        }, {
            forceFormData: true,
            onSuccess: () => {
                setIsCompleteModalOpen(false);
                alert(`Laporan berhasil diselesaikan!`);
            },
            onError: (err) => {
                console.error(err);
                alert('Gagal menyimpan. Cek inputan.');
            }
        });
    };

    // 3. Handler Edit User
    const openEditUserModal = (user: any) => {
        setSelectedUser({ ...user }); 
        setIsEditUserModalOpen(true);
    };

    const saveUserChanges = () => {
        if (!selectedUser) return;
        router.patch(route('admin.users.update', selectedUser.id), {
            name: selectedUser.name,
            phone: selectedUser.phone,
            status: selectedUser.status
        }, {
            onSuccess: () => {
                alert("Data User Berhasil Diupdate!");
                setIsEditUserModalOpen(false);
            }
        });
    };

    // Filter User Search
    const filteredUsers = (usersData || []).filter(user => 
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
                <StatCard title="Total Laporan" value={stats?.total || 0} icon="📂" color="bg-white text-slate-800" />
                <StatCard title="Aduan Masuk" value={stats?.pending || 0} icon="📩" color="bg-yellow-50 text-yellow-700 border-yellow-100" />
                <StatCard title="Diproses" value={stats?.process || 0} icon="⚙️" color="bg-blue-50 text-blue-700 border-blue-100" />
                <StatCard title="Selesai" value={stats?.completed || 0} icon="✅" color="bg-green-50 text-green-700 border-green-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-4">Statistik Real-time</h3>
                    <div className="h-64">
                        <Bar data={{
                            labels: ['Masuk', 'Diproses', 'Selesai'],
                            datasets: [{ label: 'Jumlah', data: [stats?.pending || 0, stats?.process || 0, stats?.completed || 0], backgroundColor: ['#facc15', '#3b82f6', '#10b981'], borderRadius: 8 }]
                        }} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-700 mb-4">Persentase Selesai</h3>
                    <div className="h-48 w-48">
                         <Doughnut data={{
                             labels: ['Sisa', 'Selesai'],
                             datasets: [{ data: [(stats?.total || 0) - (stats?.completed || 0), stats?.completed || 0], backgroundColor: ['#e2e8f0', '#10b981'], borderWidth: 0 }]
                         }} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTable = (statusFilter: string, title: string) => {
        const filteredData = (reportsData || []).filter(item => statusFilter === 'all' ? true : item.status === statusFilter);
        
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
                                        
                                        {/* --- TOMBOL PROSES (Pending -> Proses) --- */}
                                        {statusFilter === 'Pending' && (
                                            <button onClick={() => handleProcess(item.id)} className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all border border-blue-200">
                                                ⚡ Proses
                                            </button>
                                        )}

                                        {/* --- TOMBOL SELESAIKAN (Proses -> Selesai) --- */}
                                        {statusFilter === 'Proses' && (
                                            <button onClick={() => openCompleteModal(item)} className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all border border-green-200">
                                                ✅ Selesaikan
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
                                        <img src={user.avatar} className="w-10 h-10 rounded-full" alt="Avatar" />
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
                    <SidebarItem icon="📩" label="Aduan Masuk" active={activeTab === 'incoming'} count={stats?.pending || 0} onClick={() => setActiveTab('incoming')} />
                    <SidebarItem icon="⚙️" label="Sedang Diproses" active={activeTab === 'process'} count={stats?.process || 0} onClick={() => setActiveTab('process')} />
                    <SidebarItem icon="✅" label="Aduan Selesai" active={activeTab === 'completed'} count={stats?.completed || 0} onClick={() => setActiveTab('completed')} />
                    
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Management</div>
                    <SidebarItem icon="👥" label="Database User" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                </nav>
                <div className="p-6 border-t border-slate-100">
                    <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                             {/* Avatar Admin */}
                             {auth?.user?.avatar ? (
                                 <img src={auth.user.avatar} alt="Admin" />
                             ) : (
                                 <span>AD</span>
                             )}
                         </div>
                         <div className="flex-1 overflow-hidden">
                             <div className="text-sm font-bold text-slate-800 truncate">{auth?.user?.name}</div>
                             <div className="text-xs text-green-500">● Online</div>
                         </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto relative">
                <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-4 flex justify-between items-center border-b border-slate-200">
                    <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}</h1>
                    <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">Logout</button>
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    {activeTab === 'dashboard' && renderHome()}
                    {activeTab === 'incoming' && renderTable('Pending', 'Daftar Aduan Masuk')}
                    {activeTab === 'process' && renderTable('Proses', 'Sedang Ditindaklanjuti')}
                    {activeTab === 'completed' && renderTable('Selesai', 'Riwayat Aduan Selesai')}
                    {activeTab === 'users' && renderUserDatabase()}
                </div>
            </main>

            {/* ---  FORM PENYELESAIAN --- */}
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
                                    {completionImagePreview ? <img src={completionImagePreview} className="h-32 mx-auto rounded-lg object-cover" alt="Preview" /> : <div className="text-slate-400"><span>📸</span><p className="text-xs">Klik untuk upload</p></div>}
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

            {/* ---  DETAIL LAPORAN --- */}
            {isDetailModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="h-48 bg-slate-200 relative">
                            {selectedReport.status === 'Selesai' && selectedReport.resolution ? (
                                <>
                                    <img src={selectedReport.resolution.image} className="w-full h-full object-cover" alt="Bukti" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                        <p className="text-white text-xs font-bold bg-green-500 px-2 py-1 rounded">✓ BUKTI PENYELESAIAN</p>
                                    </div>
                                </>
                            ) : selectedReport.image ? (
                                <img src={selectedReport.image} className="w-full h-full object-cover" alt="Laporan" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">Foto Laporan Awal Tidak Ada</div>
                            )}
                            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/50">✕</button>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div><h2 className="text-2xl font-bold text-slate-800">{selectedReport.title}</h2><p className="text-slate-500 text-sm">{selectedReport.date} • Oleh {selectedReport.name}</p></div>
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

            {/* ---  EDIT USER --- */}
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
        {count > 0 && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100'}`}>{count}</span>}
    </button>
);
const StatusBadge = ({ status }: { status: string }) => {
    let style = "bg-slate-100 text-slate-600";
    if (status === 'Pending') style = "bg-yellow-100 text-yellow-700";
    if (status === 'Proses') style = "bg-blue-100 text-blue-700";
    if (status === 'Selesai') style = "bg-green-100 text-green-700";
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${style}`}>{status}</span>;
};