import React, { useMemo, useState } from 'react';
import { useGetAllUsersQuery, useToggleBlockUserMutation, useDeleteUserMutation } from '../../User/redux/userApi';

const UserManagement = () => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const { data: users = [], isLoading, isError } = useGetAllUsersQuery();
    const [toggleBlock] = useToggleBlockUserMutation();
    const [deleteUser] = useDeleteUserMutation();

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const text = `${user.firstName || ''} ${user.lastName || ''} ${user.email || ''}`.toLowerCase();
            if (search && !text.includes(search.toLowerCase())) return false;
            if (typeFilter === 'admins' && user.userType !== 1 && user.userType !== 'Admin') return false;
            if (typeFilter === 'customers' && (user.userType === 1 || user.userType === 'Admin')) return false;
            return true;
        });
    }, [users, search, typeFilter]);

    const summary = useMemo(() => ({
        total: users.length,
        blocked: users.filter(user => user.isBlocked).length,
        admins: users.filter(user => user.userType === 1 || user.userType === 'Admin').length,
    }), [users]);

    if (isLoading) return <div className="admin-loading">טוען רשימת לקוחות...</div>;
    if (isError) return <div className="admin-error">שגיאה בתקשורת עם השרת</div>;

    return (
        <div className="admin-section admin-page">
            <div className="page-hero-bar">
                <div>
                    <h3>ניהול משתמשים</h3>
                    <p>סינון מהיר לפי שם, אימייל וסוג משתמש.</p>
                </div>
                <div className="page-hero-metrics">
                    <span>סה"כ משתמשים: {summary.total}</span>
                    <span>חסומים: {summary.blocked}</span>
                    <span>מנהלים: {summary.admins}</span>
                </div>
            </div>

            <div className="order-filters">
                <input
                    type="text"
                    placeholder="חפש משתמש לפי שם או אימייל"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="all">הכל</option>
                    <option value="customers">לקוחות</option>
                    <option value="admins">מנהלים</option>
                </select>
            </div>

            <table className="admin-table admin-table-purple">
                <thead>
                    <tr>
                        <th>שם המשתמש</th>
                        <th>אימייל</th>
                        <th>סוג</th>
                        <th>סטטוס</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.userType === 1 ? 'מנהל' : 'לקוח'}</td>
                            <td>
                                <span className={user.isBlocked ? 'status-blocked' : 'status-active'}>
                                    {user.isBlocked ? '🚫 חסום' : '✅ פעיל'}
                                </span>
                            </td>
                            <td>
                                <button 
                                    className="btn-action" 
                                    onClick={() => toggleBlock(user.id)}
                                >
                                    {user.isBlocked ? 'שחרר חסימה' : 'חסום משתמש'}
                                </button>
                                <button 
                                    className="btn-delete" 
                                    onClick={() => window.confirm('למחוק לצמיתות?') && deleteUser(user.id)}
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {!filteredUsers.length && (
                <div className="admin-empty-state">לא נמצאו משתמשים לפי המסננים.</div>
            )}
        </div>
    );
};

export default UserManagement;