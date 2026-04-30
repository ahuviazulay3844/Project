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
  const availabilityStart = car?.nextAvailableStart || car?.blockingOrderStart || car?.nextAvailabilityStart;
  const availabilityEnd = car?.nextAvailableEnd || car?.blockingOrderEnd || car?.nextAvailabilityEnd;
  const isPartialOrBusy = Number(car?.status) === 1 || Number(car?.status) === 2;

  const availabilityMessage = availabilityStart
    ? `הרכב צפוי להיות פנוי ב-${formatTime(availabilityStart)} בתאריך ${formatDate(availabilityStart)}${availabilityEnd ? ` עד ${formatTime(availabilityEnd)} בתאריך ${formatDate(availabilityEnd)}` : ''}`
    : 'הרכב כרגע לא פנוי. נסה לשנות את פרטי ההזמנה כדי לבדוק פניות חדשות.';

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
            <p className="warning-text">{availabilityMessage}</p>
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