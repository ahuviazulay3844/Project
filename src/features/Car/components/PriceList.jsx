import React from 'react';
import '../Style/PriceList.css';
import { useGetAllCarsQuery } from '../redux/carApi.jsx'; 

const PriceList = () => {
  const { data: cars = [], isLoading } = useGetAllCarsQuery();

  const categoryNames = {
    0: "מיני", 1: "משפחתי", 2: "גדול", 3: "מסחרי", 4: "יוקרה"
  };

  if (isLoading) return <div className="loading-state">טוען קטלוג רכבים...</div>;

  return (
    <div className="catalog-wrapper">
      <header className="catalog-header">
        <div className="brand-badge">CITY CAR ELAD</div>
        <h1>מחירון צי הרכבים</h1>
        <p>סקירה טכנית ומחירי שימוש מעודכנים לשנת 2026</p>
      </header>

      <div className="catalog-grid">
        {cars.map((car) => {
          // חילוץ בטוח של הנתונים כדי למנוע את השגיאה שראינו בתמונה
          const km = car.kilometers ?? car.Kilometers ?? 0;
          const pPerHour = car.pricePerHour ?? car.PricePerHour ?? 0;
          const pPerDay = car.pricePerDay ?? car.PricePerDay ?? 0;
          const pPerKm = car.pricePerKm ?? car.PricePerKm ?? 0;

          return (
            <div className="car-catalog-card" key={car.id || car.Id}>
              <div className="car-visual">
                <img src={car.imageUrl || car.ImageUrl || '/assets/default_car.png'} alt={car.model} />
              </div>

              <div className="car-main-details">
                <span className="category-label">{categoryNames[car.carCategory] || car.categoryName}</span>
                <h2 className="car-title">{car.model || car.Model}</h2>
                <div className="meta-info">שנת ייצור: {car.year || car.Year} | {car.seats || car.Seats} מקומות</div>
              </div>

              <div className="price-matrix">
                <div className="matrix-item">
                  <span className="matrix-label">שעתי</span>
                  <span className="matrix-value">₪{pPerHour}</span>
                </div>
                <div className="matrix-item highlighted">
                  <span className="matrix-label">יומי</span>
                  <span className="matrix-value">₪{pPerDay}</span>
                </div>
                <div className="matrix-item">
                  <span className="matrix-label">לק"מ</span>
                  <span className="matrix-value">₪{pPerKm}</span>
                </div>
              </div>

              <div className="tech-specs">
                <div className="spec-line">
                  <span className="spec-icon">🛣️</span>
                  <span className="spec-text">קילומטראז' נוכחי: <strong>{km.toLocaleString()} ק"מ</strong></span>
                </div>
                <div className="spec-line">
                  <span className="spec-icon">🆔</span>
                  <span className="spec-text">מספר רישוי: <strong>{car.licensePlate || car.LicensePlate}</strong></span>
                </div>
                <div className="spec-line">
                  <span className="spec-icon">🏠</span>
                  <span className="spec-text">מיקום: <strong>{car.startParking}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceList;