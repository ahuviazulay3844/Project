import React, { useState } from 'react';
import logoImg from '../../../assets/top_icon.png';
import '../Style/MainLayout.css';
import UserOrders from '../../Order/components/UserOrders.jsx'; 
import PriceList from '../../Car/components/PriceList.jsx'; 

const MainLayout = ({ children, currentUser, onLogoClick, onRegisterClick, onNewOrderClick, onProfileClick }) => {
  // ניהול המצב: 'map' (ברירת מחדל), 'orders', או 'pricing'
  const [activeView, setActiveView] = useState('map');

  const handleLogoClick = () => {
    setActiveView('map');
    if (onLogoClick) onLogoClick();
  };

  const handleNewOrder = () => {
    setActiveView('map');
    if (onNewOrderClick) onNewOrderClick();
  };

  return (
    <div className="city-car-wrapper">
      <nav className="top-navbar">
        <div className="nav-container">
          <div className="nav-right">
            <img 
              src={logoImg} 
              alt="City Car" 
              className="main-logo" 
              style={{ cursor: 'pointer' }} 
              onClick={handleLogoClick} 
            />
            <span className="user-greeting">שלום, {currentUser?.firstName || 'אורח'}</span>
          </div>
          <div className="nav-left">
            <span className="phone-info">* 2319 | 0-2319-2319</span>
            <div className="nav-buttons">
              <button className="btn-white-outline" onClick={handleNewOrder}>הזמנה חדשה</button>
              {!currentUser && onRegisterClick && (
                <button className="btn-white-outline" onClick={onRegisterClick}>הרשמה</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <aside className="right-sidebar">
        <div className="sidebar-item" onClick={onProfileClick}>👤 <span>אזור אישי</span></div>
        
        <div 
          className={`sidebar-item ${activeView === 'orders' ? 'active' : ''}`} 
          onClick={() => setActiveView('orders')}
        >
          🚗 <span>הזמנות</span>
        </div>

        {/* קישור למחירון */}
        <div 
          className={`sidebar-item ${activeView === 'pricing' ? 'active' : ''}`} 
          onClick={() => setActiveView('pricing')}
        >
          ₪ <span>מחירון</span>
        </div>

        <div className="sidebar-item">ℹ️ <span>מידע חשוב</span></div>
        <div className="sidebar-item">📞 <span>צור קשר</span></div>
      </aside>

      <div className="main-scroll-area">
        {activeView === 'orders' ? (
          <UserOrders userId={currentUser?.id || currentUser?.Id} />
        ) : activeView === 'pricing' ? (
          <PriceList /> /* הצגת המחירון */
        ) : (
          children /* הצגת המפה / תוכן ראשי */
        )}
      </div>
    </div>
  );
};

export default MainLayout;