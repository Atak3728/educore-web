import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';

const GradingTab = ({ courseId }) => {
    const { courses, updateCourse, appRules } = useData();
    const course = courses.find(c => c.id === courseId);

    const [maxPoints, setMaxPoints] = useState(course?.maxPoints || appRules.defaultMaxPoints || 100);
    const [tasks, setTasks] = useState(course?.requiredTasks || []);
    const [isEditing, setIsEditing] = useState(false);

    // Local state for new task input
    const [newTask, setNewTask] = useState({
        name: '',
        maxPoints: '',
        description: '',
        teacherLink: ''
    });

    const handleSaveSettings = () => {
        updateCourse(courseId, {
            maxPoints: parseFloat(maxPoints),
            requiredTasks: tasks
        });
        setIsEditing(false);
        alert('Grading settings saved!');
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.name || !newTask.maxPoints) return;

        const task = {
            ...newTask,
            id: crypto.randomUUID(),
            maxPoints: parseFloat(newTask.maxPoints)
        };

        setTasks([...tasks, task]);
        setNewTask({ name: '', maxPoints: '', description: '', teacherLink: '' });
    };

    const handleDeleteTask = (taskId) => {
        if (window.confirm('Are you sure you want to delete this task? Existing grades for this task will be orphaned.')) {
            setTasks(tasks.filter(t => t.id !== taskId));
        }
    };

    const totalTaskPoints = tasks.reduce((sum, t) => sum + (parseFloat(t.maxPoints) || 0), 0);
    const pointsMismatch = totalTaskPoints !== parseFloat(maxPoints);

    return (
        <div className="grading-tab">
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Grading Configuration</h3>
                    {!isEditing ? (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            Edit Configuration
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn" onClick={() => {
                                setIsEditing(false);
                                setMaxPoints(course?.maxPoints || 100);
                                setTasks(course?.requiredTasks || []);
                            }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveSettings}>
                                <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Changes
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Course Points</label>
                    <input
                        type="number"
                        value={maxPoints}
                        onChange={(e) => setMaxPoints(e.target.value)}
                        disabled={!isEditing}
                        style={{ width: '150px', padding: '0.5rem', fontSize: '1.1rem' }}
                    />
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        The maximum score a student can achieve in this course.
                    </p>
                </div>

                <div>
                    <h4 style={{ marginBottom: '1rem' }}>Required Tasks & Assignments</h4>

                    {pointsMismatch && (
                        <div style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: 'var(--warning)',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <AlertCircle size={20} />
                            <span>
                                <strong>Warning:</strong> The sum of task points ({totalTaskPoints}) does not match the Total Course Points ({maxPoints}).
                            </span>
                        </div>
                    )}

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Task Name</th>
                                    <th>Max Points</th>
                                    <th>Description / Notes</th>
                                    <th>Teacher Link</th>
                                    {isEditing && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={isEditing ? 5 : 4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                            No tasks defined yet.
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map(task => (
                                        <tr key={task.id}>
                                            <td style={{ fontWeight: '500' }}>{task.name}</td>
                                            <td>{task.maxPoints}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{task.description || '-'}</td>
                                            <td>
                                                {task.teacherLink ? (
                                                    <a href={task.teacherLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                                                        View Link
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            {isEditing && (
                                                <td>
                                                    <button
                                                        className="btn"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        style={{ color: 'var(--danger)', padding: '0.25rem' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {isEditing && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                            <h5 style={{ marginBottom: '1rem' }}>Add New Task</h5>
                            <form onSubmit={handleAddTask} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Task Name *</label>
                                    <input
                                        type="text"
                                        value={newTask.name}
                                        onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                                        placeholder="e.g. Midterm Exam"
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Points *</label>
                                    <input
                                        type="number"
                                        value={newTask.maxPoints}
                                        onChange={e => setNewTask({ ...newTask, maxPoints: e.target.value })}
                                        placeholder="0"
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Description</label>
                                    <input
                                        type="text"
                                        value={newTask.description}
                                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                        placeholder="Optional notes"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Teacher Link</label>
                                    <input
                                        type="url"
                                        value={newTask.teacherLink}
                                        onChange={e => setNewTask({ ...newTask, teacherLink: e.target.value })}
                                        placeholder="https://..."
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}>
                                    <Plus size={20} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GradingTab;
