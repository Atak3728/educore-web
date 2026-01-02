import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--bg-card)', padding: '1.5rem',
                borderRadius: '1rem', width: '100%', maxWidth: '500px',
                border: '1px solid var(--border)', position: 'relative'
            }}>
                <div className="modal-header" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
