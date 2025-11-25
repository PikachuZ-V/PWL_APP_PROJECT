import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    // Setup form state
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        password_confirmation: '', // Tambahan standar untuk konfirmasi password
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // post(route('register')); 
        console.log('Register Payload:', data);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Head title="Daftar Akun Baru" />

            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
                
                {/* --- BAGIAN KIRI: Visual & Branding (Dark Theme) --- */}
                {/* Kita buat sedikit beda gradient-nya biar fresh, tapi tetap senada */}
                <div className="w-full md:w-5/12 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    {/* Dekorasi Background */}
                    <div className="absolute top-10 left-10 w-40 h-40 bg-cyan-500 rounded-full blur-[90px] opacity-20"></div>
                    <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-600 rounded-full blur-[100px] opacity-30"></div>
                    
                    {/* Pattern Dot Overlay (Opsional) */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg"></div>
                            <span className="text-xl font-bold tracking-wide">Pengaduan.<span className="text-cyan-400">App</span></span>
                        </div>
                        
                        <h1 className="text-4xl font-extrabold leading-tight mb-6">
                            Mulai Perubahan <br /> <span className="text-cyan-400">Dari Sini.</span>
                        </h1>
                        <p className="text-slate-400 leading-relaxed">
                            Bergabunglah bersama kami untuk menciptakan lingkungan yang lebih baik, aman, dan nyaman. Suara Anda sangat berharga.
                        </p>
                    </div>

                    {/* Testimonial Kecil / Quote */}
                    <div className="relative z-10 mt-10 p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700">
                        <p className="text-sm italic text-slate-300">"Pelayanan cepat dan transparan. Sangat membantu masyarakat!"</p>
                        <div className="mt-4 flex items-center space-x-2">
                            <div className="w-6 h-6 bg-cyan-500 rounded-full"></div>
                            <span className="text-xs font-bold text-slate-400">Warga Sukamaju</span>
                        </div>
                    </div>
                </div>

                {/* --- BAGIAN KANAN: Form Register (Clean Light Theme) --- */}
                {/* Kita beri overflow-y-auto jika formnya panjang di layar kecil */}
                <div className="w-full md:w-7/12 bg-white p-8 md:p-12 overflow-y-auto">
                    
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Buat Akun Baru</h2>
                        <p className="text-slate-500">Lengkapi data diri Anda dengan benar.</p>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Nama Lengkap (Full Width) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                            <input 
                                type="text" 
                                placeholder="Cth: Andi Sanjaya"
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                            <input 
                                type="email" 
                                placeholder="nama@email.com"
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>

                        {/* No HP */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">No. WhatsApp</label>
                            <input 
                                type="text" 
                                placeholder="0812..."
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </div>

                        {/* Alamat (Full Width) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Domisili</label>
                            <textarea 
                                rows={2}
                                placeholder="Jalan, No. Rumah, RT/RW..."
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                            ></textarea>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Ulangi Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                        </div>

                        {/* Tombol Register (Full Width) */}
                        <div className="md:col-span-2 mt-4">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-200 transition-all transform hover:-translate-y-1"
                            >
                                Daftar Sekarang
                            </button>
                        </div>

                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-cyan-600 font-bold hover:underline">
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}