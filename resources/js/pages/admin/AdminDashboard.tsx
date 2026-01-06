import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
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

// --- 1. REGISTRASI CHART ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// --- 2. TIPE DATA ---
interface Props {
  stats: any;
  reportsData: any[];
  usersData: any[];
  auth: any;
}

export default function AdminDashboard({ stats, reportsData, usersData, auth }: Props) {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);

  // Selected Data
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form States
  const [completionNote, setCompletionNote] = useState('');
  const [completionImage, setCompletionImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- 3. EFFECTS (AUTO UPDATE NOTIFIKASI) ---
  useEffect(() => {
    fetchNotifications();
    // Cek notifikasi setiap 30 detik
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Pastikan route API ini ada di routes/api.php
      const res = await axios.get('/api/admin/notifications');
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.log("Menunggu API Notifikasi...");
    }
  };

  // --- 4. HANDLERS (LOGIKA) ---

  const handleLogout = () => router.post(route('logout'));

  // A. Proses Laporan
  const handleProcess = (id: number) => {
    if (confirm('Proses laporan ini sekarang?')) {
      router.patch(route('reports.process', id), {}, {
        onSuccess: () => alert('Status diperbarui menjadi Diproses.'),
      });
    }
  };

  // B. Selesaikan Laporan
  const handleCompleteSubmit = () => {
    if (!completionNote || !completionImage) return alert("Wajib isi catatan dan foto bukti!");
    
    router.post(route('reports.complete', selectedReport.id), {
      note: completionNote,
      image: completionImage,
      _method: 'POST' // Trik untuk upload file dengan Inertia
    }, {
      forceFormData: true,
      onSuccess: () => {
        setIsCompleteOpen(false);
        setCompletionImage(null);
        setPreviewImage(null);
        alert('Laporan berhasil diselesaikan!');
      }
    });
  };

  // C. Update User
  const handleUserUpdate = () => {
    router.patch(route('admin.users.update', selectedUser.id), {
      name: selectedUser.name,
      phone: selectedUser.phone,
      status: selectedUser.status
    }, {
      onSuccess: () => {
        setIsUserEditOpen(false);
        alert('Data user berhasil disimpan.');
        // Refresh halaman parsial agar data tabel update
        router.reload({ only: ['usersData'] });
      }
    });
  };

  // Filter Data User
  const filteredUsers = (usersData || []).filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- 5. RENDER COMPONENTS ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold">Dashboard Admin</h2>
          <p className="opacity-90 mt-2">Pantau kinerja sistem dan laporan masyarakat secara real-time.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-indigo-500 rounded-l-full opacity-30 blur-3xl transform translate-x-20"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardStat title="Total Laporan" value={stats?.total || 0} icon="📂" color="bg-white text-slate-800" />
        <CardStat title="Menunggu" value={stats?.pending || 0} icon="⏳" color="bg-orange-50 text-orange-600 border border-orange-100" />
        <CardStat title="Diproses" value={stats?.process || 0} icon="⚡" color="bg-blue-50 text-blue-600 border border-blue-100" />
        <CardStat title="Selesai" value={stats?.completed || 0} icon="✅" color="bg-green-50 text-green-600 border border-green-100" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4">Statistik Laporan</h3>
          <div className="h-64">
            <Bar data={{
              labels: ['Masuk', 'Diproses', 'Selesai'],
              datasets: [{
                label: 'Jumlah',
                data: [stats?.pending || 0, stats?.process || 0, stats?.completed || 0],
                backgroundColor: ['#f97316', '#3b82f6', '#22c55e'],
                borderRadius: 6
              }]
            }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="font-bold text-slate-700 mb-4">Rasio Penyelesaian</h3>
          <div className="h-48 w-48">
            <Doughnut data={{
              labels: ['Pending', 'Selesai'],
              datasets: [{
                data: [(stats?.total || 0) - (stats?.completed || 0), stats?.completed || 0],
                backgroundColor: ['#f1f5f9', '#22c55e'],
                borderWidth: 0
              }]
            }} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-slate-800">{stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</p>
            <p className="text-xs text-slate-500 uppercase font-bold">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTable = (status: string, title: string) => {
    const data = (reportsData || []).filter(r => status === 'all' ? true : r.status === status);
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{data.length} Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="p-4 font-bold">Tanggal</th>
                <th className="p-4 font-bold">Pelapor</th>
                <th className="p-4 font-bold">Judul</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.length > 0 ? data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500">{item.date}</td>
                  <td className="p-4 font-bold text-slate-700">{item.name}</td>
                  <td className="p-4 truncate max-w-xs" title={item.title}>{item.title}</td>
                  <td className="p-4 text-center"><Badge status={item.status} /></td>
                  <td className="p-4 text-center space-x-2 flex justify-center">
                    <button onClick={() => { setSelectedReport(item); setIsDetailOpen(true); }} className="bg-slate-100 text-slate-600 p-2 rounded hover:bg-slate-200">👁️</button>
                    {status === 'Pending' && <button onClick={() => handleProcess(item.id)} className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200" title="Proses">⚡</button>}
                    {status === 'Proses' && <button onClick={() => { setSelectedReport(item); setIsCompleteOpen(true); }} className="bg-green-100 text-green-600 p-2 rounded hover:bg-green-200" title="Selesaikan">✅</button>}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Database User</h2>
        <input 
          type="text" 
          placeholder="Cari user..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Kontak</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredUsers.map((user: any) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-4 flex items-center space-x-3">
                  <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                  <div>
                    <div className="font-bold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-400">Joined: {user.joined}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-slate-600">{user.email}</div>
                  <div className="text-xs text-slate-400">{user.phone}</div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.status === 'Verified' ? 'bg-green-100 text-green-700' :
                    user.status === 'Banned' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{user.status}</span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => { setSelectedUser(user); setIsUserEditOpen(true); }} className="text-indigo-600 hover:underline font-bold text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <Head title="Admin Dashboard" />

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 z-20 shadow-2xl">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">A</div>
          <span className="font-bold text-lg tracking-wide">AdminPanel</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon="🏠" label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <div className="pt-4 pb-2 text-xs font-bold text-slate-500 uppercase px-4">Laporan</div>
          <NavItem icon="📥" label="Masuk" count={stats?.pending} active={activeTab === 'incoming'} onClick={() => setActiveTab('incoming')} />
          <NavItem icon="⚡" label="Proses" count={stats?.process} active={activeTab === 'process'} onClick={() => setActiveTab('process')} />
          <NavItem icon="✅" label="Selesai" count={stats?.completed} active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} />
          <div className="pt-4 pb-2 text-xs font-bold text-slate-500 uppercase px-4">Data</div>
          <NavItem icon="👥" label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        </nav>
        <div className="p-4 bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
              {auth?.user?.name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold truncate">{auth?.user?.name}</div>
              <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300">Logout</button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
          
          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 rounded-full hover:bg-slate-100 relative">
              🔔
              {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>}
            </button>
            
            {isNotifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
                <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-500">NOTIFIKASI BARU</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((n, i) => (
                    <div key={i} className="p-3 border-b border-slate-50 hover:bg-indigo-50 cursor-pointer" onClick={() => {setActiveTab('incoming'); setIsNotifOpen(false);}}>
                      <div className="flex justify-between text-[10px] text-slate-400"><span>{n.type}</span><span>{n.time}</span></div>
                      <div className="text-sm font-semibold text-slate-800 line-clamp-1">{n.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{n.message}</div>
                    </div>
                  )) : <div className="p-6 text-center text-slate-400 text-sm">Tidak ada notifikasi.</div>}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pb-20">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'incoming' && renderTable('Pending', 'Laporan Masuk')}
          {activeTab === 'process' && renderTable('Proses', 'Sedang Ditindaklanjuti')}
          {activeTab === 'completed' && renderTable('Selesai', 'Arsip Laporan Selesai')}
          {activeTab === 'users' && renderUsers()}
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* 1. Modal Detail Laporan */}
      {isDetailOpen && selectedReport && (
        <Modal onClose={() => setIsDetailOpen(false)} title="Detail Laporan">
          <div className="space-y-4">
            <div className="h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
              {selectedReport.image ? <img src={selectedReport.image} className="w-full h-full object-cover"/> : <span className="text-slate-400">Tidak ada foto</span>}
            </div>
            <div>
              <h3 className="font-bold text-lg">{selectedReport.title}</h3>
              <div className="text-xs text-slate-400 mt-1 flex space-x-2">
                <span>📅 {selectedReport.date}</span><span>👤 {selectedReport.name}</span>
              </div>
              <p className="mt-4 bg-slate-50 p-4 rounded-xl text-slate-700 text-sm border border-slate-100">{selectedReport.desc}</p>
            </div>
            {selectedReport.resolution && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-800 text-sm mb-2">✅ Penyelesaian</h4>
                <p className="text-green-700 text-sm">{selectedReport.resolution.note}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 2. Modal Selesaikan Laporan */}
      {isCompleteOpen && selectedReport && (
        <Modal onClose={() => setIsCompleteOpen(false)} title="Selesaikan Laporan">
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-700 text-sm mb-4">
              Anda akan menyelesaikan laporan: <b>{selectedReport.title}</b>
            </div>
            
            {/* Upload Foto */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Foto Bukti Selesai</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 relative group cursor-pointer transition-colors">
                <input type="file" onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setCompletionImage(e.target.files[0]);
                    setPreviewImage(URL.createObjectURL(e.target.files[0]));
                  }
                }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
                {previewImage ? (
                  <img src={previewImage} className="h-32 mx-auto rounded object-cover shadow-sm"/>
                ) : (
                  <div className="text-slate-400 group-hover:text-indigo-500">
                    <div className="text-3xl mb-2">📸</div>
                    <span className="text-sm">Klik untuk upload foto</span>
                  </div>
                )}
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Catatan Petugas</label>
              <textarea 
                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" 
                rows={4} 
                placeholder="Jelaskan tindakan perbaikan yang dilakukan..."
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleCompleteSubmit} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-500/30 transition-transform active:scale-95">
                Kirim Laporan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. Modal Edit User */}
      {isUserEditOpen && selectedUser && (
        <Modal onClose={() => setIsUserEditOpen(false)} title="Edit User">
          <div className="space-y-4 p-2">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
              <input type="text" value={selectedUser.name} onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"/>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nomor HP</label>
              <input type="text" value={selectedUser.phone} onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"/>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Status Akun</label>
              <select 
                value={selectedUser.status} 
                onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})} 
                className="w-full border border-slate-200 rounded-lg p-2 mt-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Verified">✅ Verified</option>
                <option value="Banned">🚫 Banned</option>
              </select>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleUserUpdate} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-lg">Simpan Perubahan</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// --- SUB COMPONENTS (Agar Kodingan Rapi) ---

const NavItem = ({ icon, label, count, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <div className="flex items-center space-x-3"><span className="text-xl">{icon}</span><span className="font-medium text-sm">{label}</span></div>
    {count > 0 && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white text-indigo-600' : 'bg-slate-700 text-slate-300'}`}>{count}</span>}
  </button>
);

const CardStat = ({ title, value, icon, color }: any) => (
  <div className={`p-6 rounded-2xl shadow-sm flex justify-between items-center ${color}`}>
    <div><div className="text-sm font-medium opacity-80">{title}</div><div className="text-2xl font-bold mt-1">{value}</div></div>
    <div className="text-3xl opacity-50">{icon}</div>
  </div>
);

const Badge = ({ status }: { status: string }) => {
  const color = { 'Pending': 'bg-orange-100 text-orange-600', 'Proses': 'bg-blue-100 text-blue-600', 'Selesai': 'bg-green-100 text-green-600' }[status] || 'bg-slate-100';
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>{status}</span>;
};

const Modal = ({ children, onClose, title }: any) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform scale-100 transition-all">
      <div className="flex justify-between items-center p-5 border-b border-slate-100">
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-2xl leading-none">&times;</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);