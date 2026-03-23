import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const GoogleMapWithMarker = ({ carLocation, carTitle }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAt5iqzT61JEypZuLYOCJi9tGBIaQK443U",
    language: 'iw', // חובה שיהיה זהה לכל הפרויקט
    region: 'IL'
  });

  const position = {
    lat: parseFloat(carLocation?.latitude || carLocation?.lat),
    lng: parseFloat(carLocation?.longitude || carLocation?.lng)
  };

  if (!isLoaded) return <div style={{ color: 'white' }}>טוען מפה...</div>;

  return (
    <div className="map-container" style={{ height: '400px', width: '100%', borderRadius: '15px', overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={position}
        zoom={15}
        options={{ disableDefaultUI: false, zoomControl: true }}
      >
        <MarkerF position={position} title={carTitle} />
      </GoogleMap>
    </div>
  );
};

export default GoogleMapWithMarker;