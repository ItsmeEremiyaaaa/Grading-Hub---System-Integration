import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Section {
    id: number;
    course_code: string;
    course_name: string;
    section_name: string;
    school_year: string;
    semester: string;
    status: string;
    total_students: number;
    graded_students: number;
    pending_grades: number;
}

interface Stats {
    total_sections: number;
    total_students: number;
    pending_grades: number;
    grading_open: number;
}

interface Faculty {
    full_name: string;
    faculty_id: string;
    department: string;
    position: string;
}

interface Props {
    faculty: Faculty;
    sections: Section[];
    stats: Stats;
}

function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const NAV_ITEMS = [
    { label: 'Dashboard',   href: '/faculty/dashboard',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'My Sections', href: '/faculty/sections',    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', active: true },
    { label: 'Grades',      href: '/faculty/grades',      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Students',    href: '/faculty/students',    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    grading: { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Grading' },
    pending: { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Pending'  },
    closed:  { bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400',    label: 'Closed'   },
    open:    { bg: 'bg-indigo-50',   text: 'text-indigo-700',  dot: 'bg-indigo-500',  label: 'Open'     },
    done:    { bg: 'bg-teal-50',     text: 'text-teal-700',    dot: 'bg-teal-500',    label: 'Done'     },
};

export default function MySections({ faculty, sections, stats }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
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

    const filtered = sections.filter(s => {
        const matchSearch =
            s.course_code.toLowerCase().includes(search.toLowerCase()) ||
            s.course_name.toLowerCase().includes(search.toLowerCase()) ||
            s.section_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const statCards = [
        { label: 'Total Sections',    value: stats.total_sections, sub: `${stats.grading_open} open`, gradient: 'from-indigo-500 to-indigo-600', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { label: 'Total Students',    value: stats.total_students, sub: 'Across all sections', gradient: 'from-emerald-500 to-teal-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { label: 'Pending Grades',    value: stats.pending_grades, sub: stats.pending_grades > 0 ? 'Needs attention' : 'All caught up!', gradient: 'from-amber-400 to-orange-500', urgent: stats.pending_grades > 0, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { label: 'Open for Grading',  value: stats.grading_open,  sub: 'Active grading periods', gradient: 'from-violet-500 to-purple-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    return (
        <>
            <Head title={`My Sections | ${faculty.full_name} | GradeHub`} />

            <div className={`flex h-screen overflow-hidden font-sans ${dark ? 'bg-slate-950' : 'bg-slate-50'}`}>

                {/* Sidebar */}
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
                                <p className="text-xs text-slate-400 leading-none mt-0.5">Faculty Portal</p>
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                        {sidebarOpen && <p className={`text-[10px] font-semibold uppercase tracking-widest px-3 mb-3 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Main Menu</p>}
                        {NAV_ITEMS.map(item => (
                            <a key={item.label} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                    item.active
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                                        : dark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
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
                                {initials(faculty.full_name)}
                            </div>
                            {sidebarOpen && (
                                <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>{faculty.full_name}</p>
                                    <p className="text-slate-400 text-xs truncate">{faculty.position}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => router.post('/faculty/logout')}
                            className={`mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {sidebarOpen && 'Sign Out'}
                        </button>
                    </div>
                </aside>

                {/* Main */}
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
                                <p className="text-xs text-slate-400">Pages / My Sections</p>
                                <h1 className={`text-base font-bold leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>My Sections</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setDark(d => !d)}
                                className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                {dark ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                )}
                            </button>
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {initials(faculty.full_name)}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6">
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {statCards.map(card => (
                                <div key={card.label} className={`rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
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

                        {/* Search & Filter */}
                        <div className="flex gap-3 mb-4">
                            <div className={`flex-1 flex items-center gap-2 h-10 border rounded-xl px-4 ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input type="text" placeholder="Search sections..." value={search} onChange={e => setSearch(e.target.value)}
                                    className={`flex-1 text-sm bg-transparent focus:outline-none ${dark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`} />
                            </div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className={`h-10 border rounded-xl px-4 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 ${dark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                                <option value="all">All statuses</option>
                                <option value="open">Open</option>
                                <option value="grading">Grading</option>
                                <option value="pending">Pending</option>
                                <option value="closed">Closed</option>
                                <option value="done">Done</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>All Sections</span>
                                <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                            </div>

                            {filtered.length === 0 ? (
                                <div className="py-14 text-center">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-400'}`}>No sections found.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className={`border-b ${dark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                                {['Course', 'Section', 'Semester', 'Students', 'Progress', 'Status', ''].map(h => (
                                                    <th key={h} className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${dark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                                            {filtered.map(section => {
                                                const pct = section.total_students === 0 ? 0 : Math.round((section.graded_students / section.total_students) * 100);
                                                const barColor = pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : pct > 0 ? 'bg-amber-500' : dark ? 'bg-slate-700' : 'bg-slate-200';
                                                const st = STATUS_STYLES[section.status] ?? { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: section.status };
                                                return (
                                                    <tr key={section.id} className={`transition-colors ${dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                        <td className="px-4 py-3">
                                                            <p className={`text-xs font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{section.course_code}</p>
                                                            <p className="text-xs text-slate-400 truncate max-w-[140px]">{section.course_name}</p>
                                                        </td>
                                                        <td className={`px-4 py-3 text-xs font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{section.section_name}</td>
                                                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{section.semester} · {section.school_year}</td>
                                                        <td className={`px-4 py-3 text-xs text-center font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{section.total_students}</td>
                                                        <td className="px-4 py-3 min-w-[130px]">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                                                    <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                                                </div>
                                                                <span className="text-xs text-slate-400 whitespace-nowrap">{section.graded_students}/{section.total_students}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                                                                {st.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <a href={`/faculty/sections/${section.id}`}
                                                                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm whitespace-nowrap ${
                                                                    section.status === 'grading'
                                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                                        : dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                                }`}>
                                                                {section.status === 'grading' ? 'Grade →' : 'View'}
                                                            </a>
                                                        </td>
                                                    </tr>
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