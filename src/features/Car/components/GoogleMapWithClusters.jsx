import React, { useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClusterer } from '@react-google-maps/api';
import '../Style/GoogleMapWithClusters.css'; // ניצור קובץ CSS ייעודי למפה עם אשכולות
const GoogleMapWithClusters = ({ carsList }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAt5iqzT61JEypZuLYOCJi9tGBIaQK443U",
    language: 'iw',
    region: 'IL'
  });

  // מיקוד המפה למרכז אלעד כדי שתראי את הרחובות מיד
  const center = useMemo(() => ({ lat: 32.0515, lng: 34.9507 }), []);

  if (!isLoaded) return <div style={{ color: 'white', padding: '20px' }}>טוען מפה של אלעד...</div>;

  return (
    <div className="map-wrapper" style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
      <div className="map-container" style={{ height: '600px', width: '100%' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={15} // זום קרוב מספיק כדי לראות שמות רחובות
          options={{ 
            disableDefaultUI: false, // מאפשר כפתורי זום ומפה רגילה
            clickableIcons: true,
            scrollwheel: true
          }}
        >
          {/* רינדור הסמנים לפי הרכבים ששלפת מה-API */}
          {carsList && carsList.length > 0 && (
            <MarkerClusterer>
              {(clusterer) =>
                carsList.map((car) => (
                  <MarkerF
                    key={car.id || car._id}
                    // שימוש בנכסים המדויקים שציינת: Latitude ו-Longitude
                    position={{ 
                      lat: parseFloat(car.latitude || car.Latitude), 
                      lng: parseFloat(car.longitude || car.Longitude) 
                    }}
                    clusterer={clusterer}
                    title={car.model || "רכב Smart-Ride"}
                    icon={{
                      // שימוש בתמונת רכב כסמן
                      url: car.isAvailable === false ? '/icons/pink-car.png' : '/icons/purple-car.png',
                      scaledSize: new window.google.maps.Size(45, 45), // גודל האייקון
                      origin: new window.google.maps.Point(0, 0),
                      anchor: new window.google.maps.Point(22, 22)
                    }}
                  />
                ))
              }
            </MarkerClusterer>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default GoogleMapWithClusters;