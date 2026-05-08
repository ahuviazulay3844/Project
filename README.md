
## מבוא
זהו פרויקט React עם ארכיטקטורת תיקיות לפי תכונה (`feature-based architecture`). המטרה של הפרויקט היא לנהל את ממשק המשתמש, את ניהול הרכבים, ההזמנות, הקופונים, האדמין ואת אזור המשתמשים בצורה מסודרת.

## ארכיטקטורה כללית
הפרויקט מחולק בתיקיית `src/features/` לפי מודולים עיקריים:
- `Admin`
- `Car`
- `CarFeedback`
- `Coupon`
- `Order`
- `Region`
- `User`

כל מודול מחולק ל:
- `components` — רכיבים שמציגים ממשק
- `redux` — לוגיקת state, api ו-slice
- `Style` — קבצי CSS לכל רכיב

הפרדה זו מאפשרת:
- תחזוקה טובה יותר
- הרחבה קלה של תכונות בפרויקט
- זיהוי מהיר של קוד לפי תחום אחריות

## מה יש בכל תיקיה

### `src/features/Admin`
מכיל את דפי הניהול של המערכת:
- `components`
  - `AdminDashboard.jsx` — דשבורד מנהל
  - `FleetManagement.jsx` — ניהול צי הרכבים
  - `OrderLogs.jsx` — יומן הזמנות
  - `UserManagement.jsx` — ניהול משתמשים
- `redux` — קבצי סטייט לניהול נתונים של המנהל
- `Style`
  - `AdminDashboard.css` — עיצוב דשבורד מנהל

### `src/features/Car`
מכיל את כל רכיבי הרכבים:
- `components`
  - `CarAvailabilityMap.jsx` / `CarAvailabilityM...` — מפה זמינות רכבים
  - `CarGallery.jsx` — גלריית רכבים
  - `CarSelectionList.jsx` — רשימת בחירת רכבים
  - `CoverageSidePanel.jsx` — פאנל כיסוי
  - `GoogleMapWith...jsx` — מפות גוגל משולבות
  - `PriceList.jsx` — תצוגת מחירונים
  - `RouteSidePanel.jsx` — פאנל מסלולים
- `redux`
  - `api.jsx`
  - `carApi.jsx`
  - `carSlice.jsx`
- `Style`
  - `CarAvailabilityMap.css`
  - `CarGallery.css`
  - `CarSelectionList.css`
  - `CoverageSidePanel.css`
  - `GoogleMapWith...css`
  - `PriceList.css`
  - `RouteSidePanel.css`

### `src/features/CarFeedback`
מכיל רכיבים ו-state לניהול משוב על רכבים:
- `components` — רכיבי מסך משוב לדוחות / דירוגים
- `redux` — state של משוב רכבים

### `src/features/Coupon`
מכיל רכיבים לניהול קופונים:
- `components` — ממשק יצירה/הוספה/עריכה של קופונים
- `redux` — סטייט וקשר ל-API של קופונים

### `src/features/Order`
מכיל את הניהול של הזמנות:
- `components`
  - `CreateOrder.jsx` — יצירת הזמנה
  - `OrderDetails.jsx` — פירוט הזמנה
  - `UserOrders.jsx` — רשימת הזמנות משתמש
- `redux`
  - `api.jsx`
  - `orderApi.jsx`
  - `orderSlice.jsx`
- `Style`
  - `CreateOrder.css`
  - `OrderDetails.css`
  - `UserOrders.css`

### `src/features/Region`
מכיל רכיבים וניהול state עבור אזורים:
- `components` — רכיבי תצוגת אזורים
- `redux` — סטייט API של אזורים

### `src/features/User`
מכיל את ממשק המשתמש והאימות:
- `components`
  - `AuthPage.jsx` — דף התחברות / הרשמה
  - `Register.jsx` — רישום משתמש
  - `HomeContent.jsx` — תוכן דף הבית
  - `MainPage.jsx` — עמוד ראשי
  - `MainLayout.jsx` — פריסת המסכים
  - `PersonalArea.jsx` — אזור אישי
  - `PersonalDetails.jsx` — פרטי משתמש
  - `Signature.jsx` — חתימה דיגיטלית / מסמכים
  - `UploadDocument...jsx` — העלאת מסמכים
  - `ForeignCitizen.jsx` — מסך למסתננים / אזרחים זרים
- `Style`
  - `AuthPage.css` — עיצוב דף אימות
  - קבצי CSS נוספים עבור רכיבי המשתמש (לא כולם מוצגים בממשק)

## דף מרכזי 
### `AuthPage.jsx`
דף האימות הוא דף עיקרי בפרויקט שמנצל את `AuthPage.css`:
- טופס כניסה והרשמה
- כפתורי פעולה
- שדות אימייל, סיסמה ופרטי משתמש
- באנרי משוב הצלחה/שגיאה
- מצב דינמי בין כניסה לרישום

### `AuthPage.css`
קובץ הסגנון מגדיר:
- רקע גרדיאנט
- עיצוב כרטיס מרכזי
- שדות קלט מודרניים
- כפתורים עם אפקטים
- פאנלים של הודעות הצלחה ושגיאה

## המלצות לשימוש
- לשמור על ארכיטקטורת `features` גם בעת הוספת מודולים חדשים
- להפריד רכיבים נפוצים ל-`src/components/`
- לשמור על קבצי סגנון מקומיים לכל רכיב
- להוסיף תיעוד עבור נתיבי `Routes` והתחברות ל-API ברמת הפרויקט

## איך להריץ
1. לפתוח מסוף בתיקיית הפרויקט
2. להריץ:
   - `npm install`
   - `npm start`

## סיכום
הפרויקט מסודר היטב לפי מודולים, עם הפרדה בין ממשק, לוגיקת Redux וסגנונות CSS.
התיקיות שמוצגות מראות שניתן להרחיב את המערכת בקלות עם תכונות נוספות כמו הזמנות, קופונים, ניהול צי רכבים ואזור משתמשים.
