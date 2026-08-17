'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface MapViewProps {
  value: string;
}

export default function MapView({ value }: MapViewProps) {
  const containerId = useRef(`map-view-${Math.round(Math.random() * 1e9)}`);
  const [hasCoords, setHasCoords] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // 1. Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // 2. Parse coordinates
    let lat = 9.03;
    let lng = 38.74;
    const match = value?.match(/query=([-0-9.]+),([-0-9.]+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
      setHasCoords(true);
    } else {
      setHasCoords(false);
      return () => {
        document.head.removeChild(link);
      };
    }

    // 3. Fix icon markers
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // 4. Initialize map synchronously
    const map = L.map(containerId.current).setView([lat, lng], 15);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.marker([lat, lng]).addTo(map);

    return () => {
      document.head.removeChild(link);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [value]);

  if (!hasCoords && !value?.match(/query=([-0-9.]+),([-0-9.]+)/)) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Interactive Map Location</h3>
      <div 
        id={containerId.current} 
        className="h-80 w-full rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm overflow-hidden z-10"
      />
    </div>
  );
}
