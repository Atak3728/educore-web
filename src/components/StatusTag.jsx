import React from 'react';

const StatusTag = ({ status, type = 'default' }) => {
    let backgroundColor = 'rgba(148, 163, 184, 0.1)';
    let color = 'var(--text-muted)';

    const s = status?.toLowerCase() || '';

    if (type === 'enrollment') {
        if (s === 'active') {
            backgroundColor = 'rgba(16, 185, 129, 0.1)';
            color = 'var(--success)';
        } else if (s === 'completed') {
            backgroundColor = 'rgba(59, 130, 246, 0.1)';
            color = 'var(--primary)';
        } else if (s === 'dropped') {
            backgroundColor = 'rgba(239, 68, 68, 0.1)';
            color = 'var(--danger)';
        }
    } else if (type === 'payment') {
        if (s === 'paid' || s === 'fully paid') {
            backgroundColor = 'rgba(16, 185, 129, 0.1)';
            color = 'var(--success)';
        } else if (s === 'partial') {
            backgroundColor = 'rgba(245, 158, 11, 0.1)';
            color = 'var(--warning)';
        } else if (s === 'unpaid' || s === 'overdue') {
            backgroundColor = 'rgba(239, 68, 68, 0.1)';
            color = 'var(--danger)';
        }
    } else if (type === 'attendance') {
        // Expecting status to be a number (rate) or string
        const rate = parseFloat(status);
        if (!isNaN(rate)) {
            if (rate >= 80) {
                backgroundColor = 'rgba(16, 185, 129, 0.1)';
                color = 'var(--success)';
            } else if (rate >= 70) {
                backgroundColor = 'rgba(245, 158, 11, 0.1)';
                color = 'var(--warning)';
            } else {
                backgroundColor = 'rgba(239, 68, 68, 0.1)';
                color = 'var(--danger)';
            }
        }
    }

    return (
        <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor,
            color,
            textTransform: 'capitalize'
        }}>
            {status}
            {type === 'attendance' && !isNaN(parseFloat(status)) ? '%' : ''}
        </span>
    );
};

export default StatusTag;
