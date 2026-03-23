import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import "../Style/Signature.css"; 

const Signature = ({ onComplete, onBack }) => {
  const sigCanvas = useRef({});
  const [isAgreed, setIsAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = () => {
    setErrorMessage("");
    if (!isAgreed) {
      setErrorMessage("חובה לאשר את תנאי השימוש");
      return;
    }
    if (sigCanvas.current.isEmpty()) {
      setErrorMessage("נא לחתום בתיבה");
      return;
    }
    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    onComplete(signatureData); 
  };

  return (
    <div className="legal-page-bg">
      <div className="legal-container">
        <div className="contract-view">
          <h2 className="contract-title">חוזה שימוש ברכבי סיטי קאר</h2>
          <div className="contract-content">
             <p><strong>1. כללי:</strong> המבוא לחוזה זה ונספחיו מהווים חלק בלתי נפרד הימנו.</p>
             <p><strong>2. הצהרת המנוי:</strong> המנוי מצהיר כי הוא בעל רישיון נהיגה תקף כחוק וכי כל הפרטים שמסר נכונים.</p>
             <p className="violation-notice"><strong>9.1 איסור נסיעה בשבת:</strong> המנוי מתחייב באופן מוחלט כי לא ינהג ברכב בשבתות ובחגי ישראל. הפרת סעיף זה תגרור קנס וביטול מיידי של המנוי.</p>
             <p><strong>10. אחריות וביטוח:</strong> המנוי אחראי לכל נזק שייגרם לרכב בתקופת השימוש, בכפוף לתנאי ההשתתפות העצמית.</p>
          </div>
        </div>

        <div className="signature-section">
          <div className="agreement-row">
            <input 
              type="checkbox" 
              id="terms" 
              className="custom-checkbox"
              checked={isAgreed} 
              onChange={(e) => setIsAgreed(e.target.checked)} 
            />
            <label htmlFor="terms" className="agreement-label">אני מאשר/ת את הסכם ותנאי השימוש</label>
          </div>

          <div className="canvas-border">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ className: "sig-canvas" }}
            />
          </div>
          
          <button type="button" className="clear-link-btn" onClick={() => sigCanvas.current.clear()}>נקה חתימה</button>
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