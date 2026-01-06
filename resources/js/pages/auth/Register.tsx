import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '', // Catatan: Di backend default Laravel Breeze, 'address' perlu ditangani manual jika belum ada di controller Auth.
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register')); // Mengirim ke route register bawaan Laravel
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Head title="Daftar Akun Baru" />

            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
                
                {/* BAGIAN KIRI */}
                <div className="w-full md:w-5/12 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-cyan-500 rounded-full blur-[90px] opacity-20"></div>
                    <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-600 rounded-full blur-[100px] opacity-30"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl shadow-lg flex items-center justify-center font-bold text-lg">SL</div>
                            <span className="text-xl font-bold tracking-wide">Sobat<span className="text-cyan-400">Lapor</span></span>
                        </div>
                        <h1 className="text-4xl font-extrabold leading-tight mb-6">Mulai Perubahan <br /> <span className="text-cyan-400">Dari Sini.</span></h1>
                        <p className="text-slate-400 leading-relaxed">Bergabunglah bersama kami untuk menciptakan lingkungan yang lebih baik.</p>
                    </div>
                </div>

                {/* BAGIAN KANAN: FORM */}
                <div className="w-full md:w-7/12 bg-white p-8 md:p-12 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Buat Akun Baru</h2>
                        <p className="text-slate-500">Lengkapi data diri Anda dengan benar.</p>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                            <input type="text" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                            <input type="email" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">No. WhatsApp</label>
                            <input type="text" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Domisili</label>
                            <textarea rows={2} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none" value={data.address} onChange={(e) => setData('address', e.target.value)}></textarea>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <input type={showPassword ? "text" : "password"} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Ulangi Password</label>
                            <input type={showPassword ? "text" : "password"} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required />
                        </div>

                        {/* Toggle Show Password */}
                        <div className="md:col-span-2 flex items-center">
                            <input type="checkbox" id="showPass" className="mr-2" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                            <label htmlFor="showPass" className="text-sm text-slate-600 cursor-pointer">Lihat Password</label>
                        </div>

                        <div className="md:col-span-2 mt-2">
                            <button type="submit" disabled={processing} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50">
                                {processing ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">Sudah punya akun? <Link href="/login" className="text-cyan-600 font-bold hover:underline">Login di sini</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}