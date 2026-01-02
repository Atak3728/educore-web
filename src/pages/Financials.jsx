import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Edit2, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Financials = () => {
    useDocumentTitle('EduCore | Financials');
    const {
        advances, addAdvance, updateAdvance, deleteAdvance,
        enrollments, // Added enrollments
        teacherGoals, setTeacherGoals, getFinancialSummary, appRules,
        monthlyFinancialTarget, setMonthlyFinancialTarget // Connected to DataContext
    } = useData();

    const { totalEarnings, totalAdvances, currentBalance, teacherShare } = getFinancialSummary();

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdvance, setEditingAdvance] = useState(null);
    const [formData, setFormData] = useState({ amount: '', date: '', note: '' });

    // --- Forecasting Calculations ---
    const STUDENT_MONTHLY_VALUE = parseFloat(appRules.teacherShare) / parseFloat(appRules.courseDuration); // Dynamic Rule
    const TEACHER_SHARE_FULL = parseFloat(appRules.teacherShare);

    // 1. Active Students
    const activeStudents = enrollments.filter(e => e.status === 'Active').length;

    // 2. Monthly Cash Flow
    const currentMonthlyIncome = activeStudents * STUDENT_MONTHLY_VALUE;
    const monthlySurplusDeficit = currentMonthlyIncome - monthlyFinancialTarget;
    const activeStudentsNeeded = monthlyFinancialTarget / STUDENT_MONTHLY_VALUE;

    // 3. Total Forecasting
    const totalPotentialEarnings = activeStudents * TEACHER_SHARE_FULL;
    const projectedNetBalance = totalAdvances - totalPotentialEarnings; // Positive = Debt, Negative = Surplus
    const newStudentsNeeded = projectedNetBalance > 0 ? projectedNetBalance / TEACHER_SHARE_FULL : 0;

    const handleOpenModal = (advance = null) => {
        if (advance) {
            setEditingAdvance(advance);
            setFormData({ amount: advance.amount, date: advance.date.split('T')[0], note: advance.note });
        } else {
            setEditingAdvance(null);
            setFormData({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAdvance) {
            updateAdvance(editingAdvance.id, formData);
        } else {
            addAdvance(formData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this advance?')) {
            deleteAdvance(id);
        }
    };

    return (
        <div className="financials-page">
            <header style={{ marginBottom: '2rem' }}>
                <h2>Financials</h2>
                <p className="text-muted">Track earnings, advances, and financial goals.</p>
            </header>

            {/* Summary Cards */}
            <div className="grid-summary">
                <div className="card">
                    <h3>Earnings So Far</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>${totalEarnings.toFixed(2)}</p>
                </div>
                <div className="card">
                    <h3>Advances Received</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>${totalAdvances.toFixed(2)}</p>
                </div>
                <div className="card">
                    <h3>Current Balance</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: currentBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {currentBalance > 0 ? `Owe $${currentBalance.toFixed(2)}` : `Owed $${Math.abs(currentBalance).toFixed(2)}`}
                    </p>
                    <small style={{ color: 'var(--text-muted)' }}>
                        {currentBalance > 0 ? 'You owe the school' : 'The school owes you'}
                    </small>
                </div>
            </div>

            {/* Financial Forecasting Widget */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <TrendingUp size={24} style={{ marginRight: '0.75rem', color: 'var(--primary)' }} />
                    <h3 style={{ margin: 0 }}>Financial Forecasting</h3>
                </div>

                <div className="grid-forecasting">

                    {/* I. Monthly Cash Flow Metrics */}
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            I. Monthly Cash Flow <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(Operational Risk)</span>
                        </h4>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Monthly Financial Target/Advance ($)</label>
                            <input
                                type="number"
                                value={monthlyFinancialTarget}
                                onChange={(e) => setMonthlyFinancialTarget(parseFloat(e.target.value) || 0)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Current Monthly Income</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${currentMonthlyIncome.toFixed(2)}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({activeStudents} active × ${STUDENT_MONTHLY_VALUE.toFixed(2)})</div>
                            </div>
                            <div>
                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Monthly Surplus/Deficit</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: monthlySurplusDeficit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                    {monthlySurplusDeficit >= 0 ? '+' : ''}${monthlySurplusDeficit.toFixed(2)}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: monthlySurplusDeficit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                    {monthlySurplusDeficit >= 0 ? 'Surplus' : 'Deficit / Risk'}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem' }}>Active Students Needed:</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{Math.ceil(activeStudentsNeeded)}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>to meet monthly target</div>
                        </div>
                    </div>

                    {/* II. Total Forecasting Metrics */}
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            II. Total Forecasting <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(Long-Term Debt Payoff)</span>
                        </h4>

                        <div style={{ marginBottom: '1rem' }}>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Total Potential Earnings</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>${totalPotentialEarnings.toFixed(2)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sum of ${TEACHER_SHARE_FULL} share for all {activeStudents} active students</div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Projected Net Balance</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: projectedNetBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                ${Math.abs(projectedNetBalance).toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: projectedNetBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                {projectedNetBalance > 0 ? 'Projected Debt' : 'Projected Surplus'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Advances - Potential Earnings</div>
                        </div>

                        {projectedNetBalance > 0 && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--danger)', fontWeight: 'bold' }}>New Students Needed:</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--danger)' }}>{Math.ceil(newStudentsNeeded)}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--danger)', textAlign: 'right' }}>to clear projected debt</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Advances Ledger */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Advances Ledger</h3>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Advance
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {advances.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No advances recorded.</td>
                                </tr>
                            ) : (
                                advances.map(advance => (
                                    <tr key={advance.id}>
                                        <td>{new Date(advance.date).toLocaleDateString()}</td>
                                        <td>${parseFloat(advance.amount).toFixed(2)}</td>
                                        <td>{advance.note}</td>
                                        <td>
                                            <button className="btn" style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} onClick={() => handleOpenModal(advance)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(advance.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAdvance ? "Edit Advance" : "Add Advance"}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Note</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            rows="3"
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-dark)' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Financials;
