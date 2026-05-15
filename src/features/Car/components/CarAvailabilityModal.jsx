import React from "react";
import "../Style/CarAvailabilityModal.css";

const CarAvailabilityModal = ({ car, selectedTime, onClose, onEditTime, onConfirmSelection }) => {
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  };

  const status = Number(car?.status);
  
  // הנתונים היבשים מהשרת
  const blockStart = car?.blockingOrderStart ? new Date(car.blockingOrderStart) : null;
  const blockEnd = car?.blockingOrderEnd ? new Date(car.blockingOrderEnd) : null;
  
  // הזמן שהלקוח ביקש והזמן של עכשיו
  const reqStart = new Date(selectedTime.start);
  const reqEnd = new Date(selectedTime.end);
  const now = new Date();

  const getAvailabilityMessage = () => {
    // 1. מצב בטיפול
    if (status === 3) return "הרכב נמצא כרגע בתחזוקה או דורש תדלוק ולא ניתן להזמנה.";

    // 2. מצב תפוס לגמרי (סטטוס 2)
    if (status === 2) {
      return `הרכב תפוס כרגע. הוא צפוי להתפנות ב-${formatTime(blockEnd)}.`;
    }

    // 3. מצב פנוי חלקית (סטטוס 1) - כאן הלוגיקה המורכבת
    if (status === 1 && blockStart && blockEnd) {
      
      // חישוב חלון פנוי בתחילה: מהרגע שהלקוח רוצה (או מעכשיו) ועד שהרכב נתפס
      const effectiveStart = now > reqStart ? now : reqStart;
      const startGapMinutes = (blockStart - effectiveStart) / 60000;
      
      // חישוב חלון פנוי בסוף: מהרגע שהרכב משתחרר ועד סוף ההזמנה המבוקשת
      const endGapMinutes = (reqEnd - blockEnd) / 60000;

      // מקרה א: יש חלון של שעה לפני וגם חלון אחרי
      if (startGapMinutes >= 60 && endGapMinutes > 0) {
        return `שים לב: הרכב פנוי להזמנה עד שעה ${formatTime(blockStart)} ושוב החל משעה ${formatTime(blockEnd)}.`;
      }
      
      // מקרה ב: יש חלון של שעה רק לפני (והחלון שאחרי כבר עבר או לא קיים)
      if (startGapMinutes >= 60) {
        return `שים לב: הרכב פנוי להזמנה רק עד שעה ${formatTime(blockStart)}.`;
      }

      // מקרה ג: החלון שלפני קטן משעה או כבר עבר - נציג רק את החלון שאחרי
      if (endGapMinutes > 0) {
        return `הרכב תפוס בחלק מהזמן שבחרת. הוא יהיה פנוי עבורך החל משעה ${formatTime(blockEnd)}.`;
      }
    }

    return "הרכב לא זמין להזמנה בטווח הזמן המדויק שצוין.";
  };

  const statusInfo = (s) => {
    switch (s) {
      case 0: return { label: "פנוי", color: "#16a34a" };
      case 1: return { label: "פנוי חלקית", color: "#ea580c" };
      case 2: return { label: "תפוס", color: "#dc2626" };
      default: return { label: "לא זמין", color: "#4b5563" };
    }
  };

  const info = statusInfo(status);

  return (
    <div className="availability-modal-overlay" onClick={onClose}>
      <div className="availability-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        <div className="modal-car-header">
          <img src={car?.imageUrl || "/assets/car-placeholder.png"} alt={car?.model} className="modal-car-image" />
          <div className="modal-car-info">
            <h2>{car?.model}</h2>
            <p>{car?.startParking}</p>
          </div>
        </div>

        <div className="modal-status-section">
          <div className="status-badge-large" style={{ borderColor: info.color, color: info.color }}>
            <span>{info.label}</span>
          </div>
        </div>

        {(status === 1 || status === 2 || status === 3) && (
          <div className={`availability-warning-card ${status === 2 ? 'busy' : 'partial'}`}>
            <div className="warning-title">⚠️ מידע חשוב על הזמינות</div>
            <p className="warning-text">{getAvailabilityMessage()}</p>
          </div>
        )}

        <div className="modal-specs">
          <div className="spec-item-modal"><span>⛽ {car?.fuelLevel}%</span></div>
          <div className="spec-item-modal"><span>📏 {(car?.distance || 0).toFixed(1)} ק"מ</span></div>
          <div className="spec-item-modal"><span>💺 {car?.seats} מושבים</span></div>
        </div>

        <div className="modal-actions">
          <button className="btn-edit-time" onClick={() => onEditTime(car)}>שנה זמנים</button>
          <button 
            className="btn-confirm" 
            disabled={status === 2 || status === 3}
            onClick={() => onConfirmSelection(car)}
          >
            {status === 2 || status === 3 ? "הרכב תפוס" : "הזמן נסיעה עכשיו"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarAvailabilityModal;