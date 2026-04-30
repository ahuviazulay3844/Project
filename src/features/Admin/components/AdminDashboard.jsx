import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useGetCurrentUserQuery } from '../../User/redux/userApi.jsx';
import { setUser } from '../../User/redux/userSlice.jsx';
import FleetManagement from './FleetManagement';
import UserManagement from './UserManagement';
import OrderLogs from './OrderLogs';
import '../Style/AdminDashboard.css';

const AdminDashboard = () => {
    const [view, setView] = useState('stats');
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const token = localStorage.getItem('token');

    const { data: serverUser, isLoading: isUserLoading } = useGetCurrentUserQuery(undefined, {
        skip: !token || !!currentUser,
    });

    useEffect(() => {
        if (serverUser && !currentUser) {
            dispatch(setUser(serverUser));
        }
    }, [serverUser, currentUser, dispatch]);

    if (!token && !currentUser) {
        return <Navigate to="/" replace />;
    }

    if (isUserLoading && !currentUser) {
        return <div className="admin-loading">טוען אישור מנהל...</div>;
    }

    if (currentUser && currentUser.userType !== 1 && currentUser.userType !== 'Admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="admin-wrapper">
            {/* תפריט צד (Sidebar) */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">ניהול סיטי קאר</div>
                <nav>
                    <button 
                        className={view === 'stats' ? 'active' : ''} 
                        onClick={() => setView('stats')}
                    >
                        📊 סקירה כללית
                    </button>
                    <button 
                        className={view === 'fleet' ? 'active' : ''} 
                        onClick={() => setView('fleet')}
                    >
                        🚗 ניהול צי רכבים
                    </button>
                    <button 
                        className={view === 'users' ? 'active' : ''} 
                        onClick={() => setView('users')}
                    >
                        👥 ניהול משתמשים
                    </button>
                    <button 
                        className={view === 'orders' ? 'active' : ''} 
                        onClick={() => setView('orders')}
                    >
                        📅 יומן הזמנות
                    </button>
                </nav>
            </aside>

            {/* תוכן ראשי משתנה */}
            <main className="admin-main-content">
                <header className="admin-top-bar">
                    <h2>{
                        view === 'stats' ? 'לוח בקרה' : 
                        view === 'fleet' ? 'ניהול רכבים' : 
                        view === 'users' ? 'ניהול משתמשים' : 'יומן הזמנות'
                    }</h2>
                    <div className="admin-user-info">
                        שלום, {currentUser.firstName}
                    </div>
                </header>

                <div className="view-container">
                    {view === 'stats' && <StatsOverview onSelect={(selected) => setView(selected)} />}
                    {view === 'fleet' && <FleetManagement />}
                    {view === 'users' && <UserManagement />}
                    {view === 'orders' && <OrderLogs />}
                </div>
            </main>
        </div>
    );
};

// קומפוננטה לסטטיסטיקות מהירות
const StatsOverview = ({ onSelect }) => (
    <>
        <div className="category-grid">
            <div className="category-card" onClick={() => onSelect('fleet')}>
                <h4>🚗 ניהול צי רכבים</h4>
                <p>ניהול סטטוסים, תחזוקה ונעילות מכל מקום.</p>
            </div>
            <div className="category-card" onClick={() => onSelect('orders')}>
                <h4>📅 ניהול הזמנות</h4>
                <p>סינון לפי איחורים, תשלום, סטטוס ומידע לקוח.</p>
            </div>
            <div className="category-card" onClick={() => onSelect('users')}>
                <h4>👥 ניהול משתמשים</h4>
                <p>חסימה, שחרור וחיפוש משתמשים בזמן אמת.</p>
            </div>
        </div>

        <div className="stats-grid">
            <div className="stat-card">
                <h4>רכבים פעילים</h4>
                <p>24</p>
            </div>
            <div className="stat-card yellow">
                <h4>בתיקון</h4>
                <p>3</p>
            </div>
            <div className="stat-card green">
                <h4>הזמנות להיום</h4>
                <p>15</p>
            </div>
            <div className="stat-card orange">
                <h4>משתמשים חסומים</h4>
                <p>2</p>
            </div>
        </div>
    </>
);

export default AdminDashboard;