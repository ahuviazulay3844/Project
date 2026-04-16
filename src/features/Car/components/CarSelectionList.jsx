import React, { useState } from "react";
import "../Style/CarSelectionList.css";

const CarSelectionList = ({ cars, onSelectCar }) => {
  // State לניהול הטאב הנבחר: 'all' עבור רשימת תחנות, 'favorites' עבור מועדפות
  const [activeTab, setActiveTab] = useState('all');

  if (!cars || cars.length === 0) return (
    <div className="no-cars">לא נמצאו רכבים זמינים לזמן שנבחר.</div>
  );

  // סינון הרכבים: אם הטאב הוא 'favorites', נציג רק רכבים שהם isPopular
  // שים לב: ב-C# הגדרת IsPopular, ב-JS זה לרוב יגיע כ-isPopular (אות קטנה)
  const filteredCars = activeTab === 'favorites' 
    ? cars.filter(car => car.isPopular || car.IsPopular) 
    : cars;

  return (
    <div className="car-selection-wrapper">
      <div className="selection-header">
        <div className="tab-switcher">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            רשימת תחנות
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            תחנות מועדפות
          </button>
        </div>
        <div className="filter-actions">
           <button className="icon-btn">🔍</button>
           <button className="icon-btn">🔃</button>
        </div>
      </div>

      <div className="scroll-area">
        <div className="cars-grid">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <div 
                key={car.id || car.Id} 
                className={`car-status-card ${car.isAvailable ? "available" : "busy"}`}
                onClick={() => car.isAvailable && onSelectCar(car)}
              >
                  <div className="card-top-stripe" />
                  <div className="card-content">
                    <div className="card-meta">
                      <div className="card-title">{car.model || car.Model || 'רכב'}</div>
                      <div className="card-location">{car.startParking || car.StartParking || ''}</div>
                    </div>
                    <div className="car-image-container">
                      <img src={car.imageUrl || car.ImageUrl || '/assets/default_car.png'} alt={car.model} />
                    </div>
                  </div>
              </div>
            ))
          ) : (
            <div className="no-cars">אין רכבים פופולריים להצגה כרגע.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarSelectionList;