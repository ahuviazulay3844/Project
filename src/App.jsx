import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './features/User/components/MainPage.jsx';
import OrderDetails from './features/Order/components/OrderDetails.jsx'; // וודאי שהנתיב נכון
import './App.css';

// App.jsx
function App() {
  return (
    <Routes>
      {/* MainPage כבר מכיל בתוכו את ה-MainLayout */}
      <Route path="/" element={<MainPage />} />
      
      {/* הוספת הפירוט כנתיב שיוצג בתוך המבנה של MainPage אם תרצי, 
          או פשוט לוודא ש-OrderDetails משתמש ב-MainLayout */}
      <Route path="/order-details/:id" element={<OrderDetails />} />
      <Route path="*" element={<MainPage />} />
    </Routes>
  );
}
export default App;