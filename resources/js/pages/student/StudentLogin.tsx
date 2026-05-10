import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

export default function StudentLogin() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('student.login.post'));
    };

    return (
        <>
            <Head title="Student Login | GradeHub" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">

                    {/* Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-gray-800">GradeHub</span>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h1>
                            <p className="text-gray-500 text-sm">Sign in to your student account</p>
                        </div>

                        {/* Role Badge */}
                        <div className="flex gap-2 mb-6">
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                                🎓 Student Portal
                            </span>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="surname | name@smcbi.com"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                        required
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <span>⚠</span> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked ? true : false)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                                {processing ? 'Signing in...' : 'Sign In'}
                            </button>

                            {/* Create Account Button */}
                            <a
                                href="/student/register"
                                className="w-full inline-flex justify-center items-center bg-blue-50 text-blue-700 font-semibold px-3 py-3 rounded-xl shadow-md hover:bg-blue-100 hover:shadow-lg transition-all duration-200 gap-2 text-sm -mt-1"
                            >
                                Create an Account
                            </a>

                        </form>

                        {/* Divider */}
                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400">
                                Other portals:&nbsp;
                                <a href="/admin/login" className="text-blue-600 hover:underline font-medium">Admin</a>
                                &nbsp;·&nbsp;
                                <a href="/teacher/login" className="text-blue-600 hover:underline font-medium">Faculty</a>
                                &nbsp;·&nbsp;
                                <a href="/registrar/login" className="text-blue-600 hover:underline font-medium">Registrar</a>
                            </p>
                        </div>

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