import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const AddAdvanceForm = ({ onSuccess, onCancel }) => {
    const { addAdvance } = useData();
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addAdvance(formData);
        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount ($)</label>
                <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Note</label>
                <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows="3"
                    placeholder="Reason for advance..."
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Advance</button>
            </div>
        </form>
    );
};

export default AddAdvanceForm;
