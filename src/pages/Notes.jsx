import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Search, Filter, FileText, Bell, CheckSquare, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import AddNoteModal from '../components/AddNoteModal';
import Pagination from '../components/Pagination';

const Notes = () => {
    useDocumentTitle('EduCore | Notes');
    const { notes, deleteNote } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Derived Data
    const allTags = ['All', ...new Set(notes.flatMap(note => note.tags || []))];

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (note.tags && note.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesTag = selectedTag === 'All' || (note.tags && note.tags.includes(selectedTag));
        return matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
    const paginatedNotes = filteredNotes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getTypeIcon = (type) => {
        switch (type) {
            case 'School Communication': return <Bell size={16} className="text-warning" />;
            case 'Task': return <CheckSquare size={16} className="text-success" />;
            default: return <FileText size={16} className="text-primary" />;
        }
    };

    return (
        <div className="notes-page">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>Notes & Reminders</h2>
                    <p className="text-muted">Manage administrative memos and tasks.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Add Note
                </button>
            </header>

            {/* Controls Bar */}
            <div className="controls-bar" style={{
                display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
                backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                            borderRadius: '0.25rem', border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-main)', color: 'var(--text-main)'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} className="text-muted" />
                    <select
                        value={selectedTag}
                        onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
                        style={{
                            padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', minWidth: '150px'
                        }}
                    >
                        {allTags.map(tag => (
                            <option key={tag} value={tag}>{tag === 'All' ? 'All Tags' : `#${tag}`}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Notes List */}
            <div className="notes-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {paginatedNotes.length === 0 ? (
                    <div className="text-muted" style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        No notes found matching your criteria.
                    </div>
                ) : (
                    paginatedNotes.map(note => (
                        <div key={note.id} className="note-item" style={{
                            display: 'flex', flexDirection: 'column', gap: '0.5rem',
                            backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em',
                                        backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)'
                                    }}>
                                        {getTypeIcon(note.type)} {note.type || 'General Memo'}
                                    </span>
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        {new Date(note.date).toLocaleDateString()} • {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    {/* Context Link */}
                                    {note.context && (
                                        <Link
                                            to={note.context.type === 'Student' ? `/students/${note.context.id}` : `/courses/${note.context.id}`}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem',
                                                color: 'var(--primary)', textDecoration: 'none',
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '1rem'
                                            }}
                                        >
                                            <LinkIcon size={12} />
                                            {note.context.type}: {note.context.name}
                                        </Link>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                                    className="hover-danger"
                                    title="Delete Note"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div style={{ lineHeight: '1.5', fontSize: '0.95rem' }}>
                                {note.content}
                            </div>

                            {note.tags && note.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {note.tags.map(tag => (
                                        <span key={tag} style={{
                                            fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '1rem',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)',
                                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                                        }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <AddNoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Notes;
