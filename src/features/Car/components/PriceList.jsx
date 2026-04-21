import React from 'react';
import '../Style/PriceList.css';
import { useGetAllCarsQuery } from '../redux/carApi.jsx'; 

const PriceList = () => {
  const { data: cars = [], isLoading } = useGetAllCarsQuery();

  const categoryNames = {
    0: "מיני",
    1: "משפחתי",
    2: "גדול",
    3: "מסחרי",
    4: "יוקרה"
  };

  const categoryDescriptions = {
    0: "רכבים קטנים וחסכוניים, מושלמים לתמרון עירוני וחניה קלה.",
    1: "נוחות מקסימלית לנסיעות בין-עירוניות, מרווחים ומאובזרים.",
    2: "7 מקומות ישיבה מרווחים, הפתרון המושלם לטיולים ומשפחות.",
    3: "רכבי עבודה חזקים עם נפח אחסון גדול להובלת ציוד.",
    4: "חוויית נסיעה אקסקלוסיבית ברכבי פרימיום לחופשות ואירועים."
  };

  if (isLoading) return <div className="loading-prices">טוען מחירון מעודכן...</div>;

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>מחירון רכבים</h1>
        <p>שקיפות מלאה, ללא דמי מנוי - משלמים רק על זמן הנסיעה והקילומטרים.</p>
      </div>

      <div className="pricing-grid">
        {cars.length > 0 ? (
          cars.map((car) => {
            // חילוץ בטוח של המשתנים - בודק גם אות קטנה וגם גדולה
            const priceHour = car.pricePerHour ?? car.PricePerHour ?? 0;
            const priceDay = car.pricePerDay ?? car.PricePerDay ?? 0;
            const priceKm = car.pricePerKm ?? car.PricePerKm ?? 0;
            const category = car.carCategory ?? car.CarCategory ?? 0;
            const model = car.model ?? car.Model ?? "רכב כללי";
            const img = car.imageUrl ?? car.ImageUrl ?? '/assets/default_car.png';

            return (
              <div className="pricing-card" key={car.id || car.Id}>
                {car.isPopular && <div className="card-badge popular">נבחר ביותר</div>}
                
                <div className="car-image-container">
                  <img src={img} alt={model} className="car-render-img" />
                </div>

                <div className="card-info">
                  <span className="car-category-label">{categoryNames[category]}</span>
                  <h3 className="car-model-title">{model}</h3>
                </div>

                <div className="price-section">
                  <div className="main-price">
                    <span className="currency">₪</span>
                    <span className="amount">{priceHour}</span>
                    <span className="period">/ שעה</span>
                  </div>
                  <div className="secondary-price">₪{priceDay} ליום שלם</div>
                </div>
                
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-dot"></span>
                    <span>עלות לקילומטר: <strong>₪{priceKm}</strong></span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-dot"></span>
                    <span>מספר מושבים: <strong>{car.seats || car.Seats || 5}</strong></span>
                  </div>
                  <p className="category-desc">{categoryDescriptions[category]}</p>
                </div>
                
                <button className="pricing-cta">בדוק זמינות</button>
              </div>
            );
          })
        ) : (
          <div className="no-data">לא נמצאו רכבים להצגת מחירים.</div>
        )}
      </div>

      <div className="pricing-footer">
        <p>* המחירים כוללים דלק וביטוח מקיף לכל נהג מעל גיל 21.</p>
        <p>* ביטול השתתפות עצמית זמין בתוספת של 3₪ לשעה בלבד.</p>
      </div>
    </div>
  );
};

export default PriceList;