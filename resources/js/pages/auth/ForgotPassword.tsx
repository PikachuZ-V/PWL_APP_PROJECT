import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Kirim ke route standar Laravel 'password.email'
        post(route('password.email')); 
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Head title="Lupa Password" />

            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
                <div className="w-full md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold leading-tight mb-4">Jangan Panik. <br /> <span className="text-cyan-400">Kami Bantu Pulihkan.</span></h1>
                        <p className="text-slate-400 font-light">Masukkan email Anda, dan kami akan mengirimkan link reset password.</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 bg-white p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Lupa Password?</h2>
                    </div>

                    {/* Alert Sukses dari Backend */}
                    {status && (
                        <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">Email Terdaftar</label>
                            <input type="email" id="email" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoFocus />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>

                        <button type="submit" disabled={processing} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50">
                            {processing ? 'Mengirim...' : 'Kirim Link Reset'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">Ingat password Anda? <Link href="/login" className="text-slate-800 font-bold hover:text-cyan-600 hover:underline">Kembali Login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function route(arg0: string): string {
    throw new Error('Function not implemented.');
}
