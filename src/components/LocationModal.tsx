import React, { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Crosshair, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const STORAGE_KEY = 'buildmore_location';

const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Surat',
];

export function getStoredLocation(): string {
  return localStorage.getItem(STORAGE_KEY) || '';
}

interface LocationModalProps {
  onClose: () => void;
  onSelect: (location: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ onClose, onSelect }) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState('');
  const [geoError, setGeoError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const confirm = (loc: string) => {
    if (!loc.trim()) return;
    localStorage.setItem(STORAGE_KEY, loc.trim());
    onSelect(loc.trim());
    onClose();
  };

  const handleDetect = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    setGeoError('');
    setDetected('');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const state = addr.state || '';
          const pincode = addr.postcode || '';
          const loc = [city, state, pincode].filter(Boolean).join(', ');
          setDetected(loc || 'Location detected');
        } catch {
          setGeoError('Could not resolve your location. Please search manually.');
        } finally {
          setDetecting(false);
        }
      },
      err => {
        setDetecting(false);
        if (err.code === 1) setGeoError('Location access denied. Please allow location permission.');
        else setGeoError('Could not detect location. Please search manually.');
      },
      { timeout: 10000 }
    );
  };

  const overlay = isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${overlay}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-400" />
            <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Location</h2>
          </div>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Search input */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-yellow-400/40 ${isDark ? 'bg-zinc-800 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirm(query); }}
              placeholder="Search a city or area..."
              className={`flex-1 bg-transparent text-sm font-medium outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
            />
            {query && (
              <button onClick={() => confirm(query)} className="shrink-0 px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-yellow-300 transition-colors">
                Set
              </button>
            )}
          </div>

          {/* Use current location */}
          <div className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-zinc-800/60 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${detected ? 'bg-green-500/10' : 'bg-yellow-400/10'}`}>
                  {detecting
                    ? <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                    : detected
                    ? <CheckCircle className="w-4 h-4 text-green-400" />
                    : <Crosshair className="w-4 h-4 text-yellow-400" />
                  }
                </div>
                <div>
                  <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {detecting ? 'Detecting…' : detected ? 'Location detected' : 'Use Current Location'}
                  </p>
                  <p className={`text-[10px] font-medium mt-0.5 ${muted}`}>
                    {detected || 'Enable for faster delivery estimates'}
                  </p>
                </div>
              </div>
              {!detected ? (
                <button
                  onClick={handleDetect}
                  disabled={detecting}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-yellow-400 text-yellow-400 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all disabled:opacity-50"
                >
                  Enable
                </button>
              ) : (
                <button
                  onClick={() => confirm(detected)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all"
                >
                  Confirm
                </button>
              )}
            </div>
            {geoError && (
              <p className="text-[10px] font-bold text-red-400 mt-3 pl-12">{geoError}</p>
            )}
          </div>

          {/* Popular cities */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3 h-3 text-slate-400" />
              <p className={`text-[9px] font-black uppercase tracking-widest ${muted}`}>Popular Cities</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {POPULAR_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => confirm(city)}
                  className={`px-2 py-2 rounded-xl text-[10px] font-bold text-center transition-all border ${
                    isDark
                      ? 'bg-zinc-800 border-white/5 text-slate-300 hover:border-yellow-400/40 hover:text-white hover:bg-yellow-400/5'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-yellow-400/50 hover:text-slate-900 hover:bg-yellow-50'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t text-center ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <p className={`text-[9px] font-bold uppercase tracking-widest ${muted}`}>
            Delivering across India · 500+ cities
          </p>
        </div>
      </div>
    </div>
  );
};
