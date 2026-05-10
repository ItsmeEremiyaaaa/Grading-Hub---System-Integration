import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface StudentInfo {
    full_name: string;
    student_id: string;
    course: string;
    year_level: string;
    email: string;
}

interface CourseRecord {
    code: string;
    name: string;
    units: number;
    letter_grade: string;
    gpa_equivalent: number;
    remarks: string;
}

interface SemesterRecord {
    period: string;
    courses: CourseRecord[];
    semester_gpa: number;
    total_units: number;
}

interface Props {
    student: StudentInfo;
    records: SemesterRecord[];
    cumulative_gpa: number | null;
}

function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function gradeHex(letter: string): string {
    if (letter.startsWith('1.')) return '#10b981';
    if (letter.startsWith('2.')) return '#3b82f6';
    if (letter.startsWith('3.')) return '#f59e0b';
    return '#ef4444';
}

function gpaBarWidth(gpa: number): string {
    // GPA scale typically 1.0–5.0; 1.0 = best → map to 100%→20%
    const clamped = Math.min(5, Math.max(1, gpa));
    const pct = ((5 - clamped) / 4) * 80 + 20;
    return `${pct}%`;
}

function gpaBarColor(gpa: number): string {
    if (gpa <= 1.5) return 'linear-gradient(90deg,#10b981,#34d399)';
    if (gpa <= 2.5) return 'linear-gradient(90deg,#3b82f6,#60a5fa)';
    if (gpa <= 3.5) return 'linear-gradient(90deg,#f59e0b,#fbbf24)';
    return 'linear-gradient(90deg,#ef4444,#f87171)';
}

const NAV_ITEMS = [
    { label: 'Dashboard',  href: '/student/dashboard',  active: false, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Grades',     href: '/student/grades',     active: false, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Transcript', href: '/student/transcript', active: true,  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

.gh-tr-root *, .gh-tr-root *::before, .gh-tr-root *::after { box-sizing: border-box; }
.gh-tr-root {
    font-family: 'DM Sans', sans-serif;
    display: flex; height: 100vh; background: #eef2f3; overflow: hidden;
}

/* SIDEBAR (shared pattern) */
.gh-sidebar {
    width: 240px; flex-shrink: 0;
    background: linear-gradient(180deg,#0f172a 0%,#1e293b 100%);
    display: flex; flex-direction: column;
    transition: width 0.3s cubic-bezier(.22,1,.36,1); overflow: hidden;
}
.gh-sidebar.collapsed { width: 72px; }
.gh-sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 22px 18px 18px; border-bottom: 1px solid rgba(255,255,255,0.07);
    white-space: nowrap; overflow: hidden;
}
.gh-logo-icon {
    width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px;
    background: linear-gradient(135deg,#10b981,#059669);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(16,185,129,0.4);
}
.gh-logo-text {
    font-family: 'Syne',sans-serif; font-weight: 800;
    font-size: 1.1rem; color: #fff; letter-spacing: -0.03em; transition: opacity 0.2s;
}
.gh-sidebar.collapsed .gh-logo-text { opacity: 0; width: 0; }
.gh-nav { flex: 1; padding: 14px 10px; overflow-y: auto; }
.gh-nav-label {
    font-size: 0.6rem; font-weight: 700; color: rgba(255,255,255,0.28);
    text-transform: uppercase; letter-spacing: 0.1em;
    padding: 0 10px; margin-bottom: 8px; white-space: nowrap; overflow: hidden;
    transition: opacity 0.2s;
}
.gh-sidebar.collapsed .gh-nav-label { opacity: 0; }
.gh-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 12px;
    font-size: 0.85rem; font-weight: 500;
    color: rgba(255,255,255,0.45); text-decoration: none;
    transition: all 0.18s; margin-bottom: 2px;
    white-space: nowrap; overflow: hidden;
}
.gh-nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
.gh-nav-item.active {
    background: linear-gradient(135deg,#10b981,#059669);
    color: #fff; box-shadow: 0 4px 16px rgba(16,185,129,0.35);
}
.gh-nav-item svg { flex-shrink: 0; }
.gh-nav-item span { transition: opacity 0.2s; }
.gh-sidebar.collapsed .gh-nav-item span { opacity: 0; width: 0; }
.gh-sidebar.collapsed .gh-nav-item { justify-content: center; padding: 10px; }
.gh-sidebar-footer { padding: 12px 10px; border-top: 1px solid rgba(255,255,255,0.07); }
.gh-user-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 12px;
    background: rgba(255,255,255,0.05); margin-bottom: 6px; overflow: hidden;
}
.gh-sidebar.collapsed .gh-user-chip { justify-content: center; padding: 10px; }
.gh-avatar {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg,#10b981,#3b82f6);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne',sans-serif; font-size: 0.7rem; font-weight: 700; color: #fff;
}
.gh-user-info { min-width: 0; transition: opacity 0.2s; }
.gh-sidebar.collapsed .gh-user-info { opacity: 0; width: 0; }
.gh-user-name { font-size: 0.75rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gh-user-id   { font-size: 0.67rem; color: rgba(255,255,255,0.35); }
.gh-signout {
    display: flex; align-items: center; gap: 8px; width: 100%;
    padding: 8px 12px; border-radius: 10px;
    font-size: 0.75rem; font-weight: 500;
    color: rgba(255,255,255,0.35); background: none; border: none;
    cursor: pointer; transition: all 0.18s; text-align: left;
}
.gh-signout:hover { background: rgba(239,68,68,0.12); color: #f87171; }
.gh-sidebar.collapsed .gh-signout { justify-content: center; padding: 8px; }
.gh-sidebar.collapsed .gh-signout span { display: none; }

/* MAIN */
.gh-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.gh-topbar {
    background: #fff; border-bottom: 1px solid #e8edf5;
    padding: 14px 28px; display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0; box-shadow: 0 1px 8px rgba(15,23,42,0.05);
}
.gh-topbar-left { display: flex; align-items: center; gap: 14px; }
.gh-toggle-btn {
    width: 34px; height: 34px; border-radius: 9px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #64748b; transition: all 0.18s;
}
.gh-toggle-btn:hover { background: #f1f5f9; color: #0f172a; }
.gh-breadcrumb { font-size: 0.7rem; color: #94a3b8; margin-bottom: 2px; }
.gh-page-title { font-family: 'Syne',sans-serif; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
.gh-print-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 10px;
    background: #fff; border: 1px solid #e2e8f0;
    font-size: 0.78rem; font-weight: 600; color: #64748b;
    cursor: pointer; transition: all 0.18s;
}
.gh-print-btn:hover { background: #f8fafc; border-color: #10b981; color: #10b981; }

.gh-content { flex: 1; overflow-y: auto; padding: 28px; }

/* STUDENT CARD */
.gh-student-card {
    background: linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#134e4a 100%);
    border-radius: 20px; padding: 24px 28px; margin-bottom: 24px;
    position: relative; overflow: hidden;
}
.gh-student-card::before {
    content: ''; position: absolute; top: -60px; right: -40px;
    width: 240px; height: 240px;
    background: radial-gradient(circle,rgba(16,185,129,0.15) 0%,transparent 70%);
    pointer-events: none;
}
.gh-student-card::after {
    content: ''; position: absolute; bottom: -60px; left: 40%;
    width: 180px; height: 180px;
    background: radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%);
    pointer-events: none;
}
.gh-student-inner { display: flex; align-items: flex-start; justify-content: space-between; position: relative; z-index: 1; }
.gh-student-left {}
.gh-student-name {
    font-family: 'Syne',sans-serif; font-size: 1.55rem; font-weight: 800;
    color: #fff; letter-spacing: -0.04em; margin-bottom: 6px;
}
.gh-student-meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
.gh-meta-chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.72rem; color: rgba(255,255,255,0.55);
    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
    padding: 3px 10px; border-radius: 20px;
}
.gh-student-email { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-top: 6px; }

/* cumulative GPA ring area */
.gh-gpa-block { text-align: center; }
.gh-gpa-ring { position: relative; width: 90px; height: 90px; margin: 0 auto 6px; }
.gh-gpa-ring svg { transform: rotate(-90deg); }
.gh-gpa-ring-text {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
}
.gh-gpa-ring-val {
    font-family: 'Syne',sans-serif; font-size: 1.4rem; font-weight: 800; color: #fff;
}
.gh-gpa-label { font-size: 0.62rem; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.08em; }
.gh-total-units { font-size: 0.68rem; color: rgba(255,255,255,0.3); margin-top: 3px; }

/* SUMMARY STATS */
.gh-summary-row {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 24px;
}
.gh-summary-card {
    background: #fff; border-radius: 16px; padding: 16px 18px;
    border: 1px solid #e8edf5; box-shadow: 0 2px 10px rgba(15,23,42,0.05);
}
.gh-summary-label { font-size: 0.67rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
.gh-summary-val {
    font-family: 'Syne',sans-serif; font-size: 1.6rem; font-weight: 800; color: #0f172a; line-height: 1;
}
.gh-summary-sub { font-size: 0.68rem; color: #94a3b8; margin-top: 3px; }

/* SEMESTER TABLE */
.gh-sem-block { background: #fff; border-radius: 20px; border: 1px solid #e8edf5; box-shadow: 0 2px 16px rgba(15,23,42,0.05); overflow: hidden; margin-bottom: 20px; }
.gh-sem-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid #f1f5f9; background: #fafbff;
}
.gh-sem-title { font-family: 'Syne',sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.gh-sem-meta { display: flex; align-items: center; gap: 10px; }
.gh-sem-units { font-size: 0.72rem; color: #94a3b8; }
.gh-sem-gpa {
    font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;
    background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0;
}
.gh-table { width: 100%; border-collapse: collapse; }
.gh-table thead tr { background: #f8fafc; }
.gh-table th {
    text-align: left; padding: 10px 20px;
    font-size: 0.66rem; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.08em;
    border-bottom: 1px solid #f1f5f9;
}
.gh-table td { padding: 13px 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.gh-table tbody tr:last-child td { border-bottom: none; }
.gh-table tbody tr { transition: background 0.15s; }
.gh-table tbody tr:hover { background: #fafbff; }
.gh-course-code { font-size: 0.78rem; font-weight: 700; color: #0f172a; }
.gh-course-name { font-size: 0.7rem; color: #94a3b8; margin-top: 1px; }
.gh-units-val { font-family: 'Syne',sans-serif; font-size: 0.88rem; font-weight: 700; color: #0f172a; text-align: center; }
.gh-grade-val { font-family: 'Syne',sans-serif; font-size: 1.05rem; font-weight: 800; }
.gh-gpa-row { display: flex; align-items: center; gap: 8px; }
.gh-gpa-num { font-size: 0.8rem; font-weight: 600; color: #64748b; width: 28px; flex-shrink: 0; }
.gh-gpa-bar-wrap { flex: 1; height: 5px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.gh-gpa-bar { height: 100%; border-radius: 10px; }
.gh-badge {
    display: inline-block; font-size: 0.65rem; font-weight: 700;
    padding: 3px 10px; border-radius: 20px; text-transform: capitalize;
}
.gh-badge-passed { background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0; }
.gh-badge-failed { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
.gh-badge-inc    { background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; }

.gh-empty { padding: 56px 24px; text-align: center; color: #94a3b8; }
.gh-empty-icon { font-size: 2.2rem; margin-bottom: 10px; opacity: 0.4; }
.gh-empty-text { font-size: 0.85rem; }

@media print {
    .gh-sidebar, .gh-topbar { display: none !important; }
    .gh-main { margin-left: 0 !important; }
    .gh-content { padding: 0 !important; }
}
`;

export default function Transcript({ student, records, cumulative_gpa }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const totalUnits = records.reduce((sum, r) => sum + r.total_units, 0);
    const totalSemesters = records.length;
    const avgSemGPA = records.length > 0
        ? (records.reduce((s, r) => s + r.semester_gpa, 0) / records.length).toFixed(2)
        : null;

    // GPA ring: scale 1.0–5.0 → dashoffset
    const ringR = 38;
    const ringC = 2 * Math.PI * ringR; // ~239
    const gpaFraction = cumulative_gpa
        ? Math.min(1, Math.max(0, (5 - cumulative_gpa) / 4))
        : 0;
    const dashOffset = ringC * (1 - gpaFraction);

    return (
        <>
            <Head title={`Transcript | ${student.full_name} | GradeHub`} />
            <style>{styles}</style>

            <div className="gh-tr-root">
                {/* SIDEBAR */}
                <aside className={`gh-sidebar${sidebarOpen ? '' : ' collapsed'}`}>
                    <div className="gh-sidebar-logo">
                        <div className="gh-logo-icon">
                            <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                            </svg>
                        </div>
                        <span className="gh-logo-text">GradeHub</span>
                    </div>
                    <nav className="gh-nav">
                        <p className="gh-nav-label">Student Menu</p>
                        {NAV_ITEMS.map(item => (
                            <a key={item.label} href={item.href} className={`gh-nav-item${item.active ? ' active' : ''}`}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                                </svg>
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </nav>
                    <div className="gh-sidebar-footer">
                        <div className="gh-user-chip">
                            <div className="gh-avatar">{initials(student.full_name)}</div>
                            <div className="gh-user-info">
                                <div className="gh-user-name">{student.full_name}</div>
                                <div className="gh-user-id">{student.student_id}</div>
                            </div>
                        </div>
                        <button className="gh-signout" onClick={() => router.post('/student/logout')}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div className="gh-main">
                    <header className="gh-topbar">
                        <div className="gh-topbar-left">
                            <button className="gh-toggle-btn" onClick={() => setSidebarOpen(v => !v)}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <p className="gh-breadcrumb">Pages / Transcript</p>
                                <h1 className="gh-page-title">Transcript of Records</h1>
                            </div>
                        </div>
                        <button className="gh-print-btn" onClick={() => window.print()}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                    </header>

                    <main className="gh-content">
                        {/* Student card with GPA ring */}
                        <div className="gh-student-card">
                            <div className="gh-student-inner">
                                <div className="gh-student-left">
                                    <div className="gh-student-name">{student.full_name}</div>
                                    <div className="gh-student-meta-row">
                                        <span className="gh-meta-chip">🎓 {student.course}</span>
                                        <span className="gh-meta-chip">📅 {student.year_level}</span>
                                        <span className="gh-meta-chip">🆔 {student.student_id}</span>
                                    </div>
                                    <div className="gh-student-email">{student.email}</div>
                                </div>
                                {cumulative_gpa !== null && (
                                    <div className="gh-gpa-block">
                                        <div className="gh-gpa-ring">
                                            <svg width="90" height="90" viewBox="0 0 90 90">
                                                <circle cx="45" cy="45" r={ringR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
                                                <circle cx="45" cy="45" r={ringR} fill="none"
                                                    stroke="url(#gpaGrad)" strokeWidth="7"
                                                    strokeDasharray={ringC}
                                                    strokeDashoffset={dashOffset}
                                                    strokeLinecap="round"
                                                />
                                                <defs>
                                                    <linearGradient id="gpaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#10b981" />
                                                        <stop offset="100%" stopColor="#34d399" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="gh-gpa-ring-text">
                                                <span className="gh-gpa-ring-val">{cumulative_gpa.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="gh-gpa-label">Cumulative GPA</div>
                                        <div className="gh-total-units">{totalUnits} total units</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary stats */}
                        {records.length > 0 && (
                            <div className="gh-summary-row">
                                <div className="gh-summary-card">
                                    <div className="gh-summary-label">Semesters</div>
                                    <div className="gh-summary-val">{totalSemesters}</div>
                                    <div className="gh-summary-sub">completed periods</div>
                                </div>
                                <div className="gh-summary-card">
                                    <div className="gh-summary-label">Total Units</div>
                                    <div className="gh-summary-val">{totalUnits}</div>
                                    <div className="gh-summary-sub">across all semesters</div>
                                </div>
                                <div className="gh-summary-card">
                                    <div className="gh-summary-label">Avg Sem GPA</div>
                                    <div className="gh-summary-val" style={{ color: '#10b981' }}>{avgSemGPA ?? '—'}</div>
                                    <div className="gh-summary-sub">per semester</div>
                                </div>
                            </div>
                        )}

                        {records.length === 0 ? (
                            <div className="gh-sem-block">
                                <div className="gh-empty">
                                    <div className="gh-empty-icon">📋</div>
                                    <div className="gh-empty-text">No transcript records available yet.</div>
                                </div>
                            </div>
                        ) : (
                            records.map((record, idx) => (
                                <div key={idx} className="gh-sem-block">
                                    <div className="gh-sem-header">
                                        <span className="gh-sem-title">{record.period}</span>
                                        <div className="gh-sem-meta">
                                            <span className="gh-sem-units">{record.total_units} units</span>
                                            <span className="gh-sem-gpa">GPA {record.semester_gpa.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="gh-table">
                                            <thead>
                                                <tr>
                                                    <th>Course</th>
                                                    <th style={{ textAlign: 'center' }}>Units</th>
                                                    <th>Grade</th>
                                                    <th>GPA</th>
                                                    <th>Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {record.courses.map((course, cIdx) => (
                                                    <tr key={cIdx}>
                                                        <td>
                                                            <div className="gh-course-code">{course.code}</div>
                                                            <div className="gh-course-name">{course.name}</div>
                                                        </td>
                                                        <td><div className="gh-units-val">{course.units}</div></td>
                                                        <td>
                                                            <span className="gh-grade-val" style={{ color: gradeHex(course.letter_grade) }}>
                                                                {course.letter_grade}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="gh-gpa-row">
                                                                <span className="gh-gpa-num">{course.gpa_equivalent}</span>
                                                                <div className="gh-gpa-bar-wrap">
                                                                    <div className="gh-gpa-bar"
                                                                        style={{
                                                                            width: gpaBarWidth(course.gpa_equivalent),
                                                                            background: gpaBarColor(course.gpa_equivalent),
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`gh-badge ${course.remarks === 'passed' ? 'gh-badge-passed' : course.remarks === 'failed' ? 'gh-badge-failed' : 'gh-badge-inc'}`}>
                                                                {course.remarks}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}