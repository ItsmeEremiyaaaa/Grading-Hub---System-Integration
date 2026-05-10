import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Student {
    id: number;
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    course: string;
    year_level: string;
    status: string;
}

interface Enrollment {
    id: number;
    subject_code: string;
    subject_name: string;
    section: string;
    faculty_name: string;
    schedule: string;
    room: string;
    units: number;
    status: string;
}

interface Grade {
    id: number;
    subject_code: string;
    subject_name: string;
    section: string;
    faculty_name: string;
    letter_grade: string;
    units: number;
    status: string;
    semester: string;
    school_year: string;
}

interface Stats {
    total_units_enrolled: number;
    total_units_completed: number;
    gwa: number | null;
    pending_grades: number;
}

interface Props {
    student: Student;
    enrollments: Enrollment[];
    grades: Grade[];
    stats: Stats;
}

function initials(first: string, last: string) {
    return (first[0] + last[0]).toUpperCase();
}

function gradeColor(letter: string): string {
    if (letter.startsWith('1.')) return '#10b981';
    if (letter.startsWith('2.')) return '#3b82f6';
    if (letter.startsWith('3.')) return '#f59e0b';
    return '#ef4444';
}

function gradeBarWidth(letter: string): string {
    if (letter.startsWith('1.')) return '90%';
    if (letter.startsWith('2.')) return '70%';
    if (letter.startsWith('3.')) return '50%';
    return '30%';
}

const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

    .gh-root {
        font-family: 'DM Sans', sans-serif;
        min-height: 100vh;
        background: #eef2f3;
        display: flex;
        flex-direction: column;
    }

    /* ── SIDEBAR ── */
    .gh-sidebar {
        width: 240px;
        flex-shrink: 0;
        background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0; left: 0; bottom: 0;
        z-index: 40;
        transition: transform 0.3s cubic-bezier(.22,1,.36,1);
    }
    .gh-sidebar-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 22px 20px 18px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .gh-logo-icon {
        width: 36px; height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #10b981, #059669);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(16,185,129,0.4);
    }
    .gh-logo-text {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: 1.15rem;
        color: #fff;
        letter-spacing: -0.03em;
    }
    .gh-nav {
        flex: 1;
        padding: 16px 12px;
        overflow-y: auto;
    }
    .gh-nav-label {
        font-size: 0.62rem;
        font-weight: 700;
        color: rgba(255,255,255,0.3);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding: 0 10px;
        margin-bottom: 10px;
    }
    .gh-nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(255,255,255,0.45);
        text-decoration: none;
        transition: all 0.18s ease;
        margin-bottom: 2px;
        cursor: pointer;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
    }
    .gh-nav-item:hover {
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.85);
    }
    .gh-nav-item.active {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        box-shadow: 0 4px 16px rgba(16,185,129,0.35);
    }
    .gh-nav-item.active svg { opacity: 1; }
    .gh-nav-item svg { opacity: 0.6; flex-shrink: 0; }
    .gh-sidebar-footer {
        padding: 14px 12px;
        border-top: 1px solid rgba(255,255,255,0.07);
    }
    .gh-user-chip {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(255,255,255,0.05);
        margin-bottom: 6px;
    }
    .gh-user-avatar {
        width: 32px; height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #3b82f6);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Syne', sans-serif;
        font-size: 0.72rem; font-weight: 700;
        color: #fff; flex-shrink: 0;
    }
    .gh-user-name {
        font-size: 0.78rem;
        font-weight: 600;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .gh-user-id {
        font-size: 0.68rem;
        color: rgba(255,255,255,0.35);
    }
    .gh-signout {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 12px;
        border-radius: 10px;
        font-size: 0.78rem;
        font-weight: 500;
        color: rgba(255,255,255,0.35);
        background: none;
        border: none;
        cursor: pointer;
        transition: all 0.18s;
        text-align: left;
    }
    .gh-signout:hover {
        background: rgba(239,68,68,0.12);
        color: #f87171;
    }

    /* ── MAIN ── */
    .gh-main {
        margin-left: 240px;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    /* ── HERO HEADER ── */
    .gh-hero {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #134e4a 100%);
        padding: 32px 36px 40px;
        position: relative;
        overflow: hidden;
    }
    .gh-hero::before {
        content: '';
        position: absolute;
        top: -60px; right: -60px;
        width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
        pointer-events: none;
    }
    .gh-hero::after {
        content: '';
        position: absolute;
        bottom: -80px; left: 30%;
        width: 200px; height: 200px;
        background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
        pointer-events: none;
    }
    .gh-hero-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 28px;
        position: relative;
        z-index: 1;
    }
    .gh-breadcrumb {
        font-size: 0.72rem;
        color: rgba(255,255,255,0.35);
        margin-bottom: 6px;
        letter-spacing: 0.04em;
    }
    .gh-greeting {
        font-family: 'Syne', sans-serif;
        font-size: 2rem;
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.04em;
        line-height: 1.1;
    }
    .gh-greeting-sub {
        font-size: 0.88rem;
        color: rgba(255,255,255,0.45);
        margin-top: 4px;
    }
    .gh-pending-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(245,158,11,0.15);
        border: 1px solid rgba(245,158,11,0.3);
        color: #fbbf24;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 20px;
        white-space: nowrap;
    }
    .gh-pending-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #f59e0b;
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
    }

    /* ── STAT CARDS IN HERO ── */
    .gh-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        position: relative;
        z-index: 1;
    }
    .gh-stat-card {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 16px 18px;
        backdrop-filter: blur(10px);
        transition: background 0.2s, transform 0.2s;
    }
    .gh-stat-card:hover {
        background: rgba(255,255,255,0.1);
        transform: translateY(-2px);
    }
    .gh-stat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }
    .gh-stat-label {
        font-size: 0.72rem;
        font-weight: 600;
        color: rgba(255,255,255,0.4);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }
    .gh-stat-icon {
        width: 32px; height: 32px;
        border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
    }
    .gh-stat-value {
        font-family: 'Syne', sans-serif;
        font-size: 2rem;
        font-weight: 800;
        color: #fff;
        line-height: 1;
        margin-bottom: 4px;
    }
    .gh-stat-value.urgent { color: #fbbf24; }
    .gh-stat-sub {
        font-size: 0.7rem;
        color: rgba(255,255,255,0.3);
    }

    /* ── CONTENT AREA ── */
    .gh-content {
        padding: 28px 36px;
        flex: 1;
    }
    .gh-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    /* ── CARDS ── */
    .gh-card {
        background: #fff;
        border-radius: 20px;
        border: 1px solid #e8edf5;
        box-shadow: 0 2px 16px rgba(15,23,42,0.06);
        overflow: hidden;
    }
    .gh-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 22px;
        border-bottom: 1px solid #f1f5f9;
    }
    .gh-card-title {
        font-family: 'Syne', sans-serif;
        font-size: 0.95rem;
        font-weight: 700;
        color: #0f172a;
    }
    .gh-view-all {
        font-size: 0.75rem;
        font-weight: 600;
        color: #10b981;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 3px;
        transition: opacity 0.2s;
    }
    .gh-view-all:hover { opacity: 0.7; }

    /* ── TABLE ── */
    .gh-table {
        width: 100%;
        border-collapse: collapse;
    }
    .gh-table thead tr {
        background: #f8fafc;
        border-bottom: 1px solid #f1f5f9;
    }
    .gh-table th {
        text-align: left;
        padding: 10px 22px;
        font-size: 0.68rem;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.07em;
    }
    .gh-table td {
        padding: 12px 22px;
        border-bottom: 1px solid #f8fafc;
        vertical-align: middle;
    }
    .gh-table tbody tr:last-child td { border-bottom: none; }
    .gh-table tbody tr:hover { background: #fafbff; }
    .gh-subject-code {
        font-size: 0.78rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 2px;
    }
    .gh-subject-name {
        font-size: 0.7rem;
        color: #94a3b8;
    }
    .gh-schedule {
        font-size: 0.75rem;
        color: #64748b;
    }
    .gh-units {
        font-family: 'Syne', sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
        color: #0f172a;
        text-align: center;
    }
    .gh-grade-val {
        font-family: 'Syne', sans-serif;
        font-size: 1.1rem;
        font-weight: 800;
    }
    .gh-status-badge {
        display: inline-block;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 20px;
        text-transform: capitalize;
    }
    .gh-status-finalized {
        background: #ecfdf5;
        color: #10b981;
        border: 1px solid #a7f3d0;
    }
    .gh-status-pending {
        background: #fffbeb;
        color: #f59e0b;
        border: 1px solid #fde68a;
    }

    /* grade bar */
    .gh-grade-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .gh-grade-bar-wrap {
        flex: 1;
        height: 5px;
        background: #f1f5f9;
        border-radius: 10px;
        overflow: hidden;
    }
    .gh-grade-bar {
        height: 100%;
        border-radius: 10px;
        transition: width 0.8s cubic-bezier(.22,1,.36,1);
    }

    /* empty state */
    .gh-empty {
        padding: 48px 24px;
        text-align: center;
        color: #94a3b8;
        font-size: 0.85rem;
    }
    .gh-empty-icon {
        font-size: 2rem;
        margin-bottom: 8px;
        opacity: 0.4;
    }

    /* ── MOBILE TOPBAR ── */
    .gh-mobile-header {
        display: none;
        background: linear-gradient(135deg, #0f172a, #1e293b);
        padding: 14px 18px;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 30;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .gh-menu-btn {
        width: 36px; height: 36px;
        border-radius: 10px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: rgba(255,255,255,0.75);
    }
    .gh-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.55);
        z-index: 39;
        backdrop-filter: blur(2px);
    }

    @media (max-width: 1024px) {
        .gh-main { margin-left: 0; }
        .gh-sidebar {
            transform: translateX(-100%);
        }
        .gh-sidebar.open { transform: translateX(0); }
        .gh-mobile-header { display: flex; }
        .gh-hero { padding: 24px 20px 32px; }
        .gh-stats { grid-template-columns: repeat(2, 1fr); }
        .gh-content { padding: 20px; }
        .gh-grid { grid-template-columns: 1fr; }
        .gh-greeting { font-size: 1.5rem; }
    }
`;

export default function Dashboard({ student, enrollments, grades, stats }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const activeEnrollments = enrollments.filter((e: Enrollment) => e.status === 'enrolled');

    const navItems = [
        {
            label: 'Dashboard', href: '/student/dashboard', active: true,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        },
        {
            label: 'Grades', href: '/student/grades', active: false,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        },
        {
            label: 'Transcript', href: '/student/transcript', active: false,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        },
    ];

    const statCards = [
        {
            label: 'Enrolled', value: stats.total_units_enrolled, sub: 'Current units', urgent: false,
            color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        },
        {
            label: 'Completed', value: stats.total_units_completed, sub: 'Finalized units', urgent: false,
            color: '#10b981', bg: 'rgba(16,185,129,0.15)',
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            label: 'GWA', value: stats.gwa ?? '—', sub: 'Weighted average', urgent: false,
            color: '#a78bfa', bg: 'rgba(167,139,250,0.15)',
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
        },
        {
            label: 'Pending', value: stats.pending_grades, sub: stats.pending_grades > 0 ? 'Awaiting grades' : 'All graded!', urgent: stats.pending_grades > 0,
            color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
    ];

    return (
        <>
            <Head title={`Dashboard | ${student.first_name} ${student.last_name} | GradeHub`} />
            <style>{styles}</style>

            {/* Sidebar overlay (mobile) */}
            {sidebarOpen && <div className="gh-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`gh-sidebar${sidebarOpen ? ' open' : ''}`}>
                <div className="gh-sidebar-logo">
                    <div className="gh-logo-icon">
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#fff' }}>
                            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                        </svg>
                    </div>
                    <span className="gh-logo-text">GradeHub</span>
                </div>

                <nav className="gh-nav">
                    <p className="gh-nav-label">Student Menu</p>
                    {navItems.map(item => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`gh-nav-item${item.active ? ' active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className="gh-sidebar-footer">
                    <div className="gh-user-chip">
                        <div className="gh-user-avatar">{initials(student.first_name, student.last_name)}</div>
                        <div style={{ minWidth: 0 }}>
                            <div className="gh-user-name">{student.first_name} {student.last_name}</div>
                            <div className="gh-user-id">{student.student_id}</div>
                        </div>
                    </div>
                    <button className="gh-signout" onClick={() => router.post('/student/logout')}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="gh-main">

                {/* Mobile top bar */}
                <header className="gh-mobile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="gh-logo-icon" style={{ width: 30, height: 30, borderRadius: 8 }}>
                            <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" /></svg>
                        </div>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fff', fontSize: '1rem' }}>GradeHub</span>
                    </div>
                    <button className="gh-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                {/* Hero */}
                <section className="gh-hero">
                    <div className="gh-hero-top">
                        <div>
                            <p className="gh-breadcrumb">Pages / Dashboard</p>
                            <h1 className="gh-greeting">Welcome back, {student.first_name}! 👋</h1>
                            <p className="gh-greeting-sub">{student.course} · {student.year_level} · {student.student_id}</p>
                        </div>
                        {stats.pending_grades > 0 && (
                            <div className="gh-pending-badge">
                                <span className="gh-pending-dot" />
                                {stats.pending_grades} grade{stats.pending_grades > 1 ? 's' : ''} pending
                            </div>
                        )}
                    </div>

                    <div className="gh-stats">
                        {statCards.map(card => (
                            <div className="gh-stat-card" key={card.label}>
                                <div className="gh-stat-header">
                                    <span className="gh-stat-label">{card.label}</span>
                                    <div className="gh-stat-icon" style={{ background: card.bg }}>
                                        <span style={{ color: card.color }}>{card.icon}</span>
                                    </div>
                                </div>
                                <p className={`gh-stat-value${card.urgent ? ' urgent' : ''}`}>{card.value}</p>
                                <p className="gh-stat-sub">{card.sub}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Content */}
                <main className="gh-content">
                    <div className="gh-grid">

                        {/* Current Enrollments */}
                        <div className="gh-card">
                            <div className="gh-card-header">
                                <span className="gh-card-title">Current Enrollments</span>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: '#f8fafc', padding: '3px 10px', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                                    {activeEnrollments.length} subject{activeEnrollments.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {activeEnrollments.length === 0 ? (
                                <div className="gh-empty">
                                    <div className="gh-empty-icon">📚</div>
                                    No active enrollments yet.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="gh-table">
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Schedule</th>
                                                <th style={{ textAlign: 'center' }}>Units</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeEnrollments.map((e: Enrollment) => (
                                                <tr key={e.id}>
                                                    <td>
                                                        <div className="gh-subject-code">{e.subject_code}</div>
                                                        <div className="gh-subject-name">{e.subject_name}</div>
                                                    </td>
                                                    <td>
                                                        <div className="gh-schedule">{e.schedule}</div>
                                                        {e.room && <div style={{ fontSize: '0.67rem', color: '#cbd5e1', marginTop: 1 }}>{e.room}</div>}
                                                    </td>
                                                    <td><div className="gh-units">{e.units}</div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Recent Grades */}
                        <div className="gh-card">
                            <div className="gh-card-header">
                                <span className="gh-card-title">Recent Grades</span>
                                <a href="/student/grades" className="gh-view-all">
                                    View all
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                            {grades.length === 0 ? (
                                <div className="gh-empty">
                                    <div className="gh-empty-icon">📊</div>
                                    No grades available yet.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="gh-table">
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Grade</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {grades.slice(0, 5).map((g: Grade) => (
                                                <tr key={g.id}>
                                                    <td>
                                                        <div className="gh-subject-code">{g.subject_code}</div>
                                                        <div className="gh-subject-name">{g.subject_name}</div>
                                                    </td>
                                                    <td>
                                                        <div className="gh-grade-row">
                                                            <span className="gh-grade-val" style={{ color: gradeColor(g.letter_grade) }}>
                                                                {g.letter_grade}
                                                            </span>
                                                            <div className="gh-grade-bar-wrap">
                                                                <div
                                                                    className="gh-grade-bar"
                                                                    style={{
                                                                        width: gradeBarWidth(g.letter_grade),
                                                                        background: gradeColor(g.letter_grade),
                                                                        opacity: 0.6,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`gh-status-badge ${g.status === 'finalized' ? 'gh-status-finalized' : 'gh-status-pending'}`}>
                                                            {g.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}