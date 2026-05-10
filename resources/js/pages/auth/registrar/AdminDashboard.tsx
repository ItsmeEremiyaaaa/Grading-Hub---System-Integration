import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

interface PendingStudent {
    id: number;
    student_id: string;
    full_name: string;
    email: string;
    course: string;
    year_level: number;
    status: string;
}

interface PendingGrade {
    id: number;
    student_name: string;
    student_id: string;
    course_code: string;
    course_name: string;
    section_name: string;
    faculty_name: string;
    score: number;
    letter_grade: string;
    remarks: string;
    is_finalized: boolean;
    submitted_at: string;
    enrollment_id: number;
}

interface Stats {
    total_students: number;
    total_faculty: number;
    total_courses: number;
    total_sections: number;
    total_enrolled: number;
    pending_grades: number;
    pending_students: number;
}

interface Props {
    registrar: { full_name: string; role: string };
    stats: Stats;
    pending_students: PendingStudent[];
    pending_grades: PendingGrade[];
    flash?: { success?: string };
}

const YEAR_LABELS: Record<number, string> = {
    1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year',
};

function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const REMARKS_OPTIONS = ['passed', 'failed', 'incomplete', 'dropped', 'withdrawn'];

const NAV_ITEMS = [
    { label: 'Dashboard',   href: '#',                          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true },
    { label: 'Students',    href: '/registrar/students',        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Faculty',     href: '/registrar/faculty',         icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Courses',     href: '/registrar/courses',         icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Sections',    href: '/registrar/sections',        icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Enrollments', href: '/registrar/enrollments',     icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Grades',      href: '/registrar/grades',          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

function letterFromScore(score: number): string {
    if (score >= 97) return '1.00';
    if (score >= 94) return '1.25';
    if (score >= 91) return '1.50';
    if (score >= 88) return '1.75';
    if (score >= 85) return '2.00';
    if (score >= 82) return '2.25';
    if (score >= 79) return '2.50';
    if (score >= 76) return '2.75';
    if (score >= 75) return '3.00';
    return '5.00';
}

// ─── Donut Chart ────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120, thickness = 18 }: {
    segments: { value: number; color: string; label: string }[];
    size?: number;
    thickness?: number;
}) {
    const r = (size - thickness) / 2;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const [hovered, setHovered] = useState<number | null>(null);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, []);

    let cumulative = 0;
    const arcs = segments.map((seg, i) => {
        const pct   = seg.value / total;
        const dash  = animated ? circ * pct : 0;
        const gap   = circ - dash;
        const offset = circ * (1 - cumulative);
        cumulative += pct;
        return { ...seg, dash, gap, offset, i };
    });

    return (
        <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* bg ring */}
                    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor"
                        className="text-slate-100 dark:text-slate-800" strokeWidth={thickness} />
                    {arcs.map(arc => (
                        <circle key={arc.i}
                            cx={size/2} cy={size/2} r={r} fill="none"
                            stroke={arc.color}
                            strokeWidth={hovered === arc.i ? thickness + 3 : thickness}
                            strokeDasharray={`${arc.dash} ${arc.gap}`}
                            strokeDashoffset={arc.offset}
                            strokeLinecap="butt"
                            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1), stroke-width 0.2s' }}
                            onMouseEnter={() => setHovered(arc.i)}
                            onMouseLeave={() => setHovered(null)}
                            className="cursor-pointer"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'none' }}>
                    <span className="text-xl font-black text-slate-800 dark:text-white leading-none">
                        {hovered !== null ? segments[hovered].value : total}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        {hovered !== null ? segments[hovered].label : 'Total'}
                    </span>
                </div>
            </div>
            <div className="space-y-2 flex-1">
                {segments.map((seg, i) => (
                    <div key={i}
                        className={`flex items-center justify-between gap-2 cursor-pointer rounded-lg px-2 py-1 transition-colors ${hovered === i ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}>
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                            <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{seg.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-white flex-shrink-0">{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function BarChart({ bars, dark }: {
    bars: { label: string; value: number; color: string }[];
    dark: boolean;
}) {
    const [animated, setAnimated] = useState(false);
    const max = Math.max(...bars.map(b => b.value), 1);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 200);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="flex items-end gap-2 h-28 w-full">
            {bars.map((bar, i) => {
                const pct = (bar.value / max) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {bar.value}
                        </span>
                        <div className="w-full flex items-end" style={{ height: '80px' }}>
                            <div
                                className="w-full rounded-t-lg transition-all duration-700 ease-out cursor-pointer group-hover:opacity-80"
                                style={{
                                    height: animated ? `${Math.max(pct, 4)}%` : '4%',
                                    background: bar.color,
                                    transitionDelay: `${i * 60}ms`,
                                }}
                            />
                        </div>
                        <span className="text-[9px] font-semibold text-slate-400 text-center leading-tight">{bar.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Radial Progress ─────────────────────────────────────────────────────────
function RadialProgress({ value, max, color, size = 64, stroke = 6 }: {
    value: number; max: number; color: string; size?: number; stroke?: number;
}) {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const pct = max === 0 ? 0 : Math.min(value / max, 1);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 150);
        return () => clearTimeout(t);
    }, []);

    const offset = circ - (animated ? pct : 0) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1) 0.1s' }}
            />
        </svg>
    );
}

export default function AdminDashboard({ registrar, stats, pending_students, pending_grades, flash }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dark, setDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('gradehub-theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('gradehub-theme', dark ? 'dark' : 'light');
    }, [dark]);

    const [reviewGrade, setReviewGrade]     = useState<PendingGrade | null>(null);
    const [mode, setMode]                   = useState<'finalize' | 'override'>('finalize');
    const [overrideScore, setOverrideScore] = useState('');
    const [overrideRemarks, setOverrideRemarks] = useState('passed');
    const [reason, setReason]               = useState('');
    const [submitting, setSubmitting]       = useState(false);

    const openReview = (grade: PendingGrade) => {
        setReviewGrade(grade);
        setMode('finalize');
        setOverrideScore(String(grade.score ?? ''));
        setOverrideRemarks(grade.remarks ?? 'passed');
        setReason('');
    };
    const closeReview = () => { setReviewGrade(null); setReason(''); setSubmitting(false); };
    const handleSubmit = () => {
        if (!reviewGrade || !reason.trim()) return;
        setSubmitting(true);
        const score   = mode === 'override' ? parseFloat(overrideScore) : reviewGrade.score;
        const remarks = mode === 'override' ? overrideRemarks : reviewGrade.remarks;
        router.post(
            route('registrar.grades.override', reviewGrade.enrollment_id),
            { score, remarks, reason, _method: 'POST' },
            { preserveScroll: true, onSuccess: () => closeReview(), onFinish: () => setSubmitting(false) }
        );
    };
    const approve = (id: number) => {
        router.patch(route('registrar.students.approve', id), {}, { preserveScroll: true });
    };

    // ── Derived chart data ──────────────────────────────────────────────────

    // Donut: system composition
    const donutSegments = [
        { label: 'Students',  value: stats.total_students,  color: '#6366f1' },
        { label: 'Faculty',   value: stats.total_faculty,   color: '#10b981' },
        { label: 'Courses',   value: stats.total_courses,   color: '#06b6d4' },
        { label: 'Sections',  value: stats.total_sections,  color: '#8b5cf6' },
    ];

    // Bar: grade letter distribution from pending_grades
    const gradeBuckets: Record<string, number> = { '1.00':'', '1.25':'', '1.50':'', '1.75':'', '2.00':'', '2.25':'', '2.50':'', '2.75':'', '3.00':'', '5.00':'' } as any;
    Object.keys(gradeBuckets).forEach(k => gradeBuckets[k] = 0);
    pending_grades.forEach(g => {
        const ltr = letterFromScore(g.score);
        gradeBuckets[ltr] = (gradeBuckets[ltr] || 0) + 1;
    });
    const gradeBarColors: Record<string, string> = {
        '1.00': '#10b981', '1.25': '#10b981', '1.50': '#34d399',
        '1.75': '#6ee7b7', '2.00': '#6366f1', '2.25': '#818cf8',
        '2.50': '#a5b4fc', '2.75': '#f59e0b', '3.00': '#fbbf24', '5.00': '#ef4444',
    };
    const gradeBars = Object.entries(gradeBuckets)
        .filter(([, v]) => v > 0)
        .map(([label, value]) => ({ label, value, color: gradeBarColors[label] }));

    // Enrollment funnel: 3 horizontal bars
    const funnelItems = [
        { label: 'Registered Students', value: stats.total_students, color: '#6366f1', max: stats.total_students },
        { label: 'Active Enrollments',  value: stats.total_enrolled,  color: '#10b981', max: stats.total_students },
        { label: 'Grades Pending',      value: stats.pending_grades,  color: '#f59e0b', max: stats.total_students },
    ];

    const statCards = [
        { label: 'Active Students',    value: stats.total_students,   sub: 'registered accounts', gradient: 'from-indigo-500 to-indigo-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { label: 'Pending Approvals',  value: stats.pending_students, sub: 'awaiting review',      gradient: 'from-amber-400 to-orange-500', urgent: stats.pending_students > 0, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Grade Submissions',  value: stats.pending_grades,   sub: 'need action',          gradient: 'from-rose-500 to-pink-600',    urgent: stats.pending_grades > 0,   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { label: 'Faculty Members',    value: stats.total_faculty,    sub: 'active teachers',      gradient: 'from-emerald-500 to-teal-600', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { label: 'Active Courses',     value: stats.total_courses,    sub: 'subjects offered',     gradient: 'from-cyan-500 to-sky-600',     icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { label: 'Total Enrolled',     value: stats.total_enrolled,   sub: 'active enrollments',   gradient: 'from-violet-500 to-purple-600', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    ];

    const now = new Date();

    return (
        <>
            <Head title={`Dashboard | ${registrar.full_name} | GradeHub`} />

            <div className={`flex h-screen overflow-hidden font-sans ${dark ? 'bg-slate-950' : 'bg-slate-50'}`}>

                {/* ── Sidebar ── */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-[70px]'} transition-all duration-300 flex flex-col flex-shrink-0 border-r ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`flex items-center gap-3 px-4 py-5 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/30">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                            </svg>
                        </div>
                        {sidebarOpen && (
                            <div>
                                <span className={`font-bold text-base tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>GradeHub</span>
                                <p className="text-xs text-slate-400 leading-none mt-0.5">Registrar Portal</p>
                            </div>
                        )}
                    </div>
                    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                        {sidebarOpen && <p className={`text-[10px] font-semibold uppercase tracking-widest px-3 mb-3 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Main Menu</p>}
                        {NAV_ITEMS.map(item => (
                            <a key={item.label} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                    item.active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                                    : dark ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}>
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                                </svg>
                                {sidebarOpen && <span>{item.label}</span>}
                            </a>
                        ))}
                    </nav>
                    <div className={`px-3 py-4 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${dark ? 'bg-slate-800' : 'bg-slate-50'} ${!sidebarOpen ? 'justify-center' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {initials(registrar.full_name)}
                            </div>
                            {sidebarOpen && (
                                <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>{registrar.full_name}</p>
                                    <p className="text-slate-400 text-xs truncate capitalize">{registrar.role}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => router.post(route('registrar.logout'))}
                            className={`mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {sidebarOpen && 'Sign Out'}
                        </button>
                    </div>
                </aside>

                {/* ── Main ── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className={`px-6 py-3.5 flex items-center justify-between flex-shrink-0 border-b ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(v => !v)}
                                className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <p className="text-xs text-slate-400">Pages / Dashboard</p>
                                <h1 className={`text-base font-bold leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Dashboard</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {stats.pending_students > 0 && (
                                <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                                    {stats.pending_students} pending
                                </span>
                            )}
                            {stats.pending_grades > 0 && (
                                <span className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />
                                    {stats.pending_grades} grades
                                </span>
                            )}
                            <button onClick={() => setDark(d => !d)}
                                className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                {dark ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {initials(registrar.full_name)}
                            </div>
                        </div>
                    </header>

                    <main className={`flex-1 overflow-y-auto p-6 ${dark ? 'text-white' : 'text-slate-900'}`}>

                        {flash?.success && (
                            <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {flash.success}
                            </div>
                        )}

                        {/* Welcome banner */}
                        <div className={`rounded-2xl p-5 mb-6 flex items-center justify-between overflow-hidden relative ${dark ? 'bg-indigo-900/40 border border-indigo-800/50' : 'bg-indigo-600'}`}>
                            <div className="relative z-10">
                                <p className={`text-xs font-semibold mb-1 ${dark ? 'text-indigo-300' : 'text-indigo-200'}`}>
                                    {now.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                                <h2 className="text-2xl font-bold text-white">
                                    Good day, {registrar.full_name.split(' ')[0]} 👋
                                </h2>
                                <p className={`text-sm mt-0.5 ${dark ? 'text-indigo-300' : 'text-indigo-200'}`}>
                                    Registrar · {registrar.role}
                                </p>
                            </div>
                            {(stats.pending_students > 0 || stats.pending_grades > 0) && (
                                <a href="/registrar/students"
                                    className="relative z-10 flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors backdrop-blur-sm border border-white/20">
                                    {stats.pending_students + stats.pending_grades} pending items →
                                </a>
                            )}
                            <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                            <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/3 pointer-events-none" />
                        </div>

                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                            {statCards.map(card => (
                                <div key={card.label}
                                    className={`rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${dark ? 'bg-slate-900 border-slate-800 hover:shadow-slate-900/50' : 'bg-white border-slate-200 hover:shadow-slate-200/80'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{card.label}</p>
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={card.icon} />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className={`text-3xl font-bold ${'urgent' in card && card.urgent ? 'text-amber-500' : dark ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
                                    <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{card.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* ── CHARTS ROW ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                            {/* 1. System Composition Donut */}
                            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>System Overview</p>
                                        <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Composition breakdown</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-indigo-900/40' : 'bg-indigo-50'}`}>
                                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                        </svg>
                                    </div>
                                </div>
                                <DonutChart segments={donutSegments} size={120} thickness={16} />
                            </div>

                            {/* 2. Grade Distribution Bar */}
                            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Grade Distribution</p>
                                        <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>From pending submissions</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-emerald-900/40' : 'bg-emerald-50'}`}>
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                {gradeBars.length === 0 ? (
                                    <div className="h-28 flex items-center justify-center">
                                        <p className="text-xs text-slate-400">No grade data yet</p>
                                    </div>
                                ) : (
                                    <BarChart bars={gradeBars} dark={dark} />
                                )}
                            </div>

                            {/* 3. Enrollment Funnel with Radial Progress */}
                            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Enrollment Funnel</p>
                                        <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Students → enrolled → graded</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-violet-900/40' : 'bg-violet-50'}`}>
                                        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {funnelItems.map((item, i) => {
                                        const pct = item.max === 0 ? 0 : Math.round((item.value / item.max) * 100);
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <RadialProgress
                                                        value={item.value}
                                                        max={item.max}
                                                        color={item.color}
                                                        size={44}
                                                        stroke={5}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[9px] font-black" style={{ color: item.color }}>{pct}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-xs font-semibold truncate ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</span>
                                                        <span className={`text-xs font-bold flex-shrink-0 ml-2 ${dark ? 'text-white' : 'text-slate-900'}`}>{item.value.toLocaleString()}</span>
                                                    </div>
                                                    <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                                        <div
                                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                                            style={{ width: `${pct}%`, background: item.color, transitionDelay: `${i * 150}ms` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ── Two panels (unchanged) ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                            {/* Pending Approvals */}
                            <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                                        <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Pending Approvals</span>
                                        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">{pending_students.length}</span>
                                    </div>
                                    <a href="/registrar/students" className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold">View all →</a>
                                </div>
                                {pending_students.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="text-4xl mb-3">✅</div>
                                        <p className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-400'}`}>No pending approvals</p>
                                    </div>
                                ) : (
                                    <div className={`divide-y ${dark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                                        {pending_students.slice(0, 5).map(student => (
                                            <div key={student.id} className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${dark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                                                    {initials(student.full_name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>{student.full_name}</p>
                                                    <p className={`text-xs truncate ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{student.student_id} · {YEAR_LABELS[student.year_level]}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button onClick={() => approve(student.id)}
                                                        className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors shadow-sm">
                                                        Approve
                                                    </button>
                                                    <a href="/registrar/students"
                                                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm ${dark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                                                        View
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                        {pending_students.length > 5 && (
                                            <div className={`px-5 py-3 text-center ${dark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                                <a href="/registrar/students" className="text-xs text-indigo-500 font-semibold">+{pending_students.length - 5} more</a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Grade Submissions */}
                            <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                        <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Grade Submissions</span>
                                        <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full">{pending_grades.length}</span>
                                    </div>
                                    <a href="/registrar/grades" className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold">View all →</a>
                                </div>
                                {pending_grades.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="text-4xl mb-3">✅</div>
                                        <p className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-400'}`}>All grades finalized</p>
                                    </div>
                                ) : (
                                    <div className={`divide-y ${dark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                                        {pending_grades.slice(0, 5).map(grade => (
                                            <div key={grade.id} className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${dark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                                                    {initials(grade.student_name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>
                                                        {grade.student_name}
                                                        <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-md ${dark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                            {grade.letter_grade}
                                                        </span>
                                                    </p>
                                                    <p className={`text-xs truncate ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
                                                        {grade.course_code} · {grade.section_name} · by {grade.faculty_name}
                                                    </p>
                                                </div>
                                                <button onClick={() => openReview(grade)}
                                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
                                                    Review
                                                </button>
                                            </div>
                                        ))}
                                        {pending_grades.length > 5 && (
                                            <div className={`px-5 py-3 text-center ${dark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                                <a href="/registrar/grades" className="text-xs text-indigo-500 font-semibold">+{pending_grades.length - 5} more</a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Enrollments', desc: 'Add or remove students', href: '/registrar/enrollments', icon: '📋' },
                                { label: 'Sections',    desc: 'Manage course sections',  href: '/registrar/sections',    icon: '🗂️' },
                                { label: 'Courses',     desc: 'Add subjects & details',  href: '/registrar/courses',     icon: '📚' },
                                { label: 'Faculty',     desc: 'View faculty accounts',   href: '/registrar/faculty',     icon: '👨‍🏫' },
                            ].map(link => (
                                <a key={link.label} href={link.href}
                                    className={`rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${dark ? 'bg-slate-900 border-slate-800 hover:shadow-slate-900/50' : 'bg-white border-slate-200 hover:shadow-slate-200/80'}`}>
                                    <div className="text-2xl mb-3">{link.icon}</div>
                                    <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{link.label}</p>
                                    <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{link.desc}</p>
                                </a>
                            ))}
                        </div>
                    </main>
                </div>
            </div>

            {/* Grade Review Modal (unchanged) */}
            {reviewGrade && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeReview} />
                    <div className={`relative rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ${dark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                        <div className={`flex items-center justify-between px-6 py-5 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div>
                                <h3 className={`text-base font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Review Grade Submission</h3>
                                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{reviewGrade.course_code} · {reviewGrade.section_name}</p>
                            </div>
                            <button onClick={closeReview} className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-5">
                            <div className={`flex items-center gap-4 p-4 rounded-xl ${dark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${dark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {initials(reviewGrade.student_name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{reviewGrade.student_name}</p>
                                    <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{reviewGrade.student_id}</p>
                                    <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{reviewGrade.course_name}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-2xl font-black ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>{reviewGrade.letter_grade}</p>
                                    <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-400'}`}>Score: {reviewGrade.score}</p>
                                    <p className={`text-xs capitalize ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{reviewGrade.remarks}</p>
                                </div>
                            </div>
                            <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
                                Submitted by <span className={`font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{reviewGrade.faculty_name}</span>
                            </p>
                            <div className={`flex rounded-xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                                <button onClick={() => setMode('finalize')} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === 'finalize' ? 'bg-emerald-500 text-white' : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>✅ Finalize As-Is</button>
                                <button onClick={() => setMode('override')} className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-l ${dark ? 'border-slate-700' : 'border-slate-200'} ${mode === 'override' ? 'bg-amber-500 text-white' : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>✏️ Override Grade</button>
                            </div>
                            {mode === 'override' && (
                                <div className={`space-y-3 p-4 rounded-xl ${dark ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-amber-400' : 'text-amber-700'}`}>Override Values</p>
                                        {overrideScore !== '' && (
                                            <span className={`text-sm font-black px-2 py-0.5 rounded-md ${dark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                                                → {letterFromScore(parseFloat(overrideScore))}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={`text-xs font-semibold block mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>New Score (0–100)</label>
                                        <input type="number" min={0} max={100} value={overrideScore} onChange={e => setOverrideScore(e.target.value)}
                                            className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'border border-slate-200'}`} placeholder="e.g. 88" />
                                    </div>
                                    <div>
                                        <label className={`text-xs font-semibold block mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Remarks</label>
                                        <select value={overrideRemarks} onChange={e => setOverrideRemarks(e.target.value)}
                                            className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 capitalize ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'border border-slate-200'}`}>
                                            {REMARKS_OPTIONS.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className={`text-xs font-semibold block mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Reason / Note <span className="text-rose-500">*</span></label>
                                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                                    placeholder={mode === 'finalize' ? 'e.g. Reviewed and confirmed accurate by registrar.' : 'e.g. Score corrected due to encoding error by faculty.'}
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'border border-slate-200'}`} />
                                {!reason.trim() && <p className="text-xs text-rose-400 mt-1">Reason is required for audit trail.</p>}
                            </div>
                        </div>
                        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${dark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                            <button onClick={closeReview} className={`px-4 py-2 text-sm font-semibold transition-colors ${dark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}>Cancel</button>
                            <button onClick={handleSubmit} disabled={submitting || !reason.trim() || (mode === 'override' && overrideScore === '')}
                                className={`px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'finalize' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
                                {submitting ? 'Saving…' : mode === 'finalize' ? 'Finalize Grade' : 'Override & Finalize'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}