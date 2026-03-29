import React from "react";
import "../Style/CarSelectionList.css";

const CarSelectionList = ({ cars, onSelectCar }) => {
  if (!cars || cars.length === 0) return (
    <div className="no-cars">לא נמצאו רכבים זמינים לזמן שנבחר.</div>
  );

  return (
    <div className="car-selection-wrapper">
      <div className="selection-header">
        <div className="tab-switcher">
          <button className="tab-btn active">רשימת תחנות</button>
          <button className="tab-btn">תחנות מועדפות</button>
        </div>
        <div className="filter-actions">
           <button className="icon-btn">🔍</button>
           <button className="icon-btn">🔃</button>
        </div>
      </div>

      <div className="scroll-area">
        <div className="cars-grid">
          {cars.map((car) => (
            <div 
              key={car.id} 
              className={`car-status-card ${car.isAvailable ? "available" : "busy"}`}
              onClick={() => car.isAvailable && onSelectCar(car)}
            >
                  <div className="card-top-stripe" />
                  <div className="card-content">
                    <div className="card-meta">
                      <div className="card-title">{car.model || car.Model || 'רכב'}</div>
                      <div className="card-location">{car.streetName || car.address || car.StartParking || ''}</div>
                    </div>
                    <div className="car-image-container">
                      <img src={car.imageUrl || car.ImageUrl || '/assets/default_car.png'} alt={car.model} />
                    </div>
                  </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarSelectionList;
