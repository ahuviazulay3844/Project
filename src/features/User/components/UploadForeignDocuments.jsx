import React, { useState } from 'react';
import '../Style/UploadDocuments.css'; // משתמשים באותו CSS!
import idCardImg from '../../../assets/license_front.png';

const UploadForeignDocuments = ({ onBack, onFinish, uploadData, setUploadData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { title: "צילום דרכון", sub: "ודאו שכל פרטי הדרכון ברורים וקריאים.", label: "העלאת צילום דרכון" },
    { title: "צילום ויזה / אשרה", sub: "יש לצרף את אשרת השהייה בתוקף.", label: "העלאת צילום ויזה" },
    { title: "אישור כניסה לישראל", sub: "הפתק הכחול שמקבלים בביקורת הגבולות.", label: "העלאת אישור כניסה" }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadData(prev => ({ ...prev, [`foreign_${currentStep}`]: reader.result }));
        if (currentStep < 2) setTimeout(() => setCurrentStep(currentStep + 1), 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const isAllUploaded = uploadData['foreign_0'] && uploadData['foreign_1'] && uploadData['foreign_2'];

  return (
    <div className="upload-page-container">
      <div className="square-decoration">
        <p className="decoration-text">מסמכי <br /> חו"ל</p>
        <div className="circle-icon-decoration">
           <img src={idCardImg} alt="ID Card" className="main-icon-img" />
        </div>
      </div>
      <div className="upload-main-content">
        <div className="stepper-dots-container">
          {[0, 1, 2].map((step) => (
            <div key={step} className={`step-dot ${currentStep === step ? 'active' : ''} ${uploadData[`foreign_${step}`] ? 'filled' : ''}`} onClick={() => setCurrentStep(step)}>
              {uploadData[`foreign_${step}`] ? '✓' : step + 1}
            </div>
          ))}
        </div>
        <h2 className="main-title">{steps[currentStep].title}</h2>
        <p className="sub-title">{steps[currentStep].sub}</p>
        <label htmlFor="file-upload-foreign" className="upload-dropzone">
          {uploadData[`foreign_${currentStep}`] ? (
            <img src={uploadData[`foreign_${currentStep}`]} alt="Preview" className="upload-preview-img" />
          ) : (
            <span className="upload-link">{steps[currentStep].label}</span>
          )}
          <input id="file-upload-foreign" type="file" onChange={handleFileChange} accept="image/*" hidden />
        </label>
        <button className="bottom-back-btn" onClick={onBack}>➜</button>
        {isAllUploaded && <button className="finish-btn" onClick={onFinish}>סיום והמשך</button>}
      </div>
    </div>
  );
};

export default UploadForeignDocuments;