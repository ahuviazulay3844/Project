import React, { useState, useEffect } from 'react';
import '../Style/CoverageSidePanel.css';

export default function CoverageSidePanel({ selectedCar: propCar, onClose, onConfirm }) {  
  // 1. טעינת הזמנים
  const [routeDraft, setRouteDraft] = useState(() => {
    try {
      const raw = localStorage.getItem('routeDraft');
      return raw ? JSON.parse(raw) : { totalHours: 0, start: null, end: null, selectedCar: null };
    } catch { 
      return { totalHours: 0, start: null, end: null, selectedCar: null };
    }
  });

  // 2. תיקון: אתחול קשיח ל-false. 
  // אם את רוצה שזה יתחיל תמיד כבוקסי ריק, פשוט נגדיר false בלי לבדוק ב-localStorage.
  const [waiver, setWaiver] = useState(false); 

  // 3. שמירת הבחירה בזיכרון רק אם המשתמש שינה אותה
  useEffect(() => {
    localStorage.setItem('coverage_waiver', waiver);
  }, [waiver]);

  // ניקוי ה-localStorage בטעינה הראשונה כדי לוודא שאין שאריות מהעבר
  useEffect(() => {
    localStorage.removeItem('coverage_waiver');
    const handleStorageChange = () => {
      const raw = localStorage.getItem('routeDraft');
      if (raw) setRouteDraft(JSON.parse(raw));
    };
    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); 
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const activeCar = propCar || routeDraft?.selectedCar;
  
  const calculateFinalHours = () => {
    if (!routeDraft?.start || !routeDraft?.end) return 0;
    const start = new Date(routeDraft.start);
    const end = new Date(routeDraft.end);
    let diffInHours = Math.ceil((end - start) / (1000 * 60 * 60)); 
    if (diffInHours <= 0) diffInHours = 1;
    let billableCount = 0;
    let current = new Date(start);
    for (let i = 0; i < diffInHours; i++) {
      const day = current.getDay();
      const hour = current.getHours();
      const isShabbat = (day === 5 && hour >= 16) || (day === 6 && hour < 20);
      if (!isShabbat) billableCount++;
      current.setHours(current.getHours() + 1);
    }
    return billableCount;
  };

  const billableHours = calculateFinalHours();
  const fullDays = Math.floor(billableHours / 24);
  const remainingHours = billableHours % 24;
  const waiverCost = (fullDays * 50) + (remainingHours * 3);

  const isCarSelected = !!(activeCar?.id || activeCar?.Id);
  const blocked = (() => {
    if (!routeDraft?.end) return true;
    const end = new Date(routeDraft.end);
    const day = end.getDay();
    const hour = end.getHours();
    return (day === 5 && hour >= 16) || (day === 6 && hour < 20);
  })();

  const canProgress = isCarSelected && !blocked && billableHours >= 1;

  const handleFinalConfirm = () => {
    if (!canProgress) return;
    onConfirm({
      carId: activeCar?.id || activeCar?.Id || activeCar?.carId,
      model: activeCar?.Model || activeCar?.model,
      startTime: routeDraft.start,
      endTime: routeDraft.end,
      billableHours: billableHours,
      totalPrice: (waiver ? waiverCost : 0), 
      hasWaiver: waiver,
      status: 'Occupied'
    });
  };

  return (
    <div className="coverage-modal-overlay">
      <div className="coverage-card">
        <button className="close-x" onClick={onClose}>×</button>
        
        <h2 className="car-title">
          ביטול השתתפות עצמית
        </h2>
        
        <div className="selection-area">
          <p className="summary-text">
            זמן לחיוב: <strong>{fullDays > 0 ? `${fullDays} ימים ו-` : ''}{remainingHours} שעות</strong>
          </p>          
          <div className={`custom-waiver-row ${waiver ? 'active' : ''}`} onClick={() => setWaiver(!waiver)}>
            <div className="waiver-info">
              <span className="waiver-label">ביטול השתתפות עצמית</span>
              <span className="waiver-subtext">3₪ לשעה / 50₪ ליום</span>
            </div>
            <div className="waiver-selection">
                <span className="price-tag">₪{waiverCost}</span>
                <div className={`custom-checkbox ${waiver ? 'checked' : ''}`}>
                  {waiver && <span className="check-mark">✓</span>}
                </div>
            </div>
          </div>
          <p className="waiver-disclaimer">במידה ולא ייבחר כיסוי, תיוחל השתתפות עצמית כחוק.</p>
        </div>

        {blocked && (
          <div className="shabbat-alert">
            <strong>🕯️ זמני השבת חסומים</strong>
            <p>לא ניתן להחזיר רכב בשבת.</p>
          </div>
        )}

        <button className={`confirm-btn ${!canProgress ? 'disabled' : ''}`} disabled={!canProgress} onClick={handleFinalConfirm}>
          {!isCarSelected ? 'בחר רכב תחילה' : blocked ? 'מועד לא זמין' : `אישור ${waiver ? `(₪${waiverCost})` : 'ללא כיסוי'}`}
        </button>
      </div>
    </div>
  );
}