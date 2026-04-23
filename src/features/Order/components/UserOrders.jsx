import React, { useState, useMemo } from 'react';
import { useGetOrdersByUserIdQuery, useFinishOrderMutation } from '../redux/orderApi.jsx';
import { useUpdateCarLockMutation, useGetAllCarsQuery } from '../../Car/redux/carApi.jsx'; 
import { Lock, Unlock, Calendar, CreditCard, Search, MapPin, CheckCircle2, AlertCircle, Flag, Gauge, FileCheck } from 'lucide-react';
import '../Style/UserOrders.css';

const UserOrders = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const { data: orders = [], isLoading: ordersLoading } = useGetOrdersByUserIdQuery(userId, { skip: !userId });
  const { data: cars = [], isLoading: carsLoading } = useGetAllCarsQuery();

  const [updateCarLock] = useUpdateCarLockMutation();
  const [finishOrder] = useFinishOrderMutation();

  const handleFinish = async (orderId) => {
    try {
      setActionLoading(`finish-${orderId}`);
      await finishOrder({ id: orderId }).unwrap(); 
      alert("הנסיעה הסתיימה בהצלחה!");
    } catch (err) {
      alert("שגיאה בסיום הנסיעה");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 0: return { label: 'ממתינה', class: 'status-pending', icon: <AlertCircle size={14}/> };
      case 1: return { label: 'בנסיעה', class: 'status-active', icon: <CheckCircle2 size={14}/> };
      case 2: return { label: 'הושלמה', class: 'status-completed', icon: <CheckCircle2 size={14}/> };
      default: return { label: 'בוטלה', class: 'status-cancelled', icon: <AlertCircle size={14}/> };
    }
  };

  const filteredOrders = useMemo(() => {
    return [...orders].sort((a,b) => b.id - a.id).filter(order => 
      order.carModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
    );
  }, [orders, searchTerm]);

  if (ordersLoading || carsLoading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="orders-page-wrapper">
      <div className="orders-container">
        <header className="orders-header">
          <div className="title-section">
            <h2 className="orders-title">הנסיעות שלי</h2>
            <p className="subtitle">ניהול ומעקב הזמנות אישי בזמן אמת</p>
          </div>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="חפש דגם או מספר הזמנה..." 
              className="orders-search-input"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="orders-grid">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusDetails(order.status);
            const isActive = order.status === 1;
            const isCompleted = order.status === 2;
            const carData = cars.find(c => c.id === order.carId);
            const isLockedInDb = carData?.isLocked ?? false;
            const isLoading = actionLoading === `finish-${order.id}`;

            return (
              <div key={order.id} className={`order-glass-card ${isActive ? 'card-active-glow' : ''}`}>
                <div className="card-header">
                  <span className="order-number"># {order.id}</span>
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>

                <div className="card-body">
                  <div className="car-main-info">
                    <div className="car-image-section">
                      <img 
                        src={carData?.imageUrl || 'https://via.placeholder.com/150?text=Car'} 
                        alt={order.carModel} 
                        className="car-actual-image" 
                      />
                      <div className="license-plate-badge">{carData?.licensePlate || '00-000-00'}</div>
                    </div>
                    <div className="car-text-info">
                      <h3 className="car-model-name">{order.carModel}</h3>
                      <span className="pricing-tag">{order.pricingType}</span>
                    </div>
                  </div>

                  <div className="details-grid">
                    <div className="detail-item">
                      <Calendar size={16} color="#6366f1" />
                      <div>
                        <label>איסוף</label>
                        <span>{new Date(order.startTime).toLocaleString('he-IL', {dateStyle:'short', timeStyle:'short'})}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      {isCompleted ? <Gauge size={16} color="#6366f1" /> : <MapPin size={16} color="#6366f1" />}
                      <div>
                        <label>{isCompleted ? "מרחק" : "חזרה משוערת"}</label>
                        <span>{isCompleted ? `${order.distanceDrivenKm} ק"מ` : new Date(order.expectedEndTime).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="car-control-section">
                      <div className="lock-status-indicator">
                         <div className={`status-dot ${isLockedInDb ? 'locked' : 'unlocked'}`}></div>
                         <span>הרכב {isLockedInDb ? 'נעול' : 'פתוח'}</span>
                      </div>
                      <div className="car-remote-controls">
                        <button 
                          className={`btn-control ${isLockedInDb ? 'unlock-action' : 'lock-action'}`}
                          onClick={() => updateCarLock({ id: order.carId, isLocked: !isLockedInDb })}
                        >
                          {isLockedInDb ? <Unlock size={18} /> : <Lock size={18} />}
                          <span>{isLockedInDb ? 'פתח רכב' : 'נעל רכב'}</span>
                        </button>

                        <button 
                          className="btn-control finish-action-large"
                          onClick={() => handleFinish(order.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? <div className="btn-spinner"></div> : <><Flag size={18} /> <span>סיים נסיעה</span></>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <div className="payment-info">
                    <div className={`pay-pill ${order.isPaid ? 'paid' : 'unpaid'}`}>
                      {order.isPaid ? <><FileCheck size={14} /> קבלה הופקה</> : <><CreditCard size={14} /> {isActive ? "בנסיעה" : "ממתין לתשלום"}</>}
                    </div>
                  </div>
                  {!isActive && <div className="total-price-section"><span className="amount">₪{order.totalPrice?.toLocaleString()}</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserOrders;