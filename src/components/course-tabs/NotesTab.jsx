import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trash2, Plus } from 'lucide-react';
import AddNoteModal from '../AddNoteModal';
import NoteCard from '../NoteCard';

const NotesTab = ({ courseId }) => {
    const { notes, deleteNote, courses } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    const course = courses.find(c => c.id === courseId);
    const courseNotes = notes.filter(n => n.relatedCourseId === courseId || (n.context?.type === 'Course' && n.context?.id === courseId));

    const handleEditNote = (note) => {
        setEditingNote(note);
        setIsModalOpen(true);
    };

    const handleDeleteNote = (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            deleteNote(noteId);
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Course Notes & Memos</h3>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                    <Plus size={16} /> Add Note
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {courseNotes.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No notes yet.</p>
                ) : (
                    courseNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onEdit={handleEditNote}
                            onDelete={handleDeleteNote}
                        />
                    ))
                )}
            </div>

            <AddNoteModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingNote(null); }}
                initialContext={course ? { type: 'Course', id: course.id, name: course.name } : null}
                initialNote={editingNote}
            />
        </div>
    );
};

export default NotesTab;
