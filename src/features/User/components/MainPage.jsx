import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import '../Style/MainPage.css';
import logoImg from '../../../assets/top_icon.png';
import darkCarImg from '../../../assets/background_dark_car.jpg'; 
import carFeatureImg from '../../../assets/dacia.webp';
import CarGallery from '../../Car/components/CarGallery.jsx';
import { useGetAllCarsQuery } from '../../Car/redux/carApi.jsx'; // ייבוא השליח של הרכבים
const MainPage = () => {
const { isLoading, isError } = useGetAllCarsQuery();
const currentUser = useSelector((state) => state.user.currentUser);
const cars = useSelector((state) => state.car.carsList);
useEffect(() => {
  const wrapper = document.querySelector(".city-car-wrapper");
  const handleScroll = () => {
    if (!wrapper) return;
    const scroll = wrapper.scrollTop;
    const darkness = Math.min(scroll / 250, 0.8); // החשכה הדרגתית 
    const showNext = Math.min(scroll / 300, 1);   // הופעת התמונה הבאה
    const contentArea = document.querySelector(".content-area");
    if (contentArea) {
      contentArea.style.setProperty('--darkness', darkness);
    }
    const darkOverlay = document.querySelector(".dark-background-replacement");
    if (darkOverlay) {
      darkOverlay.style.opacity = showNext;
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
          opacity: 0
        }}>
          <div className="info-card-text">
            <h3>כבר אלפי לקוחות בחרו בסיטי קאר</h3>
            <p>סיטי קאר חברת הרכב השיתופי הגדולה והמתקדמת בישראל</p>
          </div>
        </div>    
      </div>
       <aside className="right-sidebar">
          <div className="sidebar-item">👤 <span>אזור אישי</span></div>
          <div className="sidebar-item">🚗 <span>הזמנות</span></div>
          <div className="sidebar-item">₪ <span>מחירון</span></div>
          <div className="sidebar-item">ℹ️ <span>מידע חשוב</span></div>
          <div className="sidebar-item">📞 <span>צור קשר</span></div>
        </aside>

      <section className="next-section">
        <div className="features-wrapper">         
          <div className="features-text-side">        
            <h2 className="features-title">למה דווקא סיטי קאר?</h2>     
            <div className="feature-row">
              <div className="feature-icon-box">📅</div>
              <div className="feature-info">
                <h4>בגלל הגמישות</h4>
                <p>מגוון מסלולים גמישים המאפשרים לשלם רק על מה שצריך.</p>
              </div>
            </div>
            <div className="feature-row">
              <div className="feature-icon-box">📍</div>
              <div className="feature-info">
                <h4>בגלל הנגישות</h4>
                <p>מגוון רכבים פרוסים לך בכל האזורים בעיר ומאפשרים לך לקחת מיידית את הרכב שאתה זקוק לו.</p>
              </div>
            </div>
            <div className="feature-row">
               <div className="feature-icon-box">⚡</div>
              <div className="feature-info">
                <h4>בגלל המהירות</h4>
                <p>אפליקציה מהירה וידידותית, נפתחת בכל החסימות.</p>
              </div>            
            </div>
            <div className="feature-row">
              <div className="feature-icon-box">🚗</div>
              <div className="feature-info">               
                <h4>בגלל המגוון</h4>
                <p>מגוון רכבים מקטן ועד גדול - כל סוגי וגדלי הרכבים.</p>
              </div>
            </div>
            <div className="feature-row">
              <div className="feature-icon-box">⭐</div>
              <div className="feature-info">                
                <h4>בגלל הניסיון</h4>
                <p>ניסיון של למעלה מ-10 שנים שמאפשר לנו לתת לכם את המיטב.</p>
              </div>  
            </div>
          </div>
          <div className="features-image-side">
            <img src={carFeatureImg} alt="City Car Side" className="side-car-img" />
          </div>
        </div>
      </section>
      <section className="gallery-section">
        {isLoading ? (
          <div className="loading-state">טוען רכבים...</div>
        ) : isError ? (
          <div className="error-state">לא ניתן לטעון רכבים כרגע</div>
        ) : (
          <CarGallery cars={cars} />
        )}
      </section>
    </div>
  );
};

export default MainPage;