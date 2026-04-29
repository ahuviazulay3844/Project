import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { 
    useLoginUserMutation, 
    useRegisterUserMutation, 
    userApi 
} from '../redux/userApi';
import { setUser } from '../redux/userSlice.jsx';
import '../Style/AuthPage.css';

const AuthPage = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', pass: '', firstName: '', lastName: '' });
    const [message, setMessage] = useState({ text: '', type: '' });

    const dispatch = useDispatch();
    const navigate = useNavigate(); 
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
                const result = await loginUser({ 
                    email: formData.email.trim().toLowerCase(), 
                    pass: formData.pass 
                }).unwrap();
                
                if (result) {
                    const token = typeof result === 'string' ? result : result.token;
                    localStorage.setItem('token', token);

                    // שליפת המשתמש
                    const userAction = await dispatch(userApi.endpoints.getCurrentUser.initiate());
                    const user = userAction.data;

                    if (user) {
                        console.log("User Type Received:", user.userType); // בדיקה ב-Console
                        
                        dispatch(setUser(user));
                        setMessage({ text: 'התחברת בהצלחה!', type: 'success' });
                        
                        // בדיקה גמישה: בודק גם מספר וגם מחרוזת
                        const isAdmin = user.userType == 1 || 
                                        user.userType === 'Admin' || 
                                        user.userType === '1';

                        if (isAdmin) {
                            console.log("Redirecting to Admin Dashboard...");
                            navigate('/admin');
                        } else {
                            setTimeout(() => onLoginSuccess(), 500);
                        }
                    }
                }
            } else {
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
            console.error("Login Error:", error);
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

export default AuthPage;