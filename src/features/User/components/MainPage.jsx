import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { useGetAllCarsQuery } from '../../Car/redux/carApi.jsx';
import { useGetCurrentUserQuery } from '../redux/userApi';
import { setUser } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import MainLayout from './MainLayout.jsx';
import HomeContent from './HomeContent.jsx';
import Register from './Register.jsx';
import AuthPage from './AuthPage.jsx';
import PersonalArea from './PersonalArea.jsx';
import GoogleMapWithClusters from '../../Car/components/GoogleMapWithClusters.jsx';
import UserOrders from '../../Order/components/UserOrders.jsx'; 
import PriceList from '../../Car/components/PriceList.jsx'; 

const MainPage = () => {
  const [activeView, setActiveView] = useState('home');
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  const { data: userFromServer, isLoading: isUserLoading } = useGetCurrentUserQuery(undefined, {
    skip: !token || !!currentUser,
  });
useEffect(() => {
    if (userFromServer && !currentUser) {
        dispatch(setUser(userFromServer));
        
        // תיקון: אם המערכת זיהתה אוטומטית שזה מנהל, נעביר אותו לדף הניהול
        if (userFromServer.userType === 1 || userFromServer.userType === 'Admin') {
            navigate('/admin');
        }
    }
}, [userFromServer, currentUser, dispatch, navigate]);

  const { data: cars = [], isLoading: carsLoading, isError } = useGetAllCarsQuery();

  const renderContent = () => {
    switch (activeView) {
      case 'register': return <Register onStepClick={(step) => setActiveView(step)} />;
   case 'auth': 
  return (
    <AuthPage 
      onLoginSuccess={() => {
        setActiveView('map');
      }} 
      onClose={() => setActiveView('home')}
    />
  );      case 'profile': return <PersonalArea />; 
      case 'map':
        if (carsLoading) return <div className="loading-msg">טוען רכבים...</div>;
        return <GoogleMapWithClusters carsList={cars} />;
      case 'pricing': return <PriceList />;
      case 'orders': return <UserOrders userId={currentUser?.id || currentUser?.Id} />;
      default: return (
        <HomeContent 
          isLoading={carsLoading} 
          isError={isError} 
          cars={cars || []} 
          onViewPrices={() => setActiveView('pricing')} 
        />
      );
    }
  };
  
  const isUserLoggedIn = !!currentUser || (!!token && isUserLoading);

  return (
    <MainLayout 
      currentUser={currentUser}
      activeView={activeView}
      onLogoClick={() => setActiveView('home')}
      onRegisterClick={!isUserLoggedIn ? () => setActiveView('register') : null}
      onLoginClick={() => setActiveView('auth')}
      onOrdersClick={() => {
        if (isUserLoggedIn) {
          setActiveView('orders');
        } else {
          setActiveView('auth');
        }
      }}
      onPricingClick={() => setActiveView('pricing')}
      onNewOrderClick={() => {
        if (isUserLoggedIn) {
          setActiveView('map');
        } else {
          setActiveView('auth');
        }
      }} 
      onProfileClick={() => {
        if (isUserLoggedIn) {
          setActiveView('profile');
        } else {
          setActiveView('auth');
        }
      }}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default MainPage;