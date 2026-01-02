import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, ChevronRight, User } from 'lucide-react';
import Modal from '../components/Modal';
import StatusTag from '../components/StatusTag';
import AddStudentForm from '../components/forms/AddStudentForm';
import useDocumentTitle from '../hooks/useDocumentTitle';

import Pagination from '../components/Pagination';

const Students = () => {
    useDocumentTitle('EduCore | Students');
    const { students, courses, enrollments, payments, attendance, addStudent } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const itemsPerPage = 20;

    const [newStudent, setNewStudent] = useState({
        name: '',
        studentPhone: '',
        fatherName: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: '',
        notes: ''
    });

    // Helper to get student details
    const getStudentDetails = (studentId) => {
        // Current Course: Find active enrollment
        const activeEnrollment = enrollments.find(e => e.studentId === studentId && e.status === 'Active');
        const currentCourse = activeEnrollment ? courses.find(c => c.id === activeEnrollment.courseId) : null;

        // Payment Status (for current course)
        let paymentStatus = 'N/A';
        if (activeEnrollment) {
            const courseFee = parseFloat(currentCourse?.fee) || 0;
            const paid = payments
                .filter(p => p.studentId === studentId && p.courseId === activeEnrollment.courseId)
                .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            if (courseFee === 0) paymentStatus = 'Free';
            else if (paid >= courseFee) paymentStatus = 'Paid';
            else if (paid > 0) paymentStatus = 'Partial';
            else paymentStatus = 'Unpaid';
        }

        // Attendance Rate (Global)
        const studentAttendance = attendance.filter(a => a.studentId === studentId);
        const present = studentAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const rate = studentAttendance.length > 0 ? Math.round((present / studentAttendance.length) * 100) : 0;

        return {
            currentCourseName: currentCourse ? currentCourse.name : 'None',
            paymentStatus,
            attendanceRate: `${rate}%`
        };
    };

    // Filter and Sort
    const filteredStudents = students
        .filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.studentPhone && s.studentPhone.includes(searchTerm))
        )
        .sort((a, b) => {
            // Assuming ID is a string, we can try to sort by it descending if it's time-based or numeric-ish.
            // If they are UUIDs, this is arbitrary but consistent.
            // If there's a created date, use that. Let's assume ID for now as requested.
            if (a.id > b.id) return -1;
            if (a.id < b.id) return 1;
            return 0;
        });

    // Pagination Logic
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate small delay for UX
        await new Promise(resolve => setTimeout(resolve, 600));
        addStudent(newStudent);
        setIsSubmitting(false);
        setIsModalOpen(false);
        setNewStudent({
            name: '',
            studentPhone: '',
            fatherName: '',
            fatherPhone: '',
            motherName: '',
            motherPhone: '',
            notes: ''
        });
    };

    return (
        <div className="students-page">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Students</h2>
                    <p className="text-muted">Manage all students and their enrollments.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Student
                </button>
            </header>

            <div className="card">
                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        style={{ paddingLeft: '3rem' }}
                    />
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Current Course</th>
                                <th>Payment Status</th>
                                <th>Attendance</th>
                                <th>Father's Phone</th>
                                <th>Mother's Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students found.</td>
                                </tr>
                            ) : (
                                paginatedStudents.map(student => {
                                    const details = getStudentDetails(student.id);
                                    return (
                                        <tr key={student.id}>
                                            <td>
                                                <Link to={`/students/${student.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    {student.name}
                                                </Link>
                                            </td>
                                            <td>{details.currentCourseName}</td>
                                            <td>
                                                <StatusTag status={details.paymentStatus} type="payment" />
                                            </td>
                                            <td>{details.attendanceRate}</td>
                                            <td>{student.fatherPhone || '-'}</td>
                                            <td>{student.motherPhone || '-'}</td>
                                            <td>
                                                <Link to={`/students/${student.id}`} className="btn" style={{ color: 'var(--primary)', padding: '0.25rem' }}>
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Student">
                <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                        <input required value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Student Phone</label>
                            <input value={newStudent.studentPhone} onChange={e => setNewStudent({ ...newStudent, studentPhone: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Father's Info</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                                <input value={newStudent.fatherName} onChange={e => setNewStudent({ ...newStudent, fatherName: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                                <input value={newStudent.fatherPhone} onChange={e => setNewStudent({ ...newStudent, fatherPhone: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Mother's Info</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                                <input value={newStudent.motherName} onChange={e => setNewStudent({ ...newStudent, motherName: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                                <input value={newStudent.motherPhone} onChange={e => setNewStudent({ ...newStudent, motherPhone: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes</label>
                        <textarea value={newStudent.notes} onChange={e => setNewStudent({ ...newStudent, notes: e.target.value })} rows="2" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
