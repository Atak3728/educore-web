import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Bell, Check, Filter, AlertTriangle, DollarSign, Users, Database, Award, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Pagination from '../components/Pagination';

const Notifications = () => {
    useDocumentTitle('EduCore | Notifications');
    const { allNotifications, unreadNotifications, markAsRead, markAllAsRead } = useData();
    const [view, setView] = useState('unread'); // 'unread' | 'all'
    const [filter, setFilter] = useState('All'); // 'All' | 'Financial' | 'Attendance' | 'System'
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Derived Data
    const displayedNotifications = view === 'unread' ? unreadNotifications : allNotifications;

    const filteredNotifications = displayedNotifications
        .filter(note => {
            const matchesSearch = note.message.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            if (filter === 'All') return true;
            if (filter === 'Financial') return note.type === 'financial' || note.type === 'payment';
            if (filter === 'Attendance') return note.type === 'attendance';
            if (filter === 'System') return note.type === 'integrity' || note.type === 'milestone';
            return true;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const paginatedNotifications = filteredNotifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getIcon = (type) => {
        switch (type) {
            case 'payment': return <DollarSign size={18} className="text-warning" />;
            case 'financial': return <AlertTriangle size={18} className="text-danger" />;
            case 'attendance': return <Users size={18} className="text-warning" />;
            case 'integrity': return <Database size={18} className="text-primary" />;
            case 'milestone': return <Award size={18} className="text-success" />;
            default: return <Bell size={18} className="text-muted" />;
        }
    };

    return (
        <div className="notifications-page">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>Notifications</h2>
                    <p className="text-muted">Manage system alerts and updates.</p>
                </div>
                {unreadNotifications.length > 0 && (
                    <button className="btn btn-primary" onClick={markAllAsRead}>
                        <Check size={18} /> Mark All as Read
                    </button>
                )}
            </header>

            {/* Controls */}
            <div className="controls-bar" style={{
                display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
                backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)'
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                            borderRadius: '0.25rem', border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-main)', color: 'var(--text-main)'
                        }}
                    />
                </div>

                {/* View Toggle */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setView('unread')}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--border)',
                            backgroundColor: view === 'unread' ? 'var(--primary)' : 'var(--bg-main)',
                            color: view === 'unread' ? 'white' : 'var(--text-main)',
                            cursor: 'pointer', fontSize: '0.9rem'
                        }}
                    >
                        Unread ({unreadNotifications.length})
                    </button>
                    <button
                        onClick={() => setView('all')}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--border)',
                            backgroundColor: view === 'all' ? 'var(--primary)' : 'var(--bg-main)',
                            color: view === 'all' ? 'white' : 'var(--text-main)',
                            cursor: 'pointer', fontSize: '0.9rem'
                        }}
                    >
                        All History
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                    <Filter size={18} className="text-muted" />
                    <select
                        value={filter}
                        onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                        style={{
                            padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', minWidth: '150px'
                        }}
                    >
                        <option value="All">All Categories</option>
                        <option value="Financial">Financial & Payments</option>
                        <option value="Attendance">Attendance</option>
                        <option value="System">System & Milestones</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {paginatedNotifications.length === 0 ? (
                    <div className="text-muted" style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        No notifications found.
                    </div>
                ) : (
                    paginatedNotifications.map((note) => {
                        const isUnread = unreadNotifications.some(u => u.id === note.id);
                        return (
                            <div key={note.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '0.5rem',
                                border: '1px solid var(--border)', borderLeft: isUnread ? '4px solid var(--primary)' : '1px solid var(--border)',
                                opacity: isUnread ? 1 : 0.7
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid var(--border)'
                                    }}>
                                        {getIcon(note.type)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: isUnread ? '600' : '400', marginBottom: '0.25rem' }}>{note.message}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                                            <span>{new Date(note.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span style={{ textTransform: 'capitalize' }}>{note.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Link to={note.link} className="btn btn-secondary" style={{ fontSize: '0.8rem', textDecoration: 'none', padding: '0.4rem 0.8rem' }}>
                                        View
                                    </Link>
                                    {isUnread && (
                                        <button
                                            onClick={() => markAsRead(note.id)}
                                            title="Mark as Read"
                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                        >
                                            <Check size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default Notifications;
