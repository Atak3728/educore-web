import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Folder, Plus, Edit2, Trash2, ExternalLink, FileText, Link as LinkIcon, Image, File } from 'lucide-react';
import Modal from '../Modal';

const FilesTab = ({ courseId }) => {
    const { files, addFile, updateFile, deleteFile } = useData();
    const courseFiles = files.filter(f => f.courseId === courseId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFile, setEditingFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        type: 'Document',
        description: ''
    });

    const handleOpenModal = (file = null) => {
        if (file) {
            setEditingFile(file);
            setFormData({
                name: file.name,
                url: file.url,
                type: file.type,
                description: file.description
            });
        } else {
            setEditingFile(null);
            setFormData({
                name: '',
                url: '',
                type: 'Document',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingFile) {
            updateFile(editingFile.id, formData);
        } else {
            addFile({ ...formData, courseId });
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this file link?')) {
            deleteFile(id);
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'Document': return <FileText size={16} />;
            case 'Test/Form': return <LinkIcon size={16} />;
            case 'Image': return <Image size={16} />;
            default: return <File size={16} />;
        }
    };

    return (
        <div className="files-tab">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Course Files</h3>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add File Link
                </button>
            </div>

            {courseFiles.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Folder size={48} style={{ marginBottom: '1rem', color: 'var(--primary)', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No files linked yet. Add a link to get started.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Date Added</th>
                                <th>Link</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseFiles.map(file => (
                                <tr key={file.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                            {getFileIcon(file.type)}
                                            {file.name}
                                        </div>
                                    </td>
                                    <td>{file.type}</td>
                                    <td>{file.description}</td>
                                    <td>{new Date(file.date).toLocaleDateString()}</td>
                                    <td>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)' }}>
                                            Open <ExternalLink size={14} />
                                        </a>
                                    </td>
                                    <td>
                                        <button className="btn" style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} onClick={() => handleOpenModal(file)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(file.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingFile ? "Edit File Link" : "Add File Link"}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>File Name</label>
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Syllabus, Midterm Exam"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>External Link (URL)</label>
                        <input
                            type="url"
                            required
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://drive.google.com/..."
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>File Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Document">Document</option>
                            <option value="Test/Form">Test/Form</option>
                            <option value="Image">Image</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description/Tag</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            placeholder="Optional description..."
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-dark)' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Link</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FilesTab;
