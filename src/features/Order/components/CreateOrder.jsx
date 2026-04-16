import React from 'react';
import { useCreateOrderMutation } from '../redux/orderApi.jsx';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../Style/CreateOrder.css';

const CreateOrder = ({ selectedCar, orderDetails, hasWaiver, onBack, onGoToStep }) => {
    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user.currentUser);
    const token = localStorage.getItem('token');

    const carBrand = selectedCar?.Brand || selectedCar?.brand || "רכב";
    const carModel = selectedCar?.Model || selectedCar?.model || "לא נבחר";
    const station = selectedCar?.startParking || selectedCar?.StartParking || "תחנה ראשית";
    
    const startTime = orderDetails?.start || orderDetails?.startTime;
    const endTime = orderDetails?.end || orderDetails?.expectedEndTime || orderDetails?.endTime;
    
    const daysFromUser = orderDetails?.totalDays || 0;
    const hoursFromUser = orderDetails?.totalHours || 0;
    const waiverCost = hasWaiver ? (daysFromUser * 50) + (hoursFromUser * 3) : 0;

    const handleBooking = async () => {
        if (!currentUser && token) {
            alert("מזהה משתמש... אנא נסה ללחוץ שוב בעוד רגע.");
            return;
        }

        if (!currentUser) {
            alert("נראה שאינך מחובר. אנא התחבר כדי לבצע הזמנה.");
            return;
        }

        const orderDto = {
            // שולח את ה-ID הנכון מהמשתמש המחובר
            userId: currentUser.id || currentUser.Id, 
            startTime: new Date(startTime).toISOString(),
            expectedEndTime: new Date(endTime).toISOString(),
            carId: Number(selectedCar.id || selectedCar.Id),
            wantsInsuranceUpgrade: Boolean(hasWaiver),
            pricingType: daysFromUser > 0 ? "ByDay" : "ByHour",
            totalDays: Number(daysFromUser),
            totalHours: Number(hoursFromUser),
            status: 1 
        };

        try {
            await createOrder(orderDto).unwrap();
            alert("ההזמנה בוצעה בהצלחה!");
            navigate('/my-orders'); 
        } catch (err) {
            alert(err.data?.message || "שגיאה בביצוע ההזמנה");
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '---';
        return new Date(dateStr).toLocaleString('he-IL', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit'
        });
    };

    return (
        <div className="order-final-container">
            <h2 className="order-title">סיכום פרטי הזמנה</h2>
            <div className="order-details-card">
                <div className="detail-row">
                    <span className="detail-label">מזמין ההזמנה:</span>
                    <span className="detail-value">
                        {currentUser?.firstName || 'טוען...'} {currentUser?.lastName || ''}
                    </span>
                </div>
                <div className="order-divider"></div>
                <div className="detail-row clickable" onClick={() => onGoToStep(2)}>
                    <span className="detail-label">רכב נבחר:</span>
                    <span className="detail-value link-text">{carBrand} {carModel}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">תחנת איסוף והחזרה:</span>
                    <span className="detail-value">{station}</span>
                </div>
                <div className="order-divider"></div>
                <div className="detail-row clickable" onClick={() => onGoToStep(1)}>
                    <span className="detail-label">תחילת נסיעה:</span>
                    <span className="detail-value link-text" dir="ltr">{formatDateTime(startTime)}</span>
                </div>
                <div className="detail-row clickable" onClick={() => onGoToStep(1)}>
                    <span className="detail-label">סיום נסיעה:</span>
                    <span className="detail-value link-text" dir="ltr">{formatDateTime(endTime)}</span>
                </div>
                <div className="order-divider"></div>
                <div className="detail-row">
                    <span className="detail-label">זמן לחיוב:</span>
                    <span className="detail-value">
                        {daysFromUser > 0 ? `${daysFromUser} ימים ` : ''}
                        {hoursFromUser > 0 ? `${hoursFromUser} שעות` : ''}
                        {daysFromUser === 0 && hoursFromUser === 0 ? 'שעה אחת' : ''}
                    </span>
                </div>
                <div className="detail-row clickable" onClick={() => onGoToStep(3)}>
                    <span className="detail-label">כיסוי ביטוחי:</span>
                    <span className="detail-value link-text">
                        {hasWaiver ? `ביטול השתתפות עצמית (₪${waiverCost})` : 'ללא כיסוי'}
                    </span>
                </div>
                <div className="order-divider"></div>
                <p className="order-note">* החיוב הסופי יבוצע בסיום הנסיעה בהתאם לנתוני השימוש בפועל.</p>
            </div>
            <div className="order-actions">
                <button className="order-btn-secondary" onClick={onBack}>חזור</button>
                <button 
                    className="order-btn-primary" 
                    onClick={handleBooking} 
                    disabled={isLoading || (token && !currentUser)}
                >
                    {isLoading ? "מעבד..." : "אישור הזמנה"}
                </button>
            </div>
        </div>
    );
};

export default CreateOrder;