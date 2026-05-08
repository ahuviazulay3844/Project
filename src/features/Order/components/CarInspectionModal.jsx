import React, { useState } from 'react';
import { ClipboardCheck, Sparkles, Wind, AlertCircle, Send, X, Disc, Car } from 'lucide-react';
import '../Style/CarInspectionModal.css';

const CarInspectionModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [report, setReport] = useState({
    IsCleanInside: true,
    IsCleanOutside: true,
    IsAicConditionWorking: true,
    AnyNewDamage: false,
    HasFlatTire: false,
    DamageDescription: ""
  });

  if (!isOpen) return null;

  return (
    <div className="inspection-overlay" onClick={onClose}>
      <div className="inspection-modal" onClick={(e) => e.stopPropagation()} style={{ border: '1px solid #ddd', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)' }}>
        <button className="close-modal-x" onClick={onClose}><X size={24}/></button>
        
        <header className="inspection-header">
          <ClipboardCheck size={28} color="#4f46e5" />
          <h3 style={{ marginTop: '10px' }}>דיווח מצב רכב</h3>
          <p>אנא סמן את מצב הרכב כעת לטובת הכיסוי הביטוחי שלך</p>
        </header>

        <div className="inspection-form" style={{ background: '#f9fafb', padding: '15px', borderRadius: '15px', marginTop: '15px' }}>
          {[
            { id: 'IsCleanInside', label: 'נקי בפנים?', icon: <Sparkles size={18}/> },
            { id: 'IsCleanOutside', label: 'נקי בחוץ?', icon: <Car size={18}/> },
            { id: 'IsAicConditionWorking', label: 'מזגן תקין?', icon: <Wind size={18}/> },
            { id: 'HasFlatTire', label: 'יש פנצ\'ר?', icon: <Disc size={18}/>, danger: true },
            { id: 'AnyNewDamage', label: 'נזק חדש?', icon: <AlertCircle size={18}/>, danger: true }
          ].map((q) => (
            <div className="question-row" key={q.id}>
              <span style={{ fontWeight: '600', color: '#374151' }}>{q.icon} {q.label}</span>
              <div className="toggle-group">
                <button className={report[q.id] ? `active ${q.danger ? 'danger' : ''}` : ''} onClick={() => setReport({...report, [q.id]: true})}>כן</button>
                <button className={!report[q.id] ? `active ${!q.danger ? '' : ''}` : ''} onClick={() => setReport({...report, [q.id]: false})}>לא</button>
              </div>
            </div>
          ))}

          {report.AnyNewDamage && (
            <textarea 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '10px', minHeight: '80px' }}
              placeholder="פרט על הנזק שזיהית..." 
              value={report.DamageDescription}
              onChange={(e) => setReport({...report, DamageDescription: e.target.value})}
            />
          )}
        </div>

        <button className="submit-inspection-btn" disabled={isSubmitting} onClick={() => onSubmit(report)}>
          {isSubmitting ? "שולח דיווח..." : "שלח דיווח וסיים"} <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default CarInspectionModal;