import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../Style/RouteSidePanel.css";

const roundToNext10 = (d) => {
  const copy = new Date(d);
  const minutes = copy.getMinutes();
  const next = Math.ceil(minutes / 10) * 10;
  copy.setMinutes(next);
  copy.setSeconds(0);
  copy.setMilliseconds(0);
  return copy;
};

const RouteSidePanel = ({ onClose, onConfirm, selectedCar }) => {
  const now = useMemo(() => roundToNext10(new Date()), []);

  const getInitialEndDate = useCallback(() => {
    const saved = localStorage.getItem("routeDraft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedEnd = new Date(parsed.end);
        if (!isNaN(savedEnd) && savedEnd > new Date(now.getTime() + 60 * 60 * 1000)) {
          return savedEnd;
        }
      } catch (e) { console.error(e); }
    }
    return new Date(now.getTime() + 60 * 60 * 1000);
  }, [now]);

  const [endDateTime, setEndDateTime] = useState(getInitialEndDate);
  const [error, setError] = useState(null);

  const diffMs = Math.max(0, endDateTime - now);
  const totalDays = Math.floor(diffMs / (24 * 3600 * 1000));
  const remainingHours = Math.floor((diffMs % (24 * 3600 * 1000)) / (3600 * 1000));

  useEffect(() => {
    const payload = {
      start: now.toISOString(),
      end: endDateTime.toISOString(),
      totalDays,
      totalHours: Math.max(1, Math.floor(diffMs / (3600 * 1000))),
      selectedCar: selectedCar // שמירת הרכב לתוך ה-Draft לצורך סנכרון
    };
    localStorage.setItem("routeDraft", JSON.stringify(payload));
  }, [endDateTime, now, totalDays, diffMs, selectedCar]);

  const handleReset = () => {
    const resetDate = new Date(now.getTime() + 60 * 60 * 1000);
    setEndDateTime(resetDate);
    localStorage.removeItem("routeDraft");
    setError(null);
  };

  const updateHours = (val) => {
    setEndDateTime((prev) => {
      const next = new Date(prev.getTime() + val * 3600000);
      const minLimit = new Date(now.getTime() + 3600000);
      return next < minLimit ? minLimit : next;
    });
  };

  const updateDays = (val) => {
    setEndDateTime((prev) => {
      const next = new Date(prev.getTime() + val * 86400000);
      const minLimit = new Date(now.getTime() + 3600000);
      return next < minLimit ? minLimit : next;
    });
  };

  const handleConfirm = () => {
    setError(null);
    const day = endDateTime.getDay();
    const hour = endDateTime.getHours();
    const isShabbat = (day === 5 && hour >= 16) || (day === 6 && hour < 20);
    if (isShabbat) {
      setError('לא ניתן להחזיר רכב בשבת.');
      return;
    }
    onConfirm({
      selectedCar: selectedCar || null,
      route: {
        start: now.toISOString(),
        end: endDateTime.toISOString(),
        totalDays,
        totalHours: Math.max(1, Math.floor(diffMs / (3600 * 1000)))
      }
    });
  };

  const formatTime = (d) => d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(-2)}`;

  return (
    <div className="route-panel-overlay">
      <div className="route-panel">
        <div className="panel-header-row">
           <button className="route-close" onClick={onClose}>✕</button>
           <button className="reset-link" onClick={handleReset}>איפוס</button>
        </div>
        
        <h2 className="route-title">{selectedCar ? 'פרטי הזמנה' : 'בחירת מסלול'}</h2>
        
        {selectedCar && (
          <div className="car-status-card">
            <div className="status-bar"></div>
            <div className="card-main">
              <div className="car-info">
                <div className="availability-text">רכב נבחר</div>
                <h3 className="car-model-title">{selectedCar.Model || selectedCar.model}</h3>
                {/* הצגת הרחוב/מיקום מה-DB */}
                <p className="car-location">{selectedCar.startParking}</p>
              </div>
              <div className="car-img-side">
                <img src={selectedCar.imageUrl || selectedCar.image || '/assets/default_car.png'} alt="car" />
              </div>
            </div>
          </div>
        )}

        <div className="route-grid">
          <div className="route-right">
            <span className="field-label">התחלה</span>
            <div className="pill-input">{formatTime(now)}</div>
            <div className="pill-input">{formatDate(now)}</div>
          </div>
          <div className="route-left">
            <span className="field-label">סיום</span>
            <div className="pill-input">{formatTime(endDateTime)}</div>
            <div className="pill-input">{formatDate(endDateTime)}</div>
          </div>
        </div>

        <div className="total-block">
          <span className="field-label">סה״כ זמן לחיוב</span>
          <div className="total-counter">
            <button onClick={() => updateHours(-1)}>−</button>
            <span>{remainingHours} שעות</span>
            <button onClick={() => updateHours(1)}>+</button>
          </div>
          <div className="total-counter second-counter">
            <button onClick={() => updateDays(-1)}>−</button>
            <span>{totalDays} ימים</span>
            <button onClick={() => updateDays(1)}>+</button>
          </div>
        </div>

        {error && <p className="panel-error">{error}</p>}
        <button className="route-confirm" onClick={handleConfirm}>
          {selectedCar ? 'אשר והמשך לבחירת כיסוי' : 'אשר והמשך'}
        </button>
      </div>
    </div>
  );
};

export default RouteSidePanel;