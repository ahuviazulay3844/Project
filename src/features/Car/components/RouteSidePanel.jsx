import React, { useState, useMemo } from "react";
import "../Style/RouteSidePanel.css";

const RouteSidePanel = ({ onClose, onConfirm, initialData, selectedCar }) => {
  const roundTo5 = (date) => {
    const d = new Date(date);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
    return d;
  };

  const now = useMemo(() => roundTo5(new Date()), []);
  const ONE_HOUR_MS = 3600000;
  const ONE_DAY_MS = 86400000;

  const [startDateTime, setStartDateTime] = useState(() => 
    initialData?.start ? roundTo5(new Date(initialData.start)) : now
  );
  const [endDateTime, setEndDateTime] = useState(() => 
    initialData?.end ? roundTo5(new Date(initialData.end)) : new Date(now.getTime() + ONE_HOUR_MS)
  );

  const handleReset = (e) => {
    e.stopPropagation();
    setStartDateTime(now);
    setEndDateTime(new Date(now.getTime() + ONE_HOUR_MS));
  };

  const { totalDays, remainingHours } = useMemo(() => {
    const diffMs = endDateTime - startDateTime;
    const totalHrs = Math.max(1, Math.floor(diffMs / ONE_HOUR_MS));
    return { totalDays: Math.floor(totalHrs / 24), remainingHours: totalHrs % 24 };
  }, [startDateTime, endDateTime]);

  const formatTime = (date) => date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleDateTimeChange = (isStart, dateVal, timeVal) => {
    const [hours, mins] = timeVal.split(":").map(Number);
    const [y, m, d] = dateVal.split("-").map(Number);
    
    // מעגלים את התאריך החדש מיד עם יצירתו
    const newDate = roundTo5(new Date(y, m - 1, d, hours, mins));

    if (isStart) {
      setStartDateTime(newDate);
      if (newDate.getTime() + ONE_HOUR_MS > endDateTime.getTime()) {
        setEndDateTime(new Date(newDate.getTime() + ONE_HOUR_MS));
      }
    } else {
      if (newDate.getTime() < startDateTime.getTime() + ONE_HOUR_MS) {
        setEndDateTime(new Date(startDateTime.getTime() + ONE_HOUR_MS));
      } else {
        setEndDateTime(newDate);
      }
    }
  };

  return (
    <div className="route-panel-overlay" onClick={onClose}>
      <div className="route-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>✕</button>
        <div className="header-top-row">
          <button className="reset-link-top" onClick={handleReset}>איפוס</button>
          <h2 className="main-title-header">{selectedCar ? "פרטי רכב" : "מתי יוצאים?"}</h2>
        </div>

        {selectedCar && (
          <div className="car-selection-header">
            <img src={selectedCar.imageUrl || selectedCar.Image || '/assets/car-placeholder.png'} alt="car" className="panel-car-img" />
            <div className="panel-car-name">{selectedCar.model || selectedCar.Model}</div>
            <div className="panel-car-address">{selectedCar.startParking || selectedCar.Address}</div>
          </div>
        )}

        <div className="columns-container">
          <div className="time-column">
            <span className="column-label">איסוף</span>
            <input className="white-input" type="time" step="300" value={formatTime(startDateTime)} onChange={(e) => handleDateTimeChange(true, formatDate(startDateTime), e.target.value)} />
            <input className="white-input" type="date" value={formatDate(startDateTime)} onChange={(e) => handleDateTimeChange(true, e.target.value, formatTime(startDateTime))} />
          </div>
          <div className="time-column">
            <span className="column-label">החזרה</span>
            <input className="white-input" type="time" step="300" value={formatTime(endDateTime)} onChange={(e) => handleDateTimeChange(false, formatDate(endDateTime), e.target.value)} />
            <input className="white-input" type="date" value={formatDate(endDateTime)} onChange={(e) => handleDateTimeChange(false, e.target.value, formatTime(endDateTime))} />
          </div>
        </div>

        <div className="counters-row">
          <div className="fancy-counter-wide">
            <button className="wide-btn" onClick={() => setEndDateTime(new Date(endDateTime.getTime() + ONE_HOUR_MS))}>+</button>
            <div className="val-box"><strong>{remainingHours}</strong><span>שעות</span></div>
            <button className="wide-btn" onClick={() => {
                if (endDateTime.getTime() - ONE_HOUR_MS >= startDateTime.getTime() + ONE_HOUR_MS) {
                    setEndDateTime(new Date(endDateTime.getTime() - ONE_HOUR_MS));
                }
            }}>−</button>
          </div>
          <div className="fancy-counter-wide">
            <button className="wide-btn" onClick={() => setEndDateTime(new Date(endDateTime.getTime() + ONE_DAY_MS))}>+</button>
            <div className="val-box"><strong>{totalDays}</strong><span>ימים</span></div>
            <button className="wide-btn" onClick={() => {
                const newEnd = new Date(endDateTime.getTime() - ONE_DAY_MS);
                setEndDateTime(newEnd.getTime() < startDateTime.getTime() + ONE_HOUR_MS 
                    ? new Date(startDateTime.getTime() + ONE_HOUR_MS) 
                    : newEnd);
            }}>−</button>
          </div>
        </div>

        <button className="submit-btn" onClick={() => onConfirm({start: startDateTime, end: endDateTime, selectedCar})}>
          {selectedCar ? "בחר רכב זה" : "אישור זמן נסיעה"}
        </button>
      </div>
    </div>
  );
};

export default RouteSidePanel;