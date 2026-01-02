import React from 'react';
import { useData } from '../context/DataContext';
import { useLocation } from 'react-router-dom';
import { Bell, AlertTriangle, DollarSign, CheckCircle, Download, Upload, Info } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { version } from '../../package.json';

const Settings = () => {
    useDocumentTitle('EduCore | Settings');
    const { notificationPreferences, updateNotificationPreference, appRules, updateAppRules, user, updateUser, exportData, importData, factoryReset, changePassword, securitySettings, updateSecuritySettings } = useData();
    const [activeTab, setActiveTab] = React.useState('core');
    const [name, setName] = React.useState(user?.name || '');
    const [pwdStatus, setPwdStatus] = React.useState({ type: '', message: '' });
    const [isRestoring, setIsRestoring] = React.useState(false);
    const location = useLocation();

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'security') {
            setActiveTab('security');
        } else if (tab === 'notifications') {
            setActiveTab('notifications');
        } else {
            setActiveTab('core');
        }
    }, [location]);

    React.useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);

    const Toggle = ({ label, description, checked, onChange, icon: Icon, color }) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            marginBottom: '1rem'
        }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: `var(--${color}-light, #f3f4f6)`,
                    color: `var(--${color})`
                }}>
                    <Icon size={24} />
                </div>
                <div>
                    <h4 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1rem' }}>{label}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{description}</p>
                </div>
            </div>
            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span className="slider round" style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: checked ? 'var(--primary)' : '#ccc',
                    transition: '.4s',
                    borderRadius: '34px'
                }}>
                    <span style={{
                        position: 'absolute',
                        content: "",
                        height: '18px',
                        width: '18px',
                        left: checked ? '26px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '.4s',
                        borderRadius: '50%'
                    }}></span>
                </span>
            </label>
        </div>
    );

    return (
        <div className="settings-page">
            <header style={{ marginBottom: '2rem' }}>
                <h2>Settings</h2>
                <p className="text-muted">Manage your application preferences and account security.</p>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('core')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'core' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'core' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Core Rules
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'notifications' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'notifications' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Notifications
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'security' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    User & Security
                </button>
            </div>

            {/* Core Rules Tab */}
            {activeTab === 'core' && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={20} /> Core Application Rules
                    </h3>
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                        Configure the base logic used for financial calculations and defaults.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Teacher Share Amount (Rule A)</label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '0.5rem 0 0 0.5rem', color: 'var(--text-muted)', flexShrink: 0 }}>$</span>
                                <input
                                    type="number"
                                    value={appRules.teacherShare}
                                    onChange={(e) => updateAppRules('teacherShare', parseFloat(e.target.value) || 0)}
                                    style={{ flex: 1, minWidth: 0, padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '0 0.5rem 0.5rem 0', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Per fully paid student</p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Default Course Duration</label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    value={appRules.courseDuration}
                                    onChange={(e) => updateAppRules('courseDuration', parseFloat(e.target.value) || 0)}
                                    style={{ flex: 1, minWidth: 0, padding: '0.6rem', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '0.5rem 0 0 0.5rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                />
                                <span style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0 0.5rem 0.5rem 0', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>Months</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Default Course Fee</label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '0.5rem 0 0 0.5rem', color: 'var(--text-muted)', flexShrink: 0 }}>$</span>
                                <input
                                    type="number"
                                    value={appRules.defaultCourseFee}
                                    onChange={(e) => updateAppRules('defaultCourseFee', parseFloat(e.target.value) || 0)}
                                    style={{ flex: 1, minWidth: 0, padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '0 0.5rem 0.5rem 0', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Required Passing Grade</label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    value={appRules.passingGrade || 80}
                                    onChange={(e) => updateAppRules('passingGrade', parseFloat(e.target.value) || 0)}
                                    style={{ flex: 1, minWidth: 0, padding: '0.6rem', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '0.5rem 0 0 0.5rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                />
                                <span style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0 0.5rem 0.5rem 0', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>%</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Default Max Points (Grading)</label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    value={appRules.defaultMaxPoints || 100}
                                    onChange={(e) => updateAppRules('defaultMaxPoints', parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '0.5rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                />
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={18} /> Risk & Alert Thresholds
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Payment Due Alert (Days)</label>
                                    <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            value={appRules.paymentDueDays || 15}
                                            onChange={(e) => updateAppRules('paymentDueDays', parseFloat(e.target.value) || 0)}
                                            style={{ flex: 1, minWidth: 0, padding: '0.6rem', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '0.5rem 0 0 0.5rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                        <span style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0 0.5rem 0.5rem 0', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>Days Before</span>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Attendance Risk Threshold</label>
                                    <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            value={appRules.attendanceThreshold || 70}
                                            onChange={(e) => updateAppRules('attendanceThreshold', parseFloat(e.target.value) || 0)}
                                            style={{ flex: 1, minWidth: 0, padding: '0.6rem', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '0.5rem 0 0 0.5rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                        <span style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0 0.5rem 0.5rem 0', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>%</span>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Course Completion Alert</label>
                                    <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            value={appRules.completionThreshold || 90}
                                            onChange={(e) => updateAppRules('completionThreshold', parseFloat(e.target.value) || 0)}
                                            style={{ flex: 1, minWidth: 0, padding: '0.6rem', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '0.5rem 0 0 0.5rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                        <span style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0 0.5rem 0.5rem 0', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>% Progress</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Application Version: v{version}</p>
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem', opacity: 0.8 }}>Developed by Ataklti</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bell size={20} /> Notification Preferences
                    </h3>

                    <Toggle
                        label="Payment Due Alerts"
                        description="Get notified when a student's payment is overdue or nearing the deadline."
                        checked={notificationPreferences.paymentDue}
                        onChange={(val) => updateNotificationPreference('paymentDue', val)}
                        icon={DollarSign}
                        color="warning"
                    />

                    <Toggle
                        label="Attendance Risk Alerts"
                        description="Get notified when a student's attendance drops below 70%."
                        checked={notificationPreferences.attendanceRisk}
                        onChange={(val) => updateNotificationPreference('attendanceRisk', val)}
                        icon={CheckCircle}
                        color="danger"
                    />

                    <Toggle
                        label="Financial Risk Alerts"
                        description="Get notified about monthly deficits or projected debts."
                        checked={notificationPreferences.financialRisk}
                        onChange={(val) => updateNotificationPreference('financialRisk', val)}
                        icon={AlertTriangle}
                        color="primary"
                    />

                    <Toggle
                        label="Data Integrity Alerts"
                        description="Get notified about missing enrollments or empty courses."
                        checked={notificationPreferences.dataIntegrity}
                        onChange={(val) => updateNotificationPreference('dataIntegrity', val)}
                        icon={AlertTriangle}
                        color="warning"
                    />

                    <Toggle
                        label="Advance Repaid Milestones"
                        description="Get notified when you clear your debt balance."
                        checked={notificationPreferences.advanceRepaid}
                        onChange={(val) => updateNotificationPreference('advanceRepaid', val)}
                        icon={CheckCircle}
                        color="success"
                    />

                    <Toggle
                        label="Student Progress Alerts"
                        description="Get notified when a student's grade drops below the passing threshold."
                        checked={notificationPreferences.studentProgressAlerts}
                        onChange={(val) => updateNotificationPreference('studentProgressAlerts', val)}
                        icon={AlertTriangle}
                        color="danger"
                    />

                    <Toggle
                        label="Course Completion Alerts"
                        description="Get notified when a course is nearing its end date and is not yet completed."
                        checked={notificationPreferences.courseCompletionAlerts}
                        onChange={(val) => updateNotificationPreference('courseCompletionAlerts', val)}
                        icon={CheckCircle}
                        color="warning"
                    />

                    {/* Compliance Strike Limit */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.5rem',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'var(--danger-light, #fee2e2)',
                                color: 'var(--danger)'
                            }}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1rem' }}>Compliance Strike Limit</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                    Number of violations before triggering a high-risk alert.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="number"
                                min="1"
                                value={notificationPreferences.complianceStrikeLimit || 3}
                                onChange={(e) => updateNotificationPreference('complianceStrikeLimit', Math.max(1, parseInt(e.target.value) || 3))}
                                style={{
                                    width: '80px',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-main)',
                                    color: 'var(--text-main)',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div>
                    {/* Profile Details */}
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Profile Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-muted)' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    id="profile-name-input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-muted)' }}>Role</label>
                                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                    {user?.role || 'Viewer'}
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-muted)' }}>Email Address</label>
                                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                    {user?.email || 'admin@educore.com'}
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (name.trim()) {
                                            updateUser({ name: name });
                                            alert('Profile updated successfully!');
                                        }
                                    }}
                                >
                                    Update Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Change Password</h3>

                        {pwdStatus.message && (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                backgroundColor: pwdStatus.type === 'success' ? 'var(--success-light, #dcfce7)' : 'var(--danger-light, #fee2e2)',
                                color: pwdStatus.type === 'success' ? 'var(--success)' : 'var(--danger)',
                                border: `1px solid ${pwdStatus.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}>
                                {pwdStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                {pwdStatus.message}
                            </div>
                        )}

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setPwdStatus({ type: '', message: '' });
                            const current = e.target.current.value;
                            const newPwd = e.target.newPwd.value;
                            const confirm = e.target.confirm.value;

                            if (newPwd !== confirm) {
                                setPwdStatus({ type: 'error', message: 'New passwords do not match.' });
                                return;
                            }

                            if (newPwd.length < 4) {
                                setPwdStatus({ type: 'error', message: 'Password must be at least 4 characters.' });
                                return;
                            }

                            const result = changePassword(current, newPwd);
                            if (result.success) {
                                setPwdStatus({ type: 'success', message: 'Password successfully updated!' });
                                e.target.reset();
                                setTimeout(() => setPwdStatus({ type: '', message: '' }), 3000);
                            } else {
                                setPwdStatus({ type: 'error', message: result.error });
                            }
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Current Password</label>
                                <input name="current" type="password" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} placeholder="Enter current password" required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New Password</label>
                                <input name="newPwd" type="password" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} placeholder="Enter new password" required />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Confirm New Password</label>
                                <input name="confirm" type="password" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} placeholder="Confirm new password" required />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary">Update Password</button>
                            </div>
                        </form>
                    </div>

                    {/* Session Security */}
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Session Security</h3>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.5rem',
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'var(--primary-light, #e0f2fe)',
                                    color: 'var(--primary)'
                                }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1rem' }}>Enable Auto-Logout Timer</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                        Automatically log out after a period of inactivity.
                                    </p>
                                </div>
                            </div>
                            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                <input
                                    type="checkbox"
                                    checked={securitySettings.enableAutoLogout}
                                    onChange={(e) => updateSecuritySettings('enableAutoLogout', e.target.checked)}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span className="slider round" style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: securitySettings.enableAutoLogout ? 'var(--primary)' : '#ccc',
                                    transition: '.4s',
                                    borderRadius: '34px'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        content: "",
                                        height: '18px',
                                        width: '18px',
                                        left: securitySettings.enableAutoLogout ? '26px' : '4px',
                                        bottom: '4px',
                                        backgroundColor: 'white',
                                        transition: '.4s',
                                        borderRadius: '50%'
                                    }}></span>
                                </span>
                            </label>
                        </div>

                        {securitySettings.enableAutoLogout && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.5rem',
                                backgroundColor: 'var(--bg-card)',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)'
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1rem' }}>Timeout Duration</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                        Minutes of inactivity before logout.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        min="1"
                                        value={securitySettings.timeoutMinutes}
                                        onChange={(e) => updateSecuritySettings('timeoutMinutes', Math.max(1, parseInt(e.target.value) || 15))}
                                        style={{
                                            width: '80px',
                                            padding: '0.5rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid var(--border)',
                                            backgroundColor: 'var(--bg-main)',
                                            color: 'var(--text-main)',
                                            textAlign: 'center'
                                        }}
                                    />
                                    <span style={{ color: 'var(--text-muted)' }}>minutes</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Data Management */}
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Data Management</h3>
                        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                            Backup your entire application data or restore from a previous backup.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{
                                padding: '1.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                backgroundColor: 'var(--bg-main)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <Download size={20} className="text-primary" />
                                    <h4 style={{ margin: 0 }}>Export Data</h4>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Download a JSON file containing all students, courses, payments, and settings.
                                </p>
                                <button
                                    className="btn btn-outline"
                                    onClick={exportData}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Download size={16} /> Export All Data
                                </button>
                            </div>

                            <div style={{
                                padding: '1.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                backgroundColor: 'var(--bg-main)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <Upload size={20} className="text-danger" />
                                    <h4 style={{ margin: 0 }}>Import Data</h4>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Restore data from a backup file. <strong style={{ color: 'var(--danger)' }}>Warning: This will overwrite all current data.</strong>
                                </p>
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={() => document.getElementById('restore-file-input').click()}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                    disabled={isRestoring}
                                >
                                    {isRestoring ? 'Restoring...' : <><Upload size={16} /> Import Data (Restore)</>}
                                </button>
                                <input
                                    type="file"
                                    id="restore-file-input"
                                    accept=".json"
                                    style={{ display: 'none' }}
                                    disabled={isRestoring}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (window.confirm('CRITICAL WARNING: Restoring data will permanently replace ALL current application data. Are you sure you want to proceed?')) {
                                                setIsRestoring(true);
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    try {
                                                        const json = JSON.parse(event.target.result);
                                                        setTimeout(() => {
                                                            const result = importData(json);
                                                            if (result.success) {
                                                                alert('Data restored successfully!');
                                                                window.location.reload();
                                                            } else {
                                                                alert('Failed to restore data: ' + result.error);
                                                                setIsRestoring(false);
                                                            }
                                                        }, 1000);
                                                    } catch (err) {
                                                        alert('Invalid JSON file.');
                                                        setIsRestoring(false);
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                            e.target.value = null;
                                        }
                                    }}
                                />
                            </div>

                            {/* Factory Reset */}
                            <div style={{
                                padding: '1.5rem',
                                border: '2px solid var(--danger)',
                                borderRadius: '0.5rem',
                                backgroundColor: 'var(--bg-main)',
                                gridColumn: '1 / -1'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
                                    <h4 style={{ margin: 0, color: 'var(--danger)' }}>Factory Reset</h4>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    <strong style={{ color: 'var(--danger)' }}>DANGER ZONE:</strong> This will permanently delete ALL data including students, courses, payments, and settings. This action cannot be undone!
                                </p>
                                <button
                                    className="btn"
                                    onClick={() => {
                                        if (window.confirm('⚠️ FINAL WARNING: You are about to PERMANENTLY DELETE ALL DATA.\n\nThis includes:\n• All students\n• All courses\n• All payments\n• All settings\n\nThis action CANNOT be undone. Continue?')) {
                                            factoryReset();
                                        }
                                    }}
                                    style={{ width: '100%', backgroundColor: 'var(--danger)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <AlertTriangle size={16} /> Factory Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
