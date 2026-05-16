import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// API Hooks
import { 
  useGetOrdersByUserIdQuery, 
  useFinishOrderMutation, 
  useSubmitStartReportMutation,
  useUnlockCarMutation,
  useConfirmReplacementMutation,
  useReportRefuelMutation ,
  useCancelOrderMutation,
} from '../redux/orderApi.jsx';

import { 
  useUpdateCarLockMutation, 
  useGetAllCarsQuery, 
  useExtendOrderMutation 
} from '../../Car/redux/carApi.jsx'; 

// UI Components & Icons
import { 
  Lock, Unlock, Search, CheckCircle2, Flag, FileCheck, 
  ChevronLeft, CalendarDays, ClipboardList, AlertTriangle, 
  Loader2, Clock, Check, RefreshCw, XCircle, Gauge
} from 'lucide-react';
import '../Style/UserOrders.css';
import CarInspectionModal from './CarInspectionModal'; 

const UserOrders = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?.id;

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const [selectedOrderForInspection, setSelectedOrderForInspection] = useState(null);

  // --- API Queries ---
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useGetOrdersByUserIdQuery(userId, { 
    skip: !userId, 
    pollingInterval: 3000 
  });

  const { data: cars = [], isLoading: carsLoading, refetch: refetchCars } = useGetAllCarsQuery(undefined, {
    skip: !userId,
    pollingInterval: 3000 
  });
   const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation();
  const [unlockCarOrder] = useUnlockCarMutation();
  const [updateCarLock] = useUpdateCarLockMutation();
  const [finishOrder, { isLoading: isFinishing }] = useFinishOrderMutation();
  const [submitStartReport, { isLoading: isStarting }] = useSubmitStartReportMutation();
  const [extendOrder, { isLoading: isExtending }] = useExtendOrderMutation();
  const [confirmReplacement] = useConfirmReplacementMutation();
  const [reportRefuel, { isLoading: isRefueling }] = useReportRefuelMutation();

  // --- Effects ---
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
    await Promise.all([refetchOrders(), refetchCars()]);
  };

  const handleRefuelAction = async (orderId) => {
    fileInputRef.current.click(); 
    fileInputRef.current.onchange = async (e) => {
      if (e.target.files.length > 0) {
        try {
          await reportRefuel(orderId).unwrap();
          setSuccessMessage("הקבלה נקלטה! זוכת בבונוס והמיכל עודכן.");
          refreshAllData();
        } catch (err) {
          setErrorMessage("שגיאה בדיווח תדלוק.");
        }
      }
    };
  };

  const handleExtendOrder = async (orderId) => {
    try {
      setErrorMessage(null);
      await extendOrder(orderId).unwrap();
      setSuccessMessage("הנסיעה הוארכה בשעה בהצלחה!");
      refreshAllData();
    } catch (err) {
      setErrorMessage(err.data?.message || "לא ניתן להאריך - ייתכן שיש הזמנה אחרת מיד אחריך.");
    }
  };

  const handleFinish = async (orderId, carId, distance) => {
    const car = cars.find(c => c.id === carId);
    if (!car || car.isLocked === false) { 
      setErrorMessage("⚠️ עצור! עליך לנעול את הרכב פיזית לפני סיום הנסיעה."); 
      return; 
    }
    try { 
      setErrorMessage(null);
      await finishOrder({ id: orderId, mileage: Math.round(distance) || 0, fuelTime: 0 }).unwrap(); 
      await refreshAllData();
      navigate(`/order-details/${orderId}`);
    } catch (err) { 
      setErrorMessage("שגיאה בסיום נסיעה.");
    }
  };

  const handleInspectionSubmit = async (reportData) => {
    try {
      await submitStartReport({ id: selectedOrderForInspection.id, report: reportData }).unwrap();
      setSelectedOrderForInspection(null);
      await refreshAllData();
      setSuccessMessage("הדיווח נשלח בהצלחה!");
    } catch (err) {
      setErrorMessage("שגיאה בשליחת השאלון.");
    }
  };

  // --- Helpers ---
  const calculateLateMinutes = useCallback((expectedEnd, actualEnd, status) => {
    if (status === 0) return 0;
    const end = status === 2 ? new Date(actualEnd) : currentTime;
    const expected = new Date(expectedEnd);
    const diff = Math.floor((end - expected) / 60000);
    return diff > 0 ? diff : 0;
  }, [currentTime]);

  const formatLateTime = (totalMinutes) => {
    if (totalMinutes < 60) return `${totalMinutes} דק'`;
    return `${Math.floor(totalMinutes / 60)} שעות ו-${totalMinutes % 60} דק'`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Filter Logic ---
  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => b.id - a.id)
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

  if (ordersLoading || carsLoading) {
    return <div className="loader-container"><div className="spinner"></div></div>;
  }
// 1. פונקציה שרק מחשבת את ההודעה ופותחת את האישור
// פונקציה 1: חישוב הודעה ופתיחת שכבת האישור בתוך הכרטיס
  const handleCancelClick = (order) => {
    const now = new Date();
    const start = new Date(order.startTime);
    const diffHrs = (start - now) / (1000 * 60 * 60);

    let msg = "";
    if (diffHrs >= 24) msg = "הביטול כרגע הוא בחינם. לבטל?";
    else if (diffHrs >= 2) msg = "ביטול כעת יעלה דמי ביטול של שעת השכרה אחת. לבטל?";
    else msg = "ביטול ברגע האחרון יעלה 50% מעלות ההזמנה. לבטל?";

    setOrderToCancel({ id: order.id, message: msg });
  };

  // פונקציה 2: ביצוע הביטול בשרת
  const executeCancel = async () => {
    if (!orderToCancel) return;
    try {
      await cancelOrder(orderToCancel.id).unwrap();
      setSuccessMessage("ההזמנה בוטלה בהצלחה.");
      setOrderToCancel(null);
      refreshAllData();
    } catch (err) {
      setErrorMessage("שגיאה בביטול.");
      setOrderToCancel(null);
    }
  };
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
            <input type="text" placeholder="חפש דגם או מס' הזמנה" className="filter-input-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-group-main">
            <label><ClipboardList size={14} /> סטטוס</label>
            <select className="filter-select-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">כל הסטטוסים</option>
              <option value="0">ממתינה</option>
              <option value="1">בנסיעה</option>
              <option value="2">הושלמה</option>
              <option value="3">בוטלה</option>
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
            const isCanceled = order.status === 3;
            const carData = cars.find(c => c.id === order.carId);
            const lateMinutes = calculateLateMinutes(order.expectedEndTime, order.endTime, order.status);
            const isOverdue = isActive && lateMinutes >= 65;
            const hasConflict = isPending && order.hasConflict;
            const isUserCurrentlyOpen = carData?.isLocked === false && order.actualOpeningTime;

            return (
              <div key={order.id} className={`order-glass-card ${isActive ? 'card-active-glow' : isPending ? 'card-pending' : ''} ${isOverdue ? 'card-overdue-alarm' : ''}`}>
                {orderToCancel?.id === order.id && (
  <div className="card-cancel-overlay">
    <div className="overlay-content">
      <AlertTriangle size={32} color="#ef4444" />
      <p>{orderToCancel.message}</p>
      <div className="overlay-buttons">
        <button className="confirm-yes-btn" onClick={executeCancel}>כן, בטל</button>
        <button className="confirm-no-btn" onClick={() => setOrderToCancel(null)}>חזור</button>
      </div>
    </div>
  </div>
)}
<div className="card-header">
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <span className="order-number">הזמנה # {order.id}</span>
    
    {/* כפתור ביטול - מופיע רק לממתינות ורק אם אין הודעת החלפת רכב פתוחה */}
    {isPending && !hasConflict && (
      <button 
        className="cancel-minimal-btn" 
        onClick={() => handleCancelClick(order)}
        disabled={isCanceling}
      >
        <XCircle size={14} /> ביטול הזמנה
      </button>
    )}
  </div>

<span className={`status-badge ${
  isActive ? 'status-active' : 
  isPending ? 'status-pending' : 
  isFinished ? 'status-completed' : 'status-canceled' // סטטוס 3
}`}>
  {isActive ? <CheckCircle2 size={14}/> : 
   isPending ? <Clock size={14}/> : 
   isFinished ? <FileCheck size={14}/> : <XCircle size={14}/>} 
  
  {isActive ? 'בנסיעה' : 
   isPending ? 'ממתינה' : 
   isFinished ? 'הושלמה' : 'בוטלה'}
</span>
</div>
{hasConflict ? (
  <div className={`reassigned-action-card conflict-mode animate-pulse-border ${!order.suggestedReplacementCarId ? 'no-solution' : ''}`}>
    
    {order.suggestedReplacementCarId ? (
      /* --- מצב 1: נמצא רכב חלופי --- */
      <>
        <div className="reassigned-content">
          <div className="conflict-icon-wrapper">
            <AlertTriangle size={32} color="#e67e22" />
          </div>
          <div className="conflict-text-info">
            <h4 className="conflict-title" style={{color: '#431407', fontWeight: '900', marginBottom: '4px'}}>
              עדכון: הרכב שלך מתעכב
            </h4>
            <p className="conflict-subtitle" style={{color: '#7c2d12', marginBottom: '10px'}}>
              הנהג הקודם טרם החזיר את הרכב. מצאנו עבורך רכב חלופי זמין מידית:
            </p>
            
            <div className="suggested-car-display-box" style={{background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #fed7aa', color: '#1e293b', lineHeight: '1.6'}}>
              <strong>🚗 דגם: {order.suggestedCarModel}</strong> 
              <br />
              <span style={{fontSize: '13px'}}>📍 מיקום: {order.suggestedCarLocation}</span>
              <br />
              <span style={{fontSize: '13px'}}>💺 מושבים: {order.suggestedCarSeats}</span>
            </div>
            
            <div className="bonus-badge" style={{background: '#f0fdf4', padding: '8px', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '10px'}}>
              <p className="bonus-text" style={{color: '#166534', margin: 0, fontSize: '14px'}}>
                🎁 <strong>פיצוי על העיכוב:</strong> זוכת ב-₪{order.discountAmount}!
              </p>
            </div>
          </div>
        </div>
        
        <div className="reassigned-buttons" style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <button className="confirm-btn-shiny" style={{background: '#0f172a', color: 'white', padding: '12px', borderRadius: '10px', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} 
            onClick={async () => {
              try {
                await confirmReplacement({ id: order.id, accept: true }).unwrap();
                await refreshAllData(); 
                setSuccessMessage("הרכב הוחלף בהצלחה, אפשר להתחיל נסיעה!");
              } catch (err) { 
                setErrorMessage("שגיאה באישור ההחלפה. נסה שוב."); 
              }
            }}>
            <Check size={18}/> אשר מעבר לרכב זה והתחל נסיעה
          </button>
          
          <button className="cancel-btn-outline" style={{background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} 
            onClick={async () => {
              if(window.confirm("האם ברצונך לבטל את ההזמנה? (לא תחוייב כלל)")) {
                try {
                  await confirmReplacement({ id: order.id, accept: false }).unwrap();
                  await refreshAllData();
                  setSuccessMessage("ההזמנה בוטלה ללא חיוב.");
                } catch(err) {
                  setErrorMessage("שגיאה בביטול ההזמנה");
                }
              }
            }}> 
            <XCircle size={16}/> סרב ובטל הזמנה (זיכוי מלא)
          </button>
        </div>
      </>
    ) : (
      /* --- מצב 2: הנהג מאחר, ואין כרגע רכב חלופי זמין --- */
      <>
        <div className="reassigned-content" style={{background: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fecaca'}}>
          <div className="conflict-icon-wrapper" style={{marginBottom: '10px', textAlign: 'center'}}>
            <AlertTriangle size={38} color="#ef4444" />
          </div>
          <div className="conflict-text-info" style={{textAlign: 'center'}}>
            <h4 className="conflict-title" style={{color: '#7f1d1d', fontWeight: '900', marginBottom: '8px', fontSize: '18px'}}>
              מתנצלים, יש עיכוב לא צפוי
            </h4>
            <p className="conflict-subtitle" style={{color: '#991b1b', fontSize: '15px', marginBottom: '10px'}}>
              הנהג הקודם עדיין לא סיים את הנסיעה ברכב שהזמנת. 
              <br/><b>לצערנו, כרגע אין רכב חלופי פנוי באזורך.</b>
            </p>
            <p style={{color: '#b91c1c', fontSize: '13px', background: '#fee2e2', padding: '8px', borderRadius: '8px'}}>
              תוכל לבטל כעת את ההזמנה ללא שום עלות, או להמתין כאן עד שהרכב יתפנה.
            </p>
          </div>
        </div>
        
        <div className="reassigned-buttons" style={{marginTop: '15px'}}>
          <button className="cancel-btn-outline" style={{width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} 
            onClick={async () => {
              if(window.confirm("ההזמנה תבוטל ולא תחויב כלל. להמשיך?")) {
                try {
                  // אנחנו שולחים accept: false כדי לבטל את ההזמנה בשרת
                  await confirmReplacement({ id: order.id, accept: false }).unwrap();
                  await refreshAllData();
                  setSuccessMessage("ההזמנה בוטלה בהצלחה.");
                } catch(err) {
                  setErrorMessage("שגיאה בביטול ההזמנה");
                }
              }
            }}> 
            <XCircle size={18}/> בטל הזמנה כעת (ללא חיוב)
          </button>
        </div>
      </>
    )}
  </div>
) : (
 
               <>
                    {isPending && order.isReassigned && (
                      <div className="reassigned-action-card">
                        <div className="reassigned-content">
                          <RefreshCw className="spin-slow" size={20} color="#f39c12" />
                          <div>
                            <h4>הרכב הוחלף אוטומטית</h4>
                            <p>עקב עיכוב, הועברת לרכב חלופי וזוכת ב-₪{order.discountAmount}</p>
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
                      <div className="detail-item"><label>איסוף</label><span>{formatTime(order.startTime)}</span></div>
                      <div className="detail-item"><label>החזרה</label><span>{formatTime(order.expectedEndTime)}</span></div>
                      <div className="detail-item"><label>בפועל</label><span>{isFinished ? formatTime(order.endTime) : '--:--'}</span></div>
                      <div className="detail-item"><label>ק"מ</label><span>{Math.round(order.distanceDrivenKm) || 0}</span></div>
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
                        <div className="fuel-gauge-container" style={{marginBottom: '15px', padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px'}}>
                            <span><Gauge size={14} style={{verticalAlign: 'middle'}}/> רמת דלק:</span>
                            <strong style={{color: carData?.fuelLevel < 25 ? '#ef4444' : '#10b981'}}>{Math.round(carData?.fuelLevel || 0)}%</strong>
                          </div>
                          <div className="fuel-track" style={{height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden'}}>
                            <div className="fuel-fill" style={{
                              width: `${carData?.fuelLevel || 0}%`, 
                              height: '100%', 
                              background: carData?.fuelLevel < 20 ? '#e74c3c' : '#2ecc71',
                              transition: 'width 2s ease'
                            }}></div>
                          </div>
                          {(carData?.fuelLevel < 50 && !order.didCustomerRefuel) && (
                            <button className="refuel-btn-minimal" onClick={() => handleRefuelAction(order.id)} disabled={isRefueling}>
                              {isRefueling ? <Loader2 size={14} className="spinner-icon" /> : '⛽ תדלק וקבל ₪30 זיכוי'}
                            </button>
                          )}
                          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" capture="environment" />
                        </div>

                        {lateMinutes > 0 && !order.hasConflict && (
                          <button className="btn-control extend-action-btn" style={{backgroundColor: '#e74c3c', color: 'white', width: '100%', marginBottom: '10px'}} onClick={() => handleExtendOrder(order.id)} disabled={isExtending}>
                            {isExtending ? <Loader2 size={16} className="spinner-icon" /> : <Clock size={16} />}
                            <span>הארך נסיעה בשעה (₪)</span>
                          </button>
                        )}

                        <div className="lock-status-indicator">
                          <span className={`status-dot ${isUserCurrentlyOpen ? 'unlocked' : 'locked'}`}></span>
                          <span className={`lock-text-display ${isUserCurrentlyOpen ? 'unlocked-text' : 'locked-text'}`}>{isUserCurrentlyOpen ? 'פתוח' : 'נעול'}</span>
                        </div>

                        {(() => {
                          if (order.isInspectionSubmitted) return null;
                          const openTimeStr = order.actualOpeningTime;
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
                          <button className={`btn-control ${isUserCurrentlyOpen ? 'lock-action' : 'unlock-action'}`} onClick={async () => {
                            if (isUserCurrentlyOpen) await updateCarLock({ id: order.carId, isLocked: true }).unwrap();
                            else await unlockCarOrder(order.id).unwrap();
                            await refreshAllData();
                          }}>
                            {isUserCurrentlyOpen ? <Lock size={16} /> : <Unlock size={16} />}
                            {isUserCurrentlyOpen ? 'נעל' : 'פתח'}
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