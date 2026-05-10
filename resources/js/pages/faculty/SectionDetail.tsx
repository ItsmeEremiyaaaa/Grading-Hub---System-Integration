import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Faculty {
    full_name: string;
    faculty_id: string;
    department: string;
    position: string;
}

interface SectionInfo {
    id: number;
    course_code: string;
    course_name: string;
    section_name: string;
    school_year: string;
    semester: string;
    status: string;
    units: number;
}

interface GradeData {
    id: number | null;
    prelim: number | null;
    midterm: number | null;
    finals: number | null;
    score: number | null;
    letter_grade: string | null;
    gpa_equivalent: number | null;
    remarks: string | null;
    is_finalized: boolean;
    submitted_at: string | null;
}

interface Student {
    enrollment_id: number;
    student_id: string;
    full_name: string;
    email: string;
    status: string;
    grade: GradeData | null;
}

interface Props {
    faculty: Faculty;
    section: SectionInfo;
    students: Student[];
    can_grade: boolean;
    flash?: { success?: string };
}

function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// Saint Mary's College of Bansalan — 2-digit Philippine scale
function computeFromScore(score: number): { letter: string; gpa: number; remarks: string } {
    if (score >= 98) return { letter: '98', gpa: 1.00, remarks: 'passed' };
    if (score >= 95) return { letter: '95', gpa: 1.25, remarks: 'passed' };
    if (score >= 92) return { letter: '92', gpa: 1.50, remarks: 'passed' };
    if (score >= 89) return { letter: '89', gpa: 1.75, remarks: 'passed' };
    if (score >= 86) return { letter: '86', gpa: 2.00, remarks: 'passed' };
    if (score >= 83) return { letter: '83', gpa: 2.25, remarks: 'passed' };
    if (score >= 80) return { letter: '80', gpa: 2.50, remarks: 'passed' };
    if (score >= 77) return { letter: '77', gpa: 2.75, remarks: 'passed' };
    if (score >= 75) return { letter: '75', gpa: 3.00, remarks: 'passed' };
    return { letter: '74', gpa: 5.00, remarks: 'failed' };
}

function computeFinalScore(prelim: number, midterm: number, finals: number): number {
    return Math.round((prelim * 0.30 + midterm * 0.30 + finals * 0.40) * 100) / 100;
}

const NAV_ITEMS = [
    { label: 'Dashboard',   href: '/faculty/dashboard',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'My Sections', href: '/faculty/sections',    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', active: true },
    { label: 'Grades',      href: '/faculty/grades',      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Students',    href: '/faculty/students',    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
];

type GradeInputs = { prelim: string; midterm: string; finals: string };

export default function SectionDetail({ faculty, section, students, can_grade, flash }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [submitting, setSubmitting] = useState<number | null>(null);
    const [bulkSubmitting, setBulkSubmitting] = useState(false);

    // Initialize grade inputs from existing grade data
    const [inputs, setInputs] = useState<Record<number, GradeInputs>>(() => {
        const init: Record<number, GradeInputs> = {};
        students.forEach(s => {
            init[s.enrollment_id] = {
                prelim:  s.grade?.prelim?.toString()  ?? '',
                midterm: s.grade?.midterm?.toString() ?? '',
                finals:  s.grade?.finals?.toString()  ?? '',
            };
        });
        return init;
    });

    const setField = (enrollmentId: number, field: keyof GradeInputs, value: string) => {
        if (value !== '' && (isNaN(Number(value)) || Number(value) > 100 || Number(value) < 0)) return;
        setInputs(prev => ({ ...prev, [enrollmentId]: { ...prev[enrollmentId], [field]: value } }));
    };

    const getPreview = (enrollmentId: number) => {
        const g = inputs[enrollmentId];
        if (!g || g.prelim === '' || g.midterm === '' || g.finals === '') return null;
        const score = computeFinalScore(Number(g.prelim), Number(g.midterm), Number(g.finals));
        return { score, ...computeFromScore(score) };
    };

    const isComplete = (enrollmentId: number) => {
        const g = inputs[enrollmentId];
        return g && g.prelim !== '' && g.midterm !== '' && g.finals !== '';
    };

    const submitGrade = (enrollmentId: number) => {
        if (!isComplete(enrollmentId)) { alert('Please fill in Prelim, Midterm, and Finals.'); return; }
        if (!confirm('Submit this grade? It will be sent to the registrar for review.')) return;
        setSubmitting(enrollmentId);
        const g = inputs[enrollmentId];
        router.post(`/faculty/grades/${enrollmentId}`, {
            prelim:  Number(g.prelim),
            midterm: Number(g.midterm),
            finals:  Number(g.finals),
        }, {
            onSuccess: () => setSubmitting(null),
            onError:   () => { setSubmitting(null); alert('Failed to submit.'); },
            preserveScroll: true,
        });
    };

    const submitAllGrades = () => {
        const pending = students.filter(s => !s.grade?.submitted_at && isComplete(s.enrollment_id));
        if (pending.length === 0) { alert('No complete grades to submit.'); return; }
        if (!confirm(`Submit all ${pending.length} grade(s)?`)) return;
        setBulkSubmitting(true);
        const payload = pending.map(s => ({
            enrollment_id: s.enrollment_id,
            prelim:  Number(inputs[s.enrollment_id].prelim),
            midterm: Number(inputs[s.enrollment_id].midterm),
            finals:  Number(inputs[s.enrollment_id].finals),
        }));
        router.post(`/faculty/grades/bulk/${section.id}`, { grades: payload }, {
            onSuccess: () => setBulkSubmitting(false),
            onError:   () => { setBulkSubmitting(false); alert('Failed to submit.'); },
            preserveScroll: true,
        });
    };

    const gradedCount  = students.filter(s => s.grade?.submitted_at).length;
    const pendingCount = students.filter(s => !s.grade?.submitted_at).length;
    const pct = students.length === 0 ? 0 : Math.round((gradedCount / students.length) * 100);

    return (
        <>
            <Head title={`${section.course_code} — ${section.section_name} | GradeHub`} />

            <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-gray-900 flex flex-col flex-shrink-0`}>
                    <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" /></svg>
                        </div>
                        {sidebarOpen && <span className="text-white font-bold text-lg tracking-tight">GradeHub</span>}
                    </div>
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {sidebarOpen && <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-3 mb-3">Main Menu</p>}
                        {NAV_ITEMS.map(item => (
                            <a key={item.label} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    item.active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}>
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                                </svg>
                                {sidebarOpen && <span>{item.label}</span>}
                            </a>
                        ))}
                    </nav>
                    <div className="px-3 py-4 border-t border-gray-800">
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800 ${!sidebarOpen ? 'justify-center' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {initials(faculty.full_name)}
                            </div>
                            {sidebarOpen && (
                                <div className="min-w-0">
                                    <p className="text-white text-xs font-semibold truncate">{faculty.full_name}</p>
                                    <p className="text-gray-400 text-xs">{faculty.position}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => router.post('/faculty/logout')}
                            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-medium transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <div>
                                <p className="text-xs text-gray-400">Sections / {section.course_code}</p>
                                <h1 className="text-lg font-bold text-gray-900">{section.course_code}: {section.course_name}</h1>
                            </div>
                        </div>
                        {can_grade && pendingCount > 0 && (
                            <button onClick={submitAllGrades} disabled={bulkSubmitting}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                                {bulkSubmitting ? 'Submitting...' : `Submit All (${pendingCount})`}
                            </button>
                        )}
                    </header>

                    <main className="flex-1 overflow-y-auto p-6">

                        {flash?.success && (
                            <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                {flash.success}
                            </div>
                        )}

                        {/* Section info */}
                        <div className="flex items-center gap-3 mb-4">
                            <a href="/faculty/sections" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">← Back</a>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                can_grade ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}>{section.status}</span>
                            <span className="text-xs text-gray-400">{section.section_name} · {section.semester} · SY {section.school_year}</span>
                            {!can_grade && (
                                <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                    ⚠ Grading not open — contact registrar
                                </span>
                            )}
                        </div>

                        {/* Progress + formula info */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs text-gray-500">Grading Progress</span>
                                    <span className="text-xs font-semibold text-gray-900">{gradedCount}/{students.length} submitted</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <p className="text-xs font-semibold text-blue-700 mb-2">Grading Formula</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-blue-600">
                                        <span>Prelim</span><span className="font-bold">30%</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-blue-600">
                                        <span>Midterm</span><span className="font-bold">30%</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-blue-600">
                                        <span>Finals</span><span className="font-bold">40%</span>
                                    </div>
                                    <div className="border-t border-blue-200 mt-1 pt-1 flex justify-between text-xs text-blue-800">
                                        <span>Passing</span><span className="font-bold">75</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grade table */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        {['#', 'Student', 'Prelim (30%)', 'Midterm (30%)', 'Finals (40%)', 'Final Score', 'Grade', 'Remarks', 'Status', ''].map(h => (
                                            <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {students.map((student, index) => {
                                        const submitted = !!student.grade?.submitted_at;
                                        const finalized = student.grade?.is_finalized ?? false;
                                        const preview = getPreview(student.enrollment_id);
                                        const inp = inputs[student.enrollment_id];

                                        return (
                                            <tr key={student.enrollment_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 py-3 text-xs text-gray-400">{index + 1}</td>

                                                <td className="px-3 py-3">
                                                    <p className="text-xs font-bold text-gray-900">{student.full_name}</p>
                                                    <p className="text-xs text-gray-400">{student.student_id}</p>
                                                </td>

                                                {/* Prelim */}
                                                <td className="px-3 py-3">
                                                    {submitted ? (
                                                        <span className="text-xs font-medium text-gray-700">{student.grade?.prelim ?? '—'}</span>
                                                    ) : can_grade ? (
                                                        <input type="number" min={0} max={100} step={0.01}
                                                            value={inp?.prelim ?? ''}
                                                            onChange={e => setField(student.enrollment_id, 'prelim', e.target.value)}
                                                            placeholder="0–100"
                                                            className="w-20 h-8 border border-gray-200 rounded-lg px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                                    ) : <span className="text-xs text-gray-300">—</span>}
                                                </td>

                                                {/* Midterm */}
                                                <td className="px-3 py-3">
                                                    {submitted ? (
                                                        <span className="text-xs font-medium text-gray-700">{student.grade?.midterm ?? '—'}</span>
                                                    ) : can_grade ? (
                                                        <input type="number" min={0} max={100} step={0.01}
                                                            value={inp?.midterm ?? ''}
                                                            onChange={e => setField(student.enrollment_id, 'midterm', e.target.value)}
                                                            placeholder="0–100"
                                                            className="w-20 h-8 border border-gray-200 rounded-lg px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                                    ) : <span className="text-xs text-gray-300">—</span>}
                                                </td>

                                                {/* Finals */}
                                                <td className="px-3 py-3">
                                                    {submitted ? (
                                                        <span className="text-xs font-medium text-gray-700">{student.grade?.finals ?? '—'}</span>
                                                    ) : can_grade ? (
                                                        <input type="number" min={0} max={100} step={0.01}
                                                            value={inp?.finals ?? ''}
                                                            onChange={e => setField(student.enrollment_id, 'finals', e.target.value)}
                                                            placeholder="0–100"
                                                            className="w-20 h-8 border border-gray-200 rounded-lg px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                                    ) : <span className="text-xs text-gray-300">—</span>}
                                                </td>

                                                {/* Final Score */}
                                                <td className="px-3 py-3">
                                                    {submitted ? (
                                                        <span className="text-xs font-bold text-gray-900">{student.grade?.score}</span>
                                                    ) : preview ? (
                                                        <span className="text-xs font-bold text-blue-600">{preview.score}</span>
                                                    ) : <span className="text-xs text-gray-300">—</span>}
                                                </td>

                                                {/* Grade */}
                                                <td className="px-3 py-3">
                                                    {submitted ? (
                                                        <span className="text-sm font-black text-gray-900">{student.grade?.letter_grade}</span>
                                                    ) : preview ? (
                                                        <span className="text-sm font-black text-blue-500">{preview.letter}</span>
                                                    ) : <span className="text-xs text-gray-300">—</span>}
                                                </td>

                                                {/* Remarks — auto from score */}
                                                <td className="px-3 py-3">
                                                    {submitted ? (
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                            student.grade?.remarks === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>{student.grade?.remarks}</span>
                                                    ) : preview ? (
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                            preview.remarks === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>{preview.remarks}</span>
                                                    ) : <span className="text-xs text-gray-300">—</span>}
                                                </td>

                                                {/* Status */}
                                                <td className="px-3 py-3">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                        finalized ? 'bg-purple-100 text-purple-700' :
                                                        submitted ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {finalized ? 'Finalized' : submitted ? 'Submitted' : 'Pending'}
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="px-3 py-3">
                                                    {can_grade && !submitted && (
                                                        <button
                                                            onClick={() => submitGrade(student.enrollment_id)}
                                                            disabled={submitting === student.enrollment_id || !isComplete(student.enrollment_id)}
                                                            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors whitespace-nowrap"
                                                        >
                                                            {submitting === student.enrollment_id ? 'Saving...' : 'Submit'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {students.length === 0 && (
                                <div className="py-12 text-center">
                                    <div className="text-3xl mb-2">📭</div>
                                    <p className="text-sm text-gray-400">No students enrolled in this section.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}