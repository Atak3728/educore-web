import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { updateProfile } = useData();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 4) {
            setError('Password must be at least 4 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // Update password directly since we are in a privileged reset mode
        updateProfile({ password: newPassword });
        setSuccess(true);

        // Redirect to login after a short delay
        setTimeout(() => {
            navigate('/login');
        }, 2000);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'var(--bg-dark)',
            color: 'var(--text-main)',
            backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2.5rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px', height: '48px', backgroundColor: 'var(--primary-light, #e0f2fe)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem auto', color: 'var(--primary)'
                    }}>
                        <Lock size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Reset Password</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Create a new password for your account.</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: 'var(--success)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <CheckCircle size={16} />
                        Password updated! Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'var(--bg-main)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'var(--bg-main)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={success}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: success ? 'default' : 'pointer',
                            opacity: success ? 0.7 : 1,
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Set New Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
