import React from 'react';
import { useCreateOrderMutation } from '../redux/orderApi.jsx';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../Style/CreateOrder.css';

const CreateOrder = ({ selectedCar, orderDetails, onBack, onGoToStep }) => {
    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user.currentUser);

    const carBrand = selectedCar?.Brand || selectedCar?.brand || "רכב";
    const carModel = selectedCar?.Model || selectedCar?.model || "לא נבחר";
    const station = selectedCar?.startParking || selectedCar?.StartParking || "תחנה ראשית";
    
    const startTime = orderDetails?.startTime || orderDetails?.start;
    const endTime = orderDetails?.endTime || orderDetails?.end;
    const days = orderDetails?.totalDays || Math.floor((orderDetails?.billableHours || 0) / 24);
    const hours = orderDetails?.totalHours || (orderDetails?.billableHours || 0) % 24;
    const hasWaiver = orderDetails?.hasWaiver;
    const waiverCost = hasWaiver ? (days * 50) + (hours * 3) : 0;

    const handleBooking = async () => {
        if (!currentUser) {
            alert("נראה שאינך מחובר.");
            return;
        }

        const orderDto = {
            userId: currentUser.id || currentUser.Id, 
            startTime: startTime ? new Date(startTime).toISOString() : null,
            expectedEndTime: endTime ? new Date(endTime).toISOString() : null,
            carId: Number(selectedCar?.id || selectedCar?.Id),
            wantsInsuranceUpgrade: Boolean(hasWaiver),
            pricingType: days > 0 ? "ByDay" : "ByHour",
            totalDays: Number(days),
            totalHours: Number(hours),
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

    const formatDateTime = (date) => {
        if (!date) return '---';
        return new Date(date).toLocaleString('he-IL', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
        });
    };

    return (
        <div className="order-final-container">
            <h2 className="order-title">סיכום פרטי הזמנה</h2>
            <div className="order-details-card">
                <div className="detail-row">
                    <span className="detail-label">מזמין:</span>
                    <span className="detail-value">{currentUser?.firstName} {currentUser?.lastName}</span>
                </div>
                <div className="order-divider"></div>
                <div className="detail-row clickable" onClick={() => onGoToStep(2)}>
                    <span className="detail-label">רכב:</span>
                    <span className="detail-value link-text">{carBrand} {carModel}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">תחנת איסוף והחזרה:</span>
                    <span className="detail-value">{station}</span>
                </div>
                <div className="order-divider"></div>
                
                {/* פיצול ל-2 שורות זמן כפי שביקשת */}
                <div className="detail-row clickable" onClick={() => onGoToStep(1)}>
                    <span className="detail-label">זמן איסוף:</span>
                    <span className="detail-value link-text" dir="ltr">{formatDateTime(startTime)}</span>
                </div>
                <div className="detail-row clickable" onClick={() => onGoToStep(1)}>
                    <span className="detail-label">זמן החזרה:</span>
                    <span className="detail-value link-text" dir="ltr">{formatDateTime(endTime)}</span>
                </div>

                <div className="order-divider"></div>
                <div className="detail-row clickable" onClick={() => onGoToStep(3)}>
                    <span className="detail-label">ביטוח:</span>
                    <span className="detail-value link-text">
                        {hasWaiver ? `ביטול השתתפות (₪${waiverCost})` : 'בסיסי'}
                    </span>
                </div>
            </div>
            <div className="order-actions">
                <button className="order-btn-secondary" onClick={onBack}>חזור</button>
                <button className="order-btn-primary" onClick={handleBooking} disabled={isLoading}>
                    {isLoading ? "מעבד..." : "אישור הזמנה"}
                </button>
            </div>
        </div>
    );
};

export default CreateOrder;