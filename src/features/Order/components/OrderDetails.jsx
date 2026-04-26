import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrdersByUserIdQuery } from '../redux/orderApi.jsx';
import { ChevronRight, Calendar, MapPin, CreditCard, ShieldCheck, Info } from 'lucide-react';
import '../Style/OrderDetails.css';

const OrderDetails = ({ userId }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: orders = [] } = useGetOrdersByUserIdQuery(userId);
  const order = orders.find(o => o.id === parseInt(orderId));

  if (!order) return <div className="loader-container">הזמנה לא נמצאה...</div>;

  const formatDateFull = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('he-IL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  };

  return (
    <div className="details-page-wrapper">
      <div className="details-card-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
           <ChevronRight size={20} /> חזרה לנסיעות
        </button>

        <header className="details-main-header">
          <h1>סיכום נסיעה #{order.id}</h1>
          <span className="car-name-big">{order.carModel}</span>
        </header>

        <div className="details-content-grid">
          {/* זמנים ותאריכים מלאים */}
          <section className="info-section">
            <h3><Calendar size={18}/> זמני נסיעה</h3>
            <div className="info-row">
              <span>איסוף:</span>
              <strong>{formatDateFull(order.startTime)}</strong>
            </div>
            <div className="info-row">
              <span>החזרה מתוכננת:</span>
              <strong>{formatDateFull(order.expectedEndTime)}</strong>
            </div>
            <div className="info-row">
              <span>החזרה בפועל:</span>
              <strong>{order.endTime ? formatDateFull(order.endTime) : 'טרם הסתיים'}</strong>
            </div>
          </section>

          {/* פירוט כספי מלא */}
          <section className="info-section">
            <h3><CreditCard size={18}/> פירוט חשבון</h3>
            <div className="info-row">
              <span>מחיר בסיס ({order.pricingType}):</span>
              <span>₪{order.basePrice}</span>
            </div>
            {order.lateFee > 0 && (
              <div className="info-row danger-text">
                <span>קנס איחור:</span>
                <span>+ ₪{Math.round(order.lateFee)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="info-row success-text">
                <span>הנחה/פיצוי:</span>
                <span>- ₪{order.discountAmount}</span>
              </div>
            )}
            <div className="info-row total-row">
              <span>סה"כ לתשלום:</span>
              <strong>₪{Math.round(order.totalPrice)}</strong>
            </div>
          </section>

          {/* ביטוח ומידע נוסף */}
          <section className="info-section full-width">
            <h3><ShieldCheck size={18}/> ביטוח וסטטוס</h3>
            <p><strong>ביטוח:</strong> {order.wantsInsuranceUpgrade ? 'מורחב (ביטול השתתפות עצמית)' : 'סטנדרטי'}</p>
            <p><strong>מרחק שבוצע:</strong> {order.distanceDrivenKm || 0} ק"מ</p>
            <p><strong>סטטוס תשלום:</strong> {order.isPaid ? 'שולם במלואו ✅' : 'ממתין לסליקה ⏳'}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;