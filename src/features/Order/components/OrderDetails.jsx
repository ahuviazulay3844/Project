import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetOrdersByUserIdQuery } from '../redux/orderApi.jsx';
import { useGetAllCarsQuery } from '../../Car/redux/carApi.jsx'; 
import MainLayout from '../../User/components/MainLayout.jsx';
import { 
  ChevronRight, CreditCard, Loader2, AlertCircle, MapPin, 
  AlertTriangle, Clock, ArrowRight, CheckCircle, Info, Fuel
} from 'lucide-react';
import '../Style/OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser) || JSON.parse(localStorage.getItem('user'));
  const userId = currentUser?.id;

  const { data: orders = [], isLoading: ordersLoading, isError } = useGetOrdersByUserIdQuery(userId, {
    skip: !userId,
  });

  const { data: cars = [] } = useGetAllCarsQuery();

  const order = useMemo(() => orders.find(o => String(o.id) === String(id)), [orders, id]);
  const carData = useMemo(() => cars.find(c => c.id === order?.carId), [cars, order]);

  if (ordersLoading) return <div className="loader-full-page"><Loader2 className="spinner-icon pulse" size={50} /></div>;

  if (!order || isError) {
    return (
      <MainLayout currentUser={currentUser} onLogoClick={() => navigate('/')}>
        <div className="error-container">
          <AlertCircle size={60} color="#ff4d4f" />
          <h2>הזמנה לא נמצאה</h2>
          <button className="back-to-home-btn" onClick={() => navigate('/orders')}>חזרה לרשימה</button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout currentUser={currentUser} onLogoClick={() => navigate('/')}>
      <div className="details-container-new">
        <div className="breadcrumb-nav">
          <button className="text-link-btn" onClick={() => navigate('/orders')}>הנסיעות שלי</button>
          <ChevronRight size={14} />
          <span className="current-page">סיכום נסיעה #{order.id}</span>
        </div>

        <div className="order-details-card">
          <header className="order-header-section">
            <div className="title-area">
              <span className="order-id-tag">נסיעה שהושלמה</span>
              <h1 className="car-name-title">{order.carModel}</h1>
            </div>
            <button className="close-details-btn" onClick={() => navigate('/orders')}>
              <ArrowRight size={20} /> חזרה לרשימה
            </button>
          </header>

          <div className="order-main-layout">
            <div className="order-visual-side">
              {carData?.imageUrl && (
                <div className="car-image-big-wrapper">
                  <img src={carData.imageUrl} alt={order.carModel} className="car-image-big" />
                  <div className="plate-number-display">{carData.licensePlate}</div>
                </div>
              )}
              <div className="car-specs-mini">
                <div className="spec-pill"><Fuel size={16}/> {carData?.fuelType || 'חשמלי'}</div>
                <div className="spec-pill"><Info size={16}/> {carData?.year || '2024'}</div>
              </div>
            </div>

            <div className="order-info-side">
              <div className="info-grid">
                <div className="info-card">
                  <h3><Clock size={18} /> זמני נסיעה</h3>
                  <div className="time-line-vertical">
                    <div className="time-entry">
                      <div className="dot start"></div>
                      <label>איסוף:</label>
                      <strong>{new Date(order.startTime).toLocaleString('he-IL')}</strong>
                    </div>
                    <div className="time-entry">
                      <div className="dot end"></div>
                      <label>סיום בפועל:</label>
                      <strong>{new Date(order.endTime).toLocaleString('he-IL')}</strong>
                    </div>
                  </div>
                </div>

                <div className="info-card financial highlight-card">
                  <h3><CreditCard size={18} /> סיכום חיוב סופי</h3>                 
            <div className="price-breakdown">
  <h4 className="breakdown-subtitle">פירוט חיובי נסיעה</h4>
  
  {/* 1. עלות השכרה בסיסית */}
  <div className="price-row">
    <span>עלות השכרה ({order.pricingType === 'Daily' ? 'מסלול יומי' : 'מסלול שעתי'}):</span>
    <span className="price-value">₪{order.basePrice}</span>
  </div>

  {/* 2. תוספת נהג חדש - מוצג רק אם המשתמש נהג חדש */}
  {(order.isNewDriver || currentUser?.isNewDriver) && (
    <div className="price-row extra-charge">
      <span><AlertCircle size={14} /> תוספת נהג חדש (ביטוח):</span>
      <span className="price-value">+ ₪50</span>
    </div>
  )}

  {/* 3. חיוב קילומטראז' */}
  <div className="price-row">
    <span>מרחק נסיעה ({order.distanceDrivenKm || 0} ק"מ):</span>
    <span className="price-value">₪{Math.round((order.distanceDrivenKm || 0) * (carData?.pricePerKm || 1.5))}</span>
  </div>

  {/* 4. קנס איחור - מוצג רק אם קיים */}
  {order.lateFee > 0 && (
    <div className="price-row penalty-row">
      <span><AlertTriangle size={14} /> דמי איחור בהחזרה:</span>
      <span className="price-value">+ ₪{Math.round(order.lateFee)}</span>
    </div>
  )}

  {/* 5. זיכוי על תדלוק - מוצג בירוק עם סימן מינוס */}
  {order.didCustomerRefuel && (
    <div className="price-row credit-row">
      <span><Fuel size={14} /> בונוס מילוי דלק (זיכוי):</span>
      <span className="success-text">- ₪30</span>
    </div>
  )}

  {/* 6. הנחת קופון או פיצוי על רכב חלופי */}
  {(order.discountAmount > 0 || order.isReassigned) && (
    <div className="price-row credit-row">
      <span><CheckCircle size={14} /> הטבת פיצוי / הנחה:</span>
      <span className="success-text">- ₪{order.discountAmount || 30}</span>
    </div>
  )}

  <div className="total-divider"></div>
  
  <div className="final-price-row">
    <div className="final-label-group">
        <span className="total-label">סה"כ לתשלום</span>
        <span className="tax-note">(כולל מע"מ)</span>
    </div>
    <span className="price-big">₪{Math.round(order.totalPrice)}</span>
  </div>

  <div className="payment-confirmation-box">
    <CheckCircle size={16} /> התשלום נגבה בהצלחה מכרטיס האשראי
  </div>
                    {/* <div className="payment-status-success">
                      <CheckCircle size={18} /> התשלום בוצע באופן אוטומטי
                    </div> */}
                  </div>
                </div>

                <div className="info-card summary-box">
                    <h3><MapPin size={18} /> נתונים נוספים</h3>
                    <p>נסיעה זו נסגרה לאחר וידוא נעילת דלתות ובדיקת מערכות. הקבלה נשלחה לכתובת המייל המעודכנת בחשבון.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetails;