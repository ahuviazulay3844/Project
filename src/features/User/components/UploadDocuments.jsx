import React, { useState } from 'react';
import '../Style/UploadDocuments.css';
import idCardImg from '../../../assets/license_front.png';
import exampleLicenseImg from '../../../assets/ex_license_front.png';
import helpGif from '../../../assets/help_gif.gif'; 
const UploadDocuments = ({ onBack, onFinish, uploadData, setUploadData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const steps = [
    { title: "תמונה קדמית של רישיון נהיגה", sub: "חשבת שנביא לך רכב בלי לוודא שיש לך רישיון בתוקף?", label: "העלאת רישיון נהיגה קדמי" },
    { title: "תמונה אחורית של רישיון נהיגה", sub: "צריך גם את הצד השני כדי להשלים את התמונה.", label: "העלאת רישיון נהיגה אחורי" },
    { title: "סלפי עם הרישיון", sub: "חיוך למצלמה! ודאו שהפנים והרישיון ברורים.", label: "צילום סלפי עם הרישיון" }
  ];
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        // עדכון ה-State של MainPage
        setUploadData(prev => ({ ...prev, [currentStep]: base64String }));
        
        // מעבר אוטומטי לשלב הבא
        if (currentStep < 2) {
          setTimeout(() => setCurrentStep(currentStep + 1), 500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // בדיקה האם יש תמונות כפולות
  const hasDuplicates = () => {
    const images = [uploadData[0], uploadData[1], uploadData[2]].filter(img => img !== null);
    return new Set(images).size !== images.length;
  };

  const isAllUploaded = uploadData[0] && uploadData[1] && uploadData[2];

  return (
    <div className="upload-page-container">
      {/* עיצוב צדדי */}
      <div className="square-decoration">
        <p className="decoration-text">העלאת <br /> מסמכים</p>
        <div className="circle-icon-decoration">
           <img src={idCardImg} alt="Passport Icon" className="main-icon-img" />
        </div>
      </div>

      <div className="upload-main-content">
        {/* עיגולי סטפר למעלה */}
        <div className="stepper-dots-container">
          {[0, 1, 2].map((step) => (
            <div 
              key={step} 
              className={`step-dot ${currentStep === step ? 'active' : ''} ${uploadData[step] ? 'filled' : ''}`}
              onClick={() => setCurrentStep(step)}
            >
              {uploadData[step] ? '✓' : step + 1}
            </div>
          ))}
        </div>

        <h2 className="main-title">{steps[currentStep].title}</h2>
        <p className="sub-title">{steps[currentStep].sub}</p>
        
        <div className="upload-box-wrapper">
          <div className="help-icon" onClick={() => setShowExample(true)}>
            <img src={helpGif} alt="Help" className="help-gif-img" />
          </div>
          
          <label htmlFor="file-upload" className="upload-dropzone">
            {uploadData[currentStep] ? (
              <img src={uploadData[currentStep]} alt="Preview" className="upload-preview-img" />
            ) : (
              <span className="upload-link">{steps[currentStep].label}</span>
            )}
            <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" hidden />
          </label>
        </div>

        {/* הודעת שגיאה אם יש כפילות */}
        {isAllUploaded && hasDuplicates() && (
          <p className="error-message-text">נראה שהעלית תמונות זהות. נא לוודא שכל המסמכים שונים.</p>
        )}

        {/* חץ צהוב - חזרה לרישום */}
        <button className="bottom-back-btn" onClick={onBack}>➜</button>

        {/* כפתור סיום - יופיע רק אם הכל הועלה ואין כפילויות */}
        {isAllUploaded && !hasDuplicates() && (
          <button className="finish-btn" onClick={onFinish}>
            סיום והמשך
          </button>
        )}
      </div>

      {/* מודל דוגמה */}
      {showExample && (
        <div className="example-modal-overlay" onClick={() => setShowExample(false)}>
          <div className="example-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowExample(false)}>×</button>
            <h3 className="modal-title">דוגמה לרישיון נהיגה</h3>
            <img src={exampleLicenseImg} alt="Example License" className="example-img-fluid" />
            <p className="modal-desc">ודאו שהתמונה ברורה וכל הפרטים קריאים</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocuments;