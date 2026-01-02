import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useData();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        // Pass navigate to login function so it can redirect on success
        if (!login(username, password, navigate)) {
            setError('Invalid credentials.');
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#0f172a',
            backgroundImage: `
                radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
                radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
                radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)
            `,
            backgroundSize: '200% 200%',
            animation: 'gradient-animation 15s ease infinite',
            color: 'var(--text-main)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            zIndex: 9999
        }}>
            <style>
                {`
                    @keyframes gradient-animation {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .login-input:focus {
                        border-color: var(--primary) !important;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                    }
                `}
            </style>

            {/* Decorative Elements */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0
            }}></div>

            <div style={{
                width: '100%',
                maxWidth: '420px',
                padding: '3rem',
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 1,
                margin: '1rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px', backgroundColor: 'var(--primary)',
                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem auto', color: 'white', fontWeight: 'bold', fontSize: '1.5rem',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                    }}>
                        EC
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>Welcome Back</h1>
                    <p style={{ color: '#94a3b8' }}>Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#fca5a5',
                        padding: '0.875rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0', textAlign: 'left' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="login-input"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 0.875rem 0.875rem 3rem',
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0', textAlign: 'left' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="login-input"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 0.875rem 0.875rem 3rem',
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            backgroundColor: isLoading ? '#64748b' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            boxShadow: isLoading ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                            opacity: isLoading ? 0.8 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = 'var(--primary)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {isLoading ? 'Signing In...' : <>Sign In <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                    <p>Protected by EduCore Security</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
