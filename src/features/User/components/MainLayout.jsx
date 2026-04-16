import React from 'react';
import logoImg from '../../../assets/top_icon.png';
import '../Style/MainLayout.css';

const MainLayout = ({ children, currentUser, onLogoClick, onRegisterClick, onNewOrderClick, onProfileClick }) => {
  return (
    <div className="city-car-wrapper">
      <nav className="top-navbar">
        <div className="nav-container">
          <div className="nav-right">
            <img src={logoImg} alt="City Car" className="main-logo" 
                 style={{cursor: 'pointer'}} onClick={onLogoClick} />
            <span className="user-greeting">שלום, {currentUser?.firstName || 'אורח'}</span>
          </div>
          <div className="nav-left">
            <span className="phone-info">* 2319 | 0-2319-2319</span>
            <div className="nav-buttons">
              <button className="btn-white-outline" onClick={onNewOrderClick}>הזמנה חדשה</button>
              {!currentUser && onRegisterClick && (
                <button className="btn-white-outline" onClick={onRegisterClick}>הרשמה</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <aside className="right-sidebar">
        <div className="sidebar-item" onClick={onProfileClick} style={{cursor: 'pointer'}}>
            👤 <span>אזור אישי</span>
        </div>
        <div className="sidebar-item">🚗 <span>הזמנות</span></div>
        <div className="sidebar-item">₪ <span>מחירון</span></div>
        <div className="sidebar-item">ℹ️ <span>מידע חשוב</span></div>
        <div className="sidebar-item">📞 <span>צור קשר</span></div>
      </aside>

      <div className="main-scroll-area">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;