import React from 'react';
import { useGetCurrentUserQuery } from '../redux/userApi'; // ודאי שהנתיב נכון
import { FaUser, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCreditCard, FaCalendarAlt, FaFileAlt, FaCommentDots, FaStar, FaWallet, FaSignature } from 'react-icons/fa';
import '../Style/PersonalArea.css';

const PersonalArea = () => {
    // שליפת המשתמש המחובר ישירות מהשרת (משתמש בטוקן מה-Headers)
    const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery();

    if (isLoading) return <div className="pa-loader">טוען נתונים...</div>;
    
    if (isError || !currentUser) {
        return <div className="pa-error">לא ניתן לטעון נתוני משתמש. וודא שאתה מחובר.</div>;
    }

    // מיפוי הנתונים מה-DTO של ה-C#
    const userDisplay = {
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        email: currentUser.email,
        phone: currentUser.phoneNumber || "לא עודכן",
        address: currentUser.address || "לא עודכנה כתובת",
        id: currentUser.id.toString()
    };

    return (
        <div className="pa-container">
            <div className="pa-header">
                <h2>אזור אישי - {currentUser.firstName}</h2>
                <div className="pa-header-info">
                    <span><FaUser className="pa-header-icon" /> שם: <strong>{userDisplay.name}</strong></span>
                    <span className="pa-separator">|</span>
                    <span><FaFileAlt className="pa-header-icon" /> מזהה מערכת: {userDisplay.id}</span>
                    <span className="pa-separator">|</span>
                    <span>סוג מנוי: {currentUser.userType || "רגיל"}</span>
                </div>
            </div>

            <div className="pa-content">
                <div className="pa-grid">
                    <div className="pa-field">
                        <label>שם מלא</label>
                        <div className="pa-input-wrapper">
                            <input type="text" value={userDisplay.name} readOnly />
                            <FaUser className="pa-field-icon" />
                        </div>
                    </div>

                    <div className="pa-field">
                        <label>כתובת רשומה</label>
                        <div className="pa-input-wrapper">
                            <input type="text" value={userDisplay.address} readOnly />
                            <FaMapMarkerAlt className="pa-field-icon" />
                        </div>
                    </div>

                    <div className="pa-field">
                        <label>מספר טלפון</label>
                        <div className="pa-input-wrapper">
                            <input type="text" value={userDisplay.phone} readOnly />
                            <FaPhoneAlt className="pa-field-icon" />
                        </div>
                    </div>

                    <div className="pa-field">
                        <label>אימייל</label>
                        <div className="pa-input-wrapper">
                            <input type="email" value={userDisplay.email} readOnly />
                            <FaEnvelope className="pa-field-icon" />
                        </div>
                    </div>
                </div>

                <div className="pa-full-row">
                    <span className="pa-label-center">שינוי סיסמה</span>
                    <div className="pa-pill-box">
                        <span className="pa-edit">עדכן סיסמה</span>
                        <FaSignature className="pa-box-icon" />
                    </div>
                </div>
            </div>

            <div className="pa-cards">
                <div className="pa-card"><FaSignature className="pa-card-i" /><span>חתימה דיגיטלית</span></div>
                <div className="pa-card"><FaFileAlt className="pa-card-i" /><span>מסמכים</span></div>
                <div className="pa-card"><FaCommentDots className="pa-card-i" /><span>פניות</span></div>
                <div className="pa-card active"><FaStar className="pa-card-i" /><span>הטבות</span></div>
                <div className="pa-card"><FaWallet className="pa-card-i" /><span>ארנק</span></div>
            </div>
        </div>
    );
};

export default PersonalArea;