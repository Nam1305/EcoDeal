import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
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

// Routing Component — uses OSRM REST API directly via fetch, draws route as Polyline
const RoutingEngine = ({ from, to, onRoutingStart, onRoutingEnd }: {
    from: [number, number],
    to: [number, number] | null,
    onRoutingStart: () => void,
    onRoutingEnd: (error?: string, fallback?: boolean) => void
}) => {
    const map = useMap();
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

    // Extract scalar values as stable dependencies.
    // Inline array literals [lat, lon] in JSX create a NEW object reference on
    // every parent render, which triggers useEffect even when values haven't changed,
    // aborting the in-flight fetch and causing the loading indicator to never clear.
    const fromLat = from[0], fromLon = from[1];
    const toLat = to?.[0] ?? null, toLon = to?.[1] ?? null;

    useEffect(() => {
        if (toLat === null || toLon === null) return;

        const controller = new AbortController();
        const { signal } = controller;

        setRouteCoords([]);
        onRoutingStart();

        const SERVERS = [
            'https://routing.openstreetmap.de/routed-car/route/v1/driving',
            'https://router.project-osrm.org/route/v1/driving',
        ];

        const fetchRoute = async () => {
            for (const server of SERVERS) {
                try {
                    const url = `${server}/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;
                    console.log('Fetching route from:', url);
                    const res = await fetch(url, { signal });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const data = await res.json();
                    if (data.code === 'Ok' && data.routes?.length > 0) {
                        // GeoJSON coords are [lon, lat] — convert to Leaflet [lat, lon]
                        const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
                            ([lon, lat]: [number, number]) => [lat, lon]
                        );
                        console.log('Route fetched successfully, points:', coords.length);
                        setRouteCoords(coords);
                        // Fit map to route bounds
                        if (coords.length > 0) {
                            map.fitBounds(L.latLngBounds(coords));
                        }
                        onRoutingEnd();
                        return;
                    }
                    throw new Error('No route in response');
                } catch (err: any) {
                    if (signal.aborted) return;
                    console.warn(`Server ${server} failed:`, err.message);
                }
            }
            // All servers failed
            if (!signal.aborted) {
                onRoutingEnd('Could not calculate route. Showing direct path instead.', true);
            }
        };

        fetchRoute();

        return () => {
            controller.abort();
        };
    }, [map, fromLat, fromLon, toLat, toLon]);

    if (routeCoords.length === 0) return null;

    return (
        <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#10b981', weight: 6, opacity: 0.85 }}
        />
    );
};

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
    const [routingTo, setRoutingTo] = useState<any | null>(null);
    const [routingLoading, setRoutingLoading] = useState(false);
    const [useFallbackLine, setUseFallbackLine] = useState(false);

    const openInGoogleMaps = (lat: number, lon: number) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        window.open(url, '_blank');
    };

    const fetchStores = async () => {
        if (!location) return;
        setLoading(true);
        setError(null);
        setRoutingTo(null);
        setUseFallbackLine(false);
        try {
            console.log(`Fetching stores near ${location.latitude}, ${location.longitude} with radius ${radius}km`);
            const data = await storeService.getNearby(location.latitude, location.longitude, radius);
            console.log('Stores found:', data);
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
                                    <option value={15}>Within 15 km</option>
                                    <option value={20}>Within 20 km</option>
                                    <option value={50}>Within 50 km</option>
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
                                    <div key={store.storeId} className={`p-4 hover:bg-emerald-50 transition-colors cursor-pointer ${routingTo?.storeId === store.storeId ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''}`} onClick={() => setRoutingTo(store)}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-800">{store.storeName}</h4>
                                            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full whitespace-nowrap">
                                                {store.distance} km
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1 mb-2">{store.address}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-xs">
                                            <span className="text-gray-400">🚗 Est. {store.estimatedTravelTime}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openInGoogleMaps(store.latitude, store.longitude);
                                                }}
                                                className="text-emerald-600 font-bold hover:underline"
                                            >
                                                Open Maps ↗
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Integration */}
                <div className="lg:w-2/3 h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white relative">
                    {routingLoading && (
                        <div className="absolute inset-0 z-[1000] bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-100">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                                <span className="font-bold text-gray-700 animate-pulse">Calculating road route...</span>
                            </div>
                        </div>
                    )}
                    
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
                                    position={[Number(store.latitude), Number(store.longitude)]}
                                    icon={new L.Icon.Default()}
                                >
                                    <Popup>
                                        <div className="p-1 max-w-[200px]">
                                            <h5 className="font-bold text-gray-800 mb-1">{store.storeName}</h5>
                                            <p className="text-xs text-gray-500 mb-2 truncate">{store.address}</p>
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={() => setRoutingTo(store)}
                                                    className="w-full py-1.5 px-3 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition-colors"
                                                >
                                                    Show Route
                                                </button>
                                                <button 
                                                    onClick={() => openInGoogleMaps(store.latitude, store.longitude)}
                                                    className="w-full py-1.5 px-3 border border-emerald-600 text-emerald-600 text-xs font-bold rounded hover:bg-emerald-50 transition-colors"
                                                >
                                                    Google Maps ↗
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/store/${store.storeId}`)}
                                                    className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 underline"
                                                >
                                                    View Store Profile
                                                </button>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            <RecenterMap lat={location.latitude} lon={location.longitude} />
                            
                            {routingTo && (
                                <RoutingEngine 
                                    from={[location.latitude, location.longitude]} 
                                    to={[Number(routingTo.latitude), Number(routingTo.longitude)]}
                                    onRoutingStart={() => {
                                        setRoutingLoading(true);
                                        setUseFallbackLine(false);
                                    }}
                                    onRoutingEnd={(err, fallback) => {
                                        setRoutingLoading(false);
                                        if (err) {
                                            setError(err);
                                            if (fallback) setUseFallbackLine(true);
                                        }
                                    }}
                                />
                            )}

                            {useFallbackLine && routingTo && (
                                <Polyline 
                                    positions={[
                                        [location.latitude, location.longitude],
                                        [Number(routingTo.latitude), Number(routingTo.longitude)]
                                    ]}
                                    pathOptions={{ color: '#10b981', weight: 4, dashArray: '10, 10', opacity: 0.6 }}
                                />
                            )}
                        </MapContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NearbyStores;
