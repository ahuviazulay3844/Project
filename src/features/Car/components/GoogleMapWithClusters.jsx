import React, { useMemo, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClusterer } from '@react-google-maps/api';
import { useGetClosestCarsQuery } from '../redux/carApi.jsx';

// Components
import RouteSidePanel from './RouteSidePanel.jsx';
import CoverageSidePanel from './CoverageSidePanel.jsx';
import CarSelectionList from './CarSelectionList.jsx';
import CreateOrder from '../../Order/components/CreateOrder.jsx';

// Styles
import '../Style/GoogleMapWithClusters.css';

// Constants
const WHITE_MINIMAL_STYLE = [
    { elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#cccccc" }] },
    { featureType: "landscape", stylers: [{ color: "#ffffff" }] }
];

const CAR_ICONS = [
    '/assets/car_icon_purple.png',
    '/assets/car_icon_light_blue.png',
    '/assets/car_icon_red.png',
    '/assets/car_icon_grey.png'
];

const GoogleMapWithClusters = ({ carsList = [], onCarSelect, onRouteConfirm }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyAt5iqzT61JEypZuLYOCJi9tGBIaQK443U", // מומלץ להעביר ל-env
        language: 'iw',
        region: 'IL'
    });

    // State Management
    const [notification, setNotification] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedCar, setSelectedCar] = useState(null);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [originSelection, setOriginSelection] = useState(null);
    const [showGridFull, setShowGridFull] = useState(false);
    const [shouldFetchClosest, setShouldFetchClosest] = useState(false);
    const [orderPayload, setOrderPayload] = useState(null);

    const mapRef = useRef(null);

    // API Calls
// חפש את הבלוק הזה בקוד שלך ותחליף אותו בזה:
const { data: closestCarsFromServer, isFetching } = useGetClosestCarsQuery(
    { 
        lat: userLocation?.lat, 
        lng: userLocation?.lng,
        // המרה ל-String פשוט (ISO) כדי ש-Redux יפסיק להתרסק
        start: orderPayload?.start ? new Date(orderPayload.start).toISOString() : null,
        end: orderPayload?.end ? new Date(orderPayload.end).toISOString() : null
    },
    { skip: !shouldFetchClosest || !userLocation }
);

    // Handlers
    const handleLocationClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(coords);
                    setShouldFetchClosest(true);
                    mapRef.current?.panTo(coords);
                    mapRef.current?.setZoom(16);
                },
                () => setNotification('יש לאשר הרשאות מיקום בדפדפן.')
            );
        }
    };

    const processedCars = useMemo(() => {
        const rawData = closestCarsFromServer?.data || closestCarsFromServer;
        const sourceList = (Array.isArray(rawData) && rawData.length > 0) ? rawData : carsList;

        return (sourceList || [])
            .filter(car => car.Latitude || car.latitude)
.map((car, index) => ({
    ...car,
    id: car.Id || car.id || index,

    status: car.Status ?? car.status,

    position: {
        lat: parseFloat(car.Latitude || car.latitude),
        lng: parseFloat(car.Longitude || car.longitude)
    },

    distance: car.Distance ?? car.distance ?? 999,

    carIcon: CAR_ICONS[Math.abs(car.Id || index) % CAR_ICONS.length]
}))
            .sort((a, b) => a.distanceVal - b.distanceVal);
    }, [carsList, closestCarsFromServer]);

    if (!isLoaded) return <div className="loading-map">טוען...</div>;

    return (
        <div className="map-wrapper">
            <div className="map-inner-container">
                
                {/* Steps Sidebar */}
                <div className="left-steps-panel">
                    <div className="steps-container">
                        <div className="steps-title">ביצוע הזמנה</div>
                        {[1, 2, 3].map(step => (
                            <div
                                key={step}
                                className={`step-pill ${currentStep === step ? 'active' : ''} ${completedSteps.includes(step) ? 'completed' : ''}`}
                                onClick={() => {
                                    if (step === 1 || completedSteps.includes(step - 1)) {
                                        setCurrentStep(step);
                                        if (step === 1) { setShowSidePanel(true); setShowGridFull(false); }
                                        if (step === 2) {
                                            setShowGridFull(true);
                                            if (!userLocation) handleLocationClick();
                                            else setShouldFetchClosest(true);
                                        }
                                    }
                                }}
                            >
                                <div className="step-circle">{completedSteps.includes(step) ? '✓' : ''}</div>
                                <div className="step-text">
                                    <span className="step-number">שלב {step}</span>
                                    <span className="step-label">{['מסלולים', 'בחירת רכב', 'כיסויים'][step - 1]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="main-display-area">
                    <div className="map-and-grid">
                        
                        {/* Final Step: Order Summary */}
                        {completedSteps.includes(3) ? (
                            <div className="grid-full">
                                <CreateOrder
                                    selectedCar={selectedCar}
                                    orderDetails={orderPayload}
                                    onBack={() => {
                                        setCompletedSteps(prev => prev.filter(s => s !== 3));
                                        setCurrentStep(3);
                                    }}
                                    onGoToStep={(s) => setCurrentStep(s)}
                                />
                            </div>
                        ) : currentStep === 3 ? (
                            /* Step 3: Coverage */
                            <div className="grid-full">
                                <CoverageSidePanel
                                    selectedCar={selectedCar}
                                    orderDetails={orderPayload}
                                    onClose={() => setCurrentStep(2)}
                                    onConfirm={(payload) => {
                                        setOrderPayload(prev => ({ ...prev, ...payload }));
                                        setCompletedSteps(prev => [...new Set([...prev, 3])]);
                                    }}
                                />
                            </div>
                        ) : showGridFull ? (
                            /* Step 2: Car List */
                            <div className="grid-full">
                                {isFetching ? (
                                    <div className="loading-overlay">מחשב רכבים קרובים...</div>
                                ) : (
                                    <CarSelectionList
                                        cars={processedCars}
                                        onSelectCar={(car) => {
                                            setSelectedCar(car);
                                            setCompletedSteps(prev => [...new Set([...prev, 2])]);
                                            setCurrentStep(3);
                                            if (onCarSelect) onCarSelect(car);
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            /* Step 1: Map View */
                            <div className="map-view">
                                <GoogleMap
                                    mapContainerClassName="google-map-instance"
                                    onLoad={map => (mapRef.current = map)}
                                    center={userLocation || processedCars[0]?.position || { lat: 32.05, lng: 34.95 }}
                                    zoom={14}
                                    options={{
                                        styles: WHITE_MINIMAL_STYLE,
                                        disableDefaultUI: true,
                                        zoomControl: true,
                                        zoomControlOptions: {
                                            position: window.google?.maps?.ControlPosition?.LEFT_BOTTOM
                                        }
                                    }}
                                >
                                    {userLocation && (
                                        <MarkerF 
                                            position={userLocation} 
                                            icon={{ 
                                                url: '/assets/my_position_icon.png', 
                                                scaledSize: new window.google.maps.Size(30, 40) 
                                            }} 
                                        />
                                    )}
                                    
                                    <MarkerClusterer>
                                        {(clusterer) => processedCars.map((car) => (
                                            <MarkerF
                                                key={car.id}
                                                position={car.position}
                                                clusterer={clusterer}
                                                onClick={() => {
                                                    setSelectedCar(car);
                                                    setOriginSelection('map');
                                                    setShowSidePanel(true);
                                                }}
                                                icon={{
                                                    url: car.carIcon,
                                                    scaledSize: new window.google.maps.Size(25, 45)
                                                }}
                                            />
                                        ))}
                                    </MarkerClusterer>
                                </GoogleMap>

                                <button className="my-location-floating-btn" onClick={handleLocationClick}>
                                    <div className="location-outer-circle">
                                        <div className="location-inner-dot"></div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Panel for Route Selection */}
                {showSidePanel && (
                    <RouteSidePanel
                        selectedCar={selectedCar}
                        initialData={orderPayload}
                        onClose={() => { setShowSidePanel(false); setOriginSelection(null); }}
                        onConfirm={(payload) => {
                            setOrderPayload(payload);
                            setCompletedSteps(prev => [...new Set([...prev, 1])]);
                            setShowSidePanel(false);
                            
                            if (originSelection === 'map') {
                                setCompletedSteps(prev => [...new Set([...prev, 1, 2])]);
                                setCurrentStep(3);
                            } else {
                                setCurrentStep(2);
                                setShowGridFull(true);
                                if (!userLocation) handleLocationClick();
                                else setShouldFetchClosest(true);
                            }
                        }}
                    />
                )}
            </div>

            {/* Notifications */}
            {notification && <div className="notification-toast">{notification}</div>}
        </div>
    );
};

export default GoogleMapWithClusters;