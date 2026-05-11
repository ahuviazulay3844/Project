import React from "react";
import "../Style/CarAvailabilityModal.css";

const CarAvailabilityModal = ({ car, onClose, onEditTime, onConfirmSelection }) => {
  const getStatusInfo = (status) => {
    const s = Number(status);
    switch (s) {
      case 0: return { label: "פנוי", icon: "✅", color: "#16a34a" };
      case 1: return { label: "פנוי חלקית", icon: "⏳", color: "#ea580c" };
      case 2: return { label: "תפוס", icon: "🚫", color: "#dc2626" };
      case 3: return { label: "בטיפול", icon: "🔧", color: "#7c3aed" };
      default: return { label: "לא זמין", icon: "❓", color: "#4b5563" };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const statusInfo = getStatusInfo(car?.status);
  
  // שליפת הזמנים מה-API

  // לוגיקת הצגת ההודעה החדשה
  // שליפת הזמנים מה-API
  const availabilityStart = car?.blockingOrderStart; // תחילת החסימה (הזמן שלו)
  const availabilityEnd = car?.blockingOrderEnd;     // סוף החסימה (הזמן שלו + באפר)
  const isPartialOrBusy = Number(car?.status) === 1 || Number(car?.status) === 2;

  const getAvailabilityMessage = () => {
    const now = new Date();
    const busyFrom = availabilityStart ? new Date(availabilityStart) : null;
    const busyUntil = availabilityEnd ? new Date(availabilityEnd) : null;

    if (!busyUntil) return 'הרכב כרגע לא פנוי. נסה לשנות זמנים.';

    // חישוב הפרש בשעות בין עכשיו לתחילת החסימה
    const diffInHours = busyFrom ? (busyFrom - now) / (1000 * 60 * 60) : 0;

    // --- מקרה 1: הרכב תפוס ממש עכשיו (סטטוס 2) ---
    if (Number(car?.status) === 2) {
      return `הרכב תפוס כרגע וצפוי להתפנות ב-${formatTime(busyUntil)} בתאריך ${formatDate(busyUntil)}.`;
    }

    // --- מקרה 2: הרכב פנוי חלקית (סטטוס 1) ---
    if (Number(car?.status) === 1) {
      // אם החסימה מתחילה בעוד פחות משעה (או שכבר התחילה)
      if (diffInHours < 1) {
        return `הרכב תפוס כרגע וצפוי להתפנות ב-${formatTime(busyUntil)} בתאריך ${formatDate(busyUntil)}.`;
      } 
      
      // אם יש יותר משעה עד שהחסימה מתחילה (חלון זמן רלוונטי)
      return `הרכב יהיה תפוס מ-${formatTime(busyFrom)} בתאריך ${formatDate(busyFrom)} עד ${formatTime(busyUntil)} בתאריך ${formatDate(busyUntil)}.`;
    }

    return 'הרכב כרגע לא פנוי.';
  };
  return (
    <div className="availability-modal-overlay" onClick={onClose}>
      <div className="availability-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="modal-car-header">
          <img src={car?.imageUrl || "/assets/car-placeholder.png"} alt={car?.model} className="modal-car-image" />
          <div className="modal-car-info">
            <h2>{car?.model}</h2>
            <p>📍 {car?.startParking}</p>
          </div>
        </div>

        <div className="modal-status-section">
          <div className="status-badge-large" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>
            <span>{statusInfo.icon} {statusInfo.label}</span>
          </div>
        </div>

        {isPartialOrBusy && (
          <div className="availability-warning-card">
            <div className="warning-title">⏳ מידע חשוב על הזמינות</div>
            <p className="warning-text">{getAvailabilityMessage()}</p>
          </div>
        )}

        <div className="modal-specs">
          <div className="spec-item-modal"><span>⛽ {car?.fuelLevel}%</span></div>
          <div className="spec-item-modal"><span>📏 {(car?.distance || 0).toFixed(1)} ק"מ</span></div>
          <div className="spec-item-modal"><span>💺 {car?.seats} מושבים</span></div>
        </div>

        <div className="modal-actions">
          <button className="btn-edit-time" onClick={() => onEditTime(car)}>✏️ שנה זמנים</button>
          <button 
            className="btn-confirm" 
            disabled={Number(car?.status) !== 0}
            onClick={() => onConfirmSelection(car)}
          >
            {Number(car?.status) === 0 ? "הזמן נסיעה עכשיו" : "לא פנוי כרגע"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarAvailabilityModal;