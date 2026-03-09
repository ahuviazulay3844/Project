import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import '../Style/MainPage.css';
import logoImg from '../../../assets/top_icon.png';
import darkCarImg from '../../../assets/background_dark_car.jpg'; 
const MainPage = () => {
const currentUser = useSelector((state) => state.user.currentUser);
  useEffect(() => {
    const wrapper = document.querySelector(".city-car-wrapper");
    const handleScroll = () => {
      if (!wrapper) return;
      const scroll = wrapper.scrollTop;
      const darkness = Math.min(scroll / 400, 0.8); 
      const showNext = scroll > 200 ? Math.min((scroll - 200) / 300, 1) : 0;
      const contentArea = document.querySelector(".content-area");
      if (contentArea) {
        contentArea.style.setProperty('--darkness', darkness);
        contentArea.style.setProperty('--show-next', showNext);
      }
    };
    wrapper.addEventListener('scroll', handleScroll);
    return () => wrapper.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className="city-car-wrapper">
      <nav className="top-navbar">
        <div className="nav-container">
          <div className="nav-right">
            <img src={logoImg} alt="City Car" className="main-logo" />
            <span className="user-greeting">שלום, {currentUser?.name || 'אורח'}</span>
          </div>
          <div className="nav-left">
            <span className="phone-info">* 2319 | 0-2319-2319</span>
            <div className="nav-buttons">
              <button className="btn-white-outline">הזמנה חדשה</button>
              <button className="btn-white-outline">הרשמה</button>
            </div>
          </div>
        </div>
      </nav>
      <div className="content-area">
        <div className="dark-background-replacement" style={{ 
          backgroundImage: `url(${darkCarImg})`,
          opacity: 'var(--show-next, 0)'
        }}>
        <div className="info-card-text">
          <h3>כבר אלפי לקוחות בחרו בסיטי קאר</h3>
          <p>סיטי קאר חברת הרכב השיתופי הגדולה והמתקדמת בישראל</p>
        </div>
        </div>
        <aside className="right-sidebar">
          <div className="sidebar-item">👤 <span>אזור אישי</span></div>
          <div className="sidebar-item">🚗 <span>הזמנות</span></div>
          <div className="sidebar-item">₪ <span>מחירון</span></div>
          <div className="sidebar-item">ℹ️ <span>מידע חשוב</span></div>
          <div className="sidebar-item">📞 <span>צור קשר</span></div>
        </aside>
      </div>
      <div className="scroll-fake-path"></div>
      <section className="next-section">
          <h2>למה דווקא סיטי קאר?</h2>
          {/* כאן יבוא התוכן הנוסף */}
      </section>
    </div>
  );
};
export default MainPage;