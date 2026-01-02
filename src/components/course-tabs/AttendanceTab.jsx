import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Calendar, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../Modal';

const AttendanceTab = ({ courseId }) => {
    const { enrollments, students, attendance, addAttendanceSession, updateAttendanceSession, deleteAttendanceSession } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [sessionNote, setSessionNote] = useState('');
    const [editingSessionId, setEditingSessionId] = useState(null);

    // Get active students for this course
    const activeEnrollments = enrollments.filter(e => e.courseId === courseId && e.status === 'Active');
    const activeStudents = activeEnrollments.map(e => students.find(s => s.id === e.studentId)).filter(Boolean);

    // State for new session attendance
    const [sessionAttendance, setSessionAttendance] = useState({}); // { studentId: { status: 'Present' | 'Absent' | 'Late', note: '' } }

    const handleOpenModal = (sessionToEdit = null) => {
        if (sessionToEdit) {
            // Edit Mode
            setEditingSessionId(sessionToEdit.sessionId);
            setSessionDate(sessionToEdit.date);
            setSessionNote(sessionToEdit.sessionNote || '');

            const records = attendance.filter(a => a.sessionId === sessionToEdit.sessionId);
            const statusMap = {};
            activeStudents.forEach(s => {
                const record = records.find(r => r.studentId === s.id);
                statusMap[s.id] = {
                    status: record ? record.status : 'Present',
                    note: record ? record.note : ''
                };
            });
            setSessionAttendance(statusMap);
        } else {
            // Add Mode
            setEditingSessionId(null);
            setSessionDate(new Date().toISOString().split('T')[0]);
            setSessionNote('');
            const initialStatus = {};
            activeStudents.forEach(s => initialStatus[s.id] = { status: 'Present', note: '' });
            setSessionAttendance(initialStatus);
        }
        setIsModalOpen(true);
    };

    const handleDeleteSession = (sessionId) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            deleteAttendanceSession(sessionId);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const records = Object.keys(sessionAttendance).map(studentId => ({
            studentId,
            status: sessionAttendance[studentId].status,
            note: sessionAttendance[studentId].note
        }));

        const sessionData = {
            courseId,
            date: sessionDate,
            sessionNote,
            records
        };

        if (editingSessionId) {
            updateAttendanceSession(editingSessionId, sessionData);
        } else {
            addAttendanceSession(sessionData);
        }

        setIsModalOpen(false);
    };

    // Derived Data for Summary
    const courseAttendance = attendance.filter(a => a.courseId === courseId);

    // Group by Session (approximate by date/sessionId if we had it, but we flattened it. 
    // We need to group by sessionId to count "Total Classes Held".
    // In DataContext, I added sessionId to records.
    const sessionIds = [...new Set(courseAttendance.map(a => a.sessionId))];
    const totalClasses = sessionIds.length;

    const totalAbsences = courseAttendance.filter(a => a.status === 'Absent').length;
    const totalLates = courseAttendance.filter(a => a.status === 'Late').length;

    const overallRate = courseAttendance.length > 0
        ? Math.round((courseAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length / courseAttendance.length) * 100)
        : 0;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalClasses}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Classes Held</div>
                    </div>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{overallRate}%</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Avg Attendance</div>
                    </div>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{totalAbsences}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Absences</div>
                    </div>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>{totalLates}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Late Marks</div>
                    </div>
                </div>

                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Log Class Session
                </button>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Recent Sessions</h3>
                {sessionIds.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No sessions recorded.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Late</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessionIds.map(sessionId => {
                                    const sessionRecords = courseAttendance.filter(a => a.sessionId === sessionId);
                                    const date = sessionRecords[0]?.date;
                                    const present = sessionRecords.filter(r => r.status === 'Present').length;
                                    const absent = sessionRecords.filter(r => r.status === 'Absent').length;
                                    const late = sessionRecords.filter(r => r.status === 'Late').length;

                                    return (
                                        <tr key={sessionId}>
                                            <td>{new Date(date).toLocaleDateString()}</td>
                                            <td style={{ color: 'var(--success)' }}>{present}</td>
                                            <td style={{ color: 'var(--danger)' }}>{absent}</td>
                                            <td style={{ color: 'var(--warning)' }}>{late}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '0.25rem', color: 'var(--text-main)' }}
                                                        onClick={() => handleOpenModal({ sessionId, date, sessionNote: sessionRecords[0]?.sessionNote })}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                                        onClick={() => handleDeleteSession(sessionId)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Class Attendance">
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                        <input type="date" required value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Session Notes (Optional)</label>
                        <textarea
                            value={sessionNote}
                            onChange={e => setSessionNote(e.target.value)}
                            placeholder="General notes about this class session..."
                            rows="2"
                        />
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                        <table style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0.5rem' }}>Student</th>
                                    <th style={{ padding: '0.5rem' }}>Status & Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeStudents.map(student => {
                                    const studentState = sessionAttendance[student.id] || { status: 'Present', note: '' };
                                    return (
                                        <tr key={student.id}>
                                            <td style={{ padding: '0.5rem' }}>
                                                <Link to={`/students/${student.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', textDecoration: 'none' }}>
                                                    {student.name} <ExternalLink size={12} />
                                                </Link>
                                            </td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {['Present', 'Absent', 'Late'].map(status => (
                                                            <label key={status} style={{
                                                                display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem',
                                                                cursor: 'pointer',
                                                                color: studentState.status === status
                                                                    ? (status === 'Present' ? 'var(--success)' : status === 'Absent' ? 'var(--danger)' : 'var(--warning)')
                                                                    : 'var(--text-muted)'
                                                            }}>
                                                                <input
                                                                    type="radio"
                                                                    name={`status-${student.id}`}
                                                                    value={status}
                                                                    checked={studentState.status === status}
                                                                    onChange={() => setSessionAttendance(prev => ({
                                                                        ...prev,
                                                                        [student.id]: { ...prev[student.id], status }
                                                                    }))}
                                                                />
                                                                {status}
                                                            </label>
                                                        ))}
                                                    </div>
                                                    {(studentState.status === 'Absent' || studentState.status === 'Late') && (
                                                        <input
                                                            type="text"
                                                            placeholder="Reason/Note..."
                                                            value={studentState.note}
                                                            onChange={(e) => setSessionAttendance(prev => ({
                                                                ...prev,
                                                                [student.id]: { ...prev[student.id], note: e.target.value }
                                                            }))}
                                                            style={{ fontSize: '0.85rem', padding: '0.25rem' }}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Session</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AttendanceTab;
