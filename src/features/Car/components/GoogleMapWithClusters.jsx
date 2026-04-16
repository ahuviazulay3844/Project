import React, { useMemo, useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClusterer } from '@react-google-maps/api';
import '../Style/GoogleMapWithClusters.css';
import RouteSidePanel from './RouteSidePanel.jsx';
import CoverageSidePanel from './CoverageSidePanel.jsx';
import CarSelectionList from './CarSelectionList.jsx';
import CreateOrder from '../../Order/components/CreateOrder.jsx'; 
import { useGetClosestCarsQuery } from '../redux/carApi.jsx';

const whiteMinimalStyle = [
  { elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#cccccc" }] },
  { featureType: "landscape", stylers: [{ color: "#ffffff" }] }
];

const carIcons = [
  '/assets/car_icon_purple.png',
  '/assets/car_icon_light_blue.png',
  '/assets/car_icon_red.png',
  '/assets/car_icon_grey.png'
];

const GoogleMapWithClusters = ({ carsList = [], onCarSelect, onRouteConfirm }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAt5iqzT61JEypZuLYOCJi9tGBIaQK443U",
    language: 'iw',
    region: 'IL'
  });

  const [notification, setNotification] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [originSelection, setOriginSelection] = useState(null); 
  const [showGridFull, setShowGridFull] = useState(false);
  const [sortedCars, setSortedCars] = useState([]);
  const [shouldFetchClosest, setShouldFetchClosest] = useState(false);
  const [orderPayload, setOrderPayload] = useState(null);

  const mapRef = useRef(null);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          mapRef.current?.panTo(coords);
          mapRef.current?.setZoom(16);
        },
        () => setNotification('יש לאשר הרשאות מיקום בדפדפן.')
      );
    }
  };

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const processedCars = useMemo(() => {
    return (carsList || [])
      .filter(car => {
        const lat = parseFloat(car.Latitude || car.latitude || car.lat);
        const lng = parseFloat(car.Longitude || car.longitude || car.lng);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0;
      })
      .map((car, index) => ({
        ...car,
        id: car.Id || car.id || index,
        position: {
          lat: parseFloat(car.Latitude || car.latitude || car.lat),
          lng: parseFloat(car.Longitude || car.longitude || car.lng)
        },
        isAvailable: car.Status?.includes("פנוי") || car.isAvailable !== false,
        carIcon: carIcons[Math.abs(car.Id || index) % carIcons.length]
      }));
  }, [carsList]);

  const { data: closestData } = useGetClosestCarsQuery(
    { lat: userLocation?.lat, lng: userLocation?.lng },
    { skip: !shouldFetchClosest || !userLocation }
  );

  useEffect(() => {
    if (closestData && Array.isArray(closestData) && sortedCars.length === 0) {
      setSortedCars(closestData.map((c, idx) => ({ ...c, id: c.Id || c.id || idx })));
      setShowGridFull(true);
    }
  }, [closestData, sortedCars.length]);

  if (!isLoaded) return <div className="loading-map">טוען...</div>;

  return (
    <div className="map-wrapper">
      <div className="map-inner-container">
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
                    if (step === 1) {
                        setShowSidePanel(true);
                        setShowGridFull(false);
                    }
                    if (step === 2) {
                       setShowGridFull(true);
                       if (userLocation) setShouldFetchClosest(true);
                    }
                  }
                }}
              >
                <div className="step-circle">{completedSteps.includes(step) ? '✓' : ''}</div>
                <div className="step-text">
                  <span className="step-number">שלב {step}</span>
                  <span className="step-label">{['מסלולים', 'בחירת רכב', 'כיסויים'][step-1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="main-display-area">
          <div className="map-and-grid">
            {completedSteps.includes(3) ? (
              <div className="grid-full">
                <CreateOrder 
                  selectedCar={selectedCar}
                  orderDetails={orderPayload}
                  hasWaiver={JSON.parse(localStorage.getItem("coverage_waiver"))}
                  onBack={() => {
                    setCompletedSteps(prev => prev.filter(s => s !== 3));
                    setCurrentStep(3);
                  }}
                />
              </div>
            ) : currentStep === 3 ? (
              <div className="grid-full">
                <CoverageSidePanel
                  selectedCar={selectedCar}
                  onClose={() => setCurrentStep(2)}
                  onConfirm={(payload) => {
                    localStorage.setItem("coverage_waiver", JSON.stringify(payload.hasWaiver));
                    // מיזוג נתונים קריטי: שומר על זמני הנסיעה משלב 1 ומוסיף את פרטי הכיסוי
                    setOrderPayload(prev => ({ ...prev, ...payload })); 
                    setCompletedSteps(prev => [...new Set([...prev, 3])]);
                  }}
                />
              </div>
            ) : showGridFull ? (
              <div className="grid-full">
                <CarSelectionList
                  cars={sortedCars.length ? sortedCars : processedCars}
                  onSelectCar={(car) => {
                    setSelectedCar(car);
                    setCompletedSteps(prev => [...new Set([...prev, 2])]);
                    setCurrentStep(3);
                    if (onCarSelect) onCarSelect(car);
                  }}
                />
              </div>
            ) : (
              <div className="map-view">
                <GoogleMap
                  mapContainerClassName="google-map-instance"
                  onLoad={map => mapRef.current = map}
                  center={processedCars[0]?.position || { lat: 32.05, lng: 34.95 }}
                  zoom={14}
                  options={{ styles: whiteMinimalStyle, disableDefaultUI: true }}
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
                    {(clusterer) =>
                      processedCars.map((car) => (
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
                      ))
                    }
                  </MarkerClusterer>
                </GoogleMap>
                <div className="custom-zoom-controls">
                  <button onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() + 1)}>+</button>
                  <button onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() - 1)}>-</button>
                </div>
                <button className="my-location-floating-btn" onClick={handleLocationClick}>
                  <div className="location-outer-circle"><div className="location-inner-dot"></div></div>
                </button>
              </div>
            )}
          </div>
        </div>

        {showSidePanel && (
          <div className="route-panel-overlay">
            <RouteSidePanel
              selectedCar={selectedCar}
              onClose={() => { setShowSidePanel(false); setOriginSelection(null); }}
              onConfirm={(payload) => {
                setOrderPayload(payload); 
                setCompletedSteps(prev => [...new Set([...prev, 1])]);
                setCurrentStep(2);
                setShowSidePanel(false);
                if (onRouteConfirm) onRouteConfirm(payload);
                
                // אם הרכב נבחר ישירות מהמפה, אנחנו מדלגים על בחירת הרכב (שלב 2) ועוברים ישר לכיסויים
                if (originSelection === 'map') {
                   setCompletedSteps(prev => [...new Set([...prev, 1, 2])]);
                   setCurrentStep(3);
                } else {
                   setShowGridFull(true);
                }
              }}
            />
          </div>
        )}
      </div>
      {notification && <div className="notification-toast">{notification}</div>}
    </div>
  );
};

export default GoogleMapWithClusters;