import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Head title="Masuk ke Akun" />

            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* BAGIAN KIRI: BRANDING (Seragam dengan Register) */}
                <div className="w-full md:w-5/12 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-cyan-500 rounded-full blur-[90px] opacity-20"></div>
                    <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-600 rounded-full blur-[100px] opacity-30"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl shadow-lg flex items-center justify-center font-bold text-lg">SL</div>
                            <span className="text-xl font-bold tracking-wide">Sobat<span className="text-cyan-400">Lapor</span></span>
                        </div>
                        <h1 className="text-4xl font-extrabold leading-tight mb-6">Selamat Datang <br /> <span className="text-cyan-400">Kembali.</span></h1>
                        <p className="text-slate-400 leading-relaxed">Silakan masuk untuk melanjutkan laporan atau memantau status pengaduan Anda.</p>
                    </div>
                    
                    <div className="relative z-10 text-xs text-slate-500">
                        © 2025 SobatLapor System. All rights reserved.
                    </div>
                </div>

                {/* BAGIAN KANAN: FORM LOGIN */}
                <div className="w-full md:w-7/12 bg-white p-8 md:p-12 flex flex-col justify-center">
                
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Login</h2>
                        <p className="text-slate-500">Masukkan email dan password akun Anda.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                            <input 
                                type="email" 
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" 
                                placeholder="nama@email.com"
                                value={data.email} 
                                onChange={(e) => setData('email', e.target.value)} 
                                required 
                            />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                
                                {/* FITUR LUPA PASSWORD */}
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline transition-all"
                                    >
                                        Lupa Password?
                                    </Link>
                                )}
                            </div>
                            
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" 
                                    placeholder="••••••••"
                                    value={data.password} 
                                    onChange={(e) => setData('password', e.target.value)} 
                                    required 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                                </button>
                            </div>
                            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 text-cyan-600 shadow-sm focus:ring-cyan-500" 
                                    checked={data.remember} 
                                    onChange={(e) => setData('remember', e.target.checked)} 
                                />
                                <span className="ml-2 text-sm text-slate-600">Ingat Saya</span>
                            </label>
                            {status && (
                                <div className="flex justify-center ml-2 font-medium text-sm text-green-600">
                            {status}
                                </div>
                             )}
                            
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                            
                        </div>
                        
                    </form>


                    <div className="mt-10 text-center">
                        <p className="text-slate-500 text-sm">
                            Belum memiliki akun? {' '}
                            <Link href={route('register')} className="text-cyan-600 font-bold hover:underline">
                                Daftar Sekarang
                            </Link>
                        </p>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}