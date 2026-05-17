import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux"; // הוסף כדי לגשת לפרטי המשתמש המחובר
import { useLazyCheckUserOverlapQuery } from "../../Order/redux/orderApi.jsx";
import "../Style/RouteSidePanel.css";

const RouteSidePanel = ({ onClose, onConfirm, initialData, selectedCar }) => {
  // שליפת ה-ID של המשתמש מה-Store (לפי המבנה ב-MainPage)
  const currentUser = useSelector((state) => state.user.currentUser);
  const loggedInUserId = currentUser?.id || currentUser?.Id;

  const roundTo5 = (date) => {
    const d = new Date(date);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
    return d;
  };

  const now = useMemo(() => roundTo5(new Date()), []);
  const ONE_HOUR_MS = 3600000;
  const ONE_DAY_MS = 86400000;

  const [startDateTime, setStartDateTime] = useState(() =>
    initialData?.start ? roundTo5(new Date(initialData.start)) : now
  );

  const [endDateTime, setEndDateTime] = useState(() =>
    initialData?.end
      ? roundTo5(new Date(initialData.end))
      : new Date(now.getTime() + ONE_HOUR_MS)
  );

  const [errorMessage, setErrorMessage] = useState(null);
  const [checkOverlap, { isFetching }] = useLazyCheckUserOverlapQuery();

  const handleReset = (e) => {
    e.stopPropagation();
    setErrorMessage(null);
    setStartDateTime(now);
    setEndDateTime(new Date(now.getTime() + ONE_HOUR_MS));
  };

  const { totalDays, remainingHours, remainingMinutes } = useMemo(() => {
    const diffMs = endDateTime - startDateTime;
    const totalMins = Math.max(60, Math.floor(diffMs / 60000));
    return {
      totalDays: Math.floor(totalMins / 1440),
      remainingHours: Math.floor((totalMins % 1440) / 60),
      remainingMinutes: totalMins % 60,
    };
  }, [startDateTime, endDateTime]);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleDateTimeChange = (isStart, dateVal, timeVal) => {
    const [hours, mins] = timeVal.split(":").map(Number);
    const [y, m, d] = dateVal.split("-").map(Number);

    const newDate = roundTo5(new Date(y, m - 1, d, hours, mins));

    if (isStart) {
      setStartDateTime(newDate);
      const minuteDelta = newDate.getMinutes() - startDateTime.getMinutes();
      const candidateEnd = new Date(endDateTime.getTime() + minuteDelta * 60000);

      if (candidateEnd.getTime() >= newDate.getTime() + ONE_HOUR_MS) {
        setEndDateTime(candidateEnd);
      } else if (newDate.getTime() + ONE_HOUR_MS > endDateTime.getTime()) {
        setEndDateTime(new Date(newDate.getTime() + ONE_HOUR_MS));
      }
    } else {
      if (newDate.getTime() < startDateTime.getTime() + ONE_HOUR_MS) {
        setEndDateTime(new Date(startDateTime.getTime() + ONE_HOUR_MS));
      } else {
        setEndDateTime(newDate);
      }
    }
  };

// const handleConfirm = async () => {
//     setErrorMessage(null);
//     const actualNow = new Date();
    
//     const earliestAllowed = new Date(actualNow.getTime() - 15 * 60000); 
//     if (startDateTime < earliestAllowed) {
//         setErrorMessage("❌ הזמן שנבחר עבר. אנא עדכני לשעה קרובה יותר.");
//         return;
//     }

//     if (!loggedInUserId) {
//         setErrorMessage("יש להתחבר למערכת כדי לבצע הזמנה");
//         return;
//     }

//     try {
//         // פונקציית עזר קטנה ששומרת על הזמן המקומי בדיוק כפי שהמשתמש בחר
//         const toLocalString = (date) => {
//             const pad = (n) => n.toString().padStart(2, '0');
//             return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
//         };

//         const res = await checkOverlap({
//             userId: Number(loggedInUserId), 
//             start: toLocalString(startDateTime), // שולח למשל 14:00:00 במקום 11:00:00Z
//             end: toLocalString(endDateTime)
//         }).unwrap();

//         if (res?.hasOverlap === true || res === true) {
//             setErrorMessage("❌ יש לך כבר הזמנה קיימת בטווח הזה");
//             return;
//         }

//         onConfirm({
//             start: startDateTime,
//             end: endDateTime,
//             selectedCar,
//         });

//     } catch (err) {
//         // השארת הלוגיקה שלך - אם הבדיקה נכשלה, ממשיכים
//         onConfirm({ start: startDateTime, end: endDateTime, selectedCar });
//     }
// };
const handleConfirm = async () => {
    setErrorMessage(null);
    const actualNow = new Date();
    
    // בדיקה שהזמנה לא בעבר
    const earliestAllowed = new Date(actualNow.getTime() - 15 * 60000); 
    if (startDateTime < earliestAllowed) {
        setErrorMessage("❌ הזמן שנבחר עבר. אנא עדכני לשעה קרובה יותר.");
        return;
    }

    if (!loggedInUserId) {
        setErrorMessage("יש להתחבר למערכת כדי לבצע הזמנה");
        return;
    }

    try {
        // --- הפונקציה ששולחת את הזמן בדיוק כפי שהוא מופיע במסך (Local) ---
        const toLocalString = (date) => {
            const pad = (n) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        // שימוש ב-toLocalString במקום ב-toISOString
        const res = await checkOverlap({
            userId: Number(loggedInUserId), 
            start: toLocalString(startDateTime), 
            end: toLocalString(endDateTime)
        }).unwrap();

        // בדיקה אם res הוא אובייקט עם hasOverlap או פשוט boolean (השארתי את הלוגיקה שלך)
        const hasOverlap = typeof res === 'boolean' ? res : res?.hasOverlap;

        if (hasOverlap === true) {
            setErrorMessage("❌ יש לך כבר הזמנה קיימת בטווח הזה");
            return;
        }

        onConfirm({
            start: startDateTime,
            end: endDateTime,
            selectedCar,
        });

    } catch (err) {
        console.error("Check overlap failed:", err);
        onConfirm({ start: startDateTime, end: endDateTime, selectedCar });
    }
};
  return (
    <div className="route-panel-overlay" onClick={onClose}>
      <div className="route-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>✕</button>

        <div className="header-top-row">
          <button className="reset-link-top" onClick={handleReset}>איפוס</button>
          <h2 className="main-title-header">
            {selectedCar ? "פרטי רכב" : "מתי יוצאים?"}
          </h2>
        </div>

        {errorMessage && (
          <div className="error-box">{errorMessage}</div>
        )}

        {selectedCar && (
          <div className="car-selection-header">
            <img
              src={selectedCar.imageUrl || selectedCar.Image || "/assets/car-placeholder.png"}
              alt="car"
              className="panel-car-img"
            />
            <div className="panel-car-name">
              {selectedCar.model || selectedCar.Model}
            </div>
            <div className="panel-car-address">
              {selectedCar.startParking || selectedCar.Address}
            </div>
          </div>
        )}

        <div className="columns-container">
          <div className="time-column">
            <span className="column-label">איסוף</span>
            <input
              className="white-input"
              type="time"
              step="300"
              value={formatTime(startDateTime)}
              onChange={(e) =>
                handleDateTimeChange(true, formatDate(startDateTime), e.target.value)
              }
            />
            <input
              className="white-input"
              type="date"
              value={formatDate(startDateTime)}
              onChange={(e) =>
                handleDateTimeChange(true, e.target.value, formatTime(startDateTime))
              }
            />
          </div>

          <div className="time-column">
            <span className="column-label">החזרה</span>
            <input
              className="white-input"
              type="time"
              step="300"
              value={formatTime(endDateTime)}
              onChange={(e) =>
                handleDateTimeChange(false, formatDate(endDateTime), e.target.value)
              }
            />
            <input
              className="white-input"
              type="date"
              value={formatDate(endDateTime)}
              onChange={(e) =>
                handleDateTimeChange(false, e.target.value, formatTime(endDateTime))
              }
            />
          </div>
        </div>

        <div className="counters-row">
          <div className="fancy-counter-wide">
            <button
              className="wide-btn"
              onClick={() =>
                setEndDateTime(new Date(endDateTime.getTime() + ONE_HOUR_MS))
              }
            >
              +
            </button>
            <div className="val-box">
              <strong>{remainingHours}</strong>
              <span>{remainingMinutes ? `שעות + ${remainingMinutes} דק׳` : 'שעות'}</span>
            </div>
            <button
              className="wide-btn"
              onClick={() => {
                if (endDateTime.getTime() - ONE_HOUR_MS >= startDateTime.getTime() + ONE_HOUR_MS) {
                  setEndDateTime(new Date(endDateTime.getTime() - ONE_HOUR_MS));
                }
              }}
            >
              −
            </button>
          </div>

          <div className="fancy-counter-wide">
            <button
              className="wide-btn"
              onClick={() =>
                setEndDateTime(new Date(endDateTime.getTime() + ONE_DAY_MS))
              }
            >
              +
            </button>
            <div className="val-box">
              <strong>{totalDays}</strong>
              <span>ימים</span>
            </div>
            <button
              className="wide-btn"
              onClick={() => {
                const newEnd = new Date(endDateTime.getTime() - ONE_DAY_MS);
                setEndDateTime(
                  newEnd.getTime() < startDateTime.getTime() + ONE_HOUR_MS
                    ? new Date(startDateTime.getTime() + ONE_HOUR_MS)
                    : newEnd
                );
              }}
            >
              −
            </button>
          </div>
        </div>

        <button
          className="submit-btn"
          disabled={isFetching}
          onClick={handleConfirm}
        >
          {isFetching ? "בודק זמינות..." : selectedCar ? "בחר רכב זה" : "אישור זמן נסיעה"}
        </button>
      </div>
    </div>
  );
};

export default RouteSidePanel;