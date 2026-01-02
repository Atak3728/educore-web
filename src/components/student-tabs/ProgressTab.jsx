import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Save, ExternalLink, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const ProgressTab = ({ studentId }) => {
    const { courses, enrollments, grades, upsertGrade } = useData();
    const [expandedCourseId, setExpandedCourseId] = useState(null);

    // Filter enrollments for this student
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId);

    // State for inputs (keyed by `${courseId}-${taskId}`)
    const [inputs, setInputs] = useState({});

    const handleInputChange = (key, field, value) => {
        setInputs(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    const handleSaveGrade = (courseId, taskId) => {
        const key = `${courseId}-${taskId}`;
        const inputData = inputs[key] || {};

        // Get existing grade to preserve other fields if not updated
        const existingGrade = grades.find(g => g.studentId === studentId && g.courseId === courseId && g.taskId === taskId);

        const updateData = {};
        if (inputData.score !== undefined) updateData.score = inputData.score;
        if (inputData.submissionLink !== undefined) updateData.submissionLink = inputData.submissionLink;
        if (inputData.isAssigned !== undefined) updateData.isAssigned = inputData.isAssigned;

        if (Object.keys(updateData).length === 0) return;

        upsertGrade(studentId, courseId, taskId, updateData);
        alert('Progress updated!');
    };

    const toggleCourse = (courseId) => {
        setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
    };

    return (
        <div className="progress-tab">
            {studentEnrollments.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    Student is not enrolled in any courses.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {studentEnrollments.map(enrollment => {
                        const course = courses.find(c => c.id === enrollment.courseId);
                        if (!course) return null;

                        const requiredTasks = course.requiredTasks || [];
                        const maxPoints = parseFloat(course.maxPoints) || 100;

                        // Calculate current score
                        const studentGrades = grades.filter(g => g.studentId === studentId && g.courseId === enrollment.courseId);
                        const currentScore = studentGrades.reduce((sum, g) => sum + (parseFloat(g.score) || 0), 0);
                        const progressPercent = maxPoints > 0 ? (currentScore / maxPoints) * 100 : 0;

                        const isExpanded = expandedCourseId === course.id;

                        return (
                            <div key={course.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Course Header */}
                                <div
                                    onClick={() => toggleCourse(course.id)}
                                    style={{
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        backgroundColor: 'var(--bg-card)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{course.name}</h3>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            <span>Status: <strong style={{ color: enrollment.status === 'Active' ? 'var(--success)' : 'var(--text-muted)' }}>{enrollment.status}</strong></span>
                                            <span>Tasks: {requiredTasks.length}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: progressPercent < 50 ? 'var(--danger)' : 'var(--success)' }}>
                                                {currentScore} / {maxPoints}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Score</div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)' }}>
                                        {requiredTasks.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No required tasks defined for this course.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {requiredTasks.map(task => {
                                                    const grade = studentGrades.find(g => g.taskId === task.id);
                                                    const key = `${course.id}-${task.id}`;
                                                    const inputScore = inputs[key]?.score ?? grade?.score ?? '';
                                                    const inputLink = inputs[key]?.submissionLink ?? grade?.submissionLink ?? '';

                                                    return (
                                                        <div key={task.id} style={{
                                                            backgroundColor: 'var(--bg-card)',
                                                            padding: '1rem',
                                                            borderRadius: '0.5rem',
                                                            border: '1px solid var(--border)'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                                <div>
                                                                    <h4 style={{ margin: 0, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        {task.name}
                                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal', backgroundColor: 'var(--bg-main)', padding: '0.1rem 0.4rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                                                            {task.maxPoints} pts
                                                                        </span>
                                                                    </h4>
                                                                    {task.description && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{task.description}</p>}
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                    {task.teacherLink && (
                                                                        <a href={task.teacherLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', height: '32px' }}>
                                                                            <ExternalLink size={14} /> Task Link
                                                                        </a>
                                                                    )}

                                                                    {/* Toggle Switch */}
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned</span>
                                                                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={inputs[key]?.isAssigned ?? grade?.isAssigned ?? false}
                                                                                onChange={(e) => handleInputChange(key, 'isAssigned', e.target.checked)}
                                                                                style={{ opacity: 0, width: 0, height: 0 }}
                                                                            />
                                                                            <span className="slider round" style={{
                                                                                position: 'absolute',
                                                                                cursor: 'pointer',
                                                                                top: 0,
                                                                                left: 0,
                                                                                right: 0,
                                                                                bottom: 0,
                                                                                backgroundColor: (inputs[key]?.isAssigned ?? grade?.isAssigned ?? false) ? 'var(--primary)' : '#ccc',
                                                                                transition: '.4s',
                                                                                borderRadius: '34px'
                                                                            }}>
                                                                                <span style={{
                                                                                    position: 'absolute',
                                                                                    content: "",
                                                                                    height: '14px',
                                                                                    width: '14px',
                                                                                    left: (inputs[key]?.isAssigned ?? grade?.isAssigned ?? false) ? '22px' : '4px',
                                                                                    bottom: '3px',
                                                                                    backgroundColor: 'white',
                                                                                    transition: '.4s',
                                                                                    borderRadius: '50%'
                                                                                }}></span>
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                                <div style={{ flexGrow: 1 }}>
                                                                    <input
                                                                        type="url"
                                                                        placeholder="Paste submission link here..."
                                                                        value={inputLink}
                                                                        onChange={(e) => handleInputChange(key, 'submissionLink', e.target.value)}
                                                                        style={{ width: '100%', fontSize: '0.9rem', padding: '0.5rem', borderRadius: '0.3rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                                                    />
                                                                </div>
                                                                <div style={{ width: '80px' }}>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Score"
                                                                        value={inputScore}
                                                                        onChange={(e) => handleInputChange(key, 'score', e.target.value)}
                                                                        style={{ width: '100%', fontSize: '0.9rem', padding: '0.5rem', borderRadius: '0.3rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', textAlign: 'center' }}
                                                                    />
                                                                </div>
                                                                <button
                                                                    className="btn btn-primary"
                                                                    onClick={() => handleSaveGrade(course.id, task.id)}
                                                                    style={{
                                                                        padding: '0.5rem',
                                                                        borderRadius: '0.3rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '36px',
                                                                        height: '36px'
                                                                    }}
                                                                    title="Save Grade & Submission"
                                                                >
                                                                    <Save size={18} />
                                                                </button>
                                                            </div>
                                                            {grade?.submissionLink && (
                                                                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                                                    <a href={grade.submissionLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                        <CheckCircle size={12} /> View Current Submission
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProgressTab;
