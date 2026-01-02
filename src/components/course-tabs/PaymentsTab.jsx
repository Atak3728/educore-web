import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, DollarSign, Trash2 } from 'lucide-react';
import Modal from '../Modal';

const PaymentsTab = ({ courseId }) => {
    const { payments, students, addPayment, deletePayment, courses, enrollments } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPayment, setNewPayment] = useState({ studentId: '', amount: '', date: new Date().toISOString().split('T')[0], method: 'Cash' });

    const course = courses.find(c => c.id === courseId);
    const coursePayments = payments.filter(p => p.courseId === courseId);

    // Active students for dropdown
    const activeEnrollments = enrollments.filter(e => e.courseId === courseId && e.status === 'Active');
    const activeStudents = activeEnrollments.map(e => students.find(s => s.id === e.studentId)).filter(Boolean);

    const handleSubmit = (e) => {
        e.preventDefault();
        addPayment({ ...newPayment, courseId });
        setIsModalOpen(false);
        setNewPayment({ studentId: '', amount: '', date: new Date().toISOString().split('T')[0], method: 'Cash' });
    };

    // Summary
    const totalCollected = coursePayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalExpected = activeEnrollments.length * (parseFloat(course?.fee) || 0);
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center', minWidth: '150px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>${totalCollected.toFixed(2)}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Collected</div>
                    </div>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center', minWidth: '150px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{collectionRate}%</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Collection Rate</div>
                    </div>
                </div>

                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Record Payment
                </button>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Payment History</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coursePayments.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments recorded.</td></tr>
                            ) : (
                                coursePayments.map(payment => {
                                    const student = students.find(s => s.id === payment.studentId);
                                    return (
                                        <tr key={payment.id}>
                                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                                            <td>{student ? student.name : 'Unknown Student'}</td>
                                            <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>${parseFloat(payment.amount).toFixed(2)}</td>
                                            <td>{payment.method}</td>
                                            <td>
                                                <button onClick={() => deletePayment(payment.id)} className="btn" style={{ color: 'var(--danger)', padding: '0.25rem' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Student</label>
                        <select required value={newPayment.studentId} onChange={e => setNewPayment({ ...newPayment, studentId: e.target.value })}>
                            <option value="">Select Student...</option>
                            {activeStudents.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount ($)</label>
                            <input type="number" required value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                            <input type="date" required value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Payment Method</label>
                        <select value={newPayment.method} onChange={e => setNewPayment({ ...newPayment, method: e.target.value })}>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Check">Check</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Payment</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PaymentsTab;
