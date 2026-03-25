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

const GoogleMapWithClusters = ({ carsList = [] }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAt5iqzT61JEypZuLYOCJi9tGBIaQK443U", 
    language: 'iw',
    region: 'IL'
  });

  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          if (mapRef.current) {
            mapRef.current.panTo(coords);
            mapRef.current.setZoom(16);
          }
        },
        (error) => {
          console.error("Location error:", error);
          alert("כדי להתמקד במיקומך, יש לאשר הרשאות מיקום בדפדפן.");
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const processedCars = useMemo(() => {
    return carsList
      .filter(car => {
        const lat = parseFloat(car.Latitude || car.latitude);
        const lng = parseFloat(car.Longitude || car.longitude);
        return lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng);
      })
      .map((car, index) => {
        const idForIcon = car.id || car.Id || index;
        const iconIndex = Math.abs(idForIcon) % carIcons.length;
        return {
          ...car,
          position: {
            lat: parseFloat(car.Latitude || car.latitude),
            lng: parseFloat(car.Longitude || car.longitude)
          },
          carIcon: carIcons[iconIndex]
        };
      });
  }, [carsList]);

  if (!isLoaded) return <div className="loading-map">טוען מפה...</div>;

  return (
    <div className="map-wrapper">
      <div className="map-container">
        {/* כפתור מיקום צף */}
        <button 
          className="my-location-floating-btn"
          onClick={handleLocationClick}
          title="המיקום שלי"
          type="button"
        >
          <div className="location-outer-circle">
            <div className="location-inner-dot"></div>
          </div>
        </button>

        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          onLoad={map => mapRef.current = map}
          center={{ lat: 32.0515, lng: 34.9507 }}
          zoom={14}
          options={{ 
            styles: whiteMinimalStyle, 
            disableDefaultUI: true, 
            zoomControl: true 
          }}
        >
          {userLocation && (
            <MarkerF
              position={userLocation}
              icon={{
                url: '/assets/my_position_icon.png',
                scaledSize: new window.google.maps.Size(30, 40),
                anchor: new window.google.maps.Point(22, 22)
              }}
              zIndex={1000}
            />
          )}

          <MarkerClusterer>
            {(clusterer) =>
              processedCars.map((car, index) => (
                <MarkerF
                  key={car.id || car.Id || index}
                  position={car.position}
                  clusterer={clusterer}
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
      </div>
    </div>
  );
};

export default GoogleMapWithClusters;