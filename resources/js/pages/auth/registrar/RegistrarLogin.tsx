import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface LoginForm {
    email: string;
    password: string;
    [key: string]: string | boolean;
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconEmail = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
);

const IconLock = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

function EyeIcon({ show }: { show: boolean }) {
    return show ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
    ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function RegistrarLogin() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm<LoginForm>({
        email: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('registrar.login.post'));
    };

    return (
        <>
            <Head title="Registrar Login | GradeHub" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-10">
                <div className="w-full max-w-lg">

                    {/* Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-gray-800">GradeHub</span>
                        </div>

                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Registrar Sign In</h1>
                            <p className="text-gray-500 text-sm">Sign in to your registrar account</p>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                                🛡️ Registrar Portal
                            </span>
                        </div>

                        {/* Restricted access notice */}
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6">
                            <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-xs text-amber-700 font-medium">
                                This portal is for authorized administrators only. Unauthorized access is strictly prohibited.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <IconEmail />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="admin@smcbi.com"
                                        autoComplete="username"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <span>⚠</span> {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <IconLock />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Your password"
                                        autoComplete="current-password"
                                        className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <EyeIcon show={showPassword} />
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <span>⚠</span> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Forgot password */}
                            <div className="flex justify-end -mt-2">
                                <a
                                    href="/registrar/login"
                                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                {processing ? 'Signing in...' : 'Sign In'}
                                {!processing && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        © 2025 GradeHub · Grading & Transcript Management System
                    </p>
                </div>
            </div>
        </>
    );
}