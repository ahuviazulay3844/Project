import React from "react";
import "../Style/Register.css";
// הסרנו את ה-useNavigate ואת ה-Import של UploadDocuments כי הניהול עובר לאבא
import personal_details from "../../../assets/imgi_9_step_personal_details.png";
import upload_documents from "../../../assets/imgi_10_step_upload_files.png";
import foreign_citizen from "../../../assets/imgi_11_step_foreign_citizen.png";
import signature from "../../../assets/imgi_12_step_sign.png";

const Register = ({ onStepClick }) => { // מקבלים את הפונקציה מה-MainPage

  return (
    <div className="register-page">
      <h2 className="title">תהליך הרשמה</h2>

      <div className="flow-wrapper">
        <svg className="flow-line" viewBox="0 0 400 650" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b3fa0" />
              <stop offset="100%" stopColor="#d7c3f3" />
            </linearGradient>
            <mask id="hole">
              <rect width="100%" height="100%" fill="white" />
              <circle cx="200" cy="70" r="55" fill="black" />
              <circle cx="200" cy="245" r="55" fill="black" />
              <circle cx="200" cy="420" r="55" fill="black" />
              <circle cx="200" cy="595" r="55" fill="black" />
            </mask>
          </defs>

          <path
            d="M200 70 
               C 400 150, 0 180, 200 245 
               C 400 325, 0 355, 200 420 
               C 400 500, 0 530, 200 595"
            stroke="url(#grad)"
            strokeWidth="70"
            fill="none"
            strokeLinecap="round"
            mask="url(#hole)"
          />
        </svg>

        {/* שלב 1: שאלות אישיות */}
        <div className="step-item s1 clickable" onClick={() => onStepClick('questions')}>
          <div className="circle-wrap"><img src={personal_details} alt="" /></div>
          <div className="text-wrap">
            <h3>פרטים אישיים</h3>
            <ul>
              <li>אימות פלאפון</li>
              <li>שם וכתובת</li>
              <li>אימות אימייל</li>
            </ul>
          </div>
        </div>

        {/* שלב 2: העלאת מסמכים */}
        <div className="step-item s2 clickable" onClick={() => onStepClick('upload')}>
          <div className="circle-wrap"><img src={upload_documents} alt="" /></div>
          <div className="text-wrap">
            <h3>העלאת מסמכים</h3>
            <ul>
              <li>רישיון נהיגה</li>
              <li>סלפי עם רישיון</li>
            </ul>
          </div>
        </div>

        {/* שלב 3: אזרח חו"ל */}
        <div className="step-item s3 clickable" onClick={() => onStepClick('foreign')}>
          <div className="circle-wrap"><img src={foreign_citizen} alt="" /></div>
          <div className="text-wrap">
            <h3>אזרח חו"ל?</h3>
            <ul>
              <li>דרכון וויזה</li>
              <li>אישור כניסה</li>
            </ul>
          </div>
        </div>

        {/* שלב 4: חתימה */}
        <div className="step-item s4 clickable" onClick={() => onStepClick('signature')}>
          <div className="circle-wrap"><img src={signature} alt="" /></div>
          <div className="text-wrap">
            <h3>חתימה</h3>
            <ul>
              <li>חתימה על התקנון</li>
            </ul>
          </div>
        </div>
      </div>

      {/* כפתור המשך - בדרך כלל מוביל לשלב הבא (העלאת מסמכים) */}
      <button className="continue-btn" onClick={() => onStepClick('upload')}>
        המשך
      </button>
    </div>
  );
};

export default Register;