import React, { useState } from 'react';
import { useGetOrdersByUserIdQuery } from '../redux/orderApi.jsx'; // וודא שהנתיב נכון
import '../Style/UserOrders.css'; 
const UserOrders = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // שליפת נתונים אמיתיים מהשרת לפי ה-ID של המשתמש
  const { data: orders = [], isLoading, isError, error } = useGetOrdersByUserIdQuery(userId, {
    skip: !userId, // אל תבצע קריאה אם אין ID
  });

  // פונקציית עזר לתרגום ה-Enum מהשרת לטקסט וצבע
  const getStatusDetails = (status) => {
    switch (status) {
      case 0: case 'Pending': return { label: 'ממתינה', class: 'status-pending' };
      case 1: case 'Active': return { label: 'פעילה', class: 'status-active' };
      case 2: case 'Completed': return { label: 'הושלמה', class: 'status-completed' };
      case 3: case 'Canceled': return { label: 'בוטלה', class: 'status-cancelled' };
      default: return { label: 'לא ידוע', class: '' };
    }
  };

  const filteredOrders = orders.filter(order => 
    order.carModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  if (isLoading) return <div className="orders-loading">טוען הזמנות...</div>;
  if (isError) return <div className="orders-error">שגיאה: {error?.message || 'לא ניתן לטעון נתונים'}</div>;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2 className="orders-title">ההזמנות שלי</h2>
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder="חפש לפי דגם רכב או מספר הזמנה..." 
            className="orders-search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusInfo = getStatusDetails(order.status);
            return (
              <div key={order.id} className="order-card">
                <div className={`order-card-accent ${statusInfo.class}`}></div>
                <div className="order-main-content">
                  <div className="order-top-row">
                    <span className="order-id">הזמנה #{order.id}</span>
                    <span className={`order-status ${statusInfo.class}`}>{statusInfo.label}</span>
                  </div>
                  
                  <div className="order-car-info">
                    <span className="order-car-model">{order.carModel || 'דגם לא ידוע'}</span>
                    <span className="order-pricing-type">{order.pricingType}</span>
                  </div>
                  
                  <div className="order-dates">
                    <div className="date-item">
                      <span className="date-label">התחלה:</span>
                      <span className="date-val">{new Date(order.startTime).toLocaleString('he-IL')}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">סיום משוער:</span>
                      <span className="date-val">{new Date(order.expectedEndTime).toLocaleString('he-IL')}</span>
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-payment-info">
                      {order.isPaid ? 
                        <span className="paid-tag">✅ שולם</span> : 
                        <span className="unpaid-tag">❌ טרם שולם</span>
                      }
                    </div>
                    <div className="order-price">
                      <span className="price-label">סה"כ לתשלום:</span>
                      <span className="price-val">₪{order.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-orders">לא נמצאו הזמנות.</div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;