import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const RecordPaymentForm = ({ onSuccess, onCancel }) => {
    const { students, courses, enrollments, addPayment } = useData();
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState('Cash');
    const [note, setNote] = useState('');

    // Filter courses based on selected student
    const studentCourses = enrollments
        .filter(e => e.studentId === selectedStudentId && e.status === 'Active')
        .map(e => courses.find(c => c.id === e.courseId))
        .filter(Boolean);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedStudentId || !selectedCourseId) return;

        addPayment({
            studentId: selectedStudentId,
            courseId: selectedCourseId,
            amount: parseFloat(amount),
            date,
            method,
            note
        });

        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Student</label>
                <select
                    required
                    value={selectedStudentId}
                    onChange={e => {
                        setSelectedStudentId(e.target.value);
                        setSelectedCourseId(''); // Reset course when student changes
                    }}
                    style={{ width: '100%', padding: '0.5rem' }}
                >
                    <option value="">Select Student...</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Course</label>
                <select
                    required
                    value={selectedCourseId}
                    onChange={e => setSelectedCourseId(e.target.value)}
                    disabled={!selectedStudentId}
                    style={{ width: '100%', padding: '0.5rem' }}
                >
                    <option value="">Select Course...</option>
                    {studentCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                {selectedStudentId && studentCourses.length === 0 && (
                    <small style={{ color: 'var(--danger)' }}>No active courses found for this student.</small>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount ($)</label>
                    <input
                        type="number"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        step="0.01"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Payment Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Note (Optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows="2" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record Payment</button>
            </div>
        </form>
    );
};

export default RecordPaymentForm;
