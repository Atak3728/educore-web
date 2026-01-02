import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { version } from '../../package.json';
import { useToast } from './ToastContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { addToast } = useToast();

    // Helper for safe local storage parsing
    const getLocalStorage = (key, defaultValue) => {
        try {
            const storedValue = localStorage.getItem(key);
            if (!storedValue) return defaultValue;
            return JSON.parse(storedValue) || defaultValue;
        } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
            return defaultValue;
        }
    };

    // Initial State
    // Initial State
    const [students, setStudents] = useState(() => {
        const val = getLocalStorage('students', []);
        return Array.isArray(val) ? val : [];
    });
    const [courses, setCourses] = useState(() => {
        const val = getLocalStorage('courses', []);
        return Array.isArray(val) ? val : [];
    });
    const [payments, setPayments] = useState(() => {
        const val = getLocalStorage('payments', []);
        return Array.isArray(val) ? val : [];
    });
    const [attendance, setAttendance] = useState(() => {
        const val = getLocalStorage('attendance', []);
        return Array.isArray(val) ? val : [];
    });
    const [enrollments, setEnrollments] = useState(() => {
        const val = getLocalStorage('enrollments', []);
        return Array.isArray(val) ? val : [];
    });
    const [notes, setNotes] = useState(() => {
        const val = getLocalStorage('notes', []);
        return Array.isArray(val) ? val : [];
    });
    const [files, setFiles] = useState(() => {
        const val = getLocalStorage('files', []);
        return Array.isArray(val) ? val : [];
    });
    const [advances, setAdvances] = useState(() => {
        const val = getLocalStorage('advances', []);
        return Array.isArray(val) ? val : [];
    });
    const [teacherGoals, setTeacherGoals] = useState(() => getLocalStorage('teacherGoals', { target: 0 }));
    const [monthlyFinancialTarget, setMonthlyFinancialTarget] = useState(() => getLocalStorage('monthlyFinancialTarget', 0));
    const [appRules, setAppRules] = useState(() => getLocalStorage('appRules', {
        teacherShare: 50,
        courseDuration: 3,
        defaultCourseFee: 100,
        passingGrade: 80,
        paymentDueDays: 15,
        attendanceThreshold: 70,
        completionThreshold: 90,
        defaultMaxPoints: 100
    }));
    const [complianceRecords, setComplianceRecords] = useState(() => {
        const val = getLocalStorage('complianceRecords', []);
        return Array.isArray(val) ? val : [];
    });
    const [grades, setGrades] = useState(() => {
        const val = getLocalStorage('grades', []);
        return Array.isArray(val) ? val : [];
    });
    const [notificationPreferences, setNotificationPreferences] = useState(() => getLocalStorage('notificationPreferences', {
        paymentDue: true,
        attendanceRisk: true,
        financialRisk: true,
        dataIntegrity: true,
        advanceRepaid: true,
        studentProgressAlerts: true,
        courseCompletionAlerts: true,
        complianceStrikeLimit: 3
    }));
    const [paymentFollowUpLedger, setPaymentFollowUpLedger] = useState(() => {
        const val = getLocalStorage('paymentFollowUpLedger', []);
        return Array.isArray(val) ? val : [];
    });

    // Persistence
    useEffect(() => localStorage.setItem('students', JSON.stringify(students)), [students]);
    useEffect(() => localStorage.setItem('courses', JSON.stringify(courses)), [courses]);
    useEffect(() => localStorage.setItem('payments', JSON.stringify(payments)), [payments]);
    useEffect(() => localStorage.setItem('attendance', JSON.stringify(attendance)), [attendance]);
    useEffect(() => localStorage.setItem('enrollments', JSON.stringify(enrollments)), [enrollments]);
    useEffect(() => localStorage.setItem('notes', JSON.stringify(notes)), [notes]);
    useEffect(() => localStorage.setItem('files', JSON.stringify(files)), [files]);
    useEffect(() => localStorage.setItem('advances', JSON.stringify(advances)), [advances]);
    useEffect(() => localStorage.setItem('complianceRecords', JSON.stringify(complianceRecords)), [complianceRecords]);
    useEffect(() => localStorage.setItem('grades', JSON.stringify(grades)), [grades]);
    useEffect(() => localStorage.setItem('monthlyFinancialTarget', JSON.stringify(monthlyFinancialTarget)), [monthlyFinancialTarget]);
    useEffect(() => localStorage.setItem('teacherGoals', JSON.stringify(teacherGoals)), [teacherGoals]);
    useEffect(() => localStorage.setItem('appRules', JSON.stringify(appRules)), [appRules]);
    useEffect(() => localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences)), [notificationPreferences]);
    useEffect(() => localStorage.setItem('paymentFollowUpLedger', JSON.stringify(paymentFollowUpLedger)), [paymentFollowUpLedger]);

    // Clean Data State Initialization
    useEffect(() => {
        const isInitialized = localStorage.getItem('app_initialized');
        if (!isInitialized) {
            console.log('First run detected. Initializing clean data state...');

            // Clear any potential partial data
            localStorage.clear();

            // Set default admin account
            const defaultAccount = {
                username: 'admin',
                password: 'password',
                name: 'Admin User',
                role: 'Administrator',
                email: 'admin@educore.com'
            };
            localStorage.setItem('account', JSON.stringify(defaultAccount));

            // Mark as initialized
            localStorage.setItem('app_initialized', 'true');

            // Force reload to pick up clean state if needed, though state should be empty by default
            // In this context, state is already initialized from LS (which was empty or partial).
            // Since we just cleared LS, we should update state to match if it wasn't empty.
            // But since this runs on mount, state is already set. 
            // If state had data but LS didn't have 'app_initialized', we might be in a weird spot.
            // However, for a fresh install, state is empty.
            // Let's explicitly set state to defaults to be safe.
            setStudents([]);
            setCourses([]);
            setPayments([]);
            setAttendance([]);
            setEnrollments([]);
            setNotes([]);
            setFiles([]);
            setAdvances([]);
            setComplianceRecords([]);
            setGrades([]);
            setAccount(defaultAccount);
        }
    }, []);

    const calculateEarnings = () => {
        let total = 0;
        // Helper to get course fee
        const getCourseFee = (courseId) => {
            const course = courses.find(c => c.id === courseId);
            return course ? parseFloat(course.fee) || 0 : 0;
        };

        // Group payments by student and course
        const paymentsMap = {}; // { `${studentId}-${courseId}`: totalPaid }

        payments.forEach(p => {
            const key = `${p.studentId}|${p.courseId}`;
            paymentsMap[key] = (paymentsMap[key] || 0) + (parseFloat(p.amount) || 0);
        });

        // Check against course fees
        Object.keys(paymentsMap).forEach(key => {
            const [studentId, courseId] = key.split('|');
            const totalPaid = paymentsMap[key];
            const courseFee = getCourseFee(courseId);

            if (courseFee > 0 && totalPaid >= courseFee) {
                total += parseFloat(appRules.teacherShare);
            }
        });

        return total;
    };

    const totalEarnings = calculateEarnings();

    // --- Rule B: Financial Balance ---
    // Balance = Total Advances - Total Net Income
    const totalAdvances = advances.reduce((sum, adv) => sum + (parseFloat(adv.amount) || 0), 0);
    const currentBalance = totalAdvances - totalEarnings; // Positive = Teacher owes school. Negative = School owes teacher.

    // --- Actions ---

    // Student Actions
    const addStudent = (student) => {
        // Validation: Check for duplicate name (case-insensitive)
        const duplicate = students.find(s => s.name.toLowerCase() === student.name.toLowerCase());
        if (duplicate) {
            addToast('A student with this name already exists.', 'error');
            return;
        }
        const newStudent = { ...student, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        setStudents([...students, newStudent]);
        addToast('Student added successfully!', 'success');
    };

    const updateStudent = (id, updates) => {
        // Validation: Check for duplicate name if name is being updated
        if (updates.name) {
            const duplicate = students.find(s => s.name.toLowerCase() === updates.name.toLowerCase() && s.id !== id);
            if (duplicate) {
                alert('A student with this name already exists.');
                return;
            }
        }
        setStudents(students.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const addPaymentFollowUp = (enrollmentId, noteData) => {
        setEnrollments(enrollments.map(e => {
            if (e.id === enrollmentId) {
                const currentLedger = e.paymentFollowUpLedger || [];
                return {
                    ...e,
                    paymentFollowUpLedger: [
                        { ...noteData, id: crypto.randomUUID(), date: noteData.date || new Date().toISOString() },
                        ...currentLedger
                    ]
                };
            }
            return e;
        }));
        addToast('Payment follow-up added.', 'success');
    };

    const deleteStudent = (studentId) => {
        // Check for active enrollments
        const activeEnrollments = enrollments.filter(
            e => e.studentId === studentId && e.status === 'Active'
        );

        if (activeEnrollments.length > 0) {
            throw new Error(`Cannot delete student: ${activeEnrollments.length} active enrollment(s) found. Please drop or complete these enrollments first.`);
        }

        // Delete student and related data
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setEnrollments(prev => prev.filter(e => e.studentId !== studentId));
        setPayments(prev => prev.filter(p => p.studentId !== studentId));
        setAttendance(prev => prev.filter(a => a.studentId !== studentId));
        setNotes(prev => prev.filter(n => {
            // Remove notes that are directly linked to this student
            if (n.studentId === studentId) return false;
            // Remove notes with context pointing to this student
            if (n.context?.type === 'Student' && n.context?.id === studentId) return false;
            return true;
        }));
        setComplianceRecords(prev => prev.filter(c => c.studentId !== studentId));
        setGrades(prev => prev.filter(g => g.studentId !== studentId));
        addToast('Student deleted successfully', 'success');
    };


    // Course Actions
    const addCourse = (course) => {
        const newCourse = { ...course, id: crypto.randomUUID(), status: 'Active', createdAt: new Date().toISOString() };
        setCourses([...courses, newCourse]);
        addToast('Course created successfully!', 'success');
    };

    const updateCourse = (id, updates) => {
        setCourses(courses.map(c => c.id === id ? { ...c, ...updates } : c));

        // Rule: Automatic Status Cascade
        // If course is marked Completed, mark all Active students in that course as Completed.
        if (updates.status === 'Completed') {
            setEnrollments(prevEnrollments => prevEnrollments.map(e => {
                if (e.courseId === id && e.status === 'Active') {
                    return { ...e, status: 'Completed', completedDate: new Date().toISOString().split('T')[0] };
                }
                return e;
            }));
        }
        addToast('Course updated successfully', 'success');
    };

    // Rule C: Course Deletion
    const deleteCourse = (courseId) => {
        // Delete course
        setCourses(courses.filter(c => c.id !== courseId));
        // Delete payments for this course
        setPayments(payments.filter(p => p.courseId !== courseId));
        // Delete attendance for this course
        setAttendance(attendance.filter(a => a.courseId !== courseId));
        // Delete files for this course
        setFiles(files.filter(f => f.courseId !== courseId));
        // Note: Student profiles remain (Rule D)
        addToast('Course deleted successfully', 'success');
    };

    // Payment Actions
    const addPayment = (payment) => {
        const newPayment = { ...payment, id: crypto.randomUUID(), date: new Date().toISOString() };
        setPayments([...payments, newPayment]);
        addToast('Payment recorded successfully!', 'success');
    };

    const updatePayment = (id, updates) => {
        setPayments(payments.map(p => p.id === id ? { ...p, ...updates } : p));
        addToast('Payment updated successfully', 'success');
    };

    const deletePayment = (id) => {
        setPayments(payments.filter(p => p.id !== id));
    };

    // Advance Actions
    const addAdvance = (advance) => {
        const newAdvance = { ...advance, id: crypto.randomUUID(), date: new Date().toISOString() };
        setAdvances([...advances, newAdvance]);
        addToast('Advance recorded successfully', 'success');
    };

    const updateAdvance = (id, updates) => {
        setAdvances(advances.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const deleteAdvance = (id) => {
        setAdvances(advances.filter(a => a.id !== id));
    };

    // Attendance Actions
    const addAttendanceSession = (session) => {
        // session: { date, courseId, sessionNote, records: [{ studentId, status, note }] }
        const newSessionId = crypto.randomUUID();
        const newRecords = session.records.map(r => ({
            ...r,
            id: crypto.randomUUID(),
            sessionId: newSessionId,
            date: session.date,
            courseId: session.courseId,
            sessionNote: session.sessionNote || '' // General session note
        }));
        setAttendance([...attendance, ...newRecords]);
        addToast('Attendance session recorded', 'success');
    };

    const updateAttendanceSession = (sessionId, sessionData) => {
        // sessionData: { date, sessionNote, records: [{ studentId, status, note }] }
        setAttendance(prev => prev.map(record => {
            if (record.sessionId === sessionId) {
                const studentUpdate = sessionData.records.find(r => r.studentId === record.studentId);
                return {
                    ...record,
                    date: sessionData.date,
                    sessionNote: sessionData.sessionNote,
                    status: studentUpdate ? studentUpdate.status : record.status,
                    note: studentUpdate ? studentUpdate.note : record.note
                };
            }
            return record;
        }));
    };

    const deleteAttendanceSession = (sessionId) => {
        setAttendance(prev => prev.filter(a => a.sessionId !== sessionId));
    };

    // Enrollment Actions
    const enrollStudent = (enrollment) => {
        // enrollment: { studentId, courseId, startDate, status: 'Active' }

        // Check for duplicate active enrollment
        const existingActiveEnrollment = enrollments.find(
            e => e.studentId === enrollment.studentId &&
                e.courseId === enrollment.courseId &&
                e.status === 'Active'
        );

        if (existingActiveEnrollment) {
            alert('Error: Student is already active in this course.');
            return;
        }

        const newEnrollment = { ...enrollment, id: crypto.randomUUID(), status: 'Active' };
        setEnrollments([...enrollments, newEnrollment]);
        addToast('Student enrolled successfully', 'success');
    };

    const updateEnrollment = (id, updates) => {
        setEnrollments(enrollments.map(e => {
            if (e.id === id) {
                const updatedEnrollment = { ...e, ...updates };
                // Auto-set completedDate if status changes to Completed
                if (updates.status === 'Completed' && e.status !== 'Completed') {
                    updatedEnrollment.completedDate = new Date().toISOString().split('T')[0];
                }
                return updatedEnrollment;
            }
            return e;
        }));
        addToast('Enrollment updated', 'success');
    };

    const deleteEnrollment = (enrollmentId) => {
        // Find the enrollment to get student and course IDs
        const enrollment = enrollments.find(e => e.id === enrollmentId);
        if (!enrollment) return;

        // Delete the enrollment
        setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));

        // Clean up related data for this specific enrollment
        setPayments(prev => prev.filter(p =>
            !(p.studentId === enrollment.studentId && p.courseId === enrollment.courseId)
        ));

        setAttendance(prev => prev.filter(a =>
            !(a.studentId === enrollment.studentId && a.courseId === enrollment.courseId)
        ));

        setGrades(prev => prev.filter(g =>
            !(g.studentId === enrollment.studentId && g.courseId === enrollment.courseId)
        ));
    };


    const addNote = (note) => {
        const newNote = { ...note, id: crypto.randomUUID(), date: new Date().toISOString() };
        setNotes([...notes, newNote]);
        addToast('Note saved successfully!', 'success');
    };

    const updateNote = (id, updates) => {
        setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    // File Actions
    const addFile = (file) => {
        const newFile = { ...file, id: crypto.randomUUID(), date: new Date().toISOString() };
        setFiles([...files, newFile]);
        addToast('File uploaded successfully', 'success');
    };

    const updateFile = (id, updates) => {
        setFiles(files.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const deleteFile = (id) => {
        setFiles(files.filter(f => f.id !== id));
    };

    // Compliance Actions
    const addComplianceViolation = (violation) => {
        const newViolation = {
            ...violation,
            id: crypto.randomUUID(),
            date: violation.date || new Date().toISOString(),
            status: 'Open'
        };
        setComplianceRecords([...complianceRecords, newViolation]);
        addToast('Violation recorded', 'warning');
    };

    const updateComplianceViolation = (id, updates) => {
        setComplianceRecords(complianceRecords.map(v => v.id === id ? { ...v, ...updates } : v));
    };

    const deleteComplianceViolation = (id) => {
        setComplianceRecords(complianceRecords.filter(v => v.id !== id));
    };

    // Grade Actions
    const addGrade = (grade) => {
        // grade: { studentId, courseId, taskId, score, submissionLink, feedback, date }
        const newGrade = { ...grade, id: crypto.randomUUID(), date: new Date().toISOString() };
        setGrades([...grades, newGrade]);
        addToast('Grade recorded successfully', 'success');
    };

    const updateGrade = (id, updates) => {
        setGrades(grades.map(g => g.id === id ? { ...g, ...updates } : g));
        addToast('Grade updated successfully', 'success');
    };

    // Helper to get or create a grade record for a specific task
    const upsertGrade = (studentId, courseId, taskId, data) => {
        const existing = grades.find(g => g.studentId === studentId && g.courseId === courseId && g.taskId === taskId);
        if (existing) {
            updateGrade(existing.id, data);
        } else {
            addGrade({ studentId, courseId, taskId, ...data });
        }
    };

    const getFinancialSummary = () => ({
        totalEarnings,
        totalAdvances,
        currentBalance,
        teacherShare: parseFloat(appRules.teacherShare)
    });

    const updateNotificationPreference = (key, value) => {
        setNotificationPreferences(prev => ({ ...prev, [key]: value }));
    };

    const updateAppRules = (key, value) => {
        setAppRules(prev => ({ ...prev, [key]: value }));
    };

    // --- Notifications Logic ---
    const [readNotificationIds, setReadNotificationIds] = useState(() => {
        const val = getLocalStorage('readNotificationIds', []);
        return Array.isArray(val) ? val : [];
    });

    useEffect(() => localStorage.setItem('readNotificationIds', JSON.stringify(readNotificationIds)), [readNotificationIds]);

    const markAsRead = (id) => {
        if (!readNotificationIds.includes(id)) {
            setReadNotificationIds(prev => [...prev, id]);
        }
    };

    const markAllAsRead = () => {
        const unreadIds = unreadNotifications.map(n => n.id);
        setReadNotificationIds(prev => [...new Set([...prev, ...unreadIds])]);
    };

    const getNotifications = () => {
        const alerts = [];

        // 1. Payment Due Alert: Unpaid/Partial AND End Date < 15 days
        const today = new Date();
        const fifteenDaysFromNow = new Date();
        fifteenDaysFromNow.setDate(today.getDate() + (parseInt(appRules.paymentDueDays) || 15));

        enrollments.forEach(e => {
            if (e.status === 'Active') {
                const course = courses.find(c => c.id === e.courseId);
                if (course && course.endDate) {
                    const endDate = new Date(course.endDate);
                    if (endDate <= fifteenDaysFromNow) {
                        // Check payment status
                        const studentPayments = payments.filter(p => p.studentId === e.studentId && p.courseId === e.courseId);
                        const totalPaid = studentPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                        const fee = parseFloat(course.fee) || 0;

                        if (totalPaid < fee) {
                            const student = students.find(s => s.id === e.studentId);
                            alerts.push({
                                id: `payment-${e.studentId}-${e.courseId}`,
                                type: 'payment',
                                message: `Payment Due: ${student?.name} (${course.name})`,
                                link: `/students/${e.studentId}`,
                                date: new Date().toISOString() // Dynamic, but consistent for sorting if needed
                            });
                        }
                    }
                }
            }
        });

        // 2. Attendance Risk Alert: Attendance < 70% in active course
        enrollments.forEach(e => {
            if (e.status === 'Active') {
                const courseSessions = attendance.filter(a => a.courseId === e.courseId);
                if (courseSessions.length > 0) {
                    let present = 0;
                    let total = 0;
                    courseSessions.forEach(session => {
                        const record = attendance.find(r => r.sessionId === session.sessionId && r.studentId === e.studentId);
                        if (record) {
                            total++;
                            if (record.status === 'Present' || record.status === 'Late') present++;
                        }
                    });

                    if (total > 0) {
                        const rate = (present / total) * 100;
                        if (rate < (parseFloat(appRules.attendanceThreshold) || 70)) {
                            const student = students.find(s => s.id === e.studentId);
                            const course = courses.find(c => c.id === e.courseId);
                            alerts.push({
                                id: `attendance-${e.studentId}-${e.courseId}`,
                                type: 'attendance',
                                message: `Attendance Risk: ${student?.name} (${course?.name}) - ${rate.toFixed(1)}%`,
                                link: `/students/${e.studentId}`,
                                date: new Date().toISOString()
                            });
                        }
                    }
                }
            }
        });

        // 3. Financial Risk Alert: Monthly Deficit OR Projected Debt
        // Re-calculate purely for notification check (avoiding circular dependency if we used state)
        const STUDENT_MONTHLY_VALUE = parseFloat(appRules.teacherShare) / parseFloat(appRules.courseDuration);
        const activeStudentsCount = enrollments.filter(e => e.status === 'Active').length;
        const currentMonthlyIncome = activeStudentsCount * STUDENT_MONTHLY_VALUE;
        const monthlyDeficit = currentMonthlyIncome - monthlyFinancialTarget < 0;

        const totalPotentialEarnings = activeStudentsCount * parseFloat(appRules.teacherShare);
        const projectedDebt = (totalAdvances - totalPotentialEarnings) > 0;

        if (monthlyDeficit) {
            alerts.push({
                id: 'financial-monthly-deficit',
                type: 'financial',
                message: 'Financial Risk: Monthly Deficit Detected',
                link: '/financials',
                date: new Date().toISOString()
            });
        }
        if (projectedDebt) {
            alerts.push({
                id: 'financial-projected-debt',
                type: 'financial',
                message: 'Financial Risk: Projected Debt Detected',
                link: '/financials',
                date: new Date().toISOString()
            });
        }

        // 4. Data Integrity Alert
        if (students.length > 0 && enrollments.length === 0) {
            alerts.push({
                id: 'integrity-no-enrollments',
                type: 'integrity',
                message: 'Data Integrity: Students exist but no enrollments found.',
                link: '/students',
                date: new Date().toISOString()
            });
        }

        // 5. Advance Repaid Milestone
        if (currentBalance <= 0 && totalAdvances > 0) {
            alerts.push({
                id: 'milestone-advances-repaid',
                type: 'milestone',
                message: 'Milestone: All advances repaid! You are in surplus.',
                link: '/financials',
                date: new Date().toISOString()
            });
        }

        // 6. Compliance Risk Alert: Unresolved Violations >= Strike Limit
        const strikeLimit = notificationPreferences.complianceStrikeLimit || 3;
        students.forEach(student => {
            const studentViolations = complianceRecords.filter(v => v.studentId === student.id && v.status === 'Open');
            if (studentViolations.length >= strikeLimit) {
                alerts.push({
                    id: `compliance-${student.id}`,
                    type: 'compliance',
                    message: `Compliance Risk: ${student.name} has ${studentViolations.length} unresolved violations`,
                    link: `/students/${student.id}`,
                    date: new Date().toISOString()
                });
            }
        });

        // 7. Grade Risk & Missing Assignment Alerts
        if (notificationPreferences.studentProgressAlerts) {
            enrollments.forEach(e => {
                if (e.status === 'Active' || e.status === 'Completed') {
                    const course = courses.find(c => c.id === e.courseId);
                    if (course && course.requiredTasks && course.requiredTasks.length > 0) {
                        const maxPoints = parseFloat(course.maxPoints) || 100;
                        const passingGrade = parseFloat(appRules.passingGrade) || 80;
                        const studentGrades = grades.filter(g => g.studentId === e.studentId && g.courseId === e.courseId);
                        const totalScore = studentGrades.reduce((sum, g) => sum + (parseFloat(g.score) || 0), 0);
                        // A. Missing Assignment Alert (Score = 0)
                        studentGrades.forEach(g => {
                            if (parseFloat(g.score) === 0) {
                                const task = course.requiredTasks.find(t => t.id === g.taskId);
                                const student = students.find(s => s.id === e.studentId);
                                alerts.push({
                                    id: `missing-${e.studentId}-${e.courseId}-${g.taskId}`,
                                    type: 'grade',
                                    message: `Missing Assignment: ${task?.name || 'Unknown Task'} for ${student?.name || 'Student'} (${course.name})`,
                                    link: `/students/${e.studentId}`,
                                    date: new Date().toISOString()
                                });
                            }
                        });

                        // B. Grade Risk (Current Score < Passing Grade %)
                        // Only check if there are graded tasks
                        if (studentGrades.length > 0 && e.status === 'Active') {
                            // Calculate Denominator: Sum of Max Points for ASSIGNED tasks only
                            const assignedGrades = studentGrades.filter(g => g.isAssigned === true);

                            if (assignedGrades.length > 0) {
                                let totalMaxPoints = 0;
                                let currentTotalScore = 0;

                                assignedGrades.forEach(g => {
                                    const task = course.requiredTasks.find(t => t.id === g.taskId);
                                    if (task) {
                                        totalMaxPoints += parseFloat(task.maxPoints) || 0;
                                        currentTotalScore += parseFloat(g.score) || 0;
                                    }
                                });

                                if (totalMaxPoints > 0) {
                                    const percentage = (currentTotalScore / totalMaxPoints) * 100;
                                    if (percentage < passingGrade) {
                                        const student = students.find(s => s.id === e.studentId);
                                        alerts.push({
                                            id: `grade-risk-${e.studentId}-${e.courseId}`,
                                            type: 'grade',
                                            message: `Grade Risk: ${student?.name} (${course.name}) - ${percentage.toFixed(1)}% (Target: ${passingGrade}%)`,
                                            link: `/students/${e.studentId}`,
                                            date: new Date().toISOString()
                                        });
                                    }
                                }
                            }
                        }

                        // C. Final Grade Alert (Completed & Score < Passing Grade)
                        if (e.status === 'Completed') {
                            const percentage = (totalScore / maxPoints) * 100;
                            if (percentage < passingGrade) {
                                const student = students.find(s => s.id === e.studentId);
                                alerts.push({
                                    id: `final-fail-${e.studentId}-${e.courseId}`,
                                    type: 'grade',
                                    message: `Final Grade Alert: ${student?.name} failed ${course.name} with ${percentage.toFixed(1)}%`,
                                    link: `/students/${e.studentId}`,
                                    date: new Date().toISOString()
                                });
                            }
                        }
                    }
                }
            });
        }

        // Filter based on preferences
        const preferencesFiltered = alerts.filter(alert => {
            if (alert.type === 'payment' && !notificationPreferences.paymentDue) return false;
            if (alert.type === 'attendance' && !notificationPreferences.attendanceRisk) return false;
            if (alert.type === 'financial' && !notificationPreferences.financialRisk) return false;
            if (alert.type === 'integrity' && !notificationPreferences.dataIntegrity) return false;
            if (alert.type === 'milestone' && !notificationPreferences.advanceRepaid) return false;
            if (alert.type === 'grade' && !notificationPreferences.studentProgressAlerts) return false;
            if (alert.type === 'completion' && !notificationPreferences.courseCompletionAlerts) return false;
            // Compliance alerts are always shown (based on strike limit threshold)
            return true;
        });

        return preferencesFiltered;
    };

    const calculateCourseProgress = (startDate, durationMonths = 3) => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const now = new Date();
        const end = new Date(start);
        end.setMonth(start.getMonth() + parseInt(durationMonths));

        const totalTime = end - start;
        const elapsedTime = now - start;

        if (totalTime <= 0) return 100;

        const progress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
        return progress;
    };

    // 8. Course Completion Alert
    // Check if course progress > 90% and status is not Completed
    const checkCourseCompletionAlerts = () => {
        const alerts = [];
        if (notificationPreferences.courseCompletionAlerts) {
            courses.forEach(course => {
                if (course.status !== 'Completed') {
                    const progress = calculateCourseProgress(course.startDate, appRules.courseDuration);
                    if (progress > (parseFloat(appRules.completionThreshold) || 90)) {
                        alerts.push({
                            id: `completion-${course.id}`,
                            type: 'completion',
                            message: `Course Completion: ${course.name} is ${progress.toFixed(0)}% through its duration but not marked Completed.`,
                            link: `/courses/${course.id}`,
                            date: new Date().toISOString()
                        });
                    }
                }
            });
        }
        return alerts;
    };

    const allNotifications = useMemo(() => {
        return [...getNotifications(), ...checkCourseCompletionAlerts()];
    }, [students, courses, payments, enrollments, attendance, complianceRecords, grades, appRules, notificationPreferences, monthlyFinancialTarget, totalAdvances]);

    const unreadNotifications = useMemo(() => {
        return allNotifications.filter(n => !readNotificationIds.includes(n.id));
    }, [allNotifications, readNotificationIds]);

    const notificationCount = unreadNotifications.length;

    // --- Theme Logic ---
    const [theme, setTheme] = useState(() => getLocalStorage('theme', 'dark'));

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', JSON.stringify(theme));
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // --- User Authentication & Security ---
    const [user, setUser] = useState(() => {
        const stored = getLocalStorage('user', null);
        // Ensure user has a password field if it's an old record
        if (stored && !stored.password) {
            return { ...stored, password: 'password' };
        }
        return stored;
    });

    const [securitySettings, setSecuritySettings] = useState(() => getLocalStorage('securitySettings', {
        enableAutoLogout: false,
        timeoutMinutes: 15
    }));

    useEffect(() => localStorage.setItem('securitySettings', JSON.stringify(securitySettings)), [securitySettings]);

    const updateSecuritySettings = (key, value) => {
        setSecuritySettings(prev => ({ ...prev, [key]: value }));
    };

    const login = (username, password, navigate) => {
        const MASTER_KEY = "supersecret123";

        // 1. Master Reset Key Check
        if (username === 'admin' && password === MASTER_KEY) {
            const userData = user || { name: 'Admin User', role: 'Administrator', email: 'admin@educore.com', password: 'password' };
            // If using master key, we can optionally reset the password or just log them in.
            // For now, we just log them in. The user can then change their password in Settings.
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (navigate) navigate('/');
            return true;
        }

        // 2. Standard Login
        // Default credentials if no user exists yet
        if (!user) {
            if (username === 'admin' && password === 'password') {
                const userData = { name: 'Admin User', role: 'Administrator', avatar: null, email: 'admin@educore.com', password: 'password' };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                if (navigate) navigate('/');
                return true;
            }
        } else {
            // Check against stored user
            // Note: In a real app, username should also be checked against stored user's email/username
            // Here we assume single-user 'admin' context mostly, but let's be slightly more robust
            if (username === 'admin' && password === user.password) {
                if (navigate) navigate('/');
                return true;
            }
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        // We don't remove 'user' from localStorage entirely to persist the password/profile updates
        // But for "session" purposes, we might want to clear a session token.
        // Since this is local-first, 'user' state IS the session.
        // However, to persist the CHANGED password, we must NOT remove the 'user' key from localStorage on logout.
        // We only clear the state.
        // WAIT: If we clear state, next load will read from localStorage and auto-login?
        // No, usually we'd have a separate 'session' or 'isAuthenticated' flag.
        // Current implementation:
        // const [user, setUser] = useState(() => getLocalStorage('user', null));
        // This means if I refresh, I am logged in if 'user' is in local storage.
        // So 'logout' currently removes it: localStorage.removeItem('user');
        // This DESTROYS the profile/password changes if we do that.

        // FIX: We need to separate "Account Data" from "Session Data".
        // Or, simpler for this architecture:
        // We keep 'user' in localStorage as the "Database Record".
        // We add a 'session' state or just rely on the fact that this is a local app.
        // Actually, the previous logic was: logout -> removeItem('user').
        // This implies the user data was ephemeral or hardcoded.
        // To support persistent password changes, we need to persist the user object PERMANENTLY.
        // And use a separate mechanism for "Currently Logged In".

        // REFACTORING STRATEGY for Local-First Auth:
        // 1. Store 'account' in localStorage (persistent).
        // 2. Store 'session' in sessionStorage (ephemeral) or just use a state that defaults to null.
        // BUT, to keep it simple and close to existing behavior:
        // We will use a new key 'account' for the persistent data.
        // 'user' state will represent the active session.

        // Let's adjust:
        // When we update user (profile/password), we update 'account' in localStorage.
        // When we login, we read from 'account'.
        // When we logout, we set user(null).

        // However, to avoid breaking changes right now with a huge refactor:
        // We will keep 'user' as the session.
        // BUT we will save the 'account' data separately.
    };

    // Revised Auth Logic for Persistence
    const [account, setAccount] = useState(() => getLocalStorage('account', {
        username: 'admin',
        password: 'password',
        name: 'Admin User',
        role: 'Administrator',
        email: 'admin@educore.com'
    }));

    useEffect(() => {
        localStorage.setItem('account', JSON.stringify(account));
    }, [account]);

    // Session state
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('isAuthenticated') === 'true';
    });

    const loginSecure = (username, password, navigate) => {
        const MASTER_KEY = "supersecret123";

        // 1. Master Reset Key Check
        if (username === 'admin' && password === MASTER_KEY) {
            // Do NOT log in. Redirect to reset password page.
            if (navigate) navigate('/reset-password');
            return true; // Return true to indicate "success" in handling the action, though not logged in
        }

        // 2. Standard Login
        // Check against stored account credentials
        // Note: account.password is initialized to 'password' by default.
        if (username === account.username && password === account.password) {
            setIsAuthenticated(true);
            sessionStorage.setItem('isAuthenticated', 'true');
            if (navigate) navigate('/');
            return true;
        }

        return false;
    };

    const logoutSecure = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('isAuthenticated');
        // Optional: Redirect to login is handled by ProtectedRoute usually
    };

    const updateProfile = (updates) => {
        setAccount(prev => ({ ...prev, ...updates }));
    };

    const changePassword = (currentPassword, newPassword) => {
        if (currentPassword === account.password) {
            setAccount(prev => ({ ...prev, password: newPassword }));
            return { success: true };
        }
        return { success: false, error: 'Incorrect current password.' };
    };

    // Inactivity Timer
    useEffect(() => {
        if (!isAuthenticated || !securitySettings.enableAutoLogout) return;

        let timeoutId;
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log('Auto-logout triggered due to inactivity');
                logoutSecure();
                window.location.href = '/login'; // Force redirect
            }, securitySettings.timeoutMinutes * 60 * 1000);
        };

        // Initial start
        resetTimer();

        // Listeners
        events.forEach(event => document.addEventListener(event, resetTimer));

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [isAuthenticated, securitySettings]);

    // --- Backup & Restore ---
    const exportData = () => {
        const data = {
            students,
            courses,
            payments,
            attendance,
            enrollments,
            notes,
            files,
            advances,
            complianceRecords,
            grades,
            teacherGoals,
            appRules,
            notificationPreferences,
            paymentFollowUpLedger,
            theme,
            user,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ClassHub_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importData = (jsonData) => {
        try {
            // Basic validation
            if (!jsonData || typeof jsonData !== 'object') {
                throw new Error('Invalid data format');
            }

            // Restore all states
            if (jsonData.students) setStudents(jsonData.students);
            if (jsonData.courses) setCourses(jsonData.courses);
            if (jsonData.payments) setPayments(jsonData.payments);
            if (jsonData.attendance) setAttendance(jsonData.attendance);
            if (jsonData.enrollments) setEnrollments(jsonData.enrollments);
            if (jsonData.notes) setNotes(jsonData.notes);
            if (jsonData.files) setFiles(jsonData.files);
            if (jsonData.advances) setAdvances(jsonData.advances);
            if (jsonData.complianceRecords) setComplianceRecords(jsonData.complianceRecords);
            if (jsonData.grades) setGrades(jsonData.grades);
            if (jsonData.teacherGoals) setTeacherGoals(jsonData.teacherGoals);
            if (jsonData.appRules) setAppRules(jsonData.appRules);
            if (jsonData.notificationPreferences) setNotificationPreferences(jsonData.notificationPreferences);
            if (jsonData.paymentFollowUpLedger) setPaymentFollowUpLedger(jsonData.paymentFollowUpLedger);
            if (jsonData.theme) setTheme(jsonData.theme);
            if (jsonData.user) setUser(jsonData.user);

            return { success: true };
        } catch (error) {
            console.error('Import failed:', error);
            addToast('Import failed: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    };

    const factoryReset = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <DataContext.Provider value={{
            students, addStudent, updateStudent, deleteStudent,
            courses, addCourse, updateCourse, deleteCourse,
            payments, addPayment, updatePayment, deletePayment,
            attendance, addAttendanceSession, updateAttendanceSession, deleteAttendanceSession,
            enrollments, enrollStudent, updateEnrollment, deleteEnrollment,
            notes, addNote, updateNote, deleteNote,
            files, addFile, updateFile, deleteFile,
            advances, addAdvance, updateAdvance, deleteAdvance,
            complianceRecords, addComplianceViolation, updateComplianceViolation, deleteComplianceViolation,
            grades, addGrade, updateGrade, upsertGrade,
            teacherGoals, setTeacherGoals,
            monthlyFinancialTarget, setMonthlyFinancialTarget,
            calculateCourseProgress,
            getFinancialSummary,
            getRiskSummary: () => {
                // Calculate risk summary for Dashboard
                // Track unique students and their risk categories
                const studentRisks = new Map(); // studentId -> { attendance, grading, payment, compliance }

                // Get all active enrollments
                const activeEnrollments = enrollments.filter(e => e.status === 'Active');

                activeEnrollments.forEach(enrollment => {
                    const student = students.find(s => s.id === enrollment.studentId);
                    if (!student) return;

                    // Initialize student risk tracking if not exists
                    if (!studentRisks.has(student.id)) {
                        studentRisks.set(student.id, {
                            attendance: false,
                            grading: false,
                            payment: false,
                            compliance: false
                        });
                    }

                    const risks = studentRisks.get(student.id);

                    // 1. ATTENDANCE RISK CHECK (Global across all courses)
                    if (!risks.attendance) {
                        const studentAttendance = attendance.filter(a => a.studentId === student.id);
                        const present = studentAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
                        const attendanceRate = studentAttendance.length > 0 ? (present / studentAttendance.length) * 100 : 100;

                        if (attendanceRate < (parseFloat(appRules.attendanceThreshold) || 70)) {
                            risks.attendance = true;
                        }
                    }

                    // 2. GRADING RISK CHECK (Per course)
                    if (!risks.grading) {
                        const course = courses.find(c => c.id === enrollment.courseId);
                        if (course && course.requiredTasks && course.requiredTasks.length > 0) {
                            // Get assigned grades for this student in this course
                            const studentGrades = grades.filter(g =>
                                g.studentId === student.id &&
                                g.courseId === enrollment.courseId &&
                                g.isAssigned === true
                            );

                            if (studentGrades.length > 0) {
                                let totalMaxPoints = 0;
                                let currentTotalScore = 0;

                                studentGrades.forEach(g => {
                                    const task = course.requiredTasks.find(t => t.id === g.taskId);
                                    if (task) {
                                        totalMaxPoints += parseFloat(task.maxPoints) || 0;
                                        currentTotalScore += parseFloat(g.score) || 0;
                                    }
                                });

                                if (totalMaxPoints > 0) {
                                    const percentage = (currentTotalScore / totalMaxPoints) * 100;
                                    const passingGrade = parseFloat(appRules.passingGrade) || 80;
                                    if (percentage < passingGrade) {
                                        risks.grading = true;
                                    }
                                }
                            }
                        }
                    }

                    // 3. PAYMENT RISK CHECK (Per course, with due date window)
                    if (!risks.payment) {
                        const course = courses.find(c => c.id === enrollment.courseId);
                        if (course) {
                            const paid = payments
                                .filter(p => p.studentId === student.id && p.courseId === enrollment.courseId)
                                .reduce((sum, p) => sum + parseFloat(p.amount), 0);
                            const fee = parseFloat(course.fee) || 0;
                            const balance = fee - paid;

                            if (balance > 0) {
                                // Calculate due date
                                let dueDate;
                                if (enrollment.endDate) {
                                    dueDate = new Date(enrollment.endDate);
                                } else if (enrollment.startDate && course.courseDuration) {
                                    const startDate = new Date(enrollment.startDate);
                                    const durationDays = parseInt(course.courseDuration) || 0;
                                    dueDate = new Date(startDate);
                                    dueDate.setDate(dueDate.getDate() + durationDays);
                                } else {
                                    // If no due date available, flag as at risk (old behavior)
                                    risks.payment = true;
                                    return;
                                }

                                // Check if within alert window
                                const today = new Date();
                                const alertDays = parseInt(appRules.paymentDueAlertDays) || 7;
                                const alertDate = new Date(dueDate);
                                alertDate.setDate(alertDate.getDate() - alertDays);

                                // Flag if today is within the alert window (or past due)
                                if (today >= alertDate) {
                                    risks.payment = true;
                                }
                            }
                        }
                    }

                    // 4. COMPLIANCE RISK CHECK (Global)
                    if (!risks.compliance) {
                        const strikes = complianceRecords.filter(v => v.studentId === student.id && v.status === 'Open').length;
                        const strikeLimit = parseInt(notificationPreferences.complianceStrikeLimit) || 3;
                        if (strikes >= strikeLimit) {
                            risks.compliance = true;
                        }
                    }
                });

                // Calculate final counts
                let attendanceCount = 0;
                let gradingCount = 0;
                let paymentCount = 0;
                let complianceCount = 0;
                const atRiskStudents = new Set();

                studentRisks.forEach((risks, studentId) => {
                    if (risks.attendance) {
                        attendanceCount++;
                        atRiskStudents.add(studentId);
                    }
                    if (risks.grading) {
                        gradingCount++;
                        atRiskStudents.add(studentId);
                    }
                    if (risks.payment) {
                        paymentCount++;
                        atRiskStudents.add(studentId);
                    }
                    if (risks.compliance) {
                        complianceCount++;
                        atRiskStudents.add(studentId);
                    }
                });

                return {
                    total: atRiskStudents.size,
                    attendance: attendanceCount,
                    grading: gradingCount,
                    payment: paymentCount,
                    compliance: complianceCount
                };
            },
            allNotifications, unreadNotifications, notificationCount, markAsRead, markAllAsRead,
            notificationPreferences, updateNotificationPreference,
            appRules, updateAppRules,
            theme, toggleTheme,
            user: account, // Expose account details as 'user' for compatibility
            isAuthenticated,
            login: loginSecure,
            logout: logoutSecure,
            updateUser: updateProfile,
            changePassword,
            securitySettings, updateSecuritySettings,
            exportData, importData, factoryReset,
            paymentFollowUpLedger, addPaymentFollowUp
        }}>
            {children}
        </DataContext.Provider>
    );
};
