import React, { useMemo, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClusterer } from '@react-google-maps/api';
import '../Style/GoogleMapWithClusters.css';
import RouteSidePanel from './RouteSidePanel.jsx';
import CarSelectionList from './CarSelectionList.jsx';
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

  const [currentStep, setCurrentStep] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [originSelection, setOriginSelection] = useState(null); 
  const [showGridFull, setShowGridFull] = useState(false);
  const [sortedCars, setSortedCars] = useState([]);
  const [_selectedCarId, setSelectedCarId] = useState(null);
  const [shouldFetchClosest, setShouldFetchClosest] = useState(false);

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
        () => alert("יש לאשר הרשאות מיקום.")
      );
    }
  };

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

  React.useEffect(() => {
    if (closestData && Array.isArray(closestData)) {
      setSortedCars(closestData.map((c, idx) => ({ ...c, id: c.Id || c.id || idx })));
      setShowGridFull(true);
    }
  }, [closestData]);

  if (!isLoaded) return <div className="loading-map">טוען...</div>;

  return (
    <div className="map-wrapper">
      <div className="map-inner-container">

        {/* צד שמאל: תפריט שלבים */}
        <div className="left-steps-panel">
          <div className="steps-container">
            <div className="steps-title">ביצוע הזמנה</div>
            {[1, 2, 3].map(step => {
              const labels = ['מסלולים זמינים', 'בחירת רכב', 'בחירת כיסויים'];
              const isCompleted = completedSteps.includes(step);
              const isActive = currentStep === step;

              return (
                <div
                  key={step}
                  className={`step-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => {
                    if (step === 1 || step === 2 || completedSteps.includes(step - 1)) {
                      setCurrentStep(step);
                      if (step === 1) setShowSidePanel(true);
                      if (step === 2) {
                        setShowGridFull(true);
                        if (userLocation) {
                          setShouldFetchClosest(true);
                        } else if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                              setUserLocation(coords);
                              setShouldFetchClosest(true);
                            },
                            () => {
                              setShowGridFull(true);
                            },
                            { enableHighAccuracy: true }
                          );
                        } else {
                          setShowGridFull(true);
                        }
                      }
                    }
                  }}
                >
                  <div className="step-circle">{isCompleted ? '✓' : ''}</div>
                  <div className="step-text">
                    <span className="step-number">שלב {step}</span>
                    <span className="step-label">{labels[step - 1]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="main-display-area">
          <div className="map-and-grid">
            {!showGridFull ? (
              <div className="map-view">
            <GoogleMap
              mapContainerClassName="google-map-instance"
              onLoad={map => mapRef.current = map}
              center={processedCars[0]?.position || { lat: 32.05, lng: 34.95 }}
              zoom={14}
              options={{ styles: whiteMinimalStyle, disableDefaultUI: true }}
            >
              {userLocation && (
                <MarkerF position={userLocation} icon={{ url: '/assets/my_position_icon.png', scaledSize: new window.google.maps.Size(30, 40) }} />
              )}
              <MarkerClusterer>
                {(clusterer) =>
                  processedCars.map((car) => (
                    <MarkerF
                      key={car.id}
                      position={car.position}
                      clusterer={clusterer}
                      onClick={() => { setSelectedCar(car); setSelectedCarId(car.id); setOriginSelection('map'); setShowSidePanel(true); }}
                      icon={{ url: car.carIcon, scaledSize: new window.google.maps.Size(25, 45) }}
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
            ) : (
              <div className="grid-full">
                <CarSelectionList
                  cars={sortedCars.length ? sortedCars : processedCars}
                  onSelectCar={(car) => {
                      setSelectedCar(car);
                      setSelectedCarId(car.id);
                      setCompletedSteps(prev => [...new Set([...prev, 2])]);
                      setCurrentStep(3);
                      if (typeof onCarSelect === 'function') {
                        onCarSelect(car);
                      }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {showSidePanel && (
          <div className="route-panel-overlay">
            <RouteSidePanel
              selectedCar={selectedCar}
              onClose={() => { setShowSidePanel(false); setSelectedCar(null); setOriginSelection(null); }}
              onConfirm={async (payload) => {
                setCompletedSteps(prev => [...new Set([...prev, 1])]);
                setCurrentStep(2);
                setShowSidePanel(false);
                try {
                  if (typeof onRouteConfirm === 'function') {
                    try { onRouteConfirm(payload); } catch { /* ignore */ }
                  }

                  if (originSelection === 'grid') {
                    if (payload.selectedCar) {
                      setSelectedCar(payload.selectedCar);
                      setSelectedCarId(payload.selectedCar.id);
                    }
                    if (payload.selectedCar && payload.selectedCar.position) {
                      const origin = payload.selectedCar.position;
                      setUserLocation(origin);
                      setShouldFetchClosest(true);
                    } else if (userLocation) {
                      setShouldFetchClosest(true);
                    } else {
                      setSortedCars(processedCars);
                      setShowGridFull(true);
                    }
                  } else if (originSelection === 'map') {

                    if (payload.selectedCar) {
                      setSelectedCarId(payload.selectedCar.id);
                      setCompletedSteps(prev => [...new Set([...prev, 2])]);
                      setCurrentStep(3);
                      if (typeof onCarSelect === 'function') {
                        try { onCarSelect(payload.selectedCar); } catch { /* ignore */ }
                      }
                    }
                    setShowGridFull(false);
                  } else {
                    setShowGridFull(false);
                  }
                } catch (e) {
                  console.error('Error handling route confirm', e);
                } finally {
                  setOriginSelection(null);
                }
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default GoogleMapWithClusters;
