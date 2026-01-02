import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { X, Tag, CheckSquare, Bell, FileText } from 'lucide-react';

const AddNoteModal = ({ isOpen, onClose, initialContext = null, initialNote = null }) => {
    const { addNote, updateNote } = useData();

    // State
    const [content, setContent] = useState('');
    const [noteType, setNoteType] = useState('General Memo');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialNote) {
                setContent(initialNote.content);
                setNoteType(initialNote.type || 'General Memo');
                setTags(initialNote.tags || []);
                setTagInput('');
            } else {
                setContent('');
                setNoteType('General Memo');
                setTags([]);
                setTagInput('');
            }
        }
    }, [isOpen, initialNote]);

    if (!isOpen) return null;

    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/^#/, '');
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSaveNote = () => {
        if (!content.trim()) return;

        if (initialNote) {
            updateNote(initialNote.id, {
                content,
                type: noteType,
                tags,
                // Keep original context and timestamp, or update timestamp if desired?
                // Let's keep original timestamp for creation, maybe add updated timestamp?
                // For now, just update content/type/tags
            });
        } else {
            addNote({
                content,
                type: noteType,
                tags,
                context: initialContext,
                timestamp: new Date().toISOString()
            });
        }

        onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '600px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', border: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>{initialNote ? 'Edit Note' : 'Create New Note'}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                {initialContext && (
                    <div style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.25rem', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--primary)', fontSize: '0.9rem' }}>
                        <strong>Related to:</strong> {initialContext.type}: {initialContext.name}
                    </div>
                )}

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Note Type</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['General Memo', 'School Communication', 'Task'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setNoteType(type)}
                                    style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border)',
                                        backgroundColor: noteType === type ? 'var(--primary)' : 'var(--bg-main)',
                                        color: noteType === type ? 'white' : 'var(--text-main)',
                                        cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your note content here..."
                            style={{
                                width: '100%', minHeight: '150px', padding: '1rem', borderRadius: '0.25rem',
                                border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)',
                                color: 'var(--text-main)', resize: 'vertical', fontFamily: 'inherit'
                            }}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tags</label>
                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem',
                            border: '1px solid var(--border)', borderRadius: '0.25rem', backgroundColor: 'var(--bg-main)', minHeight: '42px'
                        }}>
                            {tags.map(tag => (
                                <span key={tag} style={{
                                    fontSize: '0.85rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem',
                                    backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem'
                                }}>
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, marginLeft: '0.25rem' }}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder={tags.length === 0 ? "Type tag and press Enter..." : ""}
                                style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'var(--text-main)', flex: 1, minWidth: '120px' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSaveNote} disabled={!content.trim()}>
                        {initialNote ? 'Save Changes' : 'Save Note'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddNoteModal;
