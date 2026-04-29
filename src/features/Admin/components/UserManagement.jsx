import React from 'react';
import { useGetAllUsersQuery, useToggleBlockUserMutation, useDeleteUserMutation } from '../../User/redux/userApi';

const UserManagement = () => {
    const { data: users = [], isLoading, isError } = useGetAllUsersQuery();
    const [toggleBlock] = useToggleBlockUserMutation();
    const [deleteUser] = useDeleteUserMutation();

    if (isLoading) return <div className="loader">טוען רשימת לקוחות...</div>;
    if (isError) return <div className="error">שגיאה בתקשורת עם השרת</div>;

    return (
        <div className="admin-section">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>שם המשתמש</th>
                        <th>אימייל</th>
                        <th>סוג</th>
                        <th>סטטוס</th>
                        <th>פעולות ניהול</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
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
        </div>
    );
};

export default UserManagement;