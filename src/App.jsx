import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './features/User/components/MainPage.jsx';
import OrderDetails from './features/Order/components/OrderDetails.jsx'; 
import AdminDashboard from './features/Admin/components/AdminDashboard.jsx';
import './App.css';

// App.jsx
function App() {
  return (
    <Routes>
      {/* MainPage כבר מכיל בתוכו את ה-MainLayout */}
      <Route path="/" element={<MainPage />} />          
      <Route path="/order-details/:id" element={<OrderDetails />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<MainPage />} />
    </Routes>
  );
}
export default App;