import React, { useState, useEffect } from 'react';
import { useGetCurrentUserQuery, useUpdateUserMutation } from '../redux/userApi';
import { FaUser, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFileAlt, FaStar, FaSignature } from 'react-icons/fa';
import '../Style/PersonalArea.css';

const PersonalArea = () => {
    const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    // State לניהול הודעת ההצלחה (Toast)
    const [showToast, setShowToast] = useState(false);

    // State לניהול השדות בטופס
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: ''
    });

    // סנכרון הנתונים מהשרת
    useEffect(() => {
        if (currentUser) {
            setFormData({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                phoneNumber: currentUser.phoneNumber || '',
                address: currentUser.address || ''
            });
        }
    }, [currentUser]);

    if (isLoading) return <div className="pa-loader">טוען נתונים...</div>;
    if (isError || !currentUser) return <div className="pa-error">לא ניתן לטעון נתונים. וודא שאתה מחובר.</div>;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await updateUser({ id: currentUser.id, ...formData }).unwrap();
            
            // הצגת ה-Toast במקום alert
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); 

        } catch (err) {
            console.error('Update failed:', err);
            // כאן אפשר להוסיף Toast של שגיאה אם רוצים
        }
    };

    return (
        <div className="pa-container">
            {/* הודעת הצלחה צפה */}
            {showToast && (
                <div className="toast-success">
                    <FaStar /> הפרטים עודכנו בהצלחה!
                </div>
            )}

            <div className="pa-header">
                <h2>אזור אישי - {formData.firstName} {formData.lastName}</h2>
                <div className="pa-header-info">
                    <span><FaUser className="pa-header-icon" /> שם: <strong>{formData.firstName} {formData.lastName}</strong></span>
                    <span className="pa-separator">|</span>
                    <span><FaFileAlt className="pa-header-icon" /> מזהה מערכת: {currentUser.id}</span>
                </div>
            </div>

            <div className="pa-content">
                <div className="pa-grid">
                    <div className="pa-field">
                        <label>שם פרטי</label>
                        <div className="pa-input-wrapper">
                            <input 
                                name="firstName" 
                                type="text" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                placeholder="הכנס שם פרטי"
                            />
                            <FaUser className="pa-field-icon" />
                        </div>
                    </div>

                    <div className="pa-field">
                        <label>שם משפחה</label>
                        <div className="pa-input-wrapper">
                            <input 
                                name="lastName" 
                                type="text" 
                                value={formData.lastName} 
                                onChange={handleChange} 
                                placeholder="הכנס שם משפחה"
                            />
                            <FaUser className="pa-field-icon" />
                        </div>
                    </div>

                    <div className="pa-field">
                        <label>כתובת רשומה</label>
                        <div className="pa-input-wrapper">
                            <input 
                                name="address" 
                                type="text" 
                                value={formData.address} 
                                onChange={handleChange} 
                                placeholder="עיר, רחוב ומספר"
                            />
                            <FaMapMarkerAlt className="pa-field-icon" />
                        </div>
                    </div>

                    <div className="pa-field">
                        <label>מספר טלפון</label>
                        <div className="pa-input-wrapper">
                            <input 
                                name="phoneNumber" 
                                type="text" 
                                value={formData.phoneNumber} 
                                onChange={handleChange} 
                                placeholder="05X-XXXXXXX"
                            />
                            <FaPhoneAlt className="pa-field-icon" />
                        </div>
                    </div>

                    <div className="pa-field pa-full-row">
                        <label>אימייל</label>
                        <div className="pa-input-wrapper">
                            <input 
                                name="email" 
                                type="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="example@mail.com"
                            />
                            <FaEnvelope className="pa-field-icon" />
                        </div>
                    </div>
                </div>

                <button 
                    className="pa-btn-save" 
                    onClick={handleSave}
                    disabled={isUpdating}
                >
                    {isUpdating ? 'שומר שינויים...' : 'שמור שינויים'}
                </button>
            </div>

            <div className="pa-cards">
                <div className="pa-card"><FaSignature className="pa-card-i" /><span>חתימה דיגיטלית</span></div>
                <div className="pa-card"><FaFileAlt className="pa-card-i" /><span>מסמכים</span></div>
                <div className="pa-card active"><FaStar className="pa-card-i" /><span>הטבות</span></div>
            </div>
        </div>
    );
};

export default PersonalArea;