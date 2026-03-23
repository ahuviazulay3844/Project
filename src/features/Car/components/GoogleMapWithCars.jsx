import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '400px' };

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
    libraries: ["places"],
    language: 'iw',
    region: 'IL'
  });

  const position = {
    lat: parseFloat(carLocation?.latitude || carLocation?.lat),
    lng: parseFloat(carLocation?.longitude || carLocation?.lng)
  };

  if (!isLoaded) return <div style={{ color: 'black' }}>טוען מפה...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={position}
      zoom={15}
      options={{ disableDefaultUI: true, zoomControl: true, styles: whiteMinimalStyle }}
    >
      <MarkerF
        position={position}
        title={carTitle}
        icon={{
          url: '/icons/car-black.png', // ודא שהסמן קיים בתיקיית public/icons
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }}
      />
    </GoogleMap>
  );
};

export default GoogleMapWithMarker;