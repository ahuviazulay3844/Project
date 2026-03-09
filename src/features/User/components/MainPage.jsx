// MainPage.jsx
import React from 'react';
import {useSelector } from 'react-redux'; // בשביל למשוך את השם אוטומטית
import '../Style/MainPage.css';
import logoImg from '../../../assets/top_icon.png';
const MainPage = () => {
const currentUser = useSelector((state) => state.user.currentUser);
  return (
    <div className="city-car-wrapper">
      {/* תפריט עליון סגול */}
      <nav className="top-navbar">
        <div className="nav-right">
          <div className="logo-box">
          <img src={logoImg} alt="City Car" className="main-logo" />  
        </div>
        <div className="user-info">
          <span className="user-name">שלום, {currentUser?.name || 'אורח'}</span>
          </div>
        </div>
        <div className="nav-left">
          <span className="phone-info">   * 2319   |   0-2319-2319  </span>
          <button className="btn-white-outline">הזמנה חדשה</button>
          <button className="btn-white-outline">הרשמה</button>
        </div>
      </nav>
      <div className="content-area">
        {/* תפריט צד ימין - סגול כהה */}
        <aside className="right-sidebar">
          <div className="menu-icon-item">👤 <span>אזור אישי</span></div>
          <div className="menu-icon-item">🚗 <span>הזמנות</span></div>
          <div className="menu-icon-item">₪ <span>מחירון</span></div>
          <div className="menu-icon-item">ℹ️ <span>מידע חשוב</span></div>
          <div className="menu-item">📞 <span>צור קשר</span></div>
        </aside>
      </div>
    </div>
  );
};

export default MainPage;