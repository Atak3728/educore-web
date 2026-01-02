import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Plus, Edit2, BookOpen, Calendar, Users, Search } from 'lucide-react';
import Modal from '../components/Modal';
import StatusTag from '../components/StatusTag';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Pagination from '../components/Pagination';

const Courses = () => {
    useDocumentTitle('EduCore | Courses');
    const { courses, addCourse, updateCourse, enrollments, calculateCourseProgress, appRules } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', fee: '', status: 'Active' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                name: course.name,
                startDate: course.startDate,
                endDate: course.endDate,
                fee: course.fee,
                status: course.status
            });
        } else {
            setEditingCourse(null);
            setFormData({ name: '', startDate: '', endDate: '', fee: '', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCourse) {
            updateCourse(editingCourse.id, formData);
        } else {
            addCourse(formData);
        }
        setIsModalOpen(false);
    };

    const getStudentCount = (courseId) => {
        return enrollments.filter(e => e.courseId === courseId && e.status === 'Active').length;
    };

    // Filter, Sort, and Paginate
    const filteredCourses = courses
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (a.id > b.id) return -1;
            if (a.id < b.id) return 1;
            return 0;
        });

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const paginatedCourses = filteredCourses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="courses-page">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Courses</h2>
                    <p className="text-muted">Manage your courses and curriculum.</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Course
                </button>
            </header>

            {/* Search Bar */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    style={{ paddingLeft: '3rem', width: '100%' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {paginatedCourses.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '1rem' }}>
                        <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No courses found.</p>
                    </div>
                ) : (
                    paginatedCourses.map(course => (
                        <div key={course.id} className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{course.name}</h3>
                                <StatusTag status={course.status} type="enrollment" />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Calendar size={14} />
                                    <span>{course.startDate}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Users size={14} />
                                    <span>{getStudentCount(course.id)} Students</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ marginBottom: '1rem' }}>
                                {(() => {
                                    const progress = calculateCourseProgress(course.startDate, appRules.courseDuration);
                                    let color = 'var(--primary)';
                                    if (progress >= 90) color = 'var(--danger)';
                                    else if (progress >= 75) color = 'var(--warning)';

                                    return (
                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                backgroundColor: color,
                                                transition: 'width 0.5s ease-in-out'
                                            }} title={`${progress.toFixed(0)}% Complete`} />
                                        </div>
                                    );
                                })()}
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <span style={{ fontWeight: 'bold' }}>${parseFloat(course.fee).toFixed(2)}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn" onClick={() => handleOpenModal(course)} style={{ padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                                        Manage Course
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourse ? "Edit Course" : "Add Course"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Course Name</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Date</label>
                            <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>End Date</label>
                            <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Total Fee ($)</label>
                            <input type="number" required value={formData.fee} onChange={e => setFormData({ ...formData, fee: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Course</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Courses;
