import React from 'react';
import { useData } from '../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportsTab = ({ courseId }) => {
    const { courses, enrollments, payments, attendance, students, complianceRecords, notificationPreferences, grades, appRules } = useData();

    const course = courses.find(c => c.id === courseId);
    const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
    const coursePayments = payments.filter(p => p.courseId === courseId);
    const courseAttendance = attendance.filter(a => a.courseId === courseId);

    // --- 1. Financial Summary ---
    const totalExpected = courseEnrollments.length * (parseFloat(course?.fee) || 0);
    const totalCollected = coursePayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalDue = totalExpected - totalCollected;

    // --- 2. Charts Data ---

    // A. Attendance Trend (Line Chart)
    const attendanceByDate = courseAttendance.reduce((acc, record) => {
        if (!acc[record.date]) {
            acc[record.date] = { total: 0, present: 0 };
        }
        acc[record.date].total += 1;
        if (record.status === 'Present' || record.status === 'Late') acc[record.date].present += 1;
        return acc;
    }, {});

    const attendanceData = Object.keys(attendanceByDate).sort().map(date => ({
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        rate: Math.round((attendanceByDate[date].present / attendanceByDate[date].total) * 100)
    }));

    // B. Payment Status (Pie Chart)
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;
    const courseFee = parseFloat(course?.fee) || 0;

    courseEnrollments.forEach(enrollment => {
        const paid = coursePayments
            .filter(p => p.studentId === enrollment.studentId)
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        if (courseFee === 0) paidCount++;
        else if (paid >= courseFee) paidCount++;
        else if (paid > 0) partialCount++;
        else unpaidCount++;
    });

    const paymentStatusData = [
        { name: 'Paid', value: paidCount },
        { name: 'Partial', value: partialCount },
        { name: 'Unpaid', value: unpaidCount }
    ];
    const PAYMENT_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

    // C. Progression (Bar Chart)
    const progressionData = [
        { name: 'Active', value: courseEnrollments.filter(e => e.status === 'Active').length },
        { name: 'Completed', value: courseEnrollments.filter(e => e.status === 'Completed').length },
        { name: 'Dropped', value: courseEnrollments.filter(e => e.status === 'Dropped').length }
    ];

    // --- 3. At-Risk Students ---
    const atRiskStudents = courseEnrollments.map(enrollment => {
        const student = students.find(s => s.id === enrollment.studentId);

        // Attendance Check
        const studentAtt = courseAttendance.filter(a => a.studentId === enrollment.studentId);
        const present = studentAtt.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const attendanceRate = studentAtt.length > 0 ? Math.round((present / studentAtt.length) * 100) : 100;

        // Payment Check
        const paid = coursePayments
            .filter(p => p.studentId === enrollment.studentId)
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const due = courseFee - paid;

        const risks = [];
        if (attendanceRate < (parseFloat(appRules.attendanceThreshold) || 70)) risks.push(`Low Attendance (${attendanceRate}%)`);
        if (due > 0 && (paid > 0 || enrollment.status === 'Active')) risks.push(`Unpaid Balance ($${due.toFixed(2)})`);

        // Compliance Check
        const studentViolations = complianceRecords.filter(v => v.studentId === enrollment.studentId && v.status === 'Open');
        const strikeLimit = notificationPreferences?.complianceStrikeLimit || 3;
        if (studentViolations.length >= strikeLimit) {
            risks.push(`High Compliance Risk (${studentViolations.length} Strikes)`);
        }

        // Grade Risk Check
        const courseObj = courses.find(c => c.id === courseId);
        const passingGrade = parseFloat(appRules?.passingGrade) || 80;

        if (courseObj && courseObj.requiredTasks) {
            const studentGrades = grades.filter(g => g.studentId === enrollment.studentId && g.courseId === courseId);
            const assignedGrades = studentGrades.filter(g => g.isAssigned === true);

            if (assignedGrades.length > 0) {
                let totalMaxPoints = 0;
                let currentTotalScore = 0;

                assignedGrades.forEach(g => {
                    const task = courseObj.requiredTasks.find(t => t.id === g.taskId);
                    if (task) {
                        totalMaxPoints += parseFloat(task.maxPoints) || 0;
                        currentTotalScore += parseFloat(g.score) || 0;
                    }
                });

                if (totalMaxPoints > 0) {
                    const percentage = (currentTotalScore / totalMaxPoints) * 100;
                    if (percentage < passingGrade) {
                        risks.push(`Low Grade (${percentage.toFixed(1)}%)`);
                    }
                }
            }
        }

        if (risks.length > 0) {
            return {
                id: student.id,
                name: student.name,
                risks: risks.join(', ')
            };
        }
        return null;
    }).filter(Boolean);

    // --- Export Functions ---
    const handleExportPDF = async () => {
        const input = document.getElementById('reports-container');
        if (!input) return;

        try {
            const canvas = await import('html2canvas').then(m => m.default(input, { scale: 2 }));
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 30;

            pdf.setFontSize(18);
            pdf.text(`${course?.name || 'Course'} Report`, 14, 22);
            pdf.setFontSize(10);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

            pdf.addImage(imgData, 'PNG', 0, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${course?.name || 'Course'}_Report.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const handleExportCSV = () => {
        const headers = ['Student Name', 'Status', 'Enrolled Date', 'Completed Date', 'Total Paid', 'Paid Date', 'Attendance Rate'];
        const rows = courseEnrollments.map(e => {
            const student = students.find(s => s.id === e.studentId);
            const studentPayments = coursePayments.filter(p => p.studentId === e.studentId);
            const paid = studentPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            // Logic for Paid Date: Last payment date if fully paid (or just last payment date)
            let paidDate = '-';
            if (paid >= courseFee && courseFee > 0 && studentPayments.length > 0) {
                // Sort payments by date desc
                const sortedPayments = [...studentPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
                paidDate = new Date(sortedPayments[0].date).toLocaleDateString();
            } else if (paid > 0 && studentPayments.length > 0) {
                const sortedPayments = [...studentPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
                paidDate = `Last: ${new Date(sortedPayments[0].date).toLocaleDateString()}`;
            }

            const studentAtt = courseAttendance.filter(a => a.studentId === e.studentId);
            const present = studentAtt.filter(a => a.status === 'Present' || a.status === 'Late').length;
            const rate = studentAtt.length > 0 ? Math.round((present / studentAtt.length) * 100) : 0;

            return [
                student?.name || 'Unknown',
                e.status,
                new Date(e.startDate).toLocaleDateString(),
                e.completedDate || '-',
                paid.toFixed(2),
                paidDate,
                `${rate}%`
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${course?.name || 'Course'}_Report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="reports-tab" id="reports-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>Course Analytics</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} /> Export Data (CSV)
                    </button>
                    <button className="btn btn-primary" onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> Download Report (PDF)
                    </button>
                </div>
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>Total Expected</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${totalExpected.toFixed(2)}</div>
                </div>
                <div className="card">
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>Total Collected</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>${totalCollected.toFixed(2)}</div>
                </div>
                <div className="card">
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>Remaining Due</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>${totalDue.toFixed(2)}</div>
                </div>
            </div>

            {/* At-Risk Students Section */}
            {atRiskStudents.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--danger)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--danger)' }}>
                        <AlertTriangle size={20} />
                        <h4 style={{ margin: 0 }}>At-Risk Students</h4>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Risk Factor(s)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {atRiskStudents.map(student => (
                                    <tr key={student.id}>
                                        <td style={{ fontWeight: 'bold' }}>{student.name}</td>
                                        <td style={{ color: 'var(--danger)' }}>{student.risks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

                {/* Attendance Chart */}
                <div className="card" style={{ height: '350px' }}>
                    <h4>Attendance Trend</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                            <Line type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Status Chart */}
                <div className="card" style={{ height: '350px' }}>
                    <h4>Payment Status</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={paymentStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {paymentStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Progression Chart */}
                <div className="card" style={{ height: '350px', gridColumn: '1 / -1' }}>
                    <h4>Student Progression</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={progressionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" stroke="var(--text-muted)" allowDecimals={false} />
                            <YAxis dataKey="name" type="category" stroke="var(--text-muted)" width={100} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                            <Bar dataKey="value" fill="var(--secondary)" radius={[0, 4, 4, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
