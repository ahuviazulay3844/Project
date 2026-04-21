import React, { useState, useMemo } from 'react';
import '../Style/CoverageSidePanel.css';

export default function CoverageSidePanel({ selectedCar, orderDetails, onClose, onConfirm }) {
  const [waiver, setWaiver] = useState(() => {
    const saved = localStorage.getItem('coverage_waiver');
    return saved ? JSON.parse(saved) : false;
  });

  const billableHours = useMemo(() => {
    if (!orderDetails?.start || !orderDetails?.end) return 1;
    const diffMs = new Date(orderDetails.end) - new Date(orderDetails.start);
    const hrs = Math.ceil(diffMs / (1000 * 60 * 60));
    return Math.max(1, hrs);
  }, [orderDetails]);

  const fullDays = Math.floor(billableHours / 24);
  const remainingHours = billableHours % 24;
  const waiverCost = (fullDays * 50) + (remainingHours * 3);

  const isBlocked = useMemo(() => {
    if (!orderDetails?.end) return false;
    const end = new Date(orderDetails.end);
    return (end.getDay() === 5 && end.getHours() >= 16) || (end.getDay() === 6 && end.getHours() < 20);
  }, [orderDetails]);

  const handleFinalConfirm = () => {
    if (isBlocked) return;
    localStorage.setItem("coverage_waiver", JSON.stringify(waiver));
    onConfirm({ billableHours, hasWaiver: waiver });
  };

  return (
    <div className="coverage-modal-overlay">
      <div className="coverage-card">
        <button className="close-x" onClick={onClose}>×</button>
        <h2 className="car-title">ביטול השתתפות עצמית</h2>
        <div className="selection-area">
          <p className="summary-text">זמן לחיוב: <strong>{fullDays > 0 ? `${fullDays} ימים ` : ''}{remainingHours > 0 || fullDays === 0 ? `${remainingHours} שעות` : ''}</strong></p>
          <div className={`custom-waiver-row ${waiver ? 'active' : ''}`} onClick={() => setWaiver(!waiver)}>
            <div className="waiver-info"><span className="waiver-label">ביטול השתתפות עצמית</span><span className="waiver-subtext">3₪ לשעה / 50₪ ליום</span></div>
            <div className="waiver-selection"><span className="price-tag">₪{waiverCost}</span><div className={`custom-checkbox ${waiver ? 'checked' : ''}`}>{waiver && <span className="check-mark">✓</span>}</div></div>
          </div>
        </div>
        {isBlocked && <div className="shabbat-alert"><strong>🕯️ זמני החזרה אינם זמינים בשבת</strong></div>}
        <button className={`confirm-btn ${isBlocked ? 'disabled' : ''}`} disabled={isBlocked} onClick={handleFinalConfirm}>
          {isBlocked ? 'מועד לא זמין' : `אישור ${waiver ? `(₪${waiverCost})` : 'ללא כיסוי'}`}
        </button>
      </div>
    </div>
  );
}