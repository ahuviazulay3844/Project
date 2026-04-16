import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { useGetAllCarsQuery } from '../../Car/redux/carApi.jsx';
import { useGetCurrentUserQuery } from '../redux/userApi';
import { setUser } from '../redux/userSlice';

import MainLayout from './MainLayout.jsx';
import HomeContent from './HomeContent.jsx';
import Register from './Register.jsx';
import AuthPage from './AuthPage.jsx';
import PersonalArea from './PersonalArea.jsx';
import GoogleMapWithClusters from '../../Car/components/GoogleMapWithClusters.jsx';

const MainPage = () => {
  const [activeView, setActiveView] = useState('home');
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  // שליפת המשתמש אם יש טוקן אך אין משתמש ב-Redux (למשל אחרי ריענון)
  const { data: userFromServer, isLoading: isUserLoading } = useGetCurrentUserQuery(undefined, {
    skip: !token || !!currentUser,
  });

  useEffect(() => {
    if (userFromServer && !currentUser) {
      dispatch(setUser(userFromServer));
    }
  }, [userFromServer, currentUser, dispatch]);

  const { data: cars = [], isLoading: carsLoading, isError } = useGetAllCarsQuery();

  const renderContent = () => {
    switch (activeView) {
      case 'register': return <Register onStepClick={(step) => setActiveView(step)} />;
      case 'auth': return <AuthPage onLoginSuccess={() => setActiveView('map')} />;
      case 'profile': return <PersonalArea />; 
      case 'map':
        if (carsLoading) return <div className="loading-msg">טוען רכבים...</div>;
        return <GoogleMapWithClusters carsList={cars} />;
      default: return <HomeContent isLoading={carsLoading} isError={isError} cars={cars || []} />;
    }
  };
  
  // משתמש מחובר אם יש אובייקט ב-Redux או אם אנחנו כרגע בטעינה שלו מהשרת
  const isUserLoggedIn = !!currentUser || (!!token && isUserLoading);

  return (
    <MainLayout 
      currentUser={currentUser}
      onLogoClick={() => setActiveView('home')}
      onRegisterClick={!isUserLoggedIn ? () => setActiveView('register') : null}
      onNewOrderClick={() => {
        if (isUserLoggedIn) {
          setActiveView('map');
        } else {
          setActiveView('auth');
        }
      }} 
      onProfileClick={() => setActiveView('profile')} 
    >
      {renderContent()}
    </MainLayout>
  );
};

export default MainPage;