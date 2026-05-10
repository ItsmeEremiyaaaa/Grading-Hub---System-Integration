import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface StudentInfo {
    full_name: string;
    student_id: string;
    course: string;
    year_level: string;
}

interface GradeEntry {
    id: number;
    course_code: string;
    course_name: string;
    units: number;
    faculty: string;
    score: number;
    letter_grade: string;
    gpa_equivalent: number;
    remarks: string;
    is_finalized: boolean;
}

interface GroupedGrades {
    [semester: string]: GradeEntry[];
}

interface Props {
    student: StudentInfo;
    grouped_grades: GroupedGrades;
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

function scoreBarWidth(score: number): string {
    return `${Math.min(100, Math.max(0, score))}%`;
}

function scoreBarColor(score: number): string {
    if (score >= 85) return 'linear-gradient(90deg,#10b981,#34d399)';
    if (score >= 75) return 'linear-gradient(90deg,#3b82f6,#60a5fa)';
    if (score >= 65) return 'linear-gradient(90deg,#f59e0b,#fbbf24)';
    return 'linear-gradient(90deg,#ef4444,#f87171)';
}

const NAV_ITEMS = [
    { label: 'Dashboard',  href: '/student/dashboard',  active: false, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Grades',     href: '/student/grades',     active: true,  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Transcript', href: '/student/transcript', active: false, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

.gh-grades-root *, .gh-grades-root *::before, .gh-grades-root *::after { box-sizing: border-box; }
.gh-grades-root {
    font-family: 'DM Sans', sans-serif;
    display: flex; height: 100vh; background: #eef2f3; overflow: hidden;
}

/* SIDEBAR */
.gh-sidebar {
    width: 240px; flex-shrink: 0;
    background: linear-gradient(180deg,#0f172a 0%,#1e293b 100%);
    display: flex; flex-direction: column;
    transition: width 0.3s cubic-bezier(.22,1,.36,1);
    overflow: hidden;
}
.gh-sidebar.collapsed { width: 72px; }
.gh-sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 22px 18px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    white-space: nowrap; overflow: hidden;
}
.gh-logo-icon {
    width: 36px; height: 36px; flex-shrink: 0;
    border-radius: 10px;
    background: linear-gradient(135deg,#10b981,#059669);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(16,185,129,0.4);
}
.gh-logo-text {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.1rem; color: #fff; letter-spacing: -0.03em;
    transition: opacity 0.2s;
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
    background: rgba(255,255,255,0.05); margin-bottom: 6px;
    overflow: hidden;
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

/* TOPBAR */
.gh-topbar {
    background: #fff; border-bottom: 1px solid #e8edf5;
    padding: 14px 28px;
    display: flex; align-items: center; justify-content: space-between;
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

/* CONTENT */
.gh-content { flex: 1; overflow-y: auto; padding: 28px; }

/* HERO STRIP */
.gh-hero-strip {
    background: linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#134e4a 100%);
    border-radius: 20px; padding: 24px 28px;
    margin-bottom: 24px; position: relative; overflow: hidden;
}
.gh-hero-strip::before {
    content: ''; position: absolute; top: -50px; right: -40px;
    width: 220px; height: 220px;
    background: radial-gradient(circle,rgba(16,185,129,0.18) 0%,transparent 70%);
    pointer-events: none;
}
.gh-hero-inner { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
.gh-hero-name {
    font-family: 'Syne',sans-serif; font-size: 1.5rem; font-weight: 800;
    color: #fff; letter-spacing: -0.04em; margin-bottom: 4px;
}
.gh-hero-sub { font-size: 0.82rem; color: rgba(255,255,255,0.45); }
.gh-hero-gpa {
    text-align: right;
}
.gh-hero-gpa-label { font-size: 0.65rem; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
.gh-hero-gpa-val {
    font-family: 'Syne',sans-serif; font-size: 2.4rem; font-weight: 800; color: #10b981;
    line-height: 1;
}
.gh-hero-gpa-sub { font-size: 0.68rem; color: rgba(255,255,255,0.3); margin-top: 2px; }

/* SEMESTER BLOCK */
.gh-sem-block { background: #fff; border-radius: 20px; border: 1px solid #e8edf5; box-shadow: 0 2px 16px rgba(15,23,42,0.05); overflow: hidden; margin-bottom: 20px; }
.gh-sem-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid #f1f5f9;
    background: #fafbff;
}
.gh-sem-title { font-family: 'Syne',sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.gh-sem-meta { display: flex; align-items: center; gap: 10px; }
.gh-sem-units { font-size: 0.72rem; color: #94a3b8; }
.gh-sem-gpa-badge {
    font-size: 0.7rem; font-weight: 700;
    padding: 3px 10px; border-radius: 20px;
    background: #ecfdf5; color: #10b981;
    border: 1px solid #a7f3d0;
}

/* TABLE */
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
.gh-course-code { font-size: 0.78rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.gh-course-name { font-size: 0.7rem; color: #94a3b8; }
.gh-units-val { font-family: 'Syne',sans-serif; font-size: 0.88rem; font-weight: 700; color: #0f172a; text-align: center; }
.gh-faculty-val { font-size: 0.75rem; color: #64748b; }
.gh-score-cell { min-width: 100px; }
.gh-score-row { display: flex; align-items: center; gap: 8px; }
.gh-score-num { font-family: 'Syne',sans-serif; font-size: 0.85rem; font-weight: 700; color: #0f172a; width: 28px; flex-shrink: 0; }
.gh-score-bar-wrap { flex: 1; height: 5px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.gh-score-bar { height: 100%; border-radius: 10px; transition: width 0.8s cubic-bezier(.22,1,.36,1); }
.gh-grade-val { font-family: 'Syne',sans-serif; font-size: 1.05rem; font-weight: 800; }
.gh-gpa-val { font-size: 0.8rem; color: #64748b; font-weight: 500; }
.gh-badge {
    display: inline-block; font-size: 0.65rem; font-weight: 700;
    padding: 3px 10px; border-radius: 20px; text-transform: capitalize;
}
.gh-badge-passed   { background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0; }
.gh-badge-failed   { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
.gh-badge-inc      { background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; }
.gh-badge-final    { background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0; }
.gh-badge-pending  { background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; }

/* EMPTY */
.gh-empty { padding: 56px 24px; text-align: center; color: #94a3b8; }
.gh-empty-icon { font-size: 2.2rem; margin-bottom: 10px; opacity: 0.4; }
.gh-empty-text { font-size: 0.85rem; }
`;

export default function Grades({ student, grouped_grades }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const semesters = Object.keys(grouped_grades);

    // Compute overall GPA from all finalized entries
    const allGrades = semesters.flatMap(s => grouped_grades[s]);
    const finalized = allGrades.filter(g => g.is_finalized);
    const overallGPA = finalized.length > 0
        ? (finalized.reduce((sum, g) => sum + g.gpa_equivalent * g.units, 0) /
           finalized.reduce((sum, g) => sum + g.units, 0)).toFixed(2)
        : null;

    return (
        <>
            <Head title={`Grades | ${student.full_name} | GradeHub`} />
            <style>{styles}</style>

            <div className="gh-grades-root">
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
                                <p className="gh-breadcrumb">Pages / Grades</p>
                                <h1 className="gh-page-title">Grades</h1>
                            </div>
                        </div>
                    </header>

                    <main className="gh-content">
                        {/* Hero strip */}
                        <div className="gh-hero-strip">
                            <div className="gh-hero-inner">
                                <div>
                                    <div className="gh-hero-name">{student.full_name}</div>
                                    <div className="gh-hero-sub">{student.course} · {student.year_level} · {student.student_id}</div>
                                </div>
                                {overallGPA && (
                                    <div className="gh-hero-gpa">
                                        <div className="gh-hero-gpa-label">Overall GPA</div>
                                        <div className="gh-hero-gpa-val">{overallGPA}</div>
                                        <div className="gh-hero-gpa-sub">{finalized.length} finalized subject{finalized.length !== 1 ? 's' : ''}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {semesters.length === 0 ? (
                            <div className="gh-sem-block">
                                <div className="gh-empty">
                                    <div className="gh-empty-icon">📋</div>
                                    <div className="gh-empty-text">No grades available yet.</div>
                                </div>
                            </div>
                        ) : (
                            semesters.map(semester => {
                                const entries: GradeEntry[] = grouped_grades[semester];
                                const semGPA = entries.filter(g => g.is_finalized).length > 0
                                    ? (entries.filter(g => g.is_finalized).reduce((s, g) => s + g.gpa_equivalent * g.units, 0) /
                                       entries.filter(g => g.is_finalized).reduce((s, g) => s + g.units, 0)).toFixed(2)
                                    : null;
                                const semUnits = entries.reduce((s, g) => s + g.units, 0);

                                return (
                                    <div key={semester} className="gh-sem-block">
                                        <div className="gh-sem-header">
                                            <span className="gh-sem-title">{semester}</span>
                                            <div className="gh-sem-meta">
                                                <span className="gh-sem-units">{semUnits} units</span>
                                                {semGPA && <span className="gh-sem-gpa-badge">GPA {semGPA}</span>}
                                            </div>
                                        </div>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="gh-table">
                                                <thead>
                                                    <tr>
                                                        <th>Course</th>
                                                        <th style={{ textAlign: 'center' }}>Units</th>
                                                        <th>Faculty</th>
                                                        <th>Score</th>
                                                        <th>Grade</th>
                                                        <th>GPA</th>
                                                        <th>Remarks</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {entries.map((g: GradeEntry) => (
                                                        <tr key={g.id}>
                                                            <td>
                                                                <div className="gh-course-code">{g.course_code}</div>
                                                                <div className="gh-course-name">{g.course_name}</div>
                                                            </td>
                                                            <td><div className="gh-units-val">{g.units}</div></td>
                                                            <td><div className="gh-faculty-val">{g.faculty}</div></td>
                                                            <td className="gh-score-cell">
                                                                <div className="gh-score-row">
                                                                    <span className="gh-score-num">{g.score}</span>
                                                                    <div className="gh-score-bar-wrap">
                                                                        <div className="gh-score-bar" style={{ width: scoreBarWidth(g.score), background: scoreBarColor(g.score) }} />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="gh-grade-val" style={{ color: gradeHex(g.letter_grade) }}>
                                                                    {g.letter_grade}
                                                                </span>
                                                            </td>
                                                            <td><span className="gh-gpa-val">{g.gpa_equivalent}</span></td>
                                                            <td>
                                                                <span className={`gh-badge ${g.remarks === 'passed' ? 'gh-badge-passed' : g.remarks === 'failed' ? 'gh-badge-failed' : 'gh-badge-inc'}`}>
                                                                    {g.remarks}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`gh-badge ${g.is_finalized ? 'gh-badge-final' : 'gh-badge-pending'}`}>
                                                                    {g.is_finalized ? 'Finalized' : 'Pending'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}