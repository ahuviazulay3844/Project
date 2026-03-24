import React, { useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import '../Style/GoogleMapWithMarkerars.css';
const whiteMinimalStyle = [
  { elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#000000" }] },
  { elementType: "labels.text.stroke", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#cccccc" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", stylers: [{ color: "#ffffff" }] }
];

const GoogleMapWithMarker = ({ carLocation, carTitle }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAt5iqzT61JEypZuLYOCJi9tGBIaQK443U",
    language: 'iw',
    region: 'IL'
  });

  const position = useMemo(() => ({
    lat: parseFloat(carLocation?.latitude || carLocation?.lat || carLocation?.Latitude || 0),
    lng: parseFloat(carLocation?.longitude || carLocation?.lng || carLocation?.Longitude || 0)
  }), [carLocation]);

  if (!isLoaded) return <div className="loading-map">טוען מפה...</div>;

  return (
    <div className="map-container-style">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '15px' }}
        center={position}
        zoom={16}
        options={{ 
          disableDefaultUI: true, 
          zoomControl: true, 
          styles: whiteMinimalStyle 
        }}
      >
        <MarkerF
          position={position}
          title={carTitle}
          icon={{
            url: '/assets/car-purple.png', 
            scaledSize: new window.google.maps.Size(45, 45),
            anchor: new window.google.maps.Point(22, 22)
          }}
        />
      </GoogleMap>
    </div>
  );
};

export default GoogleMapWithMarker;