import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const LogSessionForm = ({ onSuccess, onCancel }) => {
    const { courses, students, enrollments, addAttendanceSession } = useData();
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [sessionNote, setSessionNote] = useState('');
    const [sessionAttendance, setSessionAttendance] = useState({}); // { studentId: { status, note } }

    // Get active students for selected course
    const activeStudents = selectedCourseId
        ? enrollments
            .filter(e => e.courseId === selectedCourseId && e.status === 'Active')
            .map(e => students.find(s => s.id === e.studentId))
            .filter(Boolean)
        : [];

    // Initialize attendance when course changes
    useEffect(() => {
        if (activeStudents.length > 0) {
            const initialStatus = {};
            activeStudents.forEach(s => {
                initialStatus[s.id] = { status: 'Present', note: '' };
            });
            setSessionAttendance(initialStatus);
        }
    }, [selectedCourseId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCourseId) return;

        const records = Object.keys(sessionAttendance).map(studentId => ({
            studentId,
            status: sessionAttendance[studentId].status,
            note: sessionAttendance[studentId].note
        }));

        addAttendanceSession({
            courseId: selectedCourseId,
            date: sessionDate,
            sessionNote,
            records
        });

        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Course</label>
                <select
                    required
                    value={selectedCourseId}
                    onChange={e => setSelectedCourseId(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem' }}
                >
                    <option value="">Select Course...</option>
                    {courses.filter(c => c.status === 'Active').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                    <input
                        type="date"
                        required
                        value={sessionDate}
                        onChange={e => setSessionDate(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Session Notes</label>
                <textarea
                    value={sessionNote}
                    onChange={e => setSessionNote(e.target.value)}
                    rows="2"
                    placeholder="Topic covered, etc."
                />
            </div>

            {selectedCourseId && (
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Attendance</h4>
                    {activeStudents.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No active students in this course.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {activeStudents.map(student => {
                                const studentState = sessionAttendance[student.id] || { status: 'Present', note: '' };
                                return (
                                    <div key={student.id} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.25rem' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{student.name}</div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {['Present', 'Absent', 'Late'].map(status => (
                                                <label key={status} style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer',
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
                                            {(studentState.status === 'Absent' || studentState.status === 'Late') && (
                                                <input
                                                    type="text"
                                                    placeholder="Reason..."
                                                    value={studentState.note}
                                                    onChange={(e) => setSessionAttendance(prev => ({
                                                        ...prev,
                                                        [student.id]: { ...prev[student.id], note: e.target.value }
                                                    }))}
                                                    style={{ fontSize: '0.8rem', padding: '0.1rem 0.25rem', width: '100px' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Session</button>
            </div>
        </form>
    );
};

export default LogSessionForm;
