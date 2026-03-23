import React, { useState, useRef, useEffect } from 'react';
import "../Style/PersonalDetails.css";
import { 
    useSendVerificationCodeMutation, 
    useVerifyRegistrationCodeMutation,
    useRegisterUserMutation 
} from '../redux/userApi';

const PersonalQuestions = ({ onBack, userData, setUserData }) => {
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); 
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);

    const [sendCode, { isLoading: isSending }] = useSendVerificationCodeMutation();
    const [verifyCode, { isLoading: isVerifying }] = useVerifyRegistrationCodeMutation();
    const [register, { isLoading: isRegistering }] = useRegisterUserMutation();

    useEffect(() => {
        if (step === 4 && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [step]);

    const handleStepChange = (newStep) => {
        setError('');
        setStep(newStep);
    };

    const updateField = (field, value) => {
        setError('');
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    const sendEmail = async () => {
        const email = userData?.email?.trim().toLowerCase();
        if (!email) { setError("יש להזין כתובת מייל"); return; }
        try {
            await sendCode(email).unwrap();
            handleStepChange(4); 
        } catch (err) {
            setError(err.data?.message || "שגיאה בשליחת המייל");
        }
    };

    const verifyOtp = async () => {
        const fullCode = otp.join("").trim();
        if (fullCode.length < 6) { setError("יש להזין קוד מלא"); return; }
        try {
            await verifyCode({ email: userData.email.trim().toLowerCase(), code: fullCode }).unwrap();
            handleStepChange(5); // אחרי האימות עוברים לבחירת סיסמה ופרטים
        } catch (err) {
            setError("קוד שגוי או פג תוקף");
        }
    };

    const finalizeRegistration = async () => {
        if (!userData.phoneNumber || !userData.licenseNumber || !userData.passwordHash) {
            setError("חובה למלא את כל השדות, כולל סיסמה");
            return;
        }

        try {
            const finalData = {
                FirstName: userData.firstName?.trim(),
                LastName: userData.lastName?.trim(),
                Email: userData.email.trim().toLowerCase(),
                PhoneNumber: userData.phoneNumber.trim(),
                Password: userData.passwordHash, 
                LicenseNumber: userData.licenseNumber.trim(),
                UserType: "user",
                IsNewDriver: userData.isNewDriver || false,
                IsForeignCitizen: userData.isForeignCitizen || false,
                DateOfBirth: new Date(userData.dateOfBirth).toISOString(),
                LicenseExpirationDate: new Date(userData.licenseExpirationDate).toISOString(),
                Rank: "Bronze",
                IsBlocked: false
            };
            
            await register(finalData).unwrap();
            setIsSuccess(true);
            
            setTimeout(() => {
                window.location.href = "/";
            }, 3500);

        } catch (err) {
            setError(err.data?.message || "חלה שגיאה ברישום");
        }
    };

    if (isSuccess) {
        return (
            <div className="questions-page-bg">
                <div className="success-container-modern">
                    <div className="success-card">
                        <div className="success-check-icon">✓</div>
                        <h2>נרשמת בהצלחה!</h2>
                        <p>מערכת סיטי קאר שמחה להצטרפותך.</p>
                        <p>מייל ברוכים הבאים נשלח לכתובת: <b>{userData.email}</b></p>
                        <div className="progress-loader"><div className="progress-loader-bar"></div></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="questions-page-bg">
            <div className="questions-container">
                <div className="question-card">
                    <div className="card-header-purple">
                        <p className="header-sub-text">שלב {step} מתוך 6</p>
                        <h2 className="header-main-title">
                            {step === 5 ? "הגדרת חשבון" : step === 6 ? "רישיון נהיגה" : "פרטים אישיים"}
                        </h2>
                    </div>

                    <div className="card-body">
                        {step === 1 && (
                            <div className="step-fade-in">
                                <div className="input-wrapper">
                                    <input type="text" placeholder="שם פרטי" value={userData.firstName || ""} onChange={(e) => updateField('firstName', e.target.value)} />
                                </div>
                                <div className="input-wrapper">
                                    <input type="text" placeholder="שם משפחה" value={userData.lastName || ""} onChange={(e) => updateField('lastName', e.target.value)} />
                                </div>
                                <button className="gold-btn" onClick={() => handleStepChange(3)}>בואו נמשיך</button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step-fade-in">
                                <p className="info-label">מה המייל שלך?</p>
                                <div className="input-wrapper">
                                    <input type="email" placeholder="example@gmail.com" value={userData.email || ""} onChange={(e) => updateField('email', e.target.value)} />
                                </div>
                                <button className="gold-btn" onClick={sendEmail} disabled={isSending}>
                                    {isSending ? "שולח קוד..." : "שלחו לי קוד אימות"}
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="step-fade-in">
                                <p className="info-label">הזינו את הקוד מהמייל</p>
                                <div className="code-inputs" style={{ direction: 'ltr' }}>
                                    {otp.map((data, i) => (
                                        <input key={i} type="text" maxLength="1" className="code-square-oval" value={data} ref={el => (inputRefs.current[i] = el)} 
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            const newOtp = [...otp]; newOtp[i] = val; setOtp(newOtp);
                                            if (val && i < 5) inputRefs.current[i + 1].focus();
                                        }} 
                                        onKeyDown={e => e.key === "Backspace" && !otp[i] && i > 0 && inputRefs.current[i - 1].focus()} />
                                    ))}
                                </div>
                                <button className="gold-btn" onClick={verifyOtp} disabled={isVerifying}>אימות קוד</button>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="step-fade-in">
                                <div className="input-wrapper">
                                    <input type="password" placeholder="בחרו סיסמה (מינימום 6 תווים)" value={userData.passwordHash || ""} onChange={(e) => updateField('passwordHash', e.target.value)} />
                                </div>
                                <div className="input-wrapper">
                                    <input type="tel" placeholder="מספר טלפון" value={userData.phoneNumber || ""} onChange={(e) => updateField('phoneNumber', e.target.value)} />
                                </div>
                                <p className="header-sub-text">תאריך לידה:</p>
                                <div className="input-wrapper">
                                    <input type="date" value={userData.dateOfBirth || ""} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
                                </div>
                                <div className="checkbox-wrapper">
                                    <input type="checkbox" id="newDriver" checked={userData.isNewDriver || false} onChange={(e) => updateField('isNewDriver', e.target.checked)} />
                                    <label htmlFor="newDriver" style={{cursor:'pointer'}}>אני נהג/ת חדש/ה</label>
                                </div>
                                <button className="gold-btn" onClick={() => handleStepChange(6)}>שלב אחרון</button>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="step-fade-in">
                                <div className="input-wrapper">
                                    <input type="text" placeholder="מספר רישיון" maxLength="8" value={userData.licenseNumber || ""} onChange={(e) => updateField('licenseNumber', e.target.value)} />
                                </div>
                                <p className="header-sub-text">תפוגת רישיון:</p>
                                <div className="input-wrapper">
                                    <input type="date" value={userData.licenseExpirationDate || ""} onChange={(e) => updateField('licenseExpirationDate', e.target.value)} />
                                </div>
                                <button className="gold-btn" onClick={finalizeRegistration} disabled={isRegistering}>
                                    {isRegistering ? "מעבד..." : "סיום הרשמה"}
                                </button>
                            </div>
                        )}

                        {error && <p className="error-text" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
                    </div>

                    <button className="back-arrow-btn" onClick={() => step > 1 ? setStep(step === 3 ? 1 : step - 1) : onBack()}>
                        <span className="arrow-icon">➜</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalQuestions;