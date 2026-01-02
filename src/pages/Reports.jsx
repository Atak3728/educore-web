import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import StatusTag from '../components/StatusTag';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Reports = () => {
    useDocumentTitle('EduCore | Reports');
    const { students, courses, payments, attendance, enrollments, appRules, complianceRecords, notificationPreferences, grades } = useData();

    // --- Filters State ---
    const [selectedCourseId, setSelectedCourseId] = useState('All');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
        end: new Date().toISOString().split('T')[0] // Today
    });

    // --- Filter Logic ---
    const filteredEnrollments = enrollments.filter(e => {
        if (selectedCourseId !== 'All' && e.courseId !== selectedCourseId) return false;
        // Normalize to YYYY-MM-DD for comparison
        const start = e.startDate ? e.startDate.split('T')[0] : '';
        if (start < dateRange.start || start > dateRange.end) return false;
        return true;
    });

    const filteredPayments = payments.filter(p => {
        if (selectedCourseId !== 'All' && p.courseId !== selectedCourseId) return false;
        const date = p.date ? p.date.split('T')[0] : '';
        if (date < dateRange.start || date > dateRange.end) return false;
        return true;
    });

    const filteredAttendance = attendance.filter(a => {
        if (selectedCourseId !== 'All' && a.courseId !== selectedCourseId) return false;
        const date = a.date ? a.date.split('T')[0] : '';
        if (date < dateRange.start || date > dateRange.end) return false;
        return true;
    });

    // Recalculate Financials based on filters
    // Note: getFinancialSummary from context is global. We need local calculation for filtered view.

    // New Earnings Logic: Teacher Share per fully paid student
    // We need to find all "Earnings Events" - when a student fully paid a course.
    const earningsEvents = [];

    enrollments.forEach(enrollment => {
        // Apply Course Filter
        if (selectedCourseId !== 'All' && enrollment.courseId !== selectedCourseId) return;

        const course = courses.find(c => c.id === enrollment.courseId);
        if (!course) return;

        const courseFee = parseFloat(course.fee);

        // Get all payments for this enrollment
        const studentCoursePayments = payments.filter(p => p.studentId === enrollment.studentId && p.courseId === enrollment.courseId);

        // Sort by date to find WHEN it was fully paid
        studentCoursePayments.sort((a, b) => new Date(a.date) - new Date(b.date));

        let paidSoFar = 0;
        let fullyPaidDate = null;

        for (const payment of studentCoursePayments) {
            paidSoFar += parseFloat(payment.amount);
            if (paidSoFar >= courseFee) {
                fullyPaidDate = payment.date;
                break; // Found the payment that completed the fee
            }
        }

        if (fullyPaidDate) {
            // Check if this event falls within the selected Date Range
            const paidDate = fullyPaidDate.split('T')[0];
            if (paidDate >= dateRange.start && paidDate <= dateRange.end) {
                earningsEvents.push({
                    date: fullyPaidDate,
                    amount: parseFloat(appRules.teacherShare) // Dynamic Rule
                });
            }
        }
    });

    const totalEarnings = earningsEvents.reduce((sum, e) => sum + e.amount, 0);

    // Advances are global, usually not tied to course, but we can filter by date
    const { advances } = useData(); // Need direct access to advances
    const filteredAdvances = advances.filter(a => a.date >= dateRange.start && a.date <= dateRange.end);
    const totalAdvancesFiltered = filteredAdvances.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
    const currentBalanceFiltered = totalAdvancesFiltered - totalEarnings;

    // --- Data Preparation ---

    // 1. Course Status Distribution (Filtered)
    const statusData = [
        { name: 'Active', value: filteredEnrollments.filter(e => e.status === 'Active').length },
        { name: 'Completed', value: filteredEnrollments.filter(e => e.status === 'Completed').length },
        { name: 'Dropped', value: filteredEnrollments.filter(e => e.status === 'Dropped').length },
    ];
    const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

    // 2. Monthly Earnings Trend (Filtered) - Based on Realized Earnings (Teacher Share events)
    const earningsByMonth = earningsEvents.reduce((acc, event) => {
        const month = new Date(event.date).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + event.amount;
        return acc;
    }, {});
    const earningsData = Object.keys(earningsByMonth).map(month => ({ name: month, amount: earningsByMonth[month] }));

    // 3. Attendance Overview (Filtered)
    const totalSessions = new Set(filteredAttendance.map(a => a.sessionId)).size;
    const totalPresent = filteredAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const totalRecords = filteredAttendance.length;
    const overallAttendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    // 4. Outstanding Payments (Top 5 -> All for filtered view usually, but let's keep top 5 or expand)
    // We need to calculate this based on ALL active enrollments for the selected course(s), 
    // regardless of date range (outstanding is a current state), but we can respect the course filter.
    const relevantEnrollments = enrollments.filter(e => selectedCourseId === 'All' || e.courseId === selectedCourseId);

    const studentFinancials = students.map(student => {
        const studentSpecificEnrollments = relevantEnrollments.filter(e => e.studentId === student.id && e.status === 'Active');
        if (studentSpecificEnrollments.length === 0) return null;

        let expected = 0;
        studentSpecificEnrollments.forEach(e => {
            const course = courses.find(c => c.id === e.courseId);
            if (course) expected += parseFloat(course.fee);
        });

        // Paid should be total paid for these courses, NOT filtered by date range for "Balance Due" calculation
        const relevantPayments = payments.filter(p =>
            p.studentId === student.id &&
            (selectedCourseId === 'All' || p.courseId === selectedCourseId)
        );
        const paid = relevantPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Last Payment Date
        const sortedPayments = [...relevantPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastPaymentDate = sortedPayments.length > 0 ? new Date(sortedPayments[0].date).toLocaleDateString() : '-';

        return {
            ...student,
            expected,
            paid,
            due: expected - paid,
            lastPaymentDate
        };
    }).filter(s => s && s.due > 0).sort((a, b) => b.due - a.due);

    // 5. Globally At-Risk Students
    const atRiskStudents = students.map(student => {
        const studentSpecificEnrollments = relevantEnrollments.filter(e => e.studentId === student.id && e.status === 'Active');
        if (studentSpecificEnrollments.length === 0) return null;

        // Check Attendance
        // Get all attendance records for this student in relevant courses
        const studentAtt = attendance.filter(a =>
            a.studentId === student.id &&
            (selectedCourseId === 'All' || a.courseId === selectedCourseId)
        );
        const present = studentAtt.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const rate = studentAtt.length > 0 ? Math.round((present / studentAtt.length) * 100) : 100;

        // Check Financials (Reuse logic if possible, but simple calc here)
        let expected = 0;
        studentSpecificEnrollments.forEach(e => {
            const course = courses.find(c => c.id === e.courseId);
            if (course) expected += parseFloat(course.fee);
        });
        const paid = payments.filter(p =>
            p.studentId === student.id &&
            (selectedCourseId === 'All' || p.courseId === selectedCourseId)
        ).reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const due = expected - paid;

        // Check Compliance Strikes
        const studentViolations = complianceRecords.filter(v => v.studentId === student.id && v.status === 'Open');
        const strikes = studentViolations.length;
        const strikeLimit = notificationPreferences?.complianceStrikeLimit || 3;

        // Check Grades (Score < 50%)
        let gradeRisk = false;
        studentSpecificEnrollments.forEach(e => {
            const course = courses.find(c => c.id === e.courseId);
            if (course && course.requiredTasks && course.requiredTasks.length > 0) {
                const maxPoints = parseFloat(course.maxPoints) || 100;
                const studentGrades = grades.filter(g => g.studentId === e.studentId && g.courseId === e.courseId);
                const totalScore = studentGrades.reduce((sum, g) => sum + (parseFloat(g.score) || 0), 0);

                if (studentGrades.length > 0) {
                    const percentage = (totalScore / maxPoints) * 100;
                    const passingGrade = parseFloat(appRules.passingGrade) || 80;
                    if (percentage < passingGrade) gradeRisk = true;
                }
            }
        });

        if (rate < (parseFloat(appRules.attendanceThreshold) || 70) || due > 0 || strikes >= strikeLimit || gradeRisk) {
            return {
                ...student,
                currentCourse: studentSpecificEnrollments.map(e => courses.find(c => c.id === e.courseId)?.name).join(', '),
                attendanceRate: rate,
                balanceDue: due,
                strikes,
                gradeRisk
            };
        }
        return null;
    }).filter(Boolean);

    // 6. Global Course Completion
    const completionReport = filteredEnrollments.map(e => {
        const student = students.find(s => s.id === e.studentId);
        const course = courses.find(c => c.id === e.courseId);
        const paid = payments
            .filter(p => p.studentId === e.studentId && p.courseId === e.courseId)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        return {
            id: e.id,
            studentName: student?.name || 'Unknown',
            courseName: course?.name || 'Unknown',
            status: e.status,
            totalPaid: paid,
            completedDate: e.completedDate || '-'
        };
    });


    return (
        <div className="reports-page">
            <header style={{ marginBottom: '2rem' }}>
                <h2>Global Reports</h2>
                <p className="text-muted">Insights across all courses and students.</p>
            </header>

            {/* Global Filters */}
            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Filter by Course</label>
                    <select
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }}
                    >
                        <option value="All">All Courses</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flex: 2, minWidth: '300px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Financial Summary Card */}
                <div className="card">
                    <h3>Net Financial Position (Filtered)</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-muted">Total Earnings</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>${totalEarnings.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-muted">Total Advances</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--warning)' }}>${totalAdvancesFiltered.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                            <span className="text-muted">Balance</span>
                            <span style={{ fontWeight: 'bold', color: currentBalanceFiltered > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                {currentBalanceFiltered > 0 ? `Owe School $${currentBalanceFiltered.toFixed(2)}` : `School Owes You $${Math.abs(currentBalanceFiltered).toFixed(2)}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Attendance Summary Card */}
                <div className="card">
                    <h3>Overall Attendance (Filtered)</h3>
                    <div style={{ display: 'flex', alignItems: 'center', height: '150px', textAlign: 'left' }}>
                        <div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: overallAttendanceRate >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                                {overallAttendanceRate}%
                            </div>
                            <div className="text-muted">Average Attendance Rate</div>
                            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Across {totalSessions} Sessions</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Charts Row 1 */}
                <div className="card" style={{ height: '400px' }}>
                    <h3>Monthly Earnings Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={earningsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                            <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ height: '400px' }}>
                    <h3>Enrollment Status</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

                {/* Globally At-Risk Students Table */}
                <div className="card" style={{ gridColumn: '1 / -1', borderLeft: '4px solid var(--danger)' }}>
                    <h3>Globally At-Risk Students</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                        (Attendance &lt; {appRules.attendanceThreshold}%, Unpaid & Overdue, Strikes ≥ {notificationPreferences.complianceStrikeLimit}, or Grade &lt; {appRules.passingGrade}%)
                    </p>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Current Course</th>
                                    <th>Attendance</th>
                                    <th>Balance Due</th>
                                    <th>Strikes</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {atRiskStudents.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No at-risk students found.</td></tr>
                                ) : (
                                    atRiskStudents.map(s => (
                                        <tr key={s.id}>
                                            <td style={{ fontWeight: 'bold' }}>
                                                <Link to={`/students/${s.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                    {s.name}
                                                </Link>
                                            </td>
                                            <td>{s.currentCourse}</td>
                                            <td style={{ color: s.attendanceRate < (parseFloat(appRules.attendanceThreshold) || 70) ? 'var(--danger)' : 'var(--text-main)' }}>{s.attendanceRate}%</td>
                                            <td style={{ color: s.balanceDue > 0 ? 'var(--danger)' : 'var(--success)' }}>${s.balanceDue.toFixed(2)}</td>
                                            <td style={{ color: s.strikes >= (notificationPreferences?.complianceStrikeLimit || 3) ? 'var(--danger)' : 'var(--text-main)' }}>{s.strikes}</td>
                                            <td>
                                                {s.attendanceRate < (parseFloat(appRules.attendanceThreshold) || 70) && <span style={{ marginRight: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Low Attendance</span>}
                                                {s.balanceDue > 0 && <span style={{ marginRight: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Unpaid</span>}
                                                {s.strikes >= (notificationPreferences?.complianceStrikeLimit || 3) && <span style={{ marginRight: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>High Risk</span>}
                                                {s.gradeRisk && <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>Low Score</span>}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Enhanced Outstanding Payments Table */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <h3>Outstanding Payments</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Total Due</th>
                                    <th>Paid</th>
                                    <th>Balance</th>
                                    <th>Last Payment</th>
                                    <th>Father's Phone</th>
                                    <th>Mother's Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentFinancials.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No outstanding payments.</td></tr>
                                ) : (
                                    studentFinancials.map(s => (
                                        <tr key={s.id}>
                                            <td>
                                                <Link to={`/students/${s.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                    {s.name}
                                                </Link>
                                            </td>
                                            <td>${s.expected.toFixed(2)}</td>
                                            <td style={{ color: 'var(--success)' }}>${s.paid.toFixed(2)}</td>
                                            <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>${s.due.toFixed(2)}</td>
                                            <td>{s.lastPaymentDate}</td>
                                            <td>{s.fatherPhone || '-'}</td>
                                            <td>{s.motherPhone || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
