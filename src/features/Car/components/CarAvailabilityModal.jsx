import React from "react";
import "../Style/CarAvailabilityModal.css";

const CarAvailabilityModal = ({ car, onClose, onEditTime, onConfirmSelection }) => {
  const getStatusInfo = (status) => {
    const s = Number(status);
    switch (s) {
      case 0: return { label: "פנוי", color: "#16a34a" };
      case 1: return { label: "פנוי חלקית", color: "#ea580c" };
      case 2: return { label: "תפוס", color: "#dc2626" };
      case 3: return { label: "בטיפול", color: "#7c3aed" };
      default: return { label: "לא זמין", color: "#4b5563" };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const status = Number(car?.status);
  const statusInfo = getStatusInfo(status);
  
  const availabilityStart = car?.blockingOrderStart; 
  const availabilityEnd = car?.blockingOrderEnd;   
  
  const isPartialOrBusy = status === 1 || status === 2;

  const getAvailabilityMessage = () => {
    // מקרה 1: תפוס (סטטוס 2) - נגיד מתי הוא מתפנה (End)
    if (status === 2 && availabilityEnd) {
      return `הרכב תפוס כרגע וצפוי להתפנות ב-${formatTime(availabilityEnd)} בתאריך ${formatDate(availabilityEnd)}.`;
    }

    // מקרה 2: פנוי חלקית (סטטוס 1) - נגיד עד מתי הוא פנוי (Start)
    if (status === 1 && availabilityStart) {
      return `שים לב: הרכב פנוי להזמנה רק עד שעה ${formatTime(availabilityStart)} בתאריך ${formatDate(availabilityStart)}.`;
    }
    
    return 'הרכב כרגע לא זמין להזמנה בזמנים שנבחרו.';
  };

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
          <div className="status-badge-large" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {isPartialOrBusy && (
          <div className="availability-warning-card">
            <div className="warning-title">⚠️ מידע חשוב על הזמינות</div>
            <p className="warning-text">{getAvailabilityMessage()}</p>
          </div>
        )}

        <div className="modal-specs">
          <div className="spec-item-modal"><span>⛽ {car?.fuelLevel}%</span></div>
          <div className="spec-item-modal"><span>📏 {(car?.distance || 0).toFixed(1)} ק"מ מהמיקום</span></div>
          <div className="spec-item-modal"><span>💺 {car?.seats} מושבים</span></div>
        </div>

        <div className="modal-actions">
          <button className="btn-edit-time" onClick={() => onEditTime(car)}>שנה זמנים</button>
          <button 
            className="btn-confirm" 
            disabled={status === 2 || status === 3}
            onClick={() => onConfirmSelection(car)}
          >
            {status === 2 || status === 3 ? "לא ניתן להזמין" : "הזמן נסיעה עכשיו"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarAvailabilityModal;