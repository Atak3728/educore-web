import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Users, Calendar, DollarSign, FileText, BarChart2, Folder } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

import StudentsTab from '../components/course-tabs/StudentsTab';
import AttendanceTab from '../components/course-tabs/AttendanceTab';
import PaymentsTab from '../components/course-tabs/PaymentsTab';
import FilesTab from '../components/course-tabs/FilesTab';
import NotesTab from '../components/course-tabs/NotesTab';
import ReportsTab from '../components/course-tabs/ReportsTab';
import GradingTab from '../components/course-tabs/GradingTab';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { courses, calculateCourseProgress, appRules } = useData();
    const [activeTab, setActiveTab] = useState('students');

    const course = courses.find(c => c.id === id);

    useDocumentTitle(course ? `Course: ${course.name}` : 'EduCore | Course Detail');

    if (!course) return <div>Course not found</div>;

    const tabs = [
        { id: 'students', label: 'Students', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'payments', label: 'Payments', icon: DollarSign },
        { id: 'files', label: 'Files', icon: Folder },
        { id: 'notes', label: 'Notes', icon: FileText },
        { id: 'grading', label: 'Grading & Requirements', icon: BarChart2 },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
    ];

    return (
        <div className="course-detail-page">
            <button onClick={() => navigate('/courses')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', paddingLeft: 0 }}>
                <ArrowLeft size={20} /> Back to Courses
            </button>

            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{course.name}</h2>
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span>{course.startDate} - {course.endDate || 'Ongoing'}</span>
                            <span>•</span>
                            <span>Fee: ${course.fee}</span>
                            <span>•</span>
                            <span style={{ color: course.status === 'Active' ? 'var(--success)' : 'var(--text-muted)' }}>{course.status}</span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginTop: '1rem', maxWidth: '400px' }}>
                            {(() => {
                                const progress = calculateCourseProgress(course.startDate, appRules.courseDuration);
                                let color = 'var(--primary)';
                                if (progress >= 90) color = 'var(--danger)';
                                else if (progress >= 75) color = 'var(--warning)';

                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ flexGrow: 1, height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                backgroundColor: color,
                                                transition: 'width 0.5s ease-in-out'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '40px' }}>{progress.toFixed(0)}%</span>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </header>

            <div className="tabs-container" style={{ borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                                padding: '0.75rem 0',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="tab-content">
                {activeTab === 'students' && <StudentsTab courseId={id} />}
                {activeTab === 'attendance' && <AttendanceTab courseId={id} />}
                {activeTab === 'payments' && <PaymentsTab courseId={id} />}
                {activeTab === 'files' && <FilesTab courseId={id} />}
                {activeTab === 'notes' && <NotesTab courseId={id} />}
                {activeTab === 'grading' && <GradingTab courseId={id} />}
                {activeTab === 'reports' && <ReportsTab courseId={id} />}
            </div>
        </div>
    );
};

export default CourseDetail;
