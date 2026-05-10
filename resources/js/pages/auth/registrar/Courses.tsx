import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Course {
    id: number;
    code: string;
    name: string;
    description: string;
    units: number;
    department: string;
    status: string;
    sections_count: number;
}

interface Props {
    courses: Course[];
    flash?: { success?: string };
    registrar?: { full_name: string; role: string };
}

const NAV_ITEMS = [
    { label: 'Dashboard',   href: '/registrar/dashboard',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Students',    href: '/registrar/students',    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Faculty',     href: '/registrar/faculty',     icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Courses',     href: '/registrar/courses',     icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', active: true },
    { label: 'Sections',    href: '/registrar/sections',    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Enrollments', href: '/registrar/enrollments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Grades',      href: '/registrar/grades',      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Courses({ courses, flash, registrar }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dark, setDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('gradehub-theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [form, setForm] = useState({
        code: '', name: '', description: '', units: '3', department: '', status: 'active',
    });
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('gradehub-theme', dark ? 'dark' : 'light');
    }, [dark]);

    const handleSubmit = (e: React.FormEvent, type: 'add' | 'edit') => {
        e.preventDefault();
        if (!form.code.trim() || !form.name.trim()) return;
        setSubmitting(true);
        if (type === 'add') {
            router.post('/registrar/courses', form, {
                onSuccess: () => { setShowAddModal(false); resetForm(); setSubmitting(false); },
                onFinish: () => setSubmitting(false),
                preserveState: true,
            });
        } else if (editingCourse) {
            router.put(`/registrar/courses/${editingCourse.id}`, form, {
                onSuccess: () => { setEditingCourse(null); resetForm(); setSubmitting(false); },
                onFinish: () => setSubmitting(false),
                preserveState: true,
            });
        }
    };

    const deleteCourse = (id: number) => {
        if (confirm('Delete this course? This cannot be undone.')) {
            router.delete(`/registrar/courses/${id}`, { preserveState: true });
        }
    };

    const resetForm = () => {
        setForm({ code: '', name: '', description: '', units: '3', department: '', status: 'active' });
    };

    const openEdit = (c: Course) => {
        setEditingCourse(c);
        setForm({
            code: c.code,
            name: c.name,
            description: c.description || '',
            units: String(c.units),
            department: c.department || '',
            status: c.status,
        });
    };

    // Filter courses based on search term
    const filteredCourses = courses.filter(course =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.department && course.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // ── Department stats for donut chart ──
    const deptMap = new Map<string, number>();
    courses.forEach(c => {
        const dept = c.department || 'General';
        deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    const deptSegments = Array.from(deptMap.entries()).map(([label, value], i) => ({
        label,
        value,
        color: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][i % 6],
    }));

    // ── Unit distribution bar ──
    const unitMap = new Map<number, number>();
    courses.forEach(c => {
        unitMap.set(c.units, (unitMap.get(c.units) || 0) + 1);
    });
    const unitBars = Array.from(unitMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([label, value]) => ({ label: `${label}`, value, color: '#6366f1' }));

    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.status === 'active').length;
    const totalSections = courses.reduce((sum, c) => sum + (c.sections_count || 0), 0);
    const avgUnitsPerCourse = (courses.reduce((sum, c) => sum + c.units, 0) / totalCourses || 0).toFixed(1);

    const funnelItems = [
        { label: 'Total Courses', value: totalCourses, color: '#6366f1', max: totalCourses || 1 },
        { label: 'Active Courses', value: activeCourses, color: '#10b981', max: totalCourses || 1 },
        { label: 'Total Sections', value: totalSections, color: '#f59e0b', max: Math.max(totalSections, totalCourses) || 1 },
    ];

    // ── Donut Chart ─────────────────────────────────────────────────────────
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
            const pct = seg.value / total;
            const dash = animated ? circ * pct : 0;
            const gap = circ - dash;
            const offset = circ * (1 - cumulative);
            cumulative += pct;
            return { ...seg, dash, gap, offset, i };
        });

        return (
            <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-800 dark:text-white leading-none">
                            {hovered !== null ? segments[hovered].value : total}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                            {hovered !== null ? segments[hovered].label : 'Courses'}
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

    // ── Bar Chart ───────────────────────────────────────────────────────────
    function BarChart({ bars }: { bars: { label: string; value: number; color: string }[]; dark: boolean }) {
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

    // ── Radial Progress ─────────────────────────────────────────────────────
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

    const defaultRegistrar = registrar || { full_name: 'Registrar', role: 'registrar' };
    const now = new Date();

    return (
        <>
            <Head title={`Courses | ${defaultRegistrar.full_name} | GradeHub`} />

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
                                {initials(defaultRegistrar.full_name)}
                            </div>
                            {sidebarOpen && (
                                <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>{defaultRegistrar.full_name}</p>
                                    <p className="text-slate-400 text-xs truncate capitalize">{defaultRegistrar.role}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => router.post('/registrar/logout')}
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
                                <p className="text-xs text-slate-400">Pages / Courses</p>
                                <h1 className={`text-base font-bold leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Courses</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
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
                            <button onClick={() => { resetForm(); setShowAddModal(true); }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                                + Add Course
                            </button>
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {initials(defaultRegistrar.full_name)}
                            </div>
                        </div>
                    </header>

                    <main className={`flex-1 overflow-y-auto p-6 ${dark ? 'text-white' : 'text-slate-900'}`}>
                        {flash?.success && (
                            <div className="mb-5 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
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
                                    Course Management, {defaultRegistrar.full_name.split(' ')[0]} 📚
                                </h2>
                                <p className={`text-sm mt-0.5 ${dark ? 'text-indigo-300' : 'text-indigo-200'}`}>
                                    Manage subjects, departments, and course offerings
                                </p>
                            </div>
                            <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                            <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/3 pointer-events-none" />
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Total Courses', value: totalCourses, sub: 'active offerings', gradient: 'from-indigo-500 to-indigo-600', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                                { label: 'Active Courses', value: activeCourses, sub: `${((activeCourses/totalCourses)*100 || 0).toFixed(0)}% of total`, gradient: 'from-emerald-500 to-teal-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { label: 'Total Sections', value: totalSections, sub: 'across all courses', gradient: 'from-amber-400 to-orange-500', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                                { label: 'Avg. Units', value: avgUnitsPerCourse, sub: 'per course', gradient: 'from-violet-500 to-purple-600', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
                            ].map(card => (
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
                                    <p className={`text-3xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
                                    <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{card.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                            {/* Department Distribution Donut */}
                            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>By Department</p>
                                        <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Course distribution</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-indigo-900/40' : 'bg-indigo-50'}`}>
                                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                </div>
                                {deptSegments.length === 0 ? (
                                    <div className="h-32 flex items-center justify-center">
                                        <p className="text-xs text-slate-400">No department data</p>
                                    </div>
                                ) : (
                                    <DonutChart segments={deptSegments} size={120} thickness={16} />
                                )}
                            </div>

                            {/* Unit Distribution Bar */}
                            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Unit Distribution</p>
                                        <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Courses by credit units</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-emerald-900/40' : 'bg-emerald-50'}`}>
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                {unitBars.length === 0 ? (
                                    <div className="h-28 flex items-center justify-center">
                                        <p className="text-xs text-slate-400">No unit data</p>
                                    </div>
                                ) : (
                                    <BarChart bars={unitBars} dark={dark} />
                                )}
                            </div>

                            {/* Course Funnel */}
                            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Course Funnel</p>
                                        <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Total → Active → Sections</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-amber-900/40' : 'bg-amber-50'}`}>
                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                        {/* Courses Table */}
                        <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`px-5 py-4 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                        <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Course Catalog</span>
                                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-semibold px-2 py-0.5 rounded-full">{courses.length}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Search courses..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className={`text-xs px-3 py-1.5 rounded-lg border ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-indigo-400`} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className={`border-b ${dark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                                            {['Code', 'Name', 'Units', 'Department', 'Sections', 'Status', 'Actions'].map(h => (
                                                <th key={h} className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${dark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {filteredCourses.map(course => (
                                            <tr key={course.id} className={`transition-colors ${dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                <td className="px-4 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{course.code}</td>
                                                <td className={`px-4 py-3 font-medium ${dark ? 'text-white' : 'text-slate-900'}`}>{course.name}</td>
                                                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 text-center">{course.units}</td>
                                                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{course.department || '—'}</td>
                                                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 text-center">{course.sections_count || 0}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                        course.status === 'active' 
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' 
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                    }`}>{course.status}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1.5">
                                                        <button onClick={() => openEdit(course)}
                                                            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${dark ? 'border border-slate-700 text-slate-300 hover:bg-slate-800' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                                            Edit
                                                        </button>
                                                        <button onClick={() => deleteCourse(course.id)}
                                                            className="text-xs px-2.5 py-1 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-semibold transition-colors">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredCourses.length === 0 && (
                                <div className="py-12 text-center">
                                    <div className="text-4xl mb-3">📚</div>
                                    <p className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
                                        {searchTerm ? 'No courses match your search' : 'No courses added yet'}
                                    </p>
                                    {!searchTerm && (
                                        <button onClick={() => { resetForm(); setShowAddModal(true); }}
                                            className="mt-3 text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold">
                                            Add your first course
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingCourse) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditingCourse(null); resetForm(); }} />
                    <div className={`relative rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ${dark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                        <div className={`flex items-center justify-between px-6 py-5 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div>
                                <h3 className={`text-base font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                                    {editingCourse ? 'Edit Course' : 'Add Course'}
                                </h3>
                                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
                                    {editingCourse ? 'Update course details' : 'Create a new course offering'}
                                </p>
                            </div>
                            <button onClick={() => { setShowAddModal(false); setEditingCourse(null); resetForm(); }}
                                className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={(e) => handleSubmit(e, editingCourse ? 'edit' : 'add')} className="px-6 py-5 space-y-4">
                            <div>
                                <label className={`text-xs font-semibold block mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Course Code</label>
                                <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} disabled={!!editingCourse}
                                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'border border-slate-200'}`}
                                    placeholder="e.g. CS101" />
                            </div>
                            <div>
                                <label className={`text-xs font-semibold block mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Course Name</label>
                                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'border border-slate-200'}`}
                                    placeholder="e.g. Introduction to Programming" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`text-xs font-semibold block mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Units</label>
                                    <select value={form.units} onChange={e => setForm({...form, units: e.target.value})}
                                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'border border-slate-200'}`}>
                                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={`text-xs font-semibold block mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Department</label>
                                    <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'border border-slate-200'}`}
                                        placeholder="e.g. Computer Science" />
                                </div>
                            </div>
                            <div>
                                <label className={`text-xs font-semibold block mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Description</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'border border-slate-200'}`}
                                    placeholder="Brief description of the course..." />
                            </div>
                            {editingCourse && (
                                <div>
                                    <label className={`text-xs font-semibold block mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Status</label>
                                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'border border-slate-200'}`}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setShowAddModal(false); setEditingCourse(null); resetForm(); }}
                                    className={`px-4 py-2 text-sm font-semibold transition-colors ${dark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                    {submitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}