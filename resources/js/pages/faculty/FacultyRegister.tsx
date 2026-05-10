import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface RegisterForm {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    position: string;
    password: string;
    password_confirmation: string;
    [key: string]: string | boolean;
}

const DEPARTMENTS = [
    'College of Information Technology',
    'College of Computer Science',
    'College of Engineering',
    'College of Nursing',
    'College of Education',
    'College of Business Administration',
    'College of Accountancy',
    'College of Arts and Sciences',
];

const POSITIONS = [
    'Instructor I',
    'Instructor II',
    'Instructor III',
    'Assistant Professor I',
    'Assistant Professor II',
    'Assistant Professor III',
    'Associate Professor I',
    'Associate Professor II',
    'Professor I',
    'Professor II',
];

const STEPS = ['Personal Details', 'Academic Details', 'Account Setup'];

// ── Small helpers ──────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-0 mb-8">
            {STEPS.map((label, i) => {
                const done   = i < current;
                const active = i === current;
                return (
                    <div key={i} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                                done   ? 'bg-blue-600 border-blue-600 text-white' :
                                active ? 'bg-white border-blue-600 text-blue-600' :
                                         'bg-white border-gray-200 text-gray-400'
                            }`}>
                                {done ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : i + 1}
                            </div>
                            <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-blue-600' : done ? 'text-blue-400' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-2 mb-5 transition-all duration-300 ${done ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            {children}
            {error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    );
}

function TextInput({ icon, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode; error?: string }) {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <input
                {...props}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                } ${props.className ?? ''}`}
            />
        </div>
    );
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconUser = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const IconId = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
    </svg>
);
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
const IconBook = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const IconBriefcase = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

export default function FacultyRegister() {
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [localErrors, setLocalErrors]   = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm<RegisterForm>({
        employee_id:           '',
        first_name:            '',
        last_name:             '',
        email:                 '',
        department:            '',
        position:              '',
        password:              '',
        password_confirmation: '',
    });

    const stepErrors = (): string[] => {
        if (step === 0) {
            const e: string[] = [];
            if (!data.first_name.trim()) e.push('first_name');
            if (!data.last_name.trim())  e.push('last_name');
            if (!data.email.trim())      e.push('email');
            return e;
        }
        if (step === 1) {
            const e: string[] = [];
            if (!data.employee_id.trim()) e.push('employee_id');
            if (!data.department)         e.push('department');
            if (!data.position)           e.push('position');
            return e;
        }
        if (step === 2) {
            const e: string[] = [];
            if (!data.password || data.password.length < 8)          e.push('password');
            if (!data.password_confirmation)                          e.push('password_confirmation');
            if (data.password !== data.password_confirmation)         e.push('password_confirmation');
            return e;
        }
        return [];
    };

    const hasErr = (field: string) =>
        !!errors[field] || localErrors.includes(field);

    const getLocalErrMsg = (field: string): string | undefined => {
        if (!localErrors.includes(field)) return undefined;
        if (field === 'password') return data.password.length > 0 ? 'Password must be at least 8 characters' : 'Required';
        if (field === 'password_confirmation') return data.password_confirmation.length > 0 ? 'Passwords do not match' : 'Required';
        return 'Required';
    };

    const nextStep = () => {
        const errs = stepErrors();
        if (errs.length) { setLocalErrors(errs); return; }
        setLocalErrors([]);
        setStep(s => s + 1);
    };

    const prevStep = () => { setLocalErrors([]); setStep(s => s - 1); };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const errs = stepErrors();
        if (errs.length) { setLocalErrors(errs); return; }
        post('/faculty/register');
    };

    // ── Step 0: Personal Details ───────────────────────────────────────────────

    const Step0 = (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="First Name *" error={hasErr('first_name') ? (errors.first_name ?? 'Required') : undefined}>
                    <TextInput
                        icon={<IconUser />}
                        type="text"
                        placeholder="Jose"
                        value={data.first_name}
                        onChange={e => setData('first_name', e.target.value)}
                        error={hasErr('first_name') ? '1' : undefined}
                    />
                </FieldGroup>
                <FieldGroup label="Last Name *" error={hasErr('last_name') ? (errors.last_name ?? 'Required') : undefined}>
                    <TextInput
                        icon={<IconUser />}
                        type="text"
                        placeholder="Santos"
                        value={data.last_name}
                        onChange={e => setData('last_name', e.target.value)}
                        error={hasErr('last_name') ? '1' : undefined}
                    />
                </FieldGroup>
            </div>
            <FieldGroup label="Email Address *" error={hasErr('email') ? (errors.email ?? 'Required') : undefined}>
                <TextInput
                    icon={<IconEmail />}
                    type="email"
                    placeholder="j.santos@smcbi.com"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    error={hasErr('email') ? '1' : undefined}
                />
            </FieldGroup>
        </div>
    );

    // ── Step 1: Academic Details ───────────────────────────────────────────────

    const Step1 = (
        <div className="space-y-5">
            <FieldGroup label="Employee ID *" error={hasErr('employee_id') ? (errors.employee_id ?? 'Required') : undefined}>
                <TextInput
                    icon={<IconId />}
                    type="text"
                    placeholder="e.g. EMP-2021-001"
                    value={data.employee_id}
                    onChange={e => setData('employee_id', e.target.value)}
                    error={hasErr('employee_id') ? '1' : undefined}
                />
            </FieldGroup>

            <FieldGroup label="Department *" error={hasErr('department') ? (errors.department ?? 'Required') : undefined}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconBook />
                    </div>
                    <select
                        value={data.department}
                        onChange={e => setData('department', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                            hasErr('department') ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                        <option value="">Select your department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </FieldGroup>

            <FieldGroup label="Position *" error={hasErr('position') ? (errors.position ?? 'Required') : undefined}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconBriefcase />
                    </div>
                    <select
                        value={data.position}
                        onChange={e => setData('position', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                            hasErr('position') ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                        <option value="">Select your position</option>
                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </FieldGroup>
        </div>
    );

    // ── Step 2: Account Setup ──────────────────────────────────────────────────

    const Step2 = (
        <div className="space-y-5">
            <FieldGroup label="Password *" error={hasErr('password') ? (errors.password ?? getLocalErrMsg('password')) : undefined}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconLock />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        placeholder="Min. 8 characters"
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            hasErr('password') ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        <EyeIcon show={showPassword} />
                    </button>
                </div>
                {data.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                            {[1,2,3,4].map(n => (
                                <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                    data.password.length >= n * 2
                                        ? n <= 1 ? 'bg-red-400' : n <= 2 ? 'bg-yellow-400' : n <= 3 ? 'bg-blue-400' : 'bg-green-500'
                                        : 'bg-gray-200'
                                }`} />
                            ))}
                        </div>
                        <p className="text-xs text-gray-400">
                            {data.password.length < 4 ? 'Too short' : data.password.length < 6 ? 'Weak' : data.password.length < 8 ? 'Fair' : 'Strong'}
                        </p>
                    </div>
                )}
            </FieldGroup>

            <FieldGroup label="Confirm Password *" error={hasErr('password_confirmation') ? (errors.password_confirmation ?? getLocalErrMsg('password_confirmation')) : undefined}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconLock />
                    </div>
                    <input
                        type={showConfirm ? 'text' : 'password'}
                        value={data.password_confirmation}
                        onChange={e => setData('password_confirmation', e.target.value)}
                        placeholder="Repeat your password"
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            hasErr('password_confirmation') ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        <EyeIcon show={showConfirm} />
                    </button>
                </div>
                {data.password_confirmation.length > 0 && (
                    <p className={`mt-1.5 text-xs flex items-center gap-1 ${data.password === data.password_confirmation ? 'text-green-500' : 'text-red-400'}`}>
                        {data.password === data.password_confirmation ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                )}
            </FieldGroup>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Registration Summary</p>
                {[
                    ['Name',        `${data.first_name} ${data.last_name}`],
                    ['Email',       data.email],
                    ['Employee ID', data.employee_id],
                    ['Department',  data.department],
                    ['Position',    data.position],
                ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-gray-800 font-medium text-right max-w-[60%] truncate">{value || '—'}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const steps = [Step0, Step1, Step2];

    return (
        <>
            <Head title="Faculty Registration | GradeHub" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-10">
                <div className="w-full max-w-lg">
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
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Faculty Account</h1>
                            <p className="text-gray-500 text-sm">Fill in your details to register as faculty</p>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                                👩‍🏫 Faculty Portal
                            </span>
                        </div>

                        <StepIndicator current={step} />

                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Step {step + 1} of {STEPS.length} — {STEPS[step]}
                        </p>

                        <form onSubmit={submit}>
                            <div key={step} style={{ animation: 'fadeInStep .25s ease both' }}>
                                {steps[step]}
                            </div>

                            <div className={`flex gap-3 mt-7 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
                                {step > 0 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back
                                    </button>
                                )}

                                {step < STEPS.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        Continue
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        {processing ? 'Creating account...' : 'Create Account'}
                                        {!processing && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                Already have an account?{' '}
                                <a href="/faculty/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                                    Sign in
                                </a>
                            </p>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">
                                Other portals:&nbsp;
                                <a href="/student/login" className="text-blue-600 hover:underline font-medium">Student</a>
                                &nbsp;·&nbsp;
                                <a href="/registrar/login" className="text-blue-600 hover:underline font-medium">Registrar</a>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        © 2025 GradeHub · Grading & Transcript Management System
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeInStep {
                    from { opacity: 0; transform: translateX(10px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </>
    );
}