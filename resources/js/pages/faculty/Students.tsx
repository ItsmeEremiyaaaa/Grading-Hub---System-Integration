import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Faculty {
    full_name: string;
    faculty_id: string;
    department: string;
    position: string;
}

interface GradeInfo {
    score: number;
    letter_grade: string;
    remarks: string;
    is_finalized: boolean;
}

interface Enrollment {
    enrollment_id: number;
    course_code: string;
    course_name: string;
    section_name: string;
    school_year: string;
    semester: string;
    section_status: string;
    grade: GradeInfo | null;
}

interface Student {
    id: number;
    student_id: string;
    full_name: string;
    email: string;
    course: string;
    year_level: string;
    enrollments: Enrollment[];
}

interface Props {
    faculty: Faculty;
    students: Student[];
}

function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const NAV_ITEMS = [
    { label: 'Dashboard',   href: '/faculty/dashboard',   active: false, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'My Sections', href: '/faculty/sections',    active: false, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Grades',      href: '/faculty/grades',      active: false, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Students',    href: '/faculty/students',    active: true,  icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
];

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
    'A':  { bg: 'bg-emerald-50',  text: 'text-emerald-700' },
    'B':  { bg: 'bg-indigo-50',   text: 'text-indigo-700'  },
    'C':  { bg: 'bg-amber-50',    text: 'text-amber-700'   },
    'D':  { bg: 'bg-orange-50',   text: 'text-orange-700'  },
    'F':  { bg: 'bg-red-50',      text: 'text-red-700'     },
    'INC':{ bg: 'bg-slate-100',   text: 'text-slate-500'   },
};

function gradeStyle(letter: string | undefined) {
    if (!letter) return { bg: 'bg-slate-100', text: 'text-slate-400' };
    const key = letter.charAt(0).toUpperCase();
    return GRADE_COLORS[key] ?? GRADE_COLORS[letter] ?? { bg: 'bg-slate-100', text: 'text-slate-400' };
}

export default function Students({ faculty, students }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
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

    const filtered = students.filter(s =>
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.student_id.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.course.toLowerCase().includes(search.toLowerCase())
    );

    const totalEnrollments = students.reduce((sum, s) => sum + s.enrollments.length, 0);
    const gradedCount      = students.reduce((sum, s) => sum + s.enrollments.filter(e => e.grade?.is_finalized).length, 0);
    const pendingCount     = students.reduce((sum, s) => sum + s.enrollments.filter(e => !e.grade?.is_finalized).length, 0);

    const statCards = [
        {
            label: 'Total Students',
            value: students.length,
            sub: 'Across your sections',
            gradient: 'from-indigo-500 to-indigo-600',
            urgent: false,
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        },
        {
            label: 'Total Enrollments',
            value: totalEnrollments,
            sub: 'Active course slots',
            gradient: 'from-emerald-500 to-teal-600',
            urgent: false,
            icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        },
        {
            label: 'Grades Finalized',
            value: gradedCount,
            sub: 'Submitted & locked',
            gradient: 'from-violet-500 to-purple-600',
            urgent: false,
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            label: 'Pending Grades',
            value: pendingCount,
            sub: pendingCount > 0 ? 'Needs attention' : 'All caught up!',
            gradient: 'from-amber-400 to-orange-500',
            urgent: pendingCount > 0,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        },
    ];

    return (
        <>
            <Head title={`Students | ${faculty.full_name} | GradeHub`} />
            <div className={`flex h-screen overflow-hidden font-sans ${dark ? 'bg-slate-950' : 'bg-slate-50'}`}>

                {/* ── Sidebar ── */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-[70px]'} transition-all duration-300 flex flex-col flex-shrink-0 border-r ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>

                    {/* Logo */}
                    <div className={`flex items-center gap-3 px-4 py-5 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/30">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                            </svg>
                        </div>
                        {sidebarOpen && (
                            <div>
                                <span className={`font-bold text-base tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>GradeHub</span>
                                <p className="text-xs text-slate-400 leading-none mt-0.5">Faculty Portal</p>
                            </div>
                        )}
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                        {sidebarOpen && <p className={`text-[10px] font-semibold uppercase tracking-widest px-3 mb-3 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Main Menu</p>}
                        {NAV_ITEMS.map(item => (
                            <a key={item.label} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                    item.active
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                                        : dark
                                            ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}>
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                                </svg>
                                {sidebarOpen && <span>{item.label}</span>}
                            </a>
                        ))}
                    </nav>

                    {/* User */}
                    <div className={`px-3 py-4 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${dark ? 'bg-slate-800' : 'bg-slate-50'} ${!sidebarOpen ? 'justify-center' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {initials(faculty.full_name)}
                            </div>
                            {sidebarOpen && (
                                <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>{faculty.full_name}</p>
                                    <p className="text-slate-400 text-xs truncate">{faculty.position}</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => router.post('/faculty/logout')}
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

                    {/* Header */}
                    <header className={`px-6 py-3.5 flex items-center justify-between flex-shrink-0 border-b ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(v => !v)}
                                className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <p className="text-xs text-slate-400">Pages / Students</p>
                                <h1 className={`text-base font-bold leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Students</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-xs ${dark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-48 bg-transparent outline-none placeholder-slate-400"
                                />
                            </div>

                            {/* Dark mode toggle */}
                            <button onClick={() => setDark(d => !d)}
                                className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                aria-label="Toggle dark mode">
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

                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {initials(faculty.full_name)}
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className={`flex-1 overflow-y-auto p-6 ${dark ? 'text-white' : 'text-slate-900'}`}>

                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                                    <p className={`text-3xl font-bold ${card.urgent ? 'text-amber-500' : dark ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
                                    <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{card.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Students Table */}
                        <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                                    All Students
                                    {search && (
                                        <span className="ml-2 text-xs font-normal text-slate-400">
                                            — {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
                                        </span>
                                    )}
                                </span>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                    {students.length} total
                                </span>
                            </div>

                            {filtered.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {search ? 'No students match your search.' : 'No students found.'}
                                    </p>
                                    {search && (
                                        <button onClick={() => setSearch('')} className="mt-2 text-xs text-indigo-500 hover:text-indigo-600 font-semibold">
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className={`border-b ${dark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                                {['Student', 'Email', 'Course', 'Year', 'Enrollments', 'Status', ''].map(h => (
                                                    <th key={h} className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${dark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                                            {filtered.map(student => {
                                                const finalized = student.enrollments.filter(e => e.grade?.is_finalized).length;
                                                const total     = student.enrollments.length;
                                                const allDone   = total > 0 && finalized === total;
                                                const isExpanded = expandedStudent === student.id;

                                                return (
                                                    <>
                                                        <tr key={student.id}
                                                            className={`transition-colors ${dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} ${isExpanded ? (dark ? 'bg-slate-800/30' : 'bg-indigo-50/40') : ''}`}>

                                                            {/* Student */}
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                        {initials(student.full_name)}
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-xs font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{student.full_name}</p>
                                                                        <p className="text-xs text-slate-400">{student.student_id}</p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Email */}
                                                            <td className={`px-4 py-3 text-xs ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{student.email}</td>

                                                            {/* Course */}
                                                            <td className={`px-4 py-3 text-xs font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{student.course}</td>

                                                            {/* Year */}
                                                            <td className={`px-4 py-3 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{student.year_level}</td>

                                                            {/* Enrollments count */}
                                                            <td className="px-4 py-3">
                                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                                    {total}
                                                                </span>
                                                            </td>

                                                            {/* Grade status */}
                                                            <td className="px-4 py-3">
                                                                {total === 0 ? (
                                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-400`}>
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                                        No sections
                                                                    </span>
                                                                ) : allDone ? (
                                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                        All graded
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                        {finalized}/{total} graded
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Expand button */}
                                                            <td className="px-4 py-3">
                                                                <button
                                                                    onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                                                                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-1.5 ${
                                                                        isExpanded
                                                                            ? dark ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
                                                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                                    }`}>
                                                                    {isExpanded ? 'Hide' : 'View'}
                                                                    <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>

                                                        {/* Expanded enrollment rows */}
                                                        {isExpanded && (
                                                            <tr key={`${student.id}-expanded`} className={dark ? 'bg-slate-800/20' : 'bg-slate-50/80'}>
                                                                <td colSpan={7} className="px-6 py-4">
                                                                    <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                        Enrollments
                                                                    </p>
                                                                    {student.enrollments.length === 0 ? (
                                                                        <p className="text-xs text-slate-400">No enrollments found.</p>
                                                                    ) : (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                                            {student.enrollments.map(en => {
                                                                                const gs = gradeStyle(en.grade?.letter_grade);
                                                                                return (
                                                                                    <div key={en.enrollment_id}
                                                                                        className={`rounded-xl p-3.5 border ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                                                            <div className="min-w-0">
                                                                                                <p className={`text-xs font-bold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>
                                                                                                    {en.course_code}
                                                                                                </p>
                                                                                                <p className="text-xs text-slate-400 truncate">{en.course_name}</p>
                                                                                            </div>
                                                                                            {en.grade ? (
                                                                                                <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg ${gs.bg} ${gs.text}`}>
                                                                                                    {en.grade.letter_grade}
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-lg ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                                                                                                    —
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className={`flex items-center justify-between text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                                            <span>{en.section_name} · {en.semester}</span>
                                                                                            <span>{en.school_year}</span>
                                                                                        </div>
                                                                                        {en.grade && (
                                                                                            <div className={`mt-2 pt-2 border-t flex items-center justify-between ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
                                                                                                <span className="text-xs text-slate-400">
                                                                                                    Score: <span className={`font-semibold ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{en.grade.score}</span>
                                                                                                </span>
                                                                                                <span className={`text-xs font-medium ${
                                                                                                    en.grade.is_finalized
                                                                                                        ? 'text-emerald-600'
                                                                                                        : 'text-amber-600'
                                                                                                }`}>
                                                                                                    {en.grade.is_finalized ? '✓ Finalized' : '⏳ Pending'}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}