import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Head title="Lupa Password" />

            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 border border-slate-50 relative overflow-hidden">
                {/* Efek Background Halus */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 text-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl">SL</div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Lupa Password?</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Jangan khawatir. Masukkan alamat email Anda dan kami akan mengirimkan link reset password untuk membuat yang baru.
                    </p>

                    {status && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-600 animate-fade-in">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6 text-left">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 italic">Alamat Email Terdaftar</label>
                            <input 
                                type="email" 
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-100 font-bold transition-all"
                                placeholder="contoh@email.com"
                                value={data.email} 
                                onChange={(e) => setData('email', e.target.value)} 
                                required 
                            />
                            {errors.email && <div className="text-red-500 text-xs mt-2 ml-2 font-bold">{errors.email}</div>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="w-full bg-slate-900 hover:bg-cyan-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[10px]"
                        >
                            {processing ? 'Mengirim Link...' : 'Kirim Link Reset ✨'}
                        </button>
                    </form>

                    <div className="mt-10 border-t pt-8">
                        <Link href={route('login')} className="text-slate-400 text-sm font-bold hover:text-slate-800 transition-all">
                            ← Kembali ke Halaman Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}