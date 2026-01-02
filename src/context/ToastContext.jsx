import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            border: '1px solid var(--border)',
                            borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success)' :
                                    toast.type === 'error' ? 'var(--danger)' :
                                        'var(--primary)'
                                }`,
                            minWidth: '250px',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        {toast.type === 'success' && <CheckCircle size={18} color="var(--success)" />}
                        {toast.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
                        {toast.type === 'info' && <Info size={18} color="var(--primary)" />}

                        <span style={{ fontSize: '0.9rem', flex: 1 }}>{toast.message}</span>

                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                padding: 0,
                                display: 'flex'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
