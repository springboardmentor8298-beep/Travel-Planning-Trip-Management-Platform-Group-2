import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icons in webpack/react bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CITY_COORDS = {
  'Paris': [48.8566, 2.3522],
  'Tokyo': [35.6762, 139.6503],
  'New York': [40.7128, -74.0060],
  'Rome': [41.9028, 12.4964],
  'Bali': [-8.4095, 115.1889],
  'London': [51.5074, -0.1278],
  'Dubai': [25.2048, 55.2708],
  'Singapore': [1.3521, 103.8198],
  'Sydney': [-33.8688, 151.2093],
  'Barcelona': [41.3851, 2.1734],
  'Amsterdam': [52.3676, 4.9041],
  'Bangkok': [13.7563, 100.5018],
  'Cairo': [30.0444, 31.2357],
  'Cape Town': [-33.9249, 18.4241],
  'Rio de Janeiro': [-22.9068, -43.1729],
  'Goa': [15.2993, 74.1240],
  'Kyoto': [35.0116, 135.7681],
  'Santorini': [36.3932, 25.4615],
  'Reykjavik': [64.1466, -21.9426],
  'Machu Picchu': [-13.1631, -72.5450]
};

// Component to dynamically re-center map when center coordinates update
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

const TripMap = ({ destination = 'Paris', itineraries = [] }) => {
  // Determine base coordinates
  let baseCoords = [48.8566, 2.3522];
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (destination && destination.toLowerCase().includes(city.toLowerCase())) {
      baseCoords = coords;
      break;
    }
  }

  // Collect all activities that have location details
  const markers = [];
  // Main destination marker
  markers.push({
    title: `${destination} (Base)`,
    desc: 'Main Trip Destination',
    lat: baseCoords[0],
    lng: baseCoords[1],
    type: 'DESTINATION'
  });

  // Extract itinerary day activities
  if (itineraries && itineraries.length > 0) {
    itineraries.forEach((day, dIdx) => {
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((act, aIdx) => {
          // Slight jitter around baseCoords for activities without explicit GPS
          const offsetLat = (Math.sin(dIdx * 3 + aIdx) * 0.035);
          const offsetLng = (Math.cos(dIdx * 2 + aIdx) * 0.045);
          markers.push({
            title: act.activityName || act.title || `Day ${day.dayNumber} Activity`,
            desc: act.location ? `${act.location} • ${act.activityType || 'Sightseeing'}` : (act.activityType || 'Activity'),
            cost: act.cost ? `₹${act.cost}` : null,
            time: act.startTime ? `${act.startTime} - ${act.endTime || ''}` : null,
            lat: baseCoords[0] + offsetLat,
            lng: baseCoords[1] + offsetLng,
            type: 'ACTIVITY'
          });
        });
      }
    });
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <h4 className="font-bold text-white text-base">Interactive Travel Map</h4>
        </div>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
          {markers.length} Locations Plotted
        </span>
      </div>

      <div style={{ height: '380px', width: '100%' }}>
        <MapContainer
          center={baseCoords}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={baseCoords} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markers.map((m, idx) => (
            <Marker key={idx} position={[m.lat, m.lng]}>
              <Popup>
                <div className="p-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    m.type === 'DESTINATION' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {m.type}
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm mt-1">{m.title}</h5>
                  <p className="text-xs text-slate-600 mt-0.5">{m.desc}</p>
                  {m.time && <p className="text-xs text-slate-500 mt-0.5">⏰ {m.time}</p>}
                  {m.cost && <p className="text-xs font-semibold text-emerald-600 mt-0.5">💰 {m.cost}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TripMap;
