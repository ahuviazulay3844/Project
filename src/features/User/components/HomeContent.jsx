import React, { useEffect } from 'react';
import darkCarImg from '../../../assets/background_dark_car.jpg'; 
import carFeatureImg from '../../../assets/dacia.webp';
import CarGallery from '../../Car/components/CarGallery.jsx';
import '../Style/HomeContent.css';
const HomeContent = ({ isLoading, isError, cars }) => {
  
  useEffect(() => {
    // האפקט הזה ירוץ רק כשדף הבית מוצג
    const wrapper = document.querySelector(".city-car-wrapper");
    if (!wrapper) return;

    const handleScroll = () => {
      const scroll = wrapper.scrollTop;
      const darkness = Math.min(scroll / 100, 0.8);
      const showNext = Math.min(scroll / 300, 1);
      
      const contentArea = document.querySelector(".content-area");
      if (contentArea) contentArea.style.setProperty('--darkness', darkness);
      
      const darkOverlay = document.querySelector(".dark-background-replacement");
      if (darkOverlay) darkOverlay.style.opacity = showNext;
    };

    wrapper.addEventListener('scroll', handleScroll);
    return () => wrapper.removeEventListener('scroll', handleScroll);
  }, []); // רץ פעם אחת בטעינה של דף הבית

  return (
    <>
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
                <p>מגוון רכבים פרוסים לך בכל האזורים בעיר.</p>
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
                <p>מגוון רכבים מקטן ועד גדול.</p>
              </div>
            </div>
            <div className="feature-row">
              <div className="feature-icon-box">⭐</div>
              <div className="feature-info">                
                <h4>בגלל הניסיון</h4>
                <p>ניסיון של למעלה מ-10 שנים.</p>
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
    </>
  );
};

export default HomeContent;