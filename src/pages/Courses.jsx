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

    // Helper: Calculate Defaults
    const getSmartDefaults = () => {
        const today = new Date();
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);

        return {
            name: '',
            startDate: today.toISOString().split('T')[0],
            endDate: threeMonthsLater.toISOString().split('T')[0],
            fee: appRules?.defaultCourseFee || 100,
            status: 'Active',
            maxPoints: appRules?.defaultMaxPoints || 100
        };
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                name: course.name,
                startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
                endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
                fee: course.fee || '',
                status: course.status,
                maxPoints: course.maxPoints || 100
            });
        } else {
            setEditingCourse(null);
            setFormData(getSmartDefaults());
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

    // Helper: Format Date Range
    const formatDateRange = (start, end) => {
        if (!start) return 'Flexible Schedule';
        const s = new Date(start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const e = end ? new Date(end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing';
        return `${s} - ${e}`;
    };

    // Helper: Progress Calculation
    const getProgressStats = (start, end) => {
        if (!start || !end) return { percent: 0, color: 'bg-green-500' };

        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const now = new Date().getTime();
        const total = endTime - startTime;
        const elapsed = now - startTime;

        if (total <= 0) return { percent: 100, color: 'bg-red-500' };

        let percent = (elapsed / total) * 100;
        percent = Math.min(100, Math.max(0, percent));

        let color = 'bg-green-500'; // < 50%
        if (percent >= 50 && percent < 80) color = 'bg-yellow-500';
        if (percent >= 80) color = 'bg-red-500';

        return { percent, color };
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
                    paginatedCourses.map(course => {
                        const { percent, color } = getProgressStats(course.startDate, course.endDate);
                        return (
                            <div key={course.id} className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{course.name}</h3>
                                    <StatusTag status={course.status} type="enrollment" />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={14} />
                                        <span>{formatDateRange(course.startDate, course.endDate)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Users size={14} />
                                        <span>{getStudentCount(course.id)} Students</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {course.startDate && course.endDate && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                                            <span>Progress</span>
                                            <span>{Math.round(percent)}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '0.5rem', backgroundColor: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percent}%`, height: '100%', transition: 'width 0.5s ease-in-out' }} className={color}></div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.9rem' }}>Total Fee</span>
                                        <span style={{ fontWeight: 'bold' }}>${parseFloat(course.fee || 0).toFixed(2)}</span>
                                    </div>
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
                        );
                    })
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
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Advanced Mathematics" />
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
                            <input type="number" required value={formData.fee} onChange={e => setFormData({ ...formData, fee: e.target.value })} placeholder="100.00" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                                <option value="Archived">Archived</option>
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
