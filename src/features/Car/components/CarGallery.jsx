import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
// הסרנו את ה-useNavigate כי אנחנו נשארים בתוך ה-MainPage
import 'swiper/css';
import 'swiper/css/navigation';
import '../Style/CarGallery.css';

const CarGallery = ({ cars, onViewPrices }) => {
  // בדיקה למניעת קריסה אם הנתונים עדיין לא הגיעו
  if (!cars || cars.length === 0) return null; 

  return (
    <div className="cars-container">
      <div className="gallery-header">
        <h2 className="gallery-title">איזה רכב אתה אוהב?</h2>
        <p className="gallery-subtitle">מבחר רכבים במגוון מחירים! צי הרכבים שלנו לרשותך</p>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={true}
        spaceBetween={30}
        slidesPerView={3}
        loop={false}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="cars-swiper-wrapper"
      >
        {cars.map((car) => (
          <SwiperSlide key={car.id || car.Id}>
            <div className="minimal-car-card">
              <div className="car-image-wrapper">
                <img 
                  src={car.imageUrl || car.ImageUrl} 
                  alt={car.model} 
                  className="minimal-car-img" 
                />
              </div>
              <div className="car-details">
                <h4 className="car-model-name">{car.model || car.Model}</h4>
                <p className="car-category-label">
                  {car.categoryName || car.CategoryName || "רכב פרטי"}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>    

      {/* שימוש בפרופ onViewPrices כדי להחליף את ה-View ב-MainPage */}
      <button 
        className="view-all-btn" 
        onClick={onViewPrices} 
      >
        לכל הרכבים ומפרט המחירים
      </button>
    </div>
  );
};

export default CarGallery;