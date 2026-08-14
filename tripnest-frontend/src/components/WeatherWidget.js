import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  Snowflake,
  CloudLightning,
  Wind,
  Thermometer
} from 'lucide-react';

// Known coordinates fallback for seeded destinations
const CITY_COORDS = {
  'Paris': { lat: 48.8566, lon: 2.3522 },
  'Tokyo': { lat: 35.6762, lon: 139.6503 },
  'New York': { lat: 40.7128, lon: -74.0060 },
  'Rome': { lat: 41.9028, lon: 12.4964 },
  'Bali': { lat: -8.4095, lon: 115.1889 },
  'London': { lat: 51.5074, lon: -0.1278 },
  'Dubai': { lat: 25.2048, lon: 55.2708 },
  'Singapore': { lat: 1.3521, lon: 103.8198 },
  'Sydney': { lat: -33.8688, lon: 151.2093 },
  'Barcelona': { lat: 41.3851, lon: 2.1734 },
  'Amsterdam': { lat: 52.3676, lon: 4.9041 },
  'Bangkok': { lat: 13.7563, lon: 100.5018 },
  'Cairo': { lat: 30.0444, lon: 31.2357 },
  'Cape Town': { lat: -33.9249, lon: 18.4241 },
  'Rio de Janeiro': { lat: -22.9068, lon: -43.1729 },
  'Goa': { lat: 15.2993, lon: 74.1240 },
  'Kyoto': { lat: 35.0116, lon: 135.7681 },
  'Santorini': { lat: 36.3932, lon: 25.4615 },
  'Reykjavik': { lat: 64.1466, lon: -21.9426 },
  'Machu Picchu': { lat: -13.1631, lon: -72.5450 }
};

const getWeatherDisplay = (code) => {
  if (code === 0) return { label: 'Clear Sky', icon: Sun, color: '#f59e0b' };
  if (code === 1 || code === 2) return { label: 'Partly Cloudy', icon: CloudSun, color: '#38bdf8' };
  if (code === 3) return { label: 'Overcast', icon: Cloud, color: '#94a3b8' };
  if (code >= 45 && code <= 48) return { label: 'Foggy', icon: CloudFog, color: '#94a3b8' };
  if (code >= 51 && code <= 67) return { label: 'Rain Showers', icon: CloudRain, color: '#60a5fa' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: Snowflake, color: '#e0f2fe' };
  if (code >= 80 && code <= 82) return { label: 'Heavy Showers', icon: CloudRain, color: '#3b82f6' };
  if (code >= 95) return { label: 'Thunderstorm', icon: CloudLightning, color: '#a855f7' };
  return { label: 'Moderate', icon: Thermometer, color: '#10b981' };
};

const WeatherWidget = ({ destinationName = 'Paris' }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Find matching coords or default to Paris
        let coords = null;
        for (const [key, val] of Object.entries(CITY_COORDS)) {
          if (destinationName.toLowerCase().includes(key.toLowerCase())) {
            coords = val;
            break;
          }
        }
        if (!coords) coords = { lat: 48.8566, lon: 2.3522 };

        // Open-Meteo free API (No API key needed, high reliability)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
        const res = await axios.get(url);

        if (isMounted && res.data && res.data.current_weather) {
          const current = res.data.current_weather;
          const daily = res.data.daily;
          setWeather({
            temp: Math.round(current.temperature),
            windSpeed: current.windspeed,
            weatherCode: current.weathercode,
            forecast: daily ? daily.temperature_2m_max.slice(0, 4).map((max, idx) => ({
              day: idx === 0 ? 'Today' : `Day +${idx}`,
              max: Math.round(max),
              min: Math.round(daily.temperature_2m_min[idx]),
              code: daily.weathercode[idx]
            })) : []
          });
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        // Fallback static weather
        if (isMounted) {
          setWeather({
            temp: 24,
            windSpeed: 12,
            weatherCode: 1,
            forecast: [
              { day: 'Today', max: 25, min: 18, code: 0 },
              { day: 'Tomorrow', max: 26, min: 19, code: 1 },
              { day: 'Day +2', max: 23, min: 17, code: 51 }
            ]
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (destinationName) fetchWeather();
    return () => { isMounted = false; };
  }, [destinationName]);

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center text-slate-400 text-sm animate-pulse">
        Fetching live weather forecast for {destinationName}...
      </div>
    );
  }

  if (!weather) return null;

  const currentDisplay = getWeatherDisplay(weather.weatherCode);
  const CurrentIcon = currentDisplay.icon;

  return (
    <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 rounded-2xl p-5 backdrop-blur-md shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <span>Live Destination Forecast</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <h4 className="text-xl font-bold text-white mt-1">{destinationName}</h4>
          <div className="text-slate-300 text-sm font-medium mt-1 flex items-center gap-1.5">
            <CurrentIcon size={16} color={currentDisplay.color} />
            <span>{currentDisplay.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-4xl font-extrabold text-white tracking-tight">{weather.temp}°C</span>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-end gap-1">
              <Wind size={12} />
              <span>Wind: {weather.windSpeed} km/h</span>
            </p>
          </div>
        </div>
      </div>

      {weather.forecast && weather.forecast.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10">
          {weather.forecast.map((f, i) => {
            const fDisplay = getWeatherDisplay(f.code);
            const FIcon = fDisplay.icon;
            return (
              <div key={i} className="bg-white/5 rounded-lg p-2 text-center flex flex-col items-center">
                <span className="text-xs text-slate-300 block">{f.day}</span>
                <FIcon size={16} color={fDisplay.color} className="my-1" />
                <span className="text-xs font-semibold text-white mt-0.5 block">{f.max}° / {f.min}°</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
