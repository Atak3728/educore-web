import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { X } from 'lucide-react';

const AddViolationModal = ({ isOpen, onClose, studentId, studentName }) => {
    const { addComplianceViolation } = useData();
    const [violationType, setViolationType] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');

    const violationTypes = [
        'No Camera',
        'Missed Homework',
        'Late Submission',
        'Disruptive Behavior',
        'Attendance Issue',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!violationType) {
            alert('Please select a violation type');
            return;
        }

        addComplianceViolation({
            studentId,
            violationType,
            date,
            note: note.trim()
        });

        // Reset form
        setViolationType('');
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '0.5rem',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Add New Violation</h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                    Recording violation for <strong>{studentName}</strong>
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Violation Type <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <select
                            value={violationType}
                            onChange={(e) => setViolationType(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        >
                            <option value="">Select violation type...</option>
                            {violationTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Note (Optional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add any additional details about this violation..."
                            rows="4"
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Add Violation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddViolationModal;
