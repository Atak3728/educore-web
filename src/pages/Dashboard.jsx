import { useState } from 'react';
import { useData } from '../context/DataContext';
import { BookOpen, Users, CheckCircle, Clock, Plus, FileText, UserPlus, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SummaryCard from '../components/SummaryCard';
import TrendChart from '../components/TrendChart';
import Modal from '../components/Modal';
import AddCourseForm from '../components/forms/AddCourseForm';
import AddStudentForm from '../components/forms/AddStudentForm';
import RecordPaymentForm from '../components/forms/RecordPaymentForm';
import LogSessionForm from '../components/forms/LogSessionForm';
import AddAdvanceForm from '../components/forms/AddAdvanceForm';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Dashboard = () => {
    useDocumentTitle('EduCore | Dashboard');
    const { students, courses, payments, attendance, advances, enrollments, getFinancialSummary, appRules, getRiskSummary, grades } = useData();
    const { totalEarnings, totalAdvances, currentBalance } = getFinancialSummary();
    const riskSummary = getRiskSummary();

    // Grading Calculations
    const assignedTasks = grades.filter(g => g.isAssigned === true);
    const gradedTasks = assignedTasks.filter(g => g.score !== null && g.score !== undefined && g.score !== '');
    const gradedCount = gradedTasks.length;
    const pendingGradingCount = assignedTasks.length - gradedCount;
    const gradingCompletionRate = assignedTasks.length > 0 ? Math.round((gradedCount / assignedTasks.length) * 100) : 100;

    // Modal State
    const [activeModal, setActiveModal] = useState(null); // 'addCourse', 'addStudent', 'recordPayment', 'logSession', 'addAdvance'

    // --- Metrics Calculations ---

    // Active Courses
    const activeCourses = courses.filter(c => c.status === 'Active').length;

    // Total Students (Unique count)
    const totalStudents = students.length;

    // Payment Rate Calculation
    let totalExpected = 0;
    enrollments.forEach(e => {
        // Only count active or completed enrollments for expected revenue
        if (e.status === 'Active' || e.status === 'Completed') {
            const course = courses.find(c => c.id === e.courseId);
            if (course) {
                totalExpected += parseFloat(course.fee) || 0;
            }
        }
    });

    let totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const paymentRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    // Attendance Rate (%)
    const totalSessions = attendance.length;
    const presentSessions = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;


    // --- Chart Data Preparation ---
    const getMonthName = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('default', { month: 'short' });
    };

    const chartDataMap = {};

    // Process Advances
    advances.forEach(adv => {
        const month = getMonthName(adv.date);
        if (!chartDataMap[month]) chartDataMap[month] = { name: month, earnings: 0, advances: 0 };
        chartDataMap[month].advances += parseFloat(adv.amount) || 0;
    });

    // Process Earnings (Rule A: Teacher Share per fully paid student)
    const calculateEarningsData = () => {
        const paymentsMap = {}; // { `${studentId}|${courseId}`: totalPaid }

        // 1. Sum payments per enrollment
        payments.forEach(p => {
            const key = `${p.studentId}|${p.courseId}`;
            paymentsMap[key] = (paymentsMap[key] || 0) + (parseFloat(p.amount) || 0);
        });

        // 2. Check if fully paid and attribute to month of last payment (approx)
        // Ideally we need the date of the payment that crossed the threshold.
        // For simplicity in this chart, we'll iterate payments again and see when it crossed.
        // Actually, let's just use the date of the *last* payment for that enrollment as the "Earnings Date".

        const enrollmentStatus = {}; // { key: { paid: 0, fee: 0, lastDate: null } }

        enrollments.forEach(e => {
            const course = courses.find(c => c.id === e.courseId);
            if (course) {
                const key = `${e.studentId}|${e.courseId}`;
                enrollmentStatus[key] = {
                    paid: 0,
                    fee: parseFloat(course.fee) || 0,
                    lastDate: null
                };
            }
        });

        // Replay payments sorted by date to find the exact crossing point
        const sortedPayments = [...payments].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedPayments.forEach(p => {
            const key = `${p.studentId}|${p.courseId}`;
            if (enrollmentStatus[key]) {
                const prevPaid = enrollmentStatus[key].paid;
                enrollmentStatus[key].paid += parseFloat(p.amount);

                if (prevPaid < enrollmentStatus[key].fee && enrollmentStatus[key].paid >= enrollmentStatus[key].fee) {
                    // This payment triggered the earning
                    const month = getMonthName(p.date);
                    if (!chartDataMap[month]) chartDataMap[month] = { name: month, earnings: 0, advances: 0 };
                    chartDataMap[month].earnings += parseFloat(appRules.teacherShare);
                }
            }
        });
    };

    calculateEarningsData();

    const chartData = Object.values(chartDataMap);

    // Shared Button Style for Consistency
    const quickActionBtnStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        fontSize: '0.95rem',
        fontWeight: '500',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'background-color 0.2s'
    };

    const primaryBtnStyle = {
        ...quickActionBtnStyle,
        backgroundColor: 'var(--primary)',
        color: 'white'
    };

    const secondaryBtnStyle = {
        ...quickActionBtnStyle,
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--text-main)',
        border: '1px solid var(--border)'
    };

    return (
        <div className="dashboard-page">
            <header style={{ marginBottom: '2rem' }}>
                <h2>Dashboard</h2>
                <p className="text-muted">Overview of your academy's performance.</p>
            </header>

            {/* Top Summary Cards */}
            <div className="grid-summary">
                <SummaryCard
                    title="Active Courses"
                    value={activeCourses}
                    icon={BookOpen}
                    color="primary"
                />
                <SummaryCard
                    title="Total Students"
                    value={totalStudents}
                    icon={Users}
                    color="success"
                />
                <SummaryCard
                    title="Payment Rate"
                    value={`${paymentRate}%`}
                    icon={CheckCircle}
                    color="warning"
                    subtext="Collected vs Expected"
                />
                <SummaryCard
                    title="Attendance Rate"
                    value={`${attendanceRate}%`}
                    icon={Clock}
                    color="danger"
                    subtext="Overall Attendance"
                />
            </div>

            {/* Main Dashboard Grid (2x2) */}
            <div className="grid-detailed" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Financial Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                            <span>Earnings So Far</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>${totalEarnings.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                            <span>Advances Received</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--warning)' }}>${totalAdvances.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem', border: currentBalance > 0 ? '1px solid var(--danger)' : '1px solid var(--success)' }}>
                            <span>Current Balance</span>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: currentBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                    {currentBalance > 0 ? `Owe $${currentBalance.toFixed(2)}` : `Owed $${Math.abs(currentBalance).toFixed(2)}`}
                                </span>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {currentBalance > 0 ? 'Return to school' : 'To be paid'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Financial Trend */}
                <TrendChart data={chartData} />

                {/* 3. Student Risk Status */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Student Risk Status</h3>

                    {/* At-Risk Count */}
                    <div style={{
                        backgroundColor: 'var(--bg-dark)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        borderLeft: '4px solid var(--danger)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={20} color="var(--danger)" />
                            <span style={{ fontWeight: '500' }}>At-Risk Students</span>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: riskSummary.total > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                            {riskSummary.total}
                        </span>
                    </div>

                    {/* Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '0.25rem' }}>Attendance</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{riskSummary.attendance}</div>
                        </div>
                        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginBottom: '0.25rem' }}>Grading</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{riskSummary.grading}</div>
                        </div>
                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--info)', marginBottom: '0.25rem' }}>Payment</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{riskSummary.payment}</div>
                        </div>
                    </div>

                    {/* Healthy Students */}
                    <div style={{
                        backgroundColor: 'var(--bg-dark)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '500' }}>Healthy Students</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>
                            {totalStudents - riskSummary.total}
                        </span>
                    </div>
                    <Link to="/reports" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500' }}>
                        View Detailed Risk Report
                    </Link>
                </div>

                {/* 4. Grading Completion */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Grading Completion</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>
                            {gradingCompletionRate}%
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>Grading Completed</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto', backgroundColor: 'var(--bg-dark)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>{gradedCount}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Graded</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--warning)' }}>{pendingGradingCount}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shortcuts */}
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveModal('addCourse')} style={primaryBtnStyle}>
                        <Plus size={18} /> Add Course
                    </button>
                    <button onClick={() => setActiveModal('addStudent')} style={secondaryBtnStyle}>
                        <UserPlus size={18} /> Add New Student
                    </button>
                    <button onClick={() => setActiveModal('recordPayment')} style={secondaryBtnStyle}>
                        <DollarSign size={18} /> Record Payment
                    </button>
                    <button onClick={() => setActiveModal('logSession')} style={secondaryBtnStyle}>
                        <Calendar size={18} /> Log Class Session
                    </button>
                    <button onClick={() => setActiveModal('addAdvance')} style={secondaryBtnStyle}>
                        <Plus size={18} /> Add Advance
                    </button>
                    <Link to="/students" style={secondaryBtnStyle}>
                        <Users size={18} /> Manage Students
                    </Link>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={activeModal === 'addCourse'} onClose={() => setActiveModal(null)} title="Add New Course">
                <AddCourseForm onSuccess={() => setActiveModal(null)} onCancel={() => setActiveModal(null)} />
            </Modal>

            <Modal isOpen={activeModal === 'addStudent'} onClose={() => setActiveModal(null)} title="Add New Student">
                <AddStudentForm onSuccess={() => setActiveModal(null)} onCancel={() => setActiveModal(null)} />
            </Modal>

            <Modal isOpen={activeModal === 'recordPayment'} onClose={() => setActiveModal(null)} title="Record Payment">
                <RecordPaymentForm onSuccess={() => setActiveModal(null)} onCancel={() => setActiveModal(null)} />
            </Modal>

            <Modal isOpen={activeModal === 'logSession'} onClose={() => setActiveModal(null)} title="Log Class Session">
                <LogSessionForm onSuccess={() => setActiveModal(null)} onCancel={() => setActiveModal(null)} />
            </Modal>

            <Modal isOpen={activeModal === 'addAdvance'} onClose={() => setActiveModal(null)} title="Add Advance">
                <AddAdvanceForm onSuccess={() => setActiveModal(null)} onCancel={() => setActiveModal(null)} />
            </Modal>

        </div>
    );
};

export default Dashboard;
