import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import FleetManagement from './FleetManagement'; 
import UserManagement from './UserManagement'; // קומפוננטה חדשה לניהול משתמשים
import '../Style/AdminDashboard.css';

const AdminDashboard = () => {
    const [view, setView] = useState('stats');
    const { currentUser } = useSelector((state) => state.user);

    // חסימת גישה למי שאינו מנהל
    if (!currentUser || (currentUser.userType !== 1 && currentUser.userType !== 'Admin')) {
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
                    {view === 'stats' && <StatsOverview />}
                    {view === 'fleet' && <FleetManagement />}
                    {view === 'users' && <UserManagement />}
                    {view === 'orders' && <OrderLogs />}
                </div>
            </main>
        </div>
    );
};

// קומפוננטה לסטטיסטיקות מהירות
const StatsOverview = () => (
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
    </div>
);

// קומפוננטה ללוגים של הזמנות
const OrderLogs = () => (
    <div className="admin-section">
        <h3>יומן הזמנות כללי</h3>
        <p>כאן תוצג רשימת כל ההזמנות במערכת (מצריך חיבור ל-OrderApi).</p>
    </div>
);

export default AdminDashboard;