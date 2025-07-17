
'use client';

import { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
  value: {
    address: string;
    lat?: number;
    lng?: number;
  };
  onChange?: (value: { address: string; lat: number; lng: number }) => void;
  readOnly?: boolean;
}

const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// This component updates the map view when the position changes.
function MapEffect({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    if (position && map) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

// The MapDisplay component is memoized to prevent re-rendering.
const MapDisplay = memo(function MapDisplay({ lat, lng, readOnly, onMarkerMove }: { lat: number; lng: number; readOnly: boolean; onMarkerMove: (lat: number, lng: number) => void }) {
    const markerRef = useRef(null);
    const position: [number, number] = [lat, lng];
    
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker) {
                    const { lat, lng } = (marker as any).getLatLng();
                    onMarkerMove(lat, lng);
                }
            },
        }),
        [onMarkerMove]
    );

    return (
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={!readOnly} scrollWheelZoom={!readOnly}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker
                position={position}
                icon={customIcon}
                ref={markerRef}
                draggable={!readOnly}
                eventHandlers={eventHandlers}
            />
            <MapEffect position={position} />
        </MapContainer>
    );
});


export function LocationPicker({ value, onChange, readOnly = false }: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState(value.address || '');
  const [position, setPosition] = useState<[number, number]>([value.lat || 51.505, value.lng || -0.09]);
  const [address, setAddress] = useState(value.address || 'London');
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    setSearchTerm(value.address);
    if (value.lat && value.lng && (value.lat !== position[0] || value.lng !== position[1])) {
      setPosition([value.lat, value.lng]);
    }
    setAddress(value.address);
  }, [value, position]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPos);
        setAddress(display_name);
        if (onChange) {
            onChange({ address: display_name, lat: newPos[0], lng: newPos[1] });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Location not found',
          description: 'Please try a different search term.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Search failed',
        description: 'Could not fetch location data.',
      });
    }
  };

  const handleMarkerMove = useCallback((lat: number, lng: number) => {
    if (onChange) {
      // For simplicity, we keep the last searched address upon manual drag.
      // A reverse geocoding API call could be added here for more accuracy.
      onChange({ address: address, lat, lng });
    }
  }, [onChange, address]);
  
  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="Search for a location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="button" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="h-64 w-full rounded-md overflow-hidden border">
        {isClient ? (
            <MapDisplay 
                lat={position[0]} 
                lng={position[1]} 
                readOnly={readOnly} 
                onMarkerMove={handleMarkerMove} 
            />
        ) : (
            <div className="flex items-center justify-center h-full bg-muted">Loading map...</div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{address}</p>
    </div>
  );
}

export default LocationPicker;
