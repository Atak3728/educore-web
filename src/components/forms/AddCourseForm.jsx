import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const AddCourseForm = ({ onSuccess, onCancel }) => {
    const { addCourse } = useData();
    const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', fee: '', status: 'Active' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addCourse(formData);
        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Course Name</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Date</label>
                    <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>End Date</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Total Fee ($)</label>
                    <input type="number" required value={formData.fee} onChange={e => setFormData({ ...formData, fee: e.target.value })} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Course</button>
            </div>
        </form>
    );
};

export default AddCourseForm;
