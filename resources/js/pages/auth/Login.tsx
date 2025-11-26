import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
    // State untuk toggle password
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Head title="Login Masuk" />

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
                
                {/* BAGIAN KIRI: VISUAL */}
                <div className="w-full md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-30 -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl shadow-lg"></div>
                            <span className="text-xl font-bold tracking-wide">Pengaduan.<span className="text-cyan-400">App</span></span>
                        </div>
                        <h1 className="text-4xl font-extrabold leading-tight mb-4">Satu Portal untuk <br /> <span className="text-cyan-400">Semua Layanan.</span></h1>
                        <p className="text-slate-400 text-lg font-light">Login untuk warga melapor, maupun petugas untuk mengelola laporan.</p>
                    </div>
                    <div className="relative z-10 text-sm text-slate-500">&copy; 2025 Sistem Pengaduan Masyarakat.</div>
                </div>

                {/* BAGIAN KANAN: FORM LOGIN */}
                <div className="w-full md:w-1/2 bg-white p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang Kembali!</h2>
                        <p className="text-slate-500">Silakan masukkan akun Anda untuk melanjutkan.</p>
                    </div>

                    {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">Alamat Email</label>
                            <input type="email" id="email" placeholder="nama@email.com" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                            </div>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} // Logika Toggle
                                    id="password" placeholder="••••••••" 
                                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all pr-12" 
                                    value={data.password} onChange={(e) => setData('password', e.target.value)} required 
                                />
                                {/* Tombol Mata */}
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-600 transition-colors">
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                                <span className="text-sm text-slate-600">Ingat saya</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-medium text-cyan-600 hover:text-cyan-800 hover:underline">Lupa password?</Link>
                        </div>

                        <button type="submit" disabled={processing} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50">
                            {processing ? 'Memproses...' : 'Masuk ke Sistem'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">Belum punya akun? <Link href="/register" className="text-cyan-600 font-bold hover:underline">Daftar di sini</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}