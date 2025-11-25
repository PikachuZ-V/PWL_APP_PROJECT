import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Props 'status' biasanya dikirim oleh Laravel jika email berhasil terkirim
export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mengirim request ke backend (pastikan route backend sudah siap nanti)
        // post(route('password.email')); 
        console.log('Reset Link Request:', data);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Head title="Lupa Password" />

            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
                
                {/* --- BAGIAN KIRI: Visual (Dark Theme) --- */}
                <div className="w-full md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    {/* Dekorasi Background */}
                    <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
                    <div className="absolute bottom-0 right-0 w-56 h-56 bg-cyan-500 rounded-full blur-[100px] opacity-20"></div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-xl shadow-lg flex items-center justify-center text-xl">
                                🔐
                            </div>
                            <span className="text-xl font-bold tracking-wide">Pengaduan.<span className="text-cyan-400">App</span></span>
                        </div>
                        
                        <h1 className="text-3xl font-extrabold leading-tight mb-4">
                            Jangan Panik. <br /> <span className="text-cyan-400">Kami Bantu Pulihkan.</span>
                        </h1>
                        <p className="text-slate-400 font-light">
                            Kehilangan password hal yang biasa. Cukup masukkan email Anda, dan kami akan mengirimkan instruksi selanjutnya.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm text-slate-500">
                        &copy; 2025 Keamanan Sistem Terjamin.
                    </div>
                </div>

                {/* --- BAGIAN KANAN: Form (Clean Light Theme) --- */}
                <div className="w-full md:w-1/2 bg-white p-12 flex flex-col justify-center">
                    
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Lupa Password?</h2>
                        <p className="text-slate-500 text-sm">
                            Masukkan alamat email yang terdaftar untuk menerima link reset password.
                        </p>
                    </div>

                    {/* Alert Sukses (Jika ada status dari Laravel) */}
                    {status && (
                        <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Input Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
                                Email Terdaftar
                            </label>
                            <input 
                                type="email" 
                                id="email"
                                placeholder="nama@email.com"
                                className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoFocus
                            />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>

                        {/* Button Kirim */}
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-200 transition-all transform hover:-translate-y-1"
                        >
                            Kirim Link Reset Password
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Ingat password Anda?{' '}
                            <Link href="/login" className="text-slate-800 font-bold hover:text-cyan-600 hover:underline transition-colors">
                                Kembali Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}