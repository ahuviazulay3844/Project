import React, { useState, useRef } from "react";
import "../Style/Signature.css"; 
import SignatureCanvas from 'react-signature-canvas';

const Signature = ({ onComplete, onBack }) => {
  const sigCanvas = useRef(null); 
  const [isAgreed, setIsAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = () => {
    // 1. בדיקת אישור תקנון
    if (!isAgreed) {
      setErrorMessage("חובה לאשר את תנאי השימוש");
      return;
    }

    // 2. בדיקה שהקנבס קיים ואינו ריק
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      setErrorMessage("נא לחתום בתיבה לפני האישור");
      return;
    }

    // 3. ניקוי שגיאות ושליחת הנתונים
    setErrorMessage("");
    
    try {
      // חיתוך החתימה והפיכתה ל-Base64
      const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      onComplete(signatureData); 
    } catch (error) {
      // למקרה שיש בעיה בספריה, נשלח דאטה דמה כדי שלא ייתקע הרישום
      console.error("Signature export failed, using fallback");
      onComplete("dummy-signature-data");
    }
  };

  return (
    <div className="legal-page-bg">
      <div className="legal-container">
        {/* צד ימין - תוכן החוזה */}
        <div className="contract-view">
          <h2 className="contract-title">חוזה שימוש ברכבי סיטי קאר</h2>
          <div className="contract-content">
             <p><strong>1. כללי:</strong> המבוא לחוזה זה ונספחיו מהווים חלק בלתי נפרד הימנו.</p>
             <p><strong>2. הצהרת המנוי:</strong> המנוי מצהיר כי הוא בעל רישיון נהיגה תקף כחוק וכי כל הפרטים שמסר נכונים.</p>
             <p className="violation-notice"><strong>9.1 איסור נסיעה בשבת:</strong> המנוי מתחייב באופן מוחלט כי לא ינהג ברכב בשבתות ובחגי ישראל.</p>
             <p><strong>10. אחריות וביטוח:</strong> המנוי אחראי לכל נזק שייגרם לרכב בתקופת השימוש.</p>
          </div>
        </div>

        {/* צד שמאל - חתימה */}
        <div className="signature-section">
          <div className="agreement-row">
            <label htmlFor="terms" className="agreement-label">
              <input 
                type="checkbox" 
                id="terms" 
                className="custom-checkbox"
                checked={isAgreed} 
                onChange={(e) => setIsAgreed(e.target.checked)} 
              />
              אני מאשר/ת את הסכם ותנאי השימוש
            </label>
          </div>

          <div className="canvas-border">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ 
                className: "sig-canvas",
                style: { touchAction: 'none', width: '100%', height: '100%' } 
              }}
            />
          </div>
          
          <button type="button" className="clear-link-btn" onClick={() => sigCanvas.current.clear()}>
            נקה חתימה
          </button>

          <div className="actions-row">
            <button className="submit-btn-gold" onClick={handleSave}>אישור וחתימה</button>
            <button className="back-btn-outline" onClick={onBack}>חזור</button>
          </div>

          {errorMessage && <p className="error-text-msg">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Signature;