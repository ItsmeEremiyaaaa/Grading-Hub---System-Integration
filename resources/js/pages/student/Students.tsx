import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Student {
    id: number;
    student_id: string;
    full_name: string;
    email: string;
    course: string;
    year_level: number;
    status: string;
    enrollments_count: number;
}

interface Props {
    students: Student[];
    registrar: { full_name: string; role: string };
    flash?: { success?: string; error?: string };
}

const YEAR_LABELS: Record<number, string> = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };

function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function StatusPill({ status }: { status: string }) {
    const map: Record<string, string> = {
        active:   'bg-green-50 text-green-700 border-green-200',
        inactive: 'bg-amber-50 text-amber-700 border-amber-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    const label: Record<string, string> = { inactive: 'Pending', active: 'Active', rejected: 'Rejected' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            {label[status] ?? status}
        </span>
    );
}

function Avatar({ name }: { name: string }) {
    return (
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {initials(name)}
        </div>
    );
}

export default function RegistrarStudents({ students, registrar, flash }: Props) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'inactive' | 'active' | 'rejected'>('all');
    const [viewStudent, setViewStudent] = useState<Student | null>(null);
    const [rejectTarget, setRejectTarget] = useState<Student | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const filtered = students.filter(s => {
        const matchesSearch =
            s.full_name.toLowerCase().includes(search.toLowerCase()) ||
            s.student_id.includes(search) ||
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            s.course.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || s.status === filter;
        return matchesSearch && matchesFilter;
    });

    const pendingCount = students.filter(s => s.status === 'inactive').length;

    const approve = (student: Student) => {
        router.patch(route('registrar.students.approve', student.id), {}, {
            preserveScroll: true,
            onSuccess: () => setViewStudent(null),
        });
    };

    const reject = () => {
        if (!rejectReason.trim() || !rejectTarget) return;
        setProcessing(true);
        router.delete(route('registrar.students.destroy', rejectTarget.id), {
            data: { reason: rejectReason },
            preserveScroll: true,
            onSuccess: () => {
                setRejectTarget(null);
                setRejectReason('');
                setViewStudent(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const filters: { key: typeof filter; label: string }[] = [
        { key: 'all',      label: `All (${students.length})` },
        { key: 'inactive', label: `Pending (${pendingCount})` },
        { key: 'active',   label: `Active (${students.filter(s => s.status === 'active').length})` },
        { key: 'rejected', label: `Rejected (${students.filter(s => s.status === 'rejected').length})` },
    ];

    return (
        <>
            <Head title="Students — Registrar" />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Students</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Manage registrations and account approvals</p>
                        </div>
                        {pendingCount > 0 && (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-sm font-medium text-amber-700">
                                    {pendingCount} pending {pendingCount === 1 ? 'approval' : 'approvals'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 py-6">
                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Filters + Search */}
                    <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                            {filters.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        filter === f.key
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search students…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Student</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Student ID</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Course</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Year</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Enrollments</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Status</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                                            No students found
                                        </td>
                                    </tr>
                                ) : filtered.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={student.full_name} />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                                                    <div className="text-xs text-gray-500">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{student.student_id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate">{student.course}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{YEAR_LABELS[student.year_level] ?? '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{student.enrollments_count}</td>
                                        <td className="px-6 py-4"><StatusPill status={student.status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setViewStudent(student)}
                                                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                                                >
                                                    View
                                                </button>
                                                {student.status === 'inactive' && (
                                                    <>
                                                        <button
                                                            onClick={() => approve(student)}
                                                            className="text-xs px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-green-700 hover:bg-green-100 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => { setRejectTarget(student); setRejectReason(''); }}
                                                            className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-700 hover:bg-red-100 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {viewStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewStudent(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-semibold">
                                    {initials(viewStudent.full_name)}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{viewStudent.full_name}</div>
                                    <div className="text-xs text-gray-500">{viewStudent.email}</div>
                                </div>
                            </div>
                            <button onClick={() => setViewStudent(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3 mb-6">
                            {[
                                ['Student ID',  viewStudent.student_id],
                                ['Course',      viewStudent.course],
                                ['Year Level',  YEAR_LABELS[viewStudent.year_level] ?? '—'],
                                ['Enrollments', String(viewStudent.enrollments_count)],
                                ['Status',      viewStudent.status],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                                    <span className="text-gray-500">{label}</span>
                                    <span className="font-medium text-gray-900">
                                        {label === 'Status' ? <StatusPill status={value} /> : value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setViewStudent(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                                Close
                            </button>
                            {viewStudent.status === 'inactive' && (
                                <>
                                    <button
                                        onClick={() => { setRejectTarget(viewStudent); setViewStudent(null); setRejectReason(''); }}
                                        className="px-4 py-2 text-sm bg-red-50 border border-red-200 rounded-lg text-red-700 hover:bg-red-100"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => approve(viewStudent)}
                                        className="px-4 py-2 text-sm bg-blue-600 rounded-lg text-white hover:bg-blue-700"
                                    >
                                        Approve Account
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setRejectTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Reject Registration</div>
                                <div className="text-xs text-gray-500">{rejectTarget.full_name} · {rejectTarget.student_id}</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-4 mt-3">
                            This will permanently remove the account. Provide a reason so the student knows why.
                        </p>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                            Reason for rejection *
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="e.g. Invalid student ID format, not enrolled in the institution…"
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setRejectTarget(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button
                                onClick={reject}
                                disabled={!rejectReason.trim() || processing}
                                className="px-4 py-2 text-sm bg-red-600 rounded-lg text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Rejecting…' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}