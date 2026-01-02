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
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addStudent(newStudent);
        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                <input required value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Student Phone</label>
                    <input value={newStudent.studentPhone} onChange={e => setNewStudent({ ...newStudent, studentPhone: e.target.value })} />
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Father's Info</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                        <input value={newStudent.fatherName} onChange={e => setNewStudent({ ...newStudent, fatherName: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                        <input value={newStudent.fatherPhone} onChange={e => setNewStudent({ ...newStudent, fatherPhone: e.target.value })} />
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Mother's Info</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                        <input value={newStudent.motherName} onChange={e => setNewStudent({ ...newStudent, motherName: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                        <input value={newStudent.motherPhone} onChange={e => setNewStudent({ ...newStudent, motherPhone: e.target.value })} />
                    </div>
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes</label>
                <textarea value={newStudent.notes} onChange={e => setNewStudent({ ...newStudent, notes: e.target.value })} rows="2" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Student</button>
            </div>
        </form>
    );
};

export default AddStudentForm;
