import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Head title="Atur Ulang Password" />

            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 border border-slate-50 relative overflow-hidden">
                {/* Efek Background Dekoratif */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 text-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl">SL</div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Password Baru</h2>
                    <p className="text-slate-500 text-sm mb-8">Silakan masukkan password baru Anda di bawah ini.</p>

                    <form onSubmit={submit} className="space-y-6 text-left">
                        {/* Hidden Email Field (Required by Laravel) */}
                        <input type="hidden" value={data.email} />

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 italic">Password Baru</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold transition-all"
                                    value={data.password} 
                                    onChange={(e) => setData('password', e.target.value)} 
                                    required 
                                />
                            </div>
                            {errors.password && <div className="text-red-500 text-xs mt-2 ml-2 font-bold">{errors.password}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 italic">Konfirmasi Password Baru</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold transition-all"
                                value={data.password_confirmation} 
                                onChange={(e) => setData('password_confirmation', e.target.value)} 
                                required 
                            />
                            {errors.password_confirmation && <div className="text-red-500 text-xs mt-2 ml-2 font-bold">{errors.password_confirmation}</div>}
                        </div>

                        <div className="flex items-center ml-2">
                            <input 
                                type="checkbox" 
                                id="showPass" 
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                                onChange={() => setShowPassword(!showPassword)} 
                            />
                            <label htmlFor="showPass" className="ml-2 text-xs font-bold text-slate-500 cursor-pointer uppercase">Lihat Password</label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[10px]"
                        >
                            {processing ? 'Menyimpan...' : 'Perbarui Password ✨'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}