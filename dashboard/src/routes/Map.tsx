import React, { useEffect, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/Map.scss';
import { Separator } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useWebsocket } from '../contexts/WebsocketContext';
import { useAlert } from '../contexts/AlertContext';
import { IDevices } from '../interfaces';
import { IDataGNSS } from '../interfaces/IDataGNSS';

/**
 * Interface for GPS data received from devices
 */
interface DeviceGPS {
    latitude: number;
    longitude: number;
    time: number;
}

/**
 * Calculate time difference between timestamp and current time
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted time difference string
 */
const getTimeDifference = (timestamp: number): string => {
    const now = new Date();
    const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ago`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s ago`;
    }
    return `${seconds}s ago`;
};

/**
 * Format timestamp to readable date string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

/**
 * Map component that displays GPS tracking data for a specific IoT device
 * @returns {JSX.Element | JSX.Element} Map page or redirect to login
 */
const Map: React.FC = () => {
    const params = useParams<{ imei: string }>();
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [currentPosition, setCurrentPosition] = React.useState<mapboxgl.LngLat | null>(null);
    const [gpsData, setGpsData] = React.useState<DeviceGPS[]>([]);
    const [markers, setMarkers] = React.useState<mapboxgl.Marker[]>([]);
    const [timeElapsed, setTimeElapsed] = React.useState<string>('');
    const { isAuthenticated } = useAuth();
    const { lastMessage } = useWebsocket();
    const navigate = useNavigate();

    /**
     * Update the time elapsed since last GPS data
     */
    const updateTimeElapsed = (): void => {
        if (gpsData.length > 0) {
            const lastData = gpsData[gpsData.length - 1];
            setTimeElapsed(getTimeDifference(lastData.time));
        }
    };

    useEffect(() => {
        const timer = setInterval(updateTimeElapsed, 1000);
        return () => clearInterval(timer);
    }, [gpsData]);

    /**
     * Fetch GPS data for a specific device from the server
     * @param imei - Device IMEI identifier
     */
    const fetchDeviceGPS = async (imei: string): Promise<void> => {
        try {
            const response = await axios.get<IDataGNSS[]>(`http://localhost:3001/iot/gps/${imei}`, {
                withCredentials: true
            });
            const formattedData: DeviceGPS[] = response.data.map((item: IDataGNSS) => ({
                latitude: item.latitude,
                longitude: item.Longitude ?? item.latitude,
                time: item.timestamps
            }));
            setGpsData(formattedData);
        } catch (error) {
            console.error('Error fetching GPS data:', error);
            navigate('/devices', { replace: true });
        }
    };

    /**
     * Create a routed path between GPS points using Mapbox Directions API
     * @param points - Array of GPS coordinates
     */
    const createRoutePath = async (points: DeviceGPS[]): Promise<void> => {
        if (points.length < 2 || !mapRef.current || !mapRef.current.loaded()) return;
        try {
            // Create a coordinate string for the API
            const coordinates = points.map(point => 
                `${point.longitude},${point.latitude}`
            ).join(';');
            // Call the Mapbox Directions API
            const response: any = await axios.get(
                `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}`,
                {
                    params: {
                        geometries: 'geojson',
                        access_token: mapboxgl.accessToken,
                        overview: 'full',
                    }
                }
            );
            if (response.data.routes && response.data.routes[0]) {
                // Remove old source and layer if they exist
                if (mapRef.current?.getSource('gps-path')) {
                    mapRef.current.removeLayer('gps-path');
                    mapRef.current.removeSource('gps-path');
                }
                // Add new source with routed path
                mapRef.current?.addSource('gps-path', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: response.data.routes[0].geometry
                    }
                });
                // Add line layer
                mapRef.current?.addLayer({
                    id: 'gps-path',
                    type: 'line',
                    source: 'gps-path',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#e74c3c',
                        'line-width': 3,
                        'line-opacity': 0.8
                    }
                });
            }
        } catch (error) {
            console.error('Error creating routed path:', error);
        }
    };

    useEffect(() => {
        if (mapContainerRef.current) {
            mapboxgl.accessToken = 'pk.eyJ1IjoiZXJ3YW5tIiwiYSI6ImNtOWxoZ2d6YTA1ZXUyanBqbDBidDhpNnIifQ.HEq6smtoXL8XmYBSj9aoZQ';
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [2.539539, 50.724154], // Initial center coordinates (longitude, latitude)
                zoom: 13 // Initial zoom level
            });
            // Wait for the style to load
            mapRef.current.on('load', () => {
                if (params.imei) {
                    fetchDeviceGPS(params.imei);
                }
            });
        }
        return () => {
            mapRef?.current?.remove();
        };
    }, []);

    useEffect(() => {
        if (gpsData.length > 0 && mapRef.current) {
            markers.forEach(marker => marker.remove());
            setMarkers([]);
            gpsData.forEach((data) => {
                const { latitude, longitude } = data;
                if (latitude && longitude) {
                    const popup = new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`<h3>Point ${gpsData.indexOf(data) + 1}</h3>`);
                    const marker = new mapboxgl.Marker()
                        .setLngLat([longitude, latitude])
                        .setPopup(popup)
                        .addTo(mapRef.current!);
                    setMarkers(prevMarkers => [...prevMarkers, marker]);
                }
            });
            
            // Create routed path
            createRoutePath(gpsData);
            mapRef.current?.on("move", () => {
                const center = mapRef.current?.getCenter();
                if (center) {
                    setCurrentPosition(center);
                }
            });

            // Center the map on the last GPS data point
            const lastData = gpsData[gpsData.length - 1];
            if (lastData && lastData.latitude && lastData.longitude) {
                mapRef.current?.setCenter([lastData.longitude, lastData.latitude]);
            }
        }
    }, [gpsData, mapRef]);

    useEffect(() => {
        if (lastMessage){
            if (lastMessage.type === "GPS") {
                setGpsData(prevData => {
                    const newData: DeviceGPS = {
                        latitude: lastMessage.data.latitude,
                        longitude: lastMessage.data.longitude,
                        time: lastMessage.data.time
                    };
                    const lastData: DeviceGPS | undefined = prevData[prevData.length - 1];
                    if (lastData && lastData.latitude === newData.latitude && lastData.longitude === newData.longitude) {
                        prevData[prevData.length - 1].time = newData.time;
                        return [...prevData];
                    }
                    return [...prevData, newData];
                });
            }
        }
    }, [lastMessage]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <div id="Map">
            <div id='map-container' ref={mapContainerRef} />
            <div className="position-overlay">
                <p>Longitude: {currentPosition ? currentPosition.lng.toFixed(6) : 'N/A'}</p>
                <p>Latitude: {currentPosition ? currentPosition.lat.toFixed(6) : 'N/A'}</p>
            </div>
            <div className="gps-data">
                <h2><i className="fa-regular fa-location-dot"></i> Données GPS</h2>
                <Separator />
                {timeElapsed && (
                    <p className="last-update">
                        <i className="fa-regular fa-clock"></i> {timeElapsed}
                    </p>
                )}
                <ul className="marker-list">
                    {gpsData.map((data, index) => (
                        <li key={index} onClick={() => {
                            if (mapRef.current) {
                                mapRef.current.flyTo({
                                    center: [data.longitude, data.latitude],
                                    zoom: 18,
                                    duration: 2000,
                                    essential: true
                                });
                            }
                        }}>
                            <i className="fa-solid fa-location-dot" />
                            <div className="marker-details">
                                <span className="marker-title">Point {index + 1}</span>
                                <span className="marker-coords">
                                    {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                                </span>
                                <span className="marker-time">
                                    {formatDate(data.time)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Map;