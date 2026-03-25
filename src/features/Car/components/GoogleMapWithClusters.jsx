import React, { useMemo, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClusterer } from '@react-google-maps/api';
import '../Style/GoogleMapWithClusters.css';

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

const GoogleMapWithClusters = ({ carsList = [], onCarSelect }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAt5iqzT61JEypZuLYOCJi9tGBIaQK443U", 
    language: 'iw',
    region: 'IL'
  });

  const [userLocation, setUserLocation] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
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
        () => alert("יש לאשר הרשאות מיקום."),
        { enableHighAccuracy: true }
      );
    }
  };

  const processedCars = useMemo(() => {
    return (carsList || [])
      .filter(car => {
        // תמיכה ב-PascalCase מה-API (Latitude/Longitude)
        const lat = parseFloat(car.Latitude || car.latitude || car.lat);
        const lng = parseFloat(car.Longitude || car.longitude || car.lng);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0;
      })
      .map((car, index) => {
        const lat = parseFloat(car.Latitude || car.latitude || car.lat);
        const lng = parseFloat(car.Longitude || car.longitude || car.lng);
        return {
          ...car,
          position: { lat, lng },
          carIcon: carIcons[Math.abs(car.Id || car.id || index) % carIcons.length]
        };
      });
  }, [carsList]);

  if (!isLoaded) return <div className="loading-map">טוען מפה...</div>;

  return (
    <div className="map-wrapper">
      <div className="map-inner-container">
        
        <GoogleMap
          mapContainerClassName="google-map-instance"
          onLoad={map => mapRef.current = map}
          center={processedCars.length > 0 ? processedCars[0].position : { lat: 32.0515, lng: 34.9507 }}
          zoom={14}
          options={{ styles: whiteMinimalStyle, disableDefaultUI: true }}
        >
          {userLocation && (
            <MarkerF 
              position={userLocation} 
              icon={{ url: '/assets/my_position_icon.png', scaledSize: new window.google.maps.Size(30, 40) }} 
            />
          )}

          <MarkerClusterer>
            {(clusterer) =>
              processedCars.map((car, index) => (
                <MarkerF
                  key={car.Id || car.id || index}
                  position={car.position}
                  clusterer={clusterer}
                  onClick={() => setSelectedCar(car)}
                  icon={{
                    url: car.carIcon,
                    scaledSize: new window.google.maps.Size(25, 45),
                    anchor: new window.google.maps.Point(12.5, 22.5)
                  }}
                />
              ))
            }
          </MarkerClusterer>
        </GoogleMap>

        <div className="custom-zoom-controls">
          <button type="button" onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() + 1)}>+</button>
          <button type="button" onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() - 1)}>-</button>
        </div>

        <button className="my-location-floating-btn" onClick={handleLocationClick} type="button">
          <div className="location-outer-circle"><div className="location-inner-dot"></div></div>
        </button>

      {selectedCar && (
  <div className="custom-modal-overlay">
    <div className="car-details-popup">
      <button className="close-popup-btn" onClick={() => setSelectedCar(null)}>✕</button>
      
      <h2 className="status-title">{selectedCar.Status || selectedCar.status || "פנוי"}</h2>

      <div className="popup-image-container">
        {/* שימוש בלוגיקה שעבדה לך בגלריה */}
        <img 
          src={selectedCar.imageUrl || selectedCar.carImageUrl || selectedCar.ImageUrl || `/assets/${(selectedCar.Model || selectedCar.model || 'default').toLowerCase().replace(' ', '_')}.png`} 
          alt={selectedCar.Model || selectedCar.model} 
          className="car-main-img" 
          onError={(e) => { 
            console.log("Image load failed, switching to default");
            e.target.src = '/assets/default_car.png'; 
          }}
        />
      </div>

      <div className="popup-info">
        <h3 className="location-name">{selectedCar.StartParking || selectedCar.startParking || "מיקום התחנה"}</h3>
        <p className="car-model-name">{selectedCar.Model || selectedCar.model || "דגם רכב"}</p>
        <button className="change-times-btn" type="button">שנה זמנים</button>
      </div>

      <button className="action-confirm-btn" type="button" onClick={() => {
        if(onCarSelect) onCarSelect(selectedCar);
        setSelectedCar(null);
      }}>
        המשך בהזמנה
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
} 
export default GoogleMapWithClusters;