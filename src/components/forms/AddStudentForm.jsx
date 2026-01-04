import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const AddStudentForm = ({ onSuccess, onCancel }) => {
    const { addStudent } = useData();
    const [newStudent, setNewStudent] = useState({
        name: '',
        studentPhone: '',
        fatherName: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: '',
        notes: '',
        photo: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addStudent(newStudent);
        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Student Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Student Name <span style={{ color: 'red' }}>*</span></label>
                    <input required value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="e.g. John Doe" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Student Phone</label>
                    <input type="tel" value={newStudent.studentPhone} onChange={e => setNewStudent({ ...newStudent, studentPhone: e.target.value })} placeholder="+1234567890" />
                </div>
            </div>

            <hr style={{ opacity: 0.1, margin: '0.5rem 0' }} />
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Parent Details</h4>

            {/* Parent Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Father's Name</label>
                    <input value={newStudent.fatherName} onChange={e => setNewStudent({ ...newStudent, fatherName: e.target.value })} placeholder="Father's Name" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Father's Phone</label>
                    <input type="tel" value={newStudent.fatherPhone} onChange={e => setNewStudent({ ...newStudent, fatherPhone: e.target.value })} placeholder="Father's Phone" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mother's Name</label>
                    <input value={newStudent.motherName} onChange={e => setNewStudent({ ...newStudent, motherName: e.target.value })} placeholder="Mother's Name" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mother's Phone</label>
                    <input type="tel" value={newStudent.motherPhone} onChange={e => setNewStudent({ ...newStudent, motherPhone: e.target.value })} placeholder="Mother's Phone" />
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes</label>
                <textarea
                    value={newStudent.notes}
                    onChange={e => setNewStudent({ ...newStudent, notes: e.target.value })}
                    placeholder="Any health notes, concerns, or background info..."
                    rows={3}
                />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Student</button>
            </div>
        </form>
    );
};

export default AddStudentForm;
