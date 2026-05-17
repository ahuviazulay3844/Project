import React, { useState } from 'react';
import '../Style/PriceList.css';
import { Search, Users, LayoutGrid } from 'lucide-react';
import { useGetAllCarsQuery } from '../redux/carApi.jsx'; 

const PriceList = () => {
  const { data: cars = [], isLoading } = useGetAllCarsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSeats, setSelectedSeats] = useState("");
  const categoryNames = {
    0: "מיני", 1: "משפחתי", 2: "גדול", 3: "מסחרי", 4: "יוקרה"
  };
const filteredCars = cars.filter((car) => {
    const model = (car.model || car.Model || "").toLowerCase();
    
    // בדיקה של כל הווריאציות שהשרת שולח (אות גדולה/קטנה/שם שונה)
    const carCat = car.carCategory ?? car.CarCategory ?? car.category;
    const carSeats = car.seats ?? car.Seats;

    const matchesSearch = model.includes(searchTerm.toLowerCase());
    
    // תיקון קריטי: השוואה ישירה למספר (כמו ב-CarSelectionList שעובד לך)
    const matchesCategory = selectedCategory === "" || carCat === parseInt(selectedCategory);
    const matchesSeats = selectedSeats === "" || carSeats === parseInt(selectedSeats);

    return matchesSearch && matchesCategory && matchesSeats;
  });
  if (isLoading) return <div className="loading-state">טוען קטלוג רכבים...</div>;

  return (
    <div className="catalog-wrapper">
      <header className="catalog-header">
        <div className="brand-badge">CITY CAR ELAD</div>
        <h1>מחירון צי הרכבים</h1>
        <p>סקירה טכנית ומחירי שימוש מעודכנים לשנת 2026</p>
      </header>
 <div className="catalog-filter-bar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="חפש דגם רכב..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filters-group">
          <div className="select-wrapper">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">כל הקטגוריות</option>
              <option value="0">מיני</option>
              <option value="1">משפחתי</option>
              <option value="2">גדול</option>
              <option value="3">מסחרי</option>
              <option value="4">יוקרה</option>
            </select>
          </div>

          <div className="select-wrapper">
            <select 
              value={selectedSeats} 
              onChange={(e) => setSelectedSeats(e.target.value)}
            >
              <option value="">מושבים</option>
              <option value="5">5 מקומות</option>
              <option value="7">7 מקומות</option>
              <option value="9">9 מקומות</option>
            </select>
          </div>
        </div>
      </div>
      <div className="catalog-grid">
        {filteredCars.map((car) => {
          // חילוץ בטוח של הנתונים כדי למנוע את השגיאה שראינו בתמונה
          const km = car.kilometers ?? car.Kilometers ?? 0;
          const pPerHour = car.pricePerHour ?? car.PricePerHour ?? 0;
          const pPerDay = car.pricePerDay ?? car.PricePerDay ?? 0;
          const pPerKm = car.pricePerKm ?? car.PricePerKm ?? 0;
          const carCat = car.carCategory ?? car.CarCategory;
          const carSeats = car.seats ?? car.Seats;
          return (
            <div className="car-catalog-card" key={car.id || car.Id}>
              <div className="car-visual">
                <img src={car.imageUrl || car.ImageUrl || '/assets/default_car.png'} alt={car.model} />
              </div>

              <div className="car-main-details">
                <span className="category-label">{categoryNames[carCat] || car.categoryName}</span>
                <h2 className="car-title">{car.model || car.Model}</h2>
                <div className="meta-info">שנת ייצור: {car.year || car.Year} | {carSeats} מקומות</div>
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