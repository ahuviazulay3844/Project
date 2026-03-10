import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import '../Style/CarGallery.css';

const CarGallery = ({ cars }) => {
  // בדיקה למניעת קריסה אם הנתונים עדיין לא הגיעו מהשרת
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
         <SwiperSlide key={car.id}>
    <div className="minimal-car-card">
      <div className="car-image-wrapper">
        <img src={car.imageUrl} alt={car.model} className="minimal-car-img" />
      </div>
      <div className="car-details">
        <h4 className="car-model-name">{car.model}</h4>
        <p className="car-category-label">{car.categoryName || "טוען..."}</p>      </div>
    </div>
     </SwiperSlide>
        ))}
      </Swiper>    
      <button className="view-all-btn">לכל הרכבים ומפרט המחירים</button>
    </div>
  );
};
export default CarGallery;