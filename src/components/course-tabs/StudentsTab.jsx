import React from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';

const StudentsTab = ({ courseId }) => {
    const { enrollments, students, updateEnrollment, attendance } = useData();

    const courseEnrollments = enrollments.filter(e => e.courseId === courseId);

    const getStudent = (studentId) => students.find(s => s.id === studentId);

    const getAttendanceRate = (studentId) => {
        const studentAttendance = attendance.filter(a => a.studentId === studentId && a.courseId === courseId);
        const present = studentAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        return studentAttendance.length > 0 ? Math.round((present / studentAttendance.length) * 100) : 0;
    };

    const handleStatusChange = (enrollmentId, newStatus) => {
        updateEnrollment(enrollmentId, { status: newStatus });
    };

    // Summary Stats
    const totalStudents = courseEnrollments.length;
    const activeStudents = courseEnrollments.filter(e => e.status === 'Active').length;
    const completedStudents = courseEnrollments.filter(e => e.status === 'Completed').length;
    const droppedStudents = courseEnrollments.filter(e => e.status === 'Dropped').length;

    return (
        <div>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalStudents}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Enrolled</div>
                </div>
                <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{activeStudents}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active</div>
                </div>
                <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{completedStudents}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Completed</div>
                </div>
                <div className="card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{droppedStudents}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dropped</div>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Phone</th>
                                <th>Father's Phone</th>
                                <th>Mother's Phone</th>
                                <th>Attendance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseEnrollments.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled in this course.</td></tr>
                            ) : (
                                courseEnrollments.map(enrollment => {
                                    const student = getStudent(enrollment.studentId);
                                    if (!student) return null;
                                    return (
                                        <tr key={enrollment.id}>
                                            <td>
                                                <Link to={`/students/${student.id}`} style={{ color: 'var(--text-main)', fontWeight: 'bold', textDecoration: 'none' }}>
                                                    {student.name}
                                                </Link>
                                            </td>
                                            <td>{student.studentPhone || '-'}</td>
                                            <td>{student.fatherPhone || '-'}</td>
                                            <td>{student.motherPhone || '-'}</td>
                                            <td>{getAttendanceRate(student.id)}%</td>
                                            <td>
                                                <select
                                                    value={enrollment.status}
                                                    onChange={(e) => handleStatusChange(enrollment.id, e.target.value)}
                                                    style={{
                                                        padding: '0.25rem',
                                                        borderRadius: '0.25rem',
                                                        border: '1px solid var(--border)',
                                                        backgroundColor: 'var(--bg-dark)',
                                                        color: 'var(--text-main)'
                                                    }}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Dropped">Dropped</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentsTab;
