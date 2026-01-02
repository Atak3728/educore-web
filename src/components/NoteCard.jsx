import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Bell, CheckSquare, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete }) => {
    const getTypeIcon = (type) => {
        switch (type) {
            case 'School Communication':
                return <Bell size={16} style={{ color: 'var(--warning)' }} />;
            case 'Task':
                return <CheckSquare size={16} style={{ color: 'var(--success)' }} />;
            default:
                return <FileText size={16} style={{ color: 'var(--primary)' }} />;
        }
    };

    return (
        <div className="note-card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        backgroundColor: 'var(--bg-main)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid var(--border)'
                    }}>
                        {getTypeIcon(note.type)} {note.type || 'General Memo'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(note.date).toLocaleDateString()} • {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Context Link */}
                    {note.context && (
                        <Link
                            to={note.context.type === 'Student' ? `/students/${note.context.id}` : `/courses/${note.context.id}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.8rem',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                padding: '0.1rem 0.5rem',
                                borderRadius: '1rem'
                            }}
                        >
                            <LinkIcon size={12} />
                            {note.context.type}: {note.context.name}
                        </Link>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => onEdit(note)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.25rem'
                        }}
                        className="hover-primary"
                        title="Edit Note"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(note.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.25rem'
                        }}
                        className="hover-danger"
                        title="Delete Note"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div style={{ lineHeight: '1.5', fontSize: '0.95rem' }}>
                {note.content}
            </div>

            {note.tags && note.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {note.tags.map(tag => (
                        <span key={tag} style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '1rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoteCard;
