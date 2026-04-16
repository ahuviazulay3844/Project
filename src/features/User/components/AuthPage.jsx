import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
    useLoginUserMutation, 
    useRegisterUserMutation, 
    userApi // ייבוא ה-api עצמו כדי להשתמש ב-initiate
} from '../redux/userApi';
import { setUser } from '../redux/userSlice.jsx';
import '../Style/AuthPage.css';

const AuthPage = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', pass: '', firstName: '', lastName: '' });
    const [message, setMessage] = useState({ text: '', type: '' });

    const dispatch = useDispatch();

    const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();
    const [registerUser, { isLoading: isRegLoading }] = useRegisterUserMutation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        
        try {
            if (isLogin) {
                // התחברות - שליחת אובייקט עם email ו-pass כפי שמוגדר ב-API שלך
                const result = await loginUser({ 
                    email: formData.email.trim().toLowerCase(), 
                    pass: formData.pass 
                }).unwrap();
                
                if (result) {
                    // שמירת טוקן
                    const token = typeof result === 'string' ? result : result.token;
                    localStorage.setItem('token', token);

                    // שליפת המשתמש הנוכחי (Users/current) באופן ידני
                    const userAction = await dispatch(userApi.endpoints.getCurrentUser.initiate());
                    const user = userAction.data;

                    if (user) {
                        dispatch(setUser(user));
                        setMessage({ text: 'התחברת בהצלחה!', type: 'success' });
                        setTimeout(() => onLoginSuccess(), 500);
                    }
                }
            } else {
                // הרשמה - שליחת אובייקט newUser
                await registerUser({
                    email: formData.email.trim().toLowerCase(),
                    password: formData.pass, 
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim()
                }).unwrap();

                setMessage({ text: 'נרשמת בהצלחה! כעת ניתן להתחבר', type: 'success' });
                setTimeout(() => setIsLogin(true), 2000);
            }
        } catch (error) {
            setMessage({ text: error?.data?.message || 'שגיאה בביצוע הפעולה', type: 'error' });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <img src="/logo.png" alt="City Car" className="logo" />
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

                    {message.text && (
                        <div className={`message-banner ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="main-btn" disabled={isLoginLoading || isRegLoading}>
                        {isLoginLoading || isRegLoading ? 'מבצע...' : (isLogin ? 'התחברות' : 'הרשמה')}
                    </button>
                </form>

                <div className="auth-footer">
                    <button onClick={() => setIsLogin(!isLogin)} type="button">
                        {isLogin ? 'עדיין אין לך חשבון? להרשמה' : 'כבר רשום? להתחברות'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;6