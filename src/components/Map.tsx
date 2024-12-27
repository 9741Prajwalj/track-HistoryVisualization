import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';
import { subscribeToRealtimeLocation, getHistoricalData } from '@/lib/firebase';

// Fix for default marker icon
const icon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
});

// Component to handle map center updates
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

interface MapProps {
  isHistorical?: boolean;
  selectedDate?: Date;
}

export const Map = ({ isHistorical, selectedDate }: MapProps) => {
  const [positions, setPositions] = useState<[number, number][]>([]);
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get current location only once
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const newPosition: [number, number] = [position.coords.latitude, position.coords.longitude];
        setCurrentLocation(newPosition);
        setCenter(newPosition); // Center the map on the current location
      });
    }

    if (isHistorical && selectedDate) {
      // Fetch historical data
      getHistoricalData(selectedDate).then((historicalPositions: any) => {
        if (historicalPositions.length > 0) {
          setPositions(historicalPositions);
          setCenter(historicalPositions[0]); // Center on first position
        }
      });
    } else {
      // Subscribe to real-time updates
      const unsubscribe = subscribeToRealtimeLocation((location) => {
        const newPosition: [number, number] = [location.lat, location.lng];
        setPositions([newPosition]);
        // Do not update currentLocation here to keep it fixed
      });

      return () => {
        unsubscribe();
      };
    }
  }, [isHistorical, selectedDate]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        {positions.map((position, idx) => (
          <Marker key={idx} position={position} icon={icon} />
        ))}
        {currentLocation && (
          <Marker position={currentLocation} icon={icon} />
        )}
        {isHistorical && positions.length > 1 && (
          <Polyline positions={positions} color="#3B82F6" weight={3} />
        )}
      </MapContainer>
    </div>
  );
};