import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  useGetOrdersByUserIdQuery, 
  useFinishOrderMutation, 
  useSubmitStartReportMutation,
  useUnlockCarMutation,
 useConfirmReplacementMutation,
} from '../redux/orderApi.jsx';

import { useUpdateCarLockMutation, useGetAllCarsQuery, useExtendOrderMutation } from '../../Car/redux/carApi.jsx'; 
import { 
  Lock, Unlock, Search, CheckCircle2, Flag, FileCheck, 
  ChevronLeft, CalendarDays, ClipboardList, AlertTriangle, 
  Loader2, Clock, Car, Check, RefreshCw, XCircle
} from 'lucide-react';
import '../Style/UserOrders.css';
import CarInspectionModal from './CarInspectionModal'; 

const UserOrders = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [selectedOrderForInspection, setSelectedOrderForInspection] = useState(null);

  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useGetOrdersByUserIdQuery(userId, { 
    skip: !userId, 
    pollingInterval: 3000 
  });

  const { data: cars = [], isLoading: carsLoading, refetch: refetchCars } = useGetAllCarsQuery();
  const [unlockCarOrder] = useUnlockCarMutation();
  const [updateCarLock] = useUpdateCarLockMutation();
  const [finishOrder, { isLoading: isFinishing }] = useFinishOrderMutation();
  const [submitStartReport, { isLoading: isStarting }] = useSubmitStartReportMutation();
  const [extendOrder, { isLoading: isExtending }] = useExtendOrderMutation();
  const [confirmReplacement] = useConfirmReplacementMutation();
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const refreshAllData = async () => {
    await refetchOrders();
    await refetchCars();
  };

  const calculateLateMinutes = (expectedEnd, actualEnd, status) => {
    if (status === 0) return 0;
    const end = status === 2 ? new Date(actualEnd) : currentTime;
    const expected = new Date(expectedEnd);
    const diff = Math.floor((end - expected) / 60000);
    return diff > 0 ? diff : 0;
  };

  const formatLateTime = (totalMinutes) => {
    if (totalMinutes < 60) return `${totalMinutes} דק'`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} שעות ו-${minutes} דק'`;
  };

  const handleInspectionSubmit = async (reportData) => {
    try {
      await submitStartReport({ id: selectedOrderForInspection.id, report: reportData }).unwrap();
      setSelectedOrderForInspection(null);
      await refreshAllData();
      setSuccessMessage("הדיווח נשלח בהצלחה! נסיעה טובה.");
    } catch (err) {
      setErrorMessage("שגיאה בשליחת הדיווח");
    }
  };

  const handleExtendOrder = async (orderId) => {
    try {
      setErrorMessage(null);
      await extendOrder(orderId).unwrap();
      setSuccessMessage("הנסיעה הוארכה בשעה בהצלחה!");
      await refreshAllData();
    } catch (err) {
      setErrorMessage(err.data?.message || "לא ניתן להאריך את הנסיעה - ייתכן שיש הזמנה אחרת.");
    }
  };

  const handleFinish = async (orderId, carId, distance) => {
    const car = cars.find(c => c.id === carId);
    if (!car || car.isLocked === false) { 
      setErrorMessage("⚠️ לא ניתן לסיים נסיעה! עליך לנעול את הרכב תחילה."); 
      return; 
    }
    try { 
      setErrorMessage(null);
      await finishOrder({ id: orderId, mileage: distance || 0, fuelTime: 0 }).unwrap(); 
      await refreshAllData();
      navigate(`/order-details/${orderId}`);
    } catch (err) { 
      setErrorMessage("שגיאה בסיום נסיעה");
    }
  };

  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort((a,b) => b.id - a.id)
      .filter(o => {
        const matchesSearch = (o.carModel || "").toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || o.status.toString() === statusFilter;
        const orderYear = o.startTime ? new Date(o.startTime).getFullYear().toString() : "";
        return matchesSearch && matchesStatus && (yearFilter === 'all' || orderYear === yearFilter);
      });
  }, [orders, searchTerm, statusFilter, yearFilter]);

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
          {errorMessage && <div className="error-box">{errorMessage}</div>}
          {successMessage && <div className="success-toast"><Check size={18}/> {successMessage}</div>}
        </header>

        <div className="filters-bar-white">
          <div className="filter-group-main">
            <label><Search size={14} /> חיפוש</label>
            <input type="text" placeholder="חפש דגם..." className="filter-input-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-group-main">
            <label><ClipboardList size={14} /> סטטוס</label>
            <select className="filter-select-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">הכל</option>
              <option value="0">ממתינה</option>
              <option value="1">בנסיעה</option>
              <option value="2">הושלמה</option>
            </select>
          </div>
          <div className="filter-group-main">
            <label><CalendarDays size={14} /> שנה</label>
            <select className="filter-select-white" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option value="all">כל השנים</option>
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        <div className="orders-grid">
          {filteredOrders.map((order) => {
            const isActive = order.status === 1;
            const isPending = order.status === 0;
            const isFinished = order.status === 2;
            const carData = cars.find(c => c.id === order.carId);
            const lateMinutes = calculateLateMinutes(order.expectedEndTime, order.endTime, order.status);
            const isOverdue = isActive && lateMinutes >= 65;
            
            // לוגיקת חסימה: אם ההזמנה ממתינה ויש קונפליקט נציג רק את כרטיס ההחלפה
            const hasConflict = isPending && order.hasConflict;

            return (
              <div key={order.id} className={`order-glass-card ${isActive ? 'card-active-glow' : isPending ? 'card-pending' : ''} ${isOverdue ? 'card-overdue-alarm' : ''}`}>
                <div className="card-header">
                  <span className="order-number"># {order.id}</span>
                  <span className={`status-badge ${isActive ? 'status-active' : isPending ? 'status-pending' : 'status-completed'}`}>
                    {isActive ? <CheckCircle2 size={14}/> : isPending ? <Clock size={14}/> : <FileCheck size={14}/>}
                    {isActive ? 'בנסיעה' : isPending ? 'ממתינה' : 'הושלמה'}
                  </span>
                </div>

                {hasConflict ? (
                  /* תצוגת חסימה לנהג ב' - מופיע במקום פרטי הרכב */
                 <div className="reassigned-action-card conflict-mode">
    <div className="reassigned-content">
        <AlertTriangle className="blink-icon" size={24} color="#e67e22" />
        <div>
            <h4>הרכב המקורי טרם הוחזר</h4>
            <p>הנהג הקודם מתעכב. הכנו לך רכב חלופי פנוי + <strong>שעה ראשונה חינם!</strong></p>
        </div>
    </div>
    <div className="reassigned-buttons">
        <button className="confirm-btn" onClick={async () => {
    try {
        await confirmReplacement({ id: order.id, accept: true }).unwrap();
        setSuccessMessage("הרכב הוחלף בהצלחה!");
        refreshAllData();
    } catch (err) {
        setErrorMessage("שגיאה בעיבוד הבקשה, נסה שנית.");
    }
}}>
            <RefreshCw size={14}/> אשר רכב חלופי
        </button>
        <button className="cancel-btn-outline" onClick={async () => {
            try {
                await confirmReplacement({ id: order.id, accept: false }).unwrap();
                refreshAllData();
            } catch (err) {
                setErrorMessage("שגיאה בעיבוד הבקשה, נסה שנית.");
            }
}}> 
            <XCircle size={14}/> בטל הזמנה
        </button>
    </div>
</div>
                ) : (
                  /* תצוגה רגילה - מופיעה אם אין קונפליקט */
                  <>
                    {isPending && order.isReassigned && (
                      <div className="reassigned-action-card">
                        <div className="reassigned-content">
                          <RefreshCw className="spin-slow" size={20} color="#f39c12" />
                          <div>
                            <h4>הרכב הוחלף אוטומטית</h4>
                            <p>עקב עיכוב, הועברת לרכב חלופי. זוכת ב-₪{order.discountAmount}</p>
                          </div>
                        </div>
                        <div className="reassigned-buttons">
                          <button className="confirm-btn" onClick={() => setSuccessMessage("השינוי אושר.")}><Check size={14}/> אשר</button>
                        </div>
                      </div>
                    )}

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
                      <div className="detail-item"><label>איסוף</label><span className="dark-text">{formatTime(order.startTime)}</span></div>
                      <div className="detail-item"><label>החזרה</label><span className="dark-text">{formatTime(order.expectedEndTime)}</span></div>
                      <div className="detail-item"><label>בפועל</label><span className="dark-text">{isFinished ? formatTime(order.endTime) : '--:--'}</span></div>
                      <div className="detail-item"><label>ק"מ</label><span className="dark-text">{order.distanceDrivenKm || 0}</span></div>
                    </div>

                    {lateMinutes > 0 && (
                      <div className={`late-warning-box ${isFinished ? 'past-late' : 'active-late'}`}>
                        <AlertTriangle className="blink-icon" size={18} />
                        <div className="late-text">
                          <span>{isActive ? 'איחור פעיל:' : 'איחור סופי:'}</span>
                          <strong className="text-danger">{formatLateTime(lateMinutes)} (₪{lateMinutes})</strong>
                        </div>
                      </div>
                    )}

                    {isActive && (
                      <div className="car-control-section">
                        {lateMinutes > 0 && (
                          <button className="btn-control extend-action-btn" style={{backgroundColor: '#e74c3c', color: 'white', width: '100%', marginBottom: '10px'}} onClick={() => handleExtendOrder(order.id)} disabled={isExtending}>
                            {isExtending ? <Loader2 size={16} className="spinner-icon" /> : <Clock size={16} />}
                            <span>הארך נסיעה בשעה (₪)</span>
                          </button>
                        )}

                        <div className="lock-status-indicator">
                          <span className={`status-dot ${carData?.isLocked ? 'locked' : 'unlocked'}`}></span>
                          <span className={`lock-text-display ${carData?.isLocked ? 'locked-text' : 'unlocked-text'}`}>{carData?.isLocked ? 'נעול' : 'פתוח'}</span>
                        </div>

                        {(() => {
                          if (order.isInspectionSubmitted || order.IsInspectionSubmitted) return null;
                          const openTimeStr = order.actualOpeningTime || order.ActualOpeningTime;
                          if (!openTimeStr) return null;
                          const diff = (currentTime - new Date(openTimeStr)) / 60000;
                          if (diff >= 0 && diff < 10) {
                            return (
                              <button className="btn-control inspection-action-highlight" style={{backgroundColor: '#f39c12', color: 'white', width: '100%', marginBottom: '10px'}} onClick={() => setSelectedOrderForInspection(order)}>
                                <ClipboardList size={20} /> <span>שאלון מצב רכב (נותרו {Math.ceil(10 - diff)} דק')</span>
                              </button>
                            );
                          }
                          return null;
                        })()}

                        <div className="car-remote-controls">
                          <button className={`btn-control ${carData?.isLocked ? 'unlock-action' : 'lock-action'}`}
                            onClick={async () => {
                              if (carData?.isLocked) await unlockCarOrder(order.id).unwrap();
                              else await updateCarLock({ id: order.carId, isLocked: true }).unwrap();
                              await refreshAllData();
                            }}>
                            {carData?.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                            {carData?.isLocked ? 'פתח' : 'נעל'}
                          </button>
                          <button className="btn-control finish-action-large" disabled={isFinishing} onClick={() => handleFinish(order.id, order.carId, order.distanceDrivenKm)}>
                            {isFinishing ? <Loader2 size={16} className="spinner-icon" /> : <Flag size={16} />}
                            <span>סיום</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isFinished && (
                  <button className="btn-details-link" onClick={() => navigate(`/order-details/${order.id}`)}>
                    צפה בפרטי הנסיעה <ChevronLeft size={14} />
                  </button>
                )}

                <div className="card-footer">
                  <div className={`pay-pill ${order.isPaid ? 'paid' : 'unpaid'}`}>{order.isPaid ? 'שולם' : 'חויב'}</div>
                  <div className="amount-display">₪{Math.round(order.totalPrice || 0)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CarInspectionModal 
        isOpen={!!selectedOrderForInspection} 
        onClose={() => setSelectedOrderForInspection(null)} 
        isSubmitting={isStarting} 
        onSubmit={handleInspectionSubmit} 
      />
    </div>
  );
};

export default UserOrders;