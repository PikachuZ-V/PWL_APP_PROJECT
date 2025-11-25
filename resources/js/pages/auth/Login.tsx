import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mengirim data ke route login Laravel
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Head title="Login Masuk" />

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
                
                {/* --- BAGIAN KIRI: Visual & Branding (Dark Theme) --- */}
                <div className="w-full md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-30 -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl shadow-lg"></div>
                            <span className="text-xl font-bold tracking-wide">Pengaduan.<span className="text-cyan-400">App</span></span>
                        </div>
                        
                        <h1 className="text-4xl font-extrabold leading-tight mb-4">
                            Satu Portal untuk <br /> <span className="text-cyan-400">Semua Layanan.</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-light">
                            Login untuk warga melapor, maupun petugas untuk mengelola laporan. Semua dalam satu tempat.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm text-slate-500">
                        &copy; 2025 Sistem Pengaduan Masyarakat.
                    </div>
                </div>

                {/* --- BAGIAN KANAN: Form Login (Clean Light Theme) --- */}
                <div className="w-full md:w-1/2 bg-white p-12 flex flex-col justify-center">
                    
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang Kembali!</h2>
                        <p className="text-slate-500">Silakan masukkan akun Anda untuk melanjutkan.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Input Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
                                Alamat Email
                            </label>
                            <input 
                                type="email" 
                                id="email"
                                placeholder="nama@email.com"
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>

                        {/* Input Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                                    Password
                                </label>
                            </div>
                            <input 
                                type="password" 
                                id="password"
                                placeholder="••••••••"
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="text-sm text-slate-600">Ingat saya</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-medium text-cyan-600 hover:text-cyan-800 hover:underline">
                                Lupa password?
                            </Link>
                        </div>

                        {/* Button Login */}
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
                        >
                            Masuk ke Sistem
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-cyan-600 font-bold hover:underline">
                                Daftar di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function route(arg0: string): string {
    throw new Error('Function not implemented.');
}
