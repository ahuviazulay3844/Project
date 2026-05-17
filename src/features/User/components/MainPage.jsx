import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { useGetAllCarsQuery } from '../../Car/redux/carApi.jsx';
import { useGetCurrentUserQuery, useRegisterUserMutation } from '../redux/userApi';
import { setUser } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import MainLayout from './MainLayout.jsx';
import HomeContent from './HomeContent.jsx';
import Register from './Register.jsx';
import AuthPage from './AuthPage.jsx';
import PersonalArea from './PersonalArea.jsx';
import PersonalQuestions from './PersonalDetails.jsx'; 
import Signature from './Signature.jsx'; 
import GoogleMapWithClusters from '../../Car/components/GoogleMapWithClusters.jsx';
import UploadDocuments from './UploadDocuments.jsx'; 
import UploadForeignDocuments from './UploadForeignDocuments.jsx';
import UserOrders from '../../Order/components/UserOrders.jsx'; 
import PriceList from '../../Car/components/PriceList.jsx'; 

const MainPage = () => {
    const [activeView, setActiveView] = useState('home');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [redirectTo, setRedirectTo] = useState('map'); 
    const [uploadData, setUploadData] = useState({ 0: null, 1: null, 2: null });
    const [foreignUploadData, setForeignUploadData] = useState({ foreign_0: null, foreign_1: null, foreign_2: null });
    const [userData, setUserData] = useState({
        firstName: '', lastName: '', email: '', passwordHash: '',
        phoneNumber: '', licenseNumber: '', passportNumber: '',
        dateOfBirth: '', licenseExpirationDate: '', isNewDriver: false,
        isForeignCitizen: false, countryOfOrigin: 'Israel',
        cardNumber: '', cardExpiry: '', cvv: '' ,address: ''     
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = localStorage.getItem('token');
    const currentUser = useSelector((state) => state.user.currentUser);
    const loggedIn = !!currentUser || !!token;

    const [registerUser] = useRegisterUserMutation();
    const { data: userFromServer } = useGetCurrentUserQuery(undefined, {
        skip: !token || !!currentUser,
    });

    useEffect(() => {
        if (userFromServer && !currentUser) {
            dispatch(setUser(userFromServer));
            if (userFromServer.userType === 1 || userFromServer.userType === 'Admin') {
                navigate('/admin');
            }
        }
    }, [userFromServer, currentUser, dispatch, navigate]);

    const { data: cars = [], isLoading: carsLoading, isError } = useGetAllCarsQuery();

    const handleFinalRegistration = async (sigData) => {
        try {
            const finalData = {
                FirstName: userData.firstName,
                LastName: userData.lastName,
                Address: userData.address,
                Email: userData.email,
                PhoneNumber: userData.phoneNumber,
                Password: userData.passwordHash,
                LicenseNumber: userData.licenseNumber,
                PassportNumber: userData.isForeignCitizen ? userData.passportNumber : null,
                IsForeignCitizen: userData.isForeignCitizen,
                CountryOfOrigin: userData.isForeignCitizen ? userData.countryOfOrigin : "Israel",
                DateOfBirth: userData.dateOfBirth,
                LicenseExpirationDate: userData.licenseExpirationDate,
                CardNumber: userData.cardNumber,
                CardExpiry: userData.cardExpiry,
                CVV: userData.cvv,
                LicenseFrontImg: uploadData[0],
                LicenseBackImg: uploadData[1],
                SelfieImg: uploadData[2],
                PassportImg: userData.isForeignCitizen ? foreignUploadData['foreign_0'] : null,
                VisaImg: userData.isForeignCitizen ? foreignUploadData['foreign_1'] : null,
                EntryPermitImg: userData.isForeignCitizen ? foreignUploadData['foreign_2'] : null,
                Signature: sigData 
            };
            await registerUser(finalData).unwrap();
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                setActiveView('home');
            }, 3000);
        } catch (err) {
            console.error("Full error object:", err);
            alert("שגיאה ברישום: " + (err.data?.message || err.message || "בדקי את הנתונים"));
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'register': return <Register onStepClick={(step) => setActiveView(step)} isForeign={userData.isForeignCitizen} />;
            case 'auth': return <AuthPage onLoginSuccess={() => setActiveView(redirectTo)} onClose={() => setActiveView('home')} onRegisterNavigate={() => setActiveView('register') } />;
            case 'questions': return <PersonalQuestions userData={userData} setUserData={setUserData} onBack={() => setActiveView('register')} onNext={() => setActiveView('upload')} />;
            case 'upload': return <UploadDocuments uploadData={uploadData} setUploadData={setUploadData} onBack={() => setActiveView('questions')} onFinish={() => userData.isForeignCitizen ? setActiveView('foreign') : setActiveView('signature')} />;
            case 'foreign': return <UploadForeignDocuments uploadData={foreignUploadData} setUploadData={setForeignUploadData} onBack={() => setActiveView('upload')} onFinish={() => setActiveView('signature')} />;
            case 'signature': return <Signature onBack={() => setActiveView(userData.isForeignCitizen ? 'foreign' : 'upload')} onComplete={handleFinalRegistration} />;
            case 'profile': return <PersonalArea />; 
            case 'map': return carsLoading ? <div>טוען רכבים...</div> : <GoogleMapWithClusters carsList={cars} />;
            case 'pricing': return <PriceList />;
            case 'orders': return <UserOrders userId={currentUser?.id} />;
            default: return <HomeContent isLoading={carsLoading} isError={isError} cars={cars} onViewPrices={() => setActiveView('pricing')} />;
        }
    };
    return (
        <MainLayout 
            currentUser={currentUser} activeView={activeView} 
            onLogoClick={() => setActiveView('home')} 
            // onRegisterClick={!loggedIn ? () => setActiveView('register') : null}
            onRegisterClick={() => setActiveView('register')}
            onLoginClick={() => { setRedirectTo('home'); setActiveView('auth'); }}
            onPricingClick={() => setActiveView('pricing')}
            onOrdersClick={() => {
                if (loggedIn) setActiveView('orders');
                else { setRedirectTo('orders'); setActiveView('auth'); }
            }}
            onProfileClick={() => {
                if (loggedIn) setActiveView('profile');
                else { setRedirectTo('profile'); setActiveView('auth'); }
            }}
            onNewOrderClick={() => {
                if (loggedIn) setActiveView('map');
                else { setRedirectTo('map'); setActiveView('auth'); }
            }}
        >
            {renderContent()}

            {showSuccessModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <style>{`@keyframes fillProgress { from { width: 0%; } to { width: 100%; } }`}</style>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', textAlign: 'center', width: '90%', maxWidth: '400px' }}>
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px', border: '2px solid #4caf50', margin: '0 auto' }}>
                            <span style={{ color: '#4caf50', fontSize: '50px', fontWeight: 'bold' }}>✓</span>
                        </div>
                        <h2 style={{ color: '#6F3293', fontSize: '1.8rem', fontWeight: '800', marginBottom: '20px' }}>נרשמת בהצלחה!</h2>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f3f3', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', backgroundColor: '#FFC107', animation: 'fillProgress 3s linear forwards' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default MainPage;