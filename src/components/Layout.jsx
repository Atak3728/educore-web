import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    DollarSign,
    FileBarChart,
    Settings,
    Menu,
    X,
    Bell,
    Check,
    ClipboardList,
    Sun,
    Moon,
    User,
    LogOut,
    Search
} from 'lucide-react';
import { useData } from '../context/DataContext';

const NavLink = ({ to, icon, label, onClick }) => {
    const location = useLocation();
    // Check if active based on path. Exact match for root, startsWith for others.
    const isActive = to === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(to);

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`nav-link ${isActive ? 'active' : ''}`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const { notificationCount, unreadNotifications, markAllAsRead, theme, toggleTheme, logout, user, students, courses } = useData();
    const notificationRef = useRef(null);
    const userDropdownRef = useRef(null);

    // Search Logic
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const searchRef = useRef(null);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const matchedStudents = (students || []).filter(s => s.name.toLowerCase().includes(lowerQuery)).map(s => ({ ...s, type: 'student' }));
        const matchedCourses = (courses || []).filter(c => c.name.toLowerCase().includes(lowerQuery)).map(c => ({ ...c, type: 'course' }));

        setSearchResults([...matchedStudents, ...matchedCourses]);
    }, [searchQuery, students, courses]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
                setSearchQuery(''); // Optional: clear query on close
            }
            // ... existing handlers
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = () => {
        markAllAsRead();
        setIsNotificationOpen(false);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const { isUpdateAvailable, EXPECTED_LATEST_VERSION } = useData();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {/* Update Alert Banner */}
            {isUpdateAvailable && (
                <div style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    <Bell size={16} fill="white" />
                    <span>
                        Update Available! Please contact administrator for the latest v{EXPECTED_LATEST_VERSION}.
                    </span>
                </div>
            )}
            {/* Top Navigation Bar */}
            <header className="top-nav">
                <div className="nav-left">
                    <button
                        className="hamburger-btn"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>EC</div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>EduCore</h1>
                    </div>

                    {/* Main Navigation Links */}
                    <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
                        <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setIsMenuOpen(false)} />
                        <NavLink to="/students" icon={<Users size={18} />} label="Students" onClick={() => setIsMenuOpen(false)} />
                        <NavLink to="/courses" icon={<BookOpen size={18} />} label="Courses" onClick={() => setIsMenuOpen(false)} />
                        <NavLink to="/financials" icon={<DollarSign size={18} />} label="Financials" onClick={() => setIsMenuOpen(false)} />
                        <NavLink to="/reports" icon={<FileBarChart size={18} />} label="Reports" onClick={() => setIsMenuOpen(false)} />
                        <NavLink to="/notes" icon={<ClipboardList size={18} />} label="Notes" onClick={() => setIsMenuOpen(false)} />
                        <NavLink to="/settings" icon={<Settings size={18} />} label="Settings" onClick={() => setIsMenuOpen(false)} />
                    </nav>
                </div>

                <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Global Search */}
                    <div className="desktop-search" ref={searchRef}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                                    borderRadius: '2rem',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    width: '140px',
                                    transition: 'width 0.2s',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        {searchResults.length > 0 && searchQuery && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                width: '300px',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                marginTop: '0.5rem',
                                zIndex: 1000,
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {searchResults.map((result, idx) => (
                                    <Link
                                        key={idx}
                                        to={result.type === 'student' ? `/students/${result.id}` : `/courses/${result.id}`}
                                        onClick={() => setSearchQuery('')}
                                        style={{
                                            display: 'block',
                                            padding: '0.75rem',
                                            textDecoration: 'none',
                                            color: 'var(--text-main)',
                                            borderBottom: '1px solid var(--border)'
                                        }}
                                        className="hover-bg-dark"
                                    >
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{result.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {result.type === 'student' ? 'Student' : 'Course'}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Notification Dropdown */}
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        style={{
                            position: 'relative',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-main)'
                        }}
                    >
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: 'var(--danger)',
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {notificationCount}
                            </span>
                        )}
                    </button>

                    {isNotificationOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: '320px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            marginTop: '0.5rem',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Notifications</span>
                                {notificationCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <Check size={12} /> Mark all read
                                    </button>
                                )}
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {unreadNotifications.length === 0 ? (
                                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        No new notifications
                                    </div>
                                ) : (
                                    unreadNotifications.slice(0, 10).map((note, idx) => (
                                        <Link
                                            key={idx}
                                            to={note.link}
                                            onClick={() => setIsNotificationOpen(false)}
                                            style={{
                                                display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit',
                                                borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s',
                                                textAlign: 'left'
                                            }}
                                            className="hover-bg-dark"
                                        >
                                            <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{note.message}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {note.type.charAt(0).toUpperCase() + note.type.slice(1)} Alert
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            <Link
                                to="/notifications"
                                onClick={() => setIsNotificationOpen(false)}
                                style={{
                                    padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem',
                                    color: 'var(--primary)', textDecoration: 'none', borderTop: '1px solid var(--border)',
                                    fontWeight: '500'
                                }}
                            >
                                View All Alerts
                            </Link>
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }} ref={userDropdownRef}>
                        <div style={{ textAlign: 'right', display: 'none', '@media (min-width: 768px)': { display: 'block' } }} className="desktop-user-info">
                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user?.name || 'Guest User'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role || 'Viewer'}</div>
                        </div>
                        <button
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            style={{
                                width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-dark)',
                                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', padding: 0
                            }}
                        >
                            <Users size={20} style={{ color: 'var(--text-main)' }} />
                        </button>

                        {isUserDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                width: '200px',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                marginTop: '0.5rem',
                                zIndex: 100,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '0.5rem'
                            }}>
                                <Link
                                    to="/settings?tab=security"
                                    onClick={() => setIsUserDropdownOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                                        textDecoration: 'none', color: 'var(--text-main)', borderRadius: '0.25rem',
                                        fontSize: '0.9rem', transition: 'background-color 0.2s'
                                    }}
                                    className="hover-bg-dark"
                                >
                                    <User size={16} /> View Profile
                                </Link>
                                <Link
                                    to="/settings?tab=security"
                                    onClick={() => setIsUserDropdownOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                                        textDecoration: 'none', color: 'var(--text-main)', borderRadius: '0.25rem',
                                        fontSize: '0.9rem', transition: 'background-color 0.2s'
                                    }}
                                    className="hover-bg-dark"
                                >
                                    <Settings size={16} /> Change Password
                                </Link>
                                <button
                                    onClick={() => { toggleTheme(); setIsUserDropdownOpen(false); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                                        background: 'none', border: 'none', color: 'var(--text-main)', borderRadius: '0.25rem',
                                        fontSize: '0.9rem', cursor: 'pointer', width: '100%', textAlign: 'left',
                                        transition: 'background-color 0.2s'
                                    }}
                                    className="hover-bg-dark"
                                >
                                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                </button>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>
                                <button
                                    onClick={() => { logout(); setIsUserDropdownOpen(false); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                                        background: 'none', border: 'none', color: 'var(--danger)', borderRadius: '0.25rem',
                                        fontSize: '0.9rem', cursor: 'pointer', width: '100%', textAlign: 'left',
                                        transition: 'background-color 0.2s'
                                    }}
                                    className="hover-bg-dark"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="main-content" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
