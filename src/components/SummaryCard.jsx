import React from 'react';

const SummaryCard = ({ title, value, icon: Icon, color, subtext }) => {
    return (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                backgroundColor: `var(--${color || 'primary'})`,
                padding: '1rem',
                borderRadius: '0.75rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {Icon && <Icon size={24} />}
            </div>
            <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{title}</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
                {subtext && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtext}</div>}
            </div>
        </div>
    );
};

export default SummaryCard;
