import React, { useState } from 'react';
import { useSelector } from 'react-redux'; 
import { useGetAllCarsQuery } from '../../Car/redux/carApi.jsx';
import MainLayout from './MainLayout.jsx';
import HomeContent from './HomeContent.jsx';
import Register from './Register.jsx';
import UploadDocuments from './UploadDocuments.jsx';
import PersonalQuestions from './PersonalDetails.jsx'; 
import Signature from './Signature.jsx'; 
import AuthPage from './AuthPage.jsx';
import PersonalArea from './PersonalArea.jsx';
import GoogleMapWithClusters from '../../Car/components/GoogleMapWithClusters.jsx';

const MainPage = () => {
  const [activeView, setActiveView] = useState('home');
  const currentUser = useSelector((state) => state.user.currentUser);
  
  const cars = useSelector((state) => state.car.carsList);
  const { isLoading, isError } = useGetAllCarsQuery();

  const renderContent = () => {
    switch (activeView) {
      case 'register': return <Register onStepClick={(step) => setActiveView(step)} />;
      case 'upload': return <UploadDocuments onBack={() => setActiveView('register')} onFinish={() => setActiveView('register')} />;
      case 'questions': return <PersonalQuestions onBack={() => setActiveView('register')} onNext={() => setActiveView('register')} />;
      case 'signature': return <Signature onBack={() => setActiveView('register')} onComplete={() => setActiveView('register')} />;
      case 'auth': return <AuthPage onLoginSuccess={() => setActiveView('home')} onSwitchToRegister={() => setActiveView('register')} />;
      
      case 'map': return <GoogleMapWithClusters carsList={cars} />; 
      
      case 'home': 
      default: return <HomeContent isLoading={isLoading} isError={isError} cars={cars} />;
    }
  };
  
  return (
    <MainLayout 
      userName={currentUser?.firstName}
      onLogoClick={() => setActiveView('home')}
      onRegisterClick={() => setActiveView('register')}
      onNewOrderClick={() => setActiveView('map')} 
      onProfileClick={() => setActiveView('profile')} 
    >
      {renderContent()}
    </MainLayout>
  );
};

export default MainPage;