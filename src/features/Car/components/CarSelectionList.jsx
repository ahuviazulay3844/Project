import React, { useState } from "react";
import "../Style/CarSelectionList.css";
import CarAvailabilityModal from "./CarAvailabilityModal";

const CarSelectionList = ({ cars, onSelectCar, onEditTime, selectedTime }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [maxDistance, setMaxDistance] = useState(2);
  const [seats, setSeats] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCarForModal, setSelectedCarForModal] = useState(null);

  const getStatusInfo = (status) => {
    const s = Number(status);
    switch (s) {
      case 0: return { label: "פנוי", class: "status-free", icon: "✅", canOrder: true };
      case 1: return { label: "פנוי חלקית", class: "status-partial", icon: "⏳", canOrder: true };
      case 2: return { label: "תפוס", class: "status-busy", icon: "🚫", canOrder: false };
      case 3: return { label: "בטיפול", class: "status-maintenance", icon: "🔧", canOrder: false };
      default: return { label: "לא זמין", class: "status-maintenance", icon: "❓", canOrder: false };
    }
  };

  const filteredCars = cars?.filter((car) => {
    const matchesSearch = car.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistance = (car.distance || 0) <= maxDistance;
    const matchesSeats = seats === "" || car.seats === parseInt(seats);
    const matchesCategory = category === "" || car.category === parseInt(category);
    return matchesSearch && matchesDistance && matchesSeats && matchesCategory;
  });

  return (
    <div className="car-selection-container">
      <header className="cars-header">
        <h2>בחר רכב לנסיעה</h2>
        <p>מציג רכבים קרובים ברדיוס של עד {maxDistance} ק"מ</p>
      </header>

      <div className="filters-section">
        <div className="search-wrapper">
          <span className="input-icon">🔍</span>
          <input type="text" placeholder="חפש דגם רכב..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="select-group">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
            <option value="">כל הקטגוריות</option>
            <option value="0">מיני</option><option value="1">משפחתי</option><option value="2">גדול</option>
            <option value="3">מסחרי</option><option value="4">יוקרה</option>
          </select>
          <select value={seats} onChange={(e) => setSeats(e.target.value)} className="filter-select">
            <option value="">מושבים</option><option value="5">5 מקומות</option>
            <option value="7">7 מקומות</option><option value="9">9 מקומות</option>
          </select>
        </div>
        <div className="range-filter">
          <div className="range-labels"><span>מרחק</span><span className="dist-val">{maxDistance} ק"מ</span></div>
          <input type="range" min="0.5" max="10" step="0.5" value={maxDistance} onChange={(e) => setMaxDistance(parseFloat(e.target.value))} />
        </div>
      </div>

      <div className="cars-grid">
        {filteredCars?.length > 0 ? (
          filteredCars.map((car) => {
            const statusInfo = getStatusInfo(car.status);
            const canOrder = statusInfo.canOrder;

            return (
              <div 
                key={car.id} 
                className={`car-card ${!canOrder ? 'disabled-card' : ''}`} 
                onClick={() => setSelectedCarForModal(car)} // פותח מודל תמיד
              >
                <div className="car-image-wrapper">
                  <img src={car.imageUrl || '/default-car.png'} alt={car.model} />
                  <div className={`status-badge-overlay ${statusInfo.class}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </div>
                  {car.isPopular && <div className="popular-tag">פופולרי 🔥</div>}
                </div>

                <div className="car-details">
                  <div className="main-info">
                    <h3>{car.model}</h3>
                    <div className="price-tag"><span className="price-val">₪{car.pricePerHour}</span><span className="price-unit">/שעה</span></div>
                  </div>
                  <p className="location-text"> {car.startParking}</p>
                  
                  <div className="specs-grid">
                    <div className="spec-item"><span className="spec-label">⛽ דלק</span><span className="spec-val">{car.fuelLevel}%</span></div>
                    <div className="spec-item"><span className="spec-label">🚶 מרחק</span><span className="spec-val">{(car.distance || 0).toFixed(1)} ק"מ</span></div>
                    <div className="spec-item"><span className="spec-label">💺 מושבים</span><span className="spec-val">{car.seats}</span></div>
                  </div>

                  <button 
                    className={`order-button ${!canOrder ? 'btn-disabled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCarForModal(car);
                    }}
                  >
                    {Number(car.status) === 2 ? "מתי יתפנה?" : !canOrder ? "לא זמין" : "בחר רכב זה"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results-msg"><p>לא נמצאו רכבים מתאימים.</p></div>
        )}
      </div>

      {selectedCarForModal && (
        <CarAvailabilityModal
          car={selectedCarForModal}
          selectedTime={selectedTime}
          onClose={() => setSelectedCarForModal(null)}
          onEditTime={(car) => {
            onEditTime(car);
            setSelectedCarForModal(null);
          }}
          onConfirmSelection={(car) => {
            onSelectCar(car);
            setSelectedCarForModal(null);
          }}
        />
      )}
    </div>
  );
};

export default CarSelectionList;