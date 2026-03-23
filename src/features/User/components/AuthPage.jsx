import React, { useState } from 'react';
import axios from 'axios';
import '../Style/AuthPage.css'; // נוסיף את העיצוב מיד בהמשך

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true); // מעבר בין מצב התחברות להרשמה
    const [formData, setFormData] = useState({ email: '', pass: '', firstName: '', lastName: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            if (isLogin) {
                // לוגיקת התחברות
                const response = await axios.post('https://localhost:xxxx/api/User/login', {
                    email: formData.email,
                    pass: formData.pass
                });
                
                if (response.data) {
                    localStorage.setItem('token', response.data);
                    setMessage({ text: 'התחברת בהצלחה! מעביר לדף הבית...', type: 'success' });
                    // window.location.href = '/home';
                }
            } else {
                // לוגיקת הרשמה
                const response = await axios.post('https://localhost:xxxx/api/User/add', {
                    email: formData.email,
                    password: formData.pass,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                });

                if (response.status === 200) {
                    setMessage({ text: 'נרשמת בהצלחה! כעת ניתן להתחבר', type: 'success' });
                    setIsLogin(true); // מעביר אותו להתחברות אחרי הרשמה
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && !isLogin) {
                setMessage({ text: 'משתמש עם אימייל זה כבר קיים. אנא בצע התחברות.', type: 'error' });
            } else {
                setMessage({ text: 'שגיאה בביצוע הפעולה. בדוק את הפרטים.', type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <img src="/city-car-logo.png" alt="City Car" className="logo" />
                    <h2>{isLogin ? 'ברוכים הבאים לסיטי קאר' : 'יצירת חשבון חדש'}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="name-row">
                            <input type="text" name="firstName" placeholder="שם פרטי" onChange={handleChange} required />
                            <input type="text" name="lastName" placeholder="שם משפחה" onChange={handleChange} required />
                        </div>
                    )}
                    <input type="email" name="email" placeholder="אימייל" onChange={handleChange} required />
                    <input type="password" name="pass" placeholder="סיסמה" onChange={handleChange} required />

                    {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

                    <button type="submit" className="main-btn" disabled={loading}>
                        {loading ? 'מבצע...' : (isLogin ? 'התחברות' : 'הרשמה')}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>{isLogin ? 'אין לך חשבון?' : 'כבר רשום במערכת?'}</span>
                    <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'להרשמה' : 'להתחברות'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;