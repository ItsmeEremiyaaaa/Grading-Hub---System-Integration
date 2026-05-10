import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface RegisterForm {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    course: string;
    year_level: string;
    password: string;
    password_confirmation: string;
    [key: string]: string | boolean;
}

const COURSES = [
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Nursing',
    'Bachelor of Science in Education',
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Accountancy',
    'Bachelor of Science in Engineering',
    'Bachelor of Arts in Communication',
];

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const STEPS = ['Personal Details', 'Academic Details', 'Account Setup'];

function PendingModal({ onClose }: { onClose: () => void }) {
    const steps = [
        { label: 'Registration submitted',            done: true  },
        { label: 'Waiting for Registrar approval',    done: false },
        { label: 'Account activated — login enabled', done: false },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
                style={{ animation: 'popIn .3s cubic-bezier(.34,1.56,.64,1) both' }}
            >
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center">
                        <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Account Submitted!</h2>
                <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
                    Your registration has been received. Your account is currently
                    <span className="font-semibold text-amber-600"> pending approval </span>
                    from the Registrar. You will be able to log in once your account has been activated.
                </p>

                <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                                {s.done ? (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                                )}
                            </div>
                            <span className={`text-sm ${s.done ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <a
                    href="/student/login"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                    Go to Login
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                <button
                    onClick={onClose}
                    className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center mb-8">
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

const IconUser  = () => (
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

function EyeIcon({ show }: { show: boolean }) {
    if (show) {
        return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
            </svg>
        );
    }
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

export default function StudentRegister() {
    const [step, setStep]                 = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [showModal, setShowModal]       = useState(false);
    const [localErrors, setLocalErrors]   = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        student_id:            '',
        first_name:            '',
        last_name:             '',
        email:                 '',
        course:                '',
        year_level:            '',
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
            if (!data.student_id.trim()) e.push('student_id');
            if (!data.course)            e.push('course');
            if (!data.year_level)        e.push('year_level');
            return e;
        }
        if (step === 2) {
            const e: string[] = [];
            if (!data.password)                                      e.push('password');
            if (data.password.length < 8)                           e.push('password');
            if (!data.password_confirmation)                         e.push('password_confirmation');
            if (data.password !== data.password_confirmation)        e.push('password_confirmation');
            return e;
        }
        return [];
    };

    const nextStep = () => {
        const errs = stepErrors();
        if (errs.length) { setLocalErrors(errs); return; }
        setLocalErrors([]);
        setStep(s => s + 1);
    };

    const prevStep = () => {
        setLocalErrors([]);
        setStep(s => s - 1);
    };

    const hasErr = (field: string) => !!errors[field] || localErrors.includes(field);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const errs = stepErrors();
        if (errs.length) { setLocalErrors(errs); return; }
        setLocalErrors([]);
        post(route('student.register.post'), {
            onSuccess: () => {
                reset();
                setStep(0);
                setShowModal(true);
            },
        });
    };

    const Step0 = (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="First Name *" error={hasErr('first_name') ? (errors.first_name ?? 'Required') : undefined}>
                    <TextInput
                        icon={<IconUser />}
                        type="text"
                        placeholder="Juan"
                        value={data.first_name}
                        onChange={e => setData('first_name', e.target.value)}
                        error={hasErr('first_name') ? '1' : undefined}
                    />
                </FieldGroup>
                <FieldGroup label="Last Name *" error={hasErr('last_name') ? (errors.last_name ?? 'Required') : undefined}>
                    <TextInput
                        icon={<IconUser />}
                        type="text"
                        placeholder="Dela Cruz"
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
                    placeholder="surname | name@smcbi.com"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    error={hasErr('email') ? '1' : undefined}
                />
            </FieldGroup>
        </div>
    );

    const Step1 = (
        <div className="space-y-5">
            <FieldGroup label="Student ID *" error={hasErr('student_id') ? (errors.student_id ?? 'Required') : undefined}>
                <TextInput
                    icon={<IconId />}
                    type="text"
                    placeholder="e.g. 2021-00142"
                    value={data.student_id}
                    onChange={e => setData('student_id', e.target.value)}
                    error={hasErr('student_id') ? '1' : undefined}
                />
            </FieldGroup>

            <FieldGroup label="Course / Program *" error={hasErr('course') ? (errors.course ?? 'Required') : undefined}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconBook />
                    </div>
                    <select
                        value={data.course}
                        onChange={e => setData('course', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                            hasErr('course') ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                        <option value="">Select your program</option>
                        {COURSES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </FieldGroup>

            <FieldGroup label="Year Level *" error={hasErr('year_level') ? (errors.year_level ?? 'Required') : undefined}>
                <div className="grid grid-cols-4 gap-2">
                    {YEAR_LEVELS.map(y => (
                        <button
                            key={y}
                            type="button"
                            onClick={() => setData('year_level', y)}
                            className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                                data.year_level === y
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                            {y.replace(' Year', '')}
                        </button>
                    ))}
                </div>
            </FieldGroup>
        </div>
    );

    const Step2 = (
        <div className="space-y-5">
            <FieldGroup label="Password *" error={hasErr('password') ? (errors.password ?? (!data.password ? 'Required' : 'Must be at least 8 characters')) : undefined}>
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
                {data.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map(n => (
                                <div
                                    key={n}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                        data.password.length >= n * 2
                                            ? n <= 1 ? 'bg-red-400'
                                            : n <= 2 ? 'bg-yellow-400'
                                            : n <= 3 ? 'bg-blue-400'
                                            : 'bg-green-500'
                                            : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-400">
                            {data.password.length < 4 ? 'Too short'
                                : data.password.length < 6 ? 'Weak'
                                : data.password.length < 8 ? 'Fair'
                                : 'Strong'}
                        </p>
                    </div>
                )}
            </FieldGroup>

            <FieldGroup label="Confirm Password *" error={hasErr('password_confirmation') ? (errors.password_confirmation ?? (!data.password_confirmation ? 'Required' : 'Passwords do not match')) : undefined}>
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
                            errors.password_confirmation ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <EyeIcon show={showConfirm} />
                    </button>
                </div>
                {data.password_confirmation.length > 0 && (
                    <p className={`mt-1.5 text-xs flex items-center gap-1 ${
                        data.password === data.password_confirmation ? 'text-green-500' : 'text-red-400'
                    }`}>
                        {data.password === data.password_confirmation
                            ? '✓ Passwords match'
                            : '✗ Passwords do not match'}
                    </p>
                )}
            </FieldGroup>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Registration Summary</p>
                {[
                    ['Name',       `${data.first_name} ${data.last_name}`],
                    ['Email',      data.email],
                    ['Student ID', data.student_id],
                    ['Program',    data.course],
                    ['Year',       data.year_level],
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
            <Head title="Student Registration | GradeHub" />

            {showModal && <PendingModal onClose={() => setShowModal(false)} />}

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-10">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-gray-800">GradeHub</span>
                        </div>

                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Create an Account</h1>
                            <p className="text-gray-500 text-sm">Fill in your details to register as a student</p>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                                🎓 Student Portal
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
                                <a href="/student/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                                    Sign in
                                </a>
                            </p>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">
                                Other portals:&nbsp;
                                <a href="/faculty/login" className="text-blue-600 hover:underline font-medium">Faculty</a>
                                &nbsp;·&nbsp;
                                <a href="/registrar/login" className="text-blue-600 hover:underline font-medium">Registrar</a>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        © 2025 GradeHub · Grading &amp; Transcript Management System
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeInStep {
                    from { opacity: 0; transform: translateX(10px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.85); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
}