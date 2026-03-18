import React, { useState } from 'react';
import { useSelector } from 'react-redux'; 
import { useGetAllCarsQuery } from '../../Car/redux/carApi.jsx';
import MainLayout from './MainLayout.jsx';
import HomeContent from './HomeContent.jsx';
import Register from './Register.jsx';
import UploadDocuments from './UploadDocuments.jsx';

const MainPage = () => {
  const [activeView, setActiveView] = useState('home');
  
  // --- הוספת ה-State של המסמכים כאן ---
  const [uploadData, setUploadData] = useState({ 0: null, 1: null, 2: null });

  const { isLoading, isError } = useGetAllCarsQuery();
  const currentUser = useSelector((state) => state.user.currentUser);
  const cars = useSelector((state) => state.car.carsList);

  // פונקציית סיום (כשמסיימים את כל 3 התמונות)
  const handleUploadFinish = () => {
    console.log("כל התמונות הועלו:", uploadData);
    // כאן תוכלי להחליט אם לעבור למסך הבא או לשלוח לדאטה-בייס
    setActiveView('register'); 
  };

  const renderContent = () => {
    switch (activeView) {
      case 'register': 
        return <Register onStepClick={(step) => setActiveView(step)} />;
      
      case 'upload': 
        return (
          <UploadDocuments 
            onBack={() => setActiveView('register')} 
            onFinish={handleUploadFinish}
            uploadData={uploadData}      // מעבירים את הנתונים
            setUploadData={setUploadData} // מעבירים את פונקציית העדכון
          />
        );

      case 'questions': 
        return <PersonalQuestions onBack={() => setActiveView('register')} />;
      
      case 'signature': 
        return <Signature onBack={() => setActiveView('register')} />;
      
      case 'home': 
        return <HomeContent isLoading={isLoading} isError={isError} cars={cars} />;
      
      default: 
        return <HomeContent isLoading={isLoading} isError={isError} cars={cars} />;
    }
  };

  return (
    <MainLayout 
      userName={currentUser?.name}
      onLogoClick={() => setActiveView('home')}
      onRegisterClick={() => setActiveView('register')}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default MainPage;