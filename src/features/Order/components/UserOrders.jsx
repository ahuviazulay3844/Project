import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetOrdersByUserIdQuery, useFinishOrderMutation } from '../redux/orderApi.jsx';
import { useUpdateCarLockMutation, useGetAllCarsQuery } from '../../Car/redux/carApi.jsx'; 
import { Lock, Unlock, Search, CheckCircle2, Flag, Gauge, FileCheck, Clock, Timer, ChevronLeft, CalendarDays, ClipboardList } from 'lucide-react';
import '../Style/UserOrders.css';

const UserOrders = ({ userId }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: orders = [], isLoading: ordersLoading } = useGetOrdersByUserIdQuery(userId, { skip: !userId, pollingInterval: 5000 });
  const { data: cars = [], isLoading: carsLoading } = useGetAllCarsQuery();
  const [updateCarLock] = useUpdateCarLockMutation();
  const [finishOrder] = useFinishOrderMutation();

  const handleFinish = async (orderId, isLocked, distance) => {
    if (!isLocked) { alert("יש לנעול את הרכב לפני סיום!"); return; }
    try { 
      await finishOrder({ orderId, reportedMileage: distance || 0 }).unwrap(); 
      // הוספת ניווט לדף הפירוט לאחר סיום מוצלח
      navigate(`/order-details/${orderId}`);
    } 
    catch (err) { console.error(err); }
  };

  // לוגיקת סינון משולבת
  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort((a,b) => b.id - a.id)
      .filter(o => {
        const matchesSearch = o.carModel?.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || o.status.toString() === statusFilter;
        const orderYear = new Date(o.startTime).getFullYear().toString();
        const matchesYear = yearFilter === 'all' || orderYear === yearFilter;
        
        return matchesSearch && matchesStatus && matchesYear;
      });
  }, [orders, searchTerm, statusFilter, yearFilter]);

  // רשימת שנים דינמית מההזמנות
  const availableYears = useMemo(() => {
    const years = orders.map(o => new Date(o.startTime).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [orders]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'});
  };

  if (ordersLoading || carsLoading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="orders-page-wrapper">
      <div className="orders-container">
        <header className="orders-header">
          <div className="title-section">
            <h2 className="orders-title">הנסיעות שלי</h2>
            <p className="subtitle">ניהול ומעקב בזמן אמת</p>
          </div>
        </header>

        {/* שורת מסננים על רקע לבן */}
        <div className="filters-bar-white">
          <div className="filter-group-main">
            <label><Search size={14} /> חיפוש</label>
            <input 
              type="text" 
              placeholder="חפש דגם או הזמנה..." 
              className="filter-input-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="filter-group-main">
            <label><ClipboardList size={14} /> סטטוס</label>
            <select className="filter-select-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">כל הסטטוסים</option>
              <option value="1">בנסיעה</option>
              <option value="2">הושלמה</option>
            </select>
          </div>

          <div className="filter-group-main">
            <label><CalendarDays size={14} /> שנה</label>
            <select className="filter-select-white" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option value="all">כל השנים</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="orders-grid">
          {filteredOrders.map((order) => {
            const isActive = order.status === 1;
            const isCompleted = order.status === 2;
            const carData = cars.find(c => c.id === order.carId);
            
            return (
              <div key={order.id} className={`order-glass-card ${isActive ? 'card-active-glow' : ''}`}>
                <div className="card-header">
                  <span className="order-number"># {order.id}</span>
                  <span className={`status-badge ${isActive ? 'status-active' : 'status-completed'}`}>
                    {isActive ? <CheckCircle2 size={14}/> : <FileCheck size={14}/>}
                    {isActive ? 'בנסיעה' : 'הושלמה'}
                  </span>
                </div>

                <div className="card-body">
                  <div className="car-main-info">
                    <div className="car-image-section">
                      <img src={carData?.imageUrl} alt="" className="car-actual-image" />
                      <div className="license-plate-badge">{carData?.licensePlate}</div>
                    </div>
                    <div className="car-text-info">
                      <h3 className="car-model-name">{order.carModel}</h3>
                      <span className="pricing-tag">מסלול {order.pricingType === 'Daily' ? 'יומי' : 'שעתי'}</span>
                    </div>
                  </div>

                  <div className="details-grid-four">
                    <div className="detail-item">
                      <label><Clock size={12}/> איסוף</label>
                      <span className="dark-text">{formatTime(order.startTime)}</span>
                    </div>
                    <div className="detail-item">
                      <label><Timer size={12}/> החזרה</label>
                      <span className="dark-text">{formatTime(order.expectedEndTime)}</span>
                    </div>
                    <div className="detail-item">
                      <label><CheckCircle2 size={12}/> בפועל</label>
                      <span className="dark-text">{isCompleted ? formatTime(order.endTime) : '--:--'}</span>
                    </div>
                    <div className="detail-item">
                      <label><Gauge size={12}/> ק"מ</label>
                      <span className="dark-text">{order.distanceDrivenKm || 0}</span>
                    </div>
                  </div>

                  {isCompleted && (
                    <div className="order-analysis-section">
                      <div className="analysis-title">סיכום נסיעה</div>
                      {order.lateFee > 0 && (
                        <div className="analysis-row danger">
                          <span>קנס איחור:</span>
                          <strong>₪{Math.round(order.lateFee)}</strong>
                        </div>
                      )}
                      <button className="btn-details-link" onClick={() => navigate(`/order-details/${order.id}`)}>
                        פירוט מלא (נזקים, קבלה) <ChevronLeft size={14} />
                      </button>
                    </div>
                  )}

                  {isActive && (
                    <div className="car-control-section">
                      <div className="lock-status-indicator">
                        <span className={`status-dot ${carData?.isLocked ? 'locked' : 'unlocked'}`}></span>
                        <span className="dark-text">{carData?.isLocked ? 'הרכב נעול' : 'הרכב פתוח'}</span>
                      </div>
                      <div className="car-remote-controls">
                        <button className={`btn-control ${carData?.isLocked ? 'unlock-action' : 'lock-action'}`}
                          onClick={() => updateCarLock({ id: order.carId, isLocked: !carData?.isLocked })}>
                          {carData?.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                          <span>{carData?.isLocked ? 'פתח רכב' : 'נעל רכב'}</span>
                        </button>
                        <button className="btn-control finish-action-large" 
                          onClick={() => handleFinish(order.id, carData?.isLocked, order.distanceDrivenKm)}>
                          <Flag size={18} /> <span>סיום נסיעה</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <div className={`pay-pill ${order.isPaid ? 'paid' : 'unpaid'}`}>
                    {order.isPaid ? 'שולם' : 'ממתין לתשלום'}
                  </div>
                  <div className="amount dark-text">₪{Math.round(order.totalPrice || 0)}</div>
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