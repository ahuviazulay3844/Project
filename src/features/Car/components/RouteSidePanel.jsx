import React, { useState, useEffect, useCallback } from "react";
import "../Style/RouteSidePanel.css";

const roundToNext10 = (d) => {
  const copy = new Date(d);
  const minutes = copy.getMinutes();
  const next = Math.ceil(minutes / 10) * 10;
  copy.setMinutes(next);
  copy.setSeconds(0);
  return copy;
};

const RouteSidePanel = ({ onClose, onConfirm, selectedCar }) => {
  const now = roundToNext10(new Date());

  // פונקציה לשליפת נתונים שמורים
  const getSavedData = useCallback(() => {
    const saved = localStorage.getItem("routeDraft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedEnd = new Date(parsed.end);
        if (savedEnd > now) return savedEnd;
      } catch (e) {
        console.error("Error loading saved route", e);
      }
    }
    return new Date(now.getTime() + 60 * 60 * 1000);
  }, [now]);

  const [startDateTime] = useState(now);
  const [endDateTime, setEndDateTime] = useState(getSavedData);

  // חישוב ערכים לתצוגה
  const diffMs = Math.max(0, endDateTime - startDateTime);
  const totalDays = Math.floor(diffMs / (24 * 3600 * 1000));
  const remainingHours = Math.floor((diffMs - totalDays * 24 * 3600 * 1000) / (3600 * 1000));

  // שמירה אוטומטית ל-LocalStorage בכל פעם שהתאריך משתנה
  useEffect(() => {
    const payload = {
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      totalDays,
      totalHours: totalDays * 24 + remainingHours,
    };
    localStorage.setItem("routeDraft", JSON.stringify(payload));
  }, [endDateTime, startDateTime, totalDays, remainingHours]);

  const formatTime = (d) => d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
  };

  const handleReset = () => {
    setEndDateTime(new Date(now.getTime() + 60 * 60 * 1000));
  };

  const updateHours = (val) => {
    setEndDateTime(prev => {
      const next = new Date(prev.getTime() + val * 3600000);
      return next > startDateTime ? next : prev;
    });
  };

  const updateDays = (val) => {
    setEndDateTime(prev => {
      const next = new Date(prev.getTime() + val * 86400000);
      return next > startDateTime ? next : prev;
    });
  };

  return (
    <div className="route-side-panel">
      <div className="panel-header">
        <div className="header-right">
          <span>{selectedCar ? 'פרטי רכב' : 'בחירת מסלול'}</span>
          <button className="reset-link" onClick={handleReset}>איפוס</button>
        </div>
        <button className="close-panel-btn" onClick={onClose}>✕</button>
      </div>

      {selectedCar && (
        <div className="car-detail-inline" style={{marginBottom:16}}>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <img src={selectedCar.imageUrl || '/assets/default_car.png'} alt="car" style={{width:90, height:60, objectFit:'contain', borderRadius:8}} />
            <div>
              <div style={{fontWeight:800, color:'#5d299a'}}>{selectedCar.Model || selectedCar.model || 'דגם רכב'}</div>
              <div style={{color:'#777', fontSize:13}}>{selectedCar.StartParking || selectedCar.startParking || 'מיקום התחנה'}</div>
            </div>
          </div>
        </div>
      )}

      <div className="time-grid">
        <div className="time-column">
          <div className="label">התחלה</div>
          <div className="pill-box">{formatTime(startDateTime)}</div>
          <div className="pill-box">{formatDate(startDateTime)}</div>
        </div>
        <div className="time-column">
          <div className="label">סיום</div>
          <div className="pill-box">{formatTime(endDateTime)}</div>
          <div className="pill-box">{formatDate(endDateTime)}</div>
        </div>
      </div>

      <div className="counter-section">
        <div className="counter-row">
          <span className="counter-label">סה״כ שעות</span>
          <div className="counter-controls">
            <button className="counter-btn" onClick={() => updateHours(-1)}>−</button>
            <span className="count-value">{remainingHours}</span>
            <button className="counter-btn" onClick={() => updateHours(1)}>+</button>
          </div>
        </div>

        <div className="counter-row">
          <span className="counter-label">סה״כ ימים</span>
          <div className="counter-controls">
            <button className="counter-btn" onClick={() => updateDays(-1)}>−</button>
            <span className="count-value">{totalDays}</span>
            <button className="counter-btn" onClick={() => updateDays(1)}>+</button>
          </div>
        </div>
      </div>

      <button className="confirm-btn-large" onClick={() => {
            const payload = {
              selectedCar: selectedCar || null,
              route: {
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                totalDays,
                totalHours: totalDays * 24 + remainingHours
              }
            };
            onConfirm && onConfirm(payload);
          }}>
            {selectedCar ? 'בחר רכב זה' : 'אישור והמשך'}
          </button>
    </div>
  );
};

export default RouteSidePanel;