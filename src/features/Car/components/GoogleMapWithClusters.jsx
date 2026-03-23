import React, { useMemo, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  MarkerClusterer
} from '@react-google-maps/api';

const GoogleMapWithClusters = ({ carsList = [] }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAt5iqzT61JEypZuLYOCJi9tGBIaQK443U",
    language: 'iw',
    region: 'IL'
  });

  const mapRef = useRef(null);

  const carsWithLocation = carsList.filter(car => {
    const lat = parseFloat(car.latitude);
    const lng = parseFloat(car.longitude);
    return lat && lng;
  });

  // התאמת המפה לכל הרכבים
  useEffect(() => {
    if (mapRef.current && carsWithLocation.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      carsWithLocation.forEach(car => {
        const lat = parseFloat(car.Latitude || car.latitude);
        const lng = parseFloat(car.Longitude || car.longitude);
        bounds.extend({ lat, lng });
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [carsWithLocation]);

  const center = useMemo(() => ({ lat: 32.0515, lng: 34.9507 }), []);

  if (!isLoaded) return <div>טוען מפה...</div>;

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={15}
        onLoad={map => (mapRef.current = map)}
      >
        {carsWithLocation.length > 0 && (
          <MarkerClusterer>
            {clusterer =>
              carsWithLocation.map(car => {
                const lat = parseFloat(car.Latitude || car.latitude);
                const lng = parseFloat(car.Longitude || car.longitude);

                return (
                  <MarkerF
                    key={car.id || car.Id}
                    position={{ lat, lng }}
                    clusterer={clusterer}
                  />
                );
              })
            }
          </MarkerClusterer>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapWithClusters;