import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '../hooks/useGeolocation';
import storeService from '../services/storeService';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom marker for user location
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to recenter map when location changes
const RecenterMap = ({ lat, lon }: { lat: number, lon: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lon]);
    }, [lat, lon, map]);
    return null;
};

const NearbyStores: React.FC = () => {
    const { location, error: geoError, loading: geoLoading } = useGeolocation();
    const navigate = useNavigate();
    const [stores, setStores] = useState<any[]>([]);
    const [radius, setRadius] = useState(5.0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStores = async () => {
        if (!location) return;
        setLoading(true);
        try {
            const data = await storeService.getNearby(location.latitude, location.longitude, radius);
            setStores(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch nearby stores');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location) {
            fetchStores();
        }
    }, [location, radius]);

    if (geoLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-sm p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-600 font-medium">Determining your location...</p>
        </div>
    );

    if (geoError) return (
        <div className="max-w-2xl mx-auto p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
            <div className="text-red-500 text-5xl mb-4">📍</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Location Access Needed</h2>
            <p className="text-red-600 mb-6">{geoError}</p>
            <p className="text-sm text-red-500">Please enable GPS/Location in your browser to find deals near you.</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar & Filters */}
                <div className="lg:w-1/3 space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Nearby Deals 📍</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Radius</label>
                                <select 
                                    value={radius} 
                                    onChange={(e) => setRadius(parseFloat(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value={1}>Within 1 km</option>
                                    <option value={3}>Within 3 km</option>
                                    <option value={5}>Within 5 km</option>
                                    <option value={10}>Within 10 km</option>
                                    <option value={20}>Within 20 km</option>
                                </select>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-sm text-emerald-700 leading-relaxed">
                                    Finding the best bargains within <b>{radius}km</b> of your current position.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Results ({stores.length})</h3>
                            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>}
                        </div>
                        <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100">
                                    {error}
                                </div>
                            )}
                            {stores.length === 0 && !loading ? (
                                <div className="p-12 text-center text-gray-500">
                                    No stores found in this area. Try increasing the radius.
                                </div>
                            ) : (
                                stores.map(store => (
                                    <div key={store.storeId} className="p-4 hover:bg-emerald-50 transition-colors cursor-pointer" onClick={() => navigate(`/store/${store.storeId}`)}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-800">{store.storeName}</h4>
                                            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full whitespace-nowrap">
                                                {store.distance} km
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1 mb-2">{store.address}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>🚗 Est. {store.estimatedTravelTime}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Integration */}
                <div className="lg:w-2/3 h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white relative">
                    {location && (
                        <MapContainer 
                            center={[location.latitude, location.longitude]} 
                            zoom={13} 
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {/* User Marker */}
                            <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
                                <Popup>
                                    <div className="text-center font-bold">You are here</div>
                                </Popup>
                            </Marker>

                            {/* Radius Circle */}
                            <Circle 
                                center={[location.latitude, location.longitude]} 
                                radius={radius * 1000} 
                                pathOptions={{ fillColor: 'rgb(16 185 129)', fillOpacity: 0.1, color: 'rgb(16 185 129)', weight: 1, dashArray: '5, 10' }} 
                            />

                            {/* Store Markers */}
                            {stores.map(store => (
                                <Marker 
                                    key={store.storeId} 
                                    position={[store.latitude, store.longitude]}
                                >
                                    <Popup>
                                        <div className="p-1">
                                            <h5 className="font-bold text-gray-800 mb-1">{store.storeName}</h5>
                                            <p className="text-xs text-gray-500 mb-2">{store.address}</p>
                                            <button 
                                                onClick={() => navigate(`/store/${store.storeId}`)}
                                                className="w-full py-1.5 px-3 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700"
                                            >
                                                View Store
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            <RecenterMap lat={location.latitude} lon={location.longitude} />
                        </MapContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NearbyStores;
