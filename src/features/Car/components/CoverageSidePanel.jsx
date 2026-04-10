import React, { useState } from 'react';
import '../Style/CoverageSidePanel.css';

export default function CoverageSidePanel({ selectedCar, onClose, onConfirm }) {
  const [routeDraft] = useState(() => {
    const raw = localStorage.getItem('routeDraft');
    return raw ? JSON.parse(raw) : { totalHours: 0, start: null, end: null };
  });

  const [waiver, setWaiver] = useState(false);

  const totalHours = routeDraft.totalHours || 0;
  const totalDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  
  // חישוב אוטומטי: 50 ליום ו-3 לכל שעה נוספת
  const calculatedCost = (totalDays * 50) + (remainingHours * 3);

  const isTimeBlocked = () => {
    if (!routeDraft.end) return false;
    const endDate = new Date(routeDraft.end);
    const day = endDate.getDay(); 
    const hour = endDate.getHours();
    if (day === 6) return true; // שבת
    if (day === 5 && hour >= 15) return true; // שישי מ-15:00
    return false;
  };

  const blocked = isTimeBlocked();

  const handleFinalConfirm = () => {
    if (blocked) return;

    // אובייקט נתונים מושלם לעדכון ה-DB
    const bookingData = {
      carId: selectedCar?.id || selectedCar?.Id,
      model: selectedCar?.Model || selectedCar?.model,
      startTime: routeDraft.start,
      endTime: routeDraft.end,
      totalHours: totalHours,
      totalPrice: calculatedCost + (waiver ? calculatedCost : 0),
      hasWaiver: waiver,
      status: 'Occupied' // משנה לרכב תפוס בדאטה
    };

    onConfirm(bookingData);
  };

  return (
    <div className="coverage-modal-overlay">
      <div className="coverage-card">
        <button className="close-x" onClick={onClose}>×</button>
        
        <h2 className="car-title">אישור הזמנה: {selectedCar?.Model}</h2>
        
        <div className="selection-area">
          <label className={`custom-waiver-row ${waiver ? 'active' : ''}`}>
            <div className="waiver-info">
              <span className="waiver-label">ביטול השתתפות עצמית</span>
              <span className="waiver-subtext">הגנה מלאה בנסיעה שלך</span>
            </div>
            <div className="waiver-action">
              <span className="price-display">₪{calculatedCost}</span>
              <input 
                type="checkbox" 
                checked={waiver} 
                onChange={() => setWaiver(!waiver)} 
              />
            </div>
          </label>
        </div>

        {blocked ? (
          <div className="shabbat-alert">
            <div className="shabbat-icon">🕯️🕯️</div>
            <div className="shabbat-text">
              <strong>זמני השבת חסומים</strong>
              <p>לא ניתן לבצע הזמנות בשבת קודש. נא לבחור מועד אחר.</p>
            </div>
          </div>
        ) : (
          <div className="final-price-summary">
             <span>סה"כ לתשלום:</span>
             <strong>₪{calculatedCost + (waiver ? calculatedCost : 0)}</strong>
          </div>
        )}

        <button 
          className={`confirm-btn ${blocked ? 'disabled' : ''}`}
          disabled={blocked}
          onClick={handleFinalConfirm}
        >
          {blocked ? 'מועד לא זמין' : 'אשר ושנה לרכב תפוס'}
        </button>
      </div>
    </div>
  );
}