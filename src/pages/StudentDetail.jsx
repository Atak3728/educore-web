import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Save, ArrowLeft, Plus, Trash2, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import AddNoteModal from '../components/AddNoteModal';
import AddViolationModal from '../components/AddViolationModal';
import AddPaymentFollowUpModal from '../components/AddPaymentFollowUpModal';
import ProgressTab from '../components/student-tabs/ProgressTab';
import NoteCard from '../components/NoteCard';
const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        students, updateStudent, addPaymentFollowUp, deleteStudent,
        courses, enrollments, enrollStudent, updateEnrollment, deleteEnrollment,
        notes, addNote, deleteNote,
        attendance, payments,
        complianceRecords, updateComplianceViolation, notificationPreferences, appRules
    } = useData();

    const student = students.find(s => s.id === id);

    useDocumentTitle(student ? `Student: ${student.name}` : 'EduCore | Student Detail');

    // Local state for editing
    const [formData, setFormData] = useState({
        name: '',
        studentPhone: '',
        fatherName: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: ''
    });
    const [newEnrollment, setNewEnrollment] = useState({ courseId: '', startDate: '' });
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [selectedEnrollmentIdForFollowUp, setSelectedEnrollmentIdForFollowUp] = useState(null);
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [editingEnrollmentId, setEditingEnrollmentId] = useState(null);
    const [enrollmentEditData, setEnrollmentEditData] = useState({});

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                studentPhone: student.studentPhone || student.phone || '',
                fatherName: student.fatherName || student.parentName || '',
                fatherPhone: student.fatherPhone || '',
                motherName: student.motherName || '',
                motherPhone: student.motherPhone || ''
            });
        }
    }, [student]);

    if (!student) return <div>Student not found</div>;

    // --- Derived Data ---
    const studentEnrollments = enrollments.filter(e => e.studentId === id);
    const studentNotes = notes.filter(n => n.studentId === id || (n.context?.type === 'Student' && n.context?.id === id));
    const studentViolations = complianceRecords.filter(v => v.studentId === id).sort((a, b) => new Date(b.date) - new Date(a.date));
    const openViolationsCount = studentViolations.filter(v => v.status === 'Open').length;
    const strikeLimit = notificationPreferences?.complianceStrikeLimit || 3;
    const complianceStatus = openViolationsCount >= strikeLimit ? 'Critical' : openViolationsCount > 0 ? 'Warning' : 'Good';

    // Stats
    const studentAttendance = attendance.filter(a => a.studentId === id);

    // Helper for per-course attendance
    const getCourseAttendance = (courseId) => {
        const records = studentAttendance.filter(a => a.courseId === courseId);
        const present = records.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;
        // Sort records by date desc
        const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
        return { rate, records: sortedRecords };
    };

    const totalPaidGlobal = payments.filter(p => p.studentId === id).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    // Financial Overview Data
    const financialOverview = studentEnrollments.map(e => {
        const course = courses.find(c => c.id === e.courseId);
        const fee = course ? parseFloat(course.fee) || 0 : 0;
        const paid = payments
            .filter(p => p.studentId === id && p.courseId === e.courseId)
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const balance = fee - paid;

        let status = 'Unpaid';
        if (paid >= fee && fee > 0) status = 'Paid';
        else if (paid > 0) status = 'Partial';

        return {
            courseId: e.courseId,
            courseName: course ? course.name : 'Unknown',
            fee,
            paid,
            balance,
            status
        };
    });

    // --- Handlers ---
    const handleSaveContact = (e) => {
        e.preventDefault();
        updateStudent(id, formData);
        alert('Contact info updated!');
    };

    const handleEnroll = (e) => {
        e.preventDefault();
        if (!newEnrollment.courseId) return;
        enrollStudent({
            studentId: id,
            courseId: newEnrollment.courseId,
            startDate: newEnrollment.startDate || new Date().toISOString().split('T')[0]
        });
        setNewEnrollment({ courseId: '', startDate: '' });
    };

    const handleStatusChange = (enrollmentId, newStatus) => {
        updateEnrollment(enrollmentId, { status: newStatus });
    };

    const handleResolveViolation = (violationId) => {
        if (window.confirm('Are you sure you want to mark this violation as resolved?')) {
            updateComplianceViolation(violationId, { status: 'Resolved', resolvedDate: new Date().toISOString() });
        }
    };

    const handleSaveFollowUp = (data) => {
        if (selectedEnrollmentIdForFollowUp) {
            addPaymentFollowUp(selectedEnrollmentIdForFollowUp, data);
            setIsFollowUpModalOpen(false);
            setSelectedEnrollmentIdForFollowUp(null);
        }
    };

    const handleDeleteStudent = () => {
        if (!window.confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
            return;
        }

        try {
            deleteStudent(id);
            alert('Student deleted successfully.');
            navigate('/students');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteEnrollment = (enrollmentId) => {
        if (window.confirm('Are you sure you want to delete this enrollment? This will also remove related payments, attendance, and grades.')) {
            deleteEnrollment(enrollmentId);
        }
    };

    const handleStartEditEnrollment = (enrollment) => {
        setEditingEnrollmentId(enrollment.id);
        setEnrollmentEditData({
            startDate: enrollment.startDate || '',
            endDate: enrollment.endDate || '',
            status: enrollment.status
        });
    };

    const handleSaveEnrollmentEdit = (enrollmentId) => {
        updateEnrollment(enrollmentId, enrollmentEditData);
        setEditingEnrollmentId(null);
        setEnrollmentEditData({});
    };

    const handleCancelEnrollmentEdit = () => {
        setEditingEnrollmentId(null);
        setEnrollmentEditData({});
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setIsNoteModalOpen(true);
    };

    const handleDeleteNote = (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            deleteNote(noteId);
        }
    };

    // --- RENDER ---
    return (
        <div className="student-detail-page">
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn" onClick={() => navigate('/students')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div>
                        <h2 style={{ margin: 0 }}>{student.name}</h2>
                    </div>
                </div>
                <button
                    className="btn"
                    onClick={handleDeleteStudent}
                    style={{
                        backgroundColor: 'var(--danger)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Trash2 size={18} /> Delete Student
                </button>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
                {['overview', 'attendance', 'progress', 'enrollment', 'financials', 'notes', 'compliance'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.75rem 1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {tab === 'notes' ? 'Notes & Memos' : tab}
                        {tab === 'compliance' && openViolationsCount > 0 && (
                            <span style={{
                                backgroundColor: complianceStatus === 'Critical' ? 'var(--danger)' : 'var(--warning)',
                                color: '#fff',
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '1rem',
                                fontWeight: 'bold'
                            }}>
                                {openViolationsCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Financial Summary */}
                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Paid</p>
                                <h3 style={{ margin: 0 }}>${totalPaidGlobal.toFixed(2)}</h3>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>Contact Information</h3>
                            <form onSubmit={handleSaveContact}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Student Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Student Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.studentPhone}
                                            onChange={e => setFormData({ ...formData, studentPhone: e.target.value })}
                                            placeholder="(123) 456-7890"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Father's Name</label>
                                        <input
                                            type="text"
                                            value={formData.fatherName}
                                            onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Father's Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.fatherPhone}
                                            onChange={e => setFormData({ ...formData, fatherPhone: e.target.value })}
                                            placeholder="(123) 456-7890"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Mother's Name</label>
                                        <input
                                            type="text"
                                            value={formData.motherName}
                                            onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Mother's Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.motherPhone}
                                            onChange={e => setFormData({ ...formData, motherPhone: e.target.value })}
                                            placeholder="(123) 456-7890"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Save size={18} /> Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ATTENDANCE TAB */}
                {activeTab === 'attendance' && (
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Attendance by Course</h3>
                        {studentEnrollments.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>Not enrolled in any courses.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {studentEnrollments.map(e => {
                                    const course = courses.find(c => c.id === e.courseId);
                                    if (!course) return null;
                                    const { rate, records } = getCourseAttendance(e.courseId);
                                    const isExpanded = expandedCourseId === e.courseId;

                                    return (
                                        <div key={e.courseId} style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                            <div
                                                onClick={() => setExpandedCourseId(isExpanded ? null : e.courseId)}
                                                style={{
                                                    padding: '1rem',
                                                    backgroundColor: 'var(--bg-dark)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{course.name}</span>
                                                <span style={{
                                                    fontWeight: 'bold',
                                                    color: rate >= (parseFloat(appRules.attendanceThreshold) || 70) ? 'var(--success)' : 'var(--danger)'
                                                }}>
                                                    {rate}%
                                                </span>
                                            </div>

                                            {isExpanded && (
                                                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                                                    {records.length === 0 ? (
                                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>No attendance records.</p>
                                                    ) : (
                                                        <table style={{ fontSize: '0.9rem' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th>Date</th>
                                                                    <th>Status</th>
                                                                    <th>Note</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {records.map(r => (
                                                                    <tr key={r.id}>
                                                                        <td>{new Date(r.date).toLocaleDateString()}</td>
                                                                        <td>
                                                                            <span style={{
                                                                                color: r.status === 'Present' ? 'var(--success)' : r.status === 'Absent' ? 'var(--danger)' : 'var(--warning)'
                                                                            }}>
                                                                                {r.status}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ color: 'var(--text-muted)' }}>{r.note || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* PROGRESS TAB */}
                {activeTab === 'progress' && <ProgressTab studentId={id} />}

                {/* ENROLLMENT TAB */}
                {activeTab === 'enrollment' && (
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Enrollment History</h3>
                        <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentEnrollments.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No enrollments.</td></tr>
                                    ) : (
                                        studentEnrollments.map(e => {
                                            const course = courses.find(c => c.id === e.courseId);
                                            const isEditing = editingEnrollmentId === e.id;

                                            return (
                                                <tr key={e.id}>
                                                    <td>{course ? course.name : 'Unknown Course'}</td>
                                                    <td>
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                value={enrollmentEditData.startDate}
                                                                onChange={(ev) => setEnrollmentEditData({ ...enrollmentEditData, startDate: ev.target.value })}
                                                                style={{ padding: '0.25rem', fontSize: '0.9rem' }}
                                                            />
                                                        ) : (
                                                            e.startDate || '-'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                value={enrollmentEditData.endDate}
                                                                onChange={(ev) => setEnrollmentEditData({ ...enrollmentEditData, endDate: ev.target.value })}
                                                                style={{ padding: '0.25rem', fontSize: '0.9rem' }}
                                                            />
                                                        ) : (
                                                            e.endDate || '-'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <select
                                                                value={enrollmentEditData.status}
                                                                onChange={(ev) => setEnrollmentEditData({ ...enrollmentEditData, status: ev.target.value })}
                                                                style={{ padding: '0.25rem', fontSize: '0.9rem' }}
                                                            >
                                                                <option value="Active">Active</option>
                                                                <option value="Completed">Completed</option>
                                                                <option value="Dropped">Dropped</option>
                                                            </select>
                                                        ) : (
                                                            <select
                                                                value={e.status}
                                                                onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                                                                style={{ padding: '0.25rem', fontSize: '0.9rem' }}
                                                            >
                                                                <option value="Active">Active</option>
                                                                <option value="Completed">Completed</option>
                                                                <option value="Dropped">Dropped</option>
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    className="btn"
                                                                    onClick={() => handleSaveEnrollmentEdit(e.id)}
                                                                    style={{ marginRight: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--success)', color: 'white' }}
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    className="btn"
                                                                    onClick={handleCancelEnrollmentEdit}
                                                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="btn"
                                                                    onClick={() => handleStartEditEnrollment(e)}
                                                                    style={{ marginRight: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="btn"
                                                                    onClick={() => handleDeleteEnrollment(e.id)}
                                                                    style={{ backgroundColor: 'var(--danger)', color: 'white', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Enroll in New Course</h4>
                        <form onSubmit={handleEnroll} style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                value={newEnrollment.courseId}
                                onChange={e => setNewEnrollment({ ...newEnrollment, courseId: e.target.value })}
                                required
                                style={{ flex: 1 }}
                            >
                                <option value="">Select Course...</option>
                                {courses.filter(c => c.status === 'Active').map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={newEnrollment.startDate}
                                onChange={e => setNewEnrollment({ ...newEnrollment, startDate: e.target.value })}
                                style={{ width: '130px' }}
                            />
                            <button type="submit" className="btn btn-primary"><Plus size={18} /></button>
                        </form>
                    </div>
                )}

                {/* FINANCIALS TAB */}
                {activeTab === 'financials' && (
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Financial Overview</h3>

                        {financialOverview.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No financial records.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {financialOverview.map((item, index) => {
                                    // Find the enrollment for this item to get the ledger
                                    // Note: financialOverview is derived, so we need to match it back to enrollment.
                                    // Ideally financialOverview should include enrollmentId.
                                    // Let's assume we can find it by courseId for this student.
                                    const enrollment = studentEnrollments.find(e => e.courseId === item.courseId);

                                    return (
                                        <div key={index} style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h4 style={{ margin: 0, color: 'var(--primary)' }}>{item.courseName}</h4>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem',
                                                    backgroundColor: item.status === 'Paid' ? 'rgba(16, 185, 129, 0.2)' : item.status === 'Partial' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    color: item.status === 'Paid' ? 'var(--success)' : item.status === 'Partial' ? 'var(--warning)' : 'var(--danger)'
                                                }}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem', backgroundColor: 'var(--bg-dark)', padding: '1rem', borderRadius: '0.5rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fee</div>
                                                    <div style={{ fontWeight: 'bold' }}>${item.fee.toFixed(2)}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paid</div>
                                                    <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>${item.paid.toFixed(2)}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Balance</div>
                                                    <div style={{ fontWeight: 'bold', color: item.balance > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>${item.balance.toFixed(2)}</div>
                                                </div>
                                            </div>

                                            {/* Payment Follow-up Section for this Course */}
                                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <h5 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                        <Clock size={16} /> Follow-up History
                                                    </h5>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => {
                                                            setSelectedEnrollmentIdForFollowUp(enrollment?.id);
                                                            setIsFollowUpModalOpen(true);
                                                        }}
                                                        disabled={!enrollment}
                                                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                                    >
                                                        <Plus size={14} /> Add Note
                                                    </button>
                                                </div>

                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {(!enrollment?.paymentFollowUpLedger || enrollment.paymentFollowUpLedger.length === 0) ? (
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No follow-up records.</p>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            {enrollment.paymentFollowUpLedger.map((note, idx) => (
                                                                <div key={note.id || idx} style={{ backgroundColor: 'var(--bg-dark)', padding: '0.5rem', borderRadius: '0.25rem', borderLeft: '2px solid var(--warning)' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
                                                                        <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{new Date(note.date).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{note.note}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <AddPaymentFollowUpModal
                            isOpen={isFollowUpModalOpen}
                            onClose={() => setIsFollowUpModalOpen(false)}
                            onSave={handleSaveFollowUp}
                        />
                    </div>
                )}

                {/* NOTES TAB */}
                {activeTab === 'notes' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Notes & Memos</h3>
                            <button className="btn btn-primary" onClick={() => setIsNoteModalOpen(true)} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                                <Plus size={16} /> Add Note
                            </button>
                        </div>
                        <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                            {studentNotes.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No notes recorded.</p>
                            ) : (
                                studentNotes.map(note => (
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
                            isOpen={isNoteModalOpen}
                            onClose={() => { setIsNoteModalOpen(false); setEditingNote(null); }}
                            initialContext={{ type: 'Student', id: student.id, name: student.name }}
                            initialNote={editingNote}
                        />
                    </div>
                )}

                {/* COMPLIANCE TAB */}
                {activeTab === 'compliance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Status Card */}
                        <div className="card" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderLeft: `4px solid ${complianceStatus === 'Critical' ? 'var(--danger)' : complianceStatus === 'Warning' ? 'var(--warning)' : 'var(--success)'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '50%',
                                    backgroundColor: complianceStatus === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : complianceStatus === 'Warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    color: complianceStatus === 'Critical' ? 'var(--danger)' : complianceStatus === 'Warning' ? 'var(--warning)' : 'var(--success)'
                                }}>
                                    {complianceStatus === 'Good' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{complianceStatus} Standing</h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                        {openViolationsCount} Active Strike{openViolationsCount !== 1 ? 's' : ''} (Limit: {strikeLimit})
                                    </p>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={() => setIsViolationModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={18} /> Add Violation
                            </button>
                        </div>

                        {/* Violation History */}
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>Violation History</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Note</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentViolations.length === 0 ? (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No violations recorded.</td></tr>
                                        ) : (
                                            studentViolations.map(v => (
                                                <tr key={v.id} style={{ opacity: v.status === 'Resolved' ? 0.6 : 1 }}>
                                                    <td>{new Date(v.date).toLocaleDateString()}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{v.violationType}</td>
                                                    <td style={{ color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.note || '-'}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem',
                                                            backgroundColor: v.status === 'Open' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                            color: v.status === 'Open' ? 'var(--danger)' : 'var(--success)'
                                                        }}>
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {v.status === 'Open' && (
                                                            <button
                                                                className="btn"
                                                                onClick={() => handleResolveViolation(v.id)}
                                                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', color: 'var(--success)', borderColor: 'var(--success)' }}
                                                            >
                                                                Mark Resolved
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <AddViolationModal
                            isOpen={isViolationModalOpen}
                            onClose={() => setIsViolationModalOpen(false)}
                            studentId={student.id}
                            studentName={student.name}
                        />
                    </div>
                )}

            </div>
        </div >

    );
};

export default StudentDetail;
