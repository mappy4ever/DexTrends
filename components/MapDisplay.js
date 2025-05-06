// components/MapDisplay.js
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';

// Leaflet CSS (ensure these are loaded)
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// --- Helper Component to Fit Bounds ---
const FitBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => m.position));
            if (bounds.isValid()) {
                 // Added slight delay to ensure map container size is calculated
                 // May not always be needed, but can help prevent race conditions
                setTimeout(() => {
                    map.fitBounds(bounds, { padding: [50, 50] }); // Add padding
                }, 100);
            }
        }
        // Optional: Reset view if markers are cleared?
        // else { map.setView([DEFAULT_LAT, DEFAULT_LON], DEFAULT_ZOOM); }

    // Run whenever the markers prop changes
    }, [markers, map]);

    return null; // This component doesn't render anything itself
};


// --- Main Map Display Component ---
// This component will ONLY render on the client side due to dynamic import in pages/map.js
const MapDisplay = ({ mapMarkers }) => {

    // Runs only on client side AFTER component mounts to fix default icon paths
    useEffect(() => {
        // Check if the fix is already applied (optional, defensive)
        if (L.Icon.Default.prototype._getIconUrl?.toString().includes('fix')) return;

        delete L.Icon.Default.prototype._getIconUrl; // Delete broken default function

        // Add a marker to indicate the fix is applied (optional)
        L.Icon.Default.prototype._getIconUrl = function() { return 'fix applied'; };

        L.Icon.Default.mergeOptions({
            // Reference images from the public folder (ensure these files exist)
            iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
            iconUrl: '/images/leaflet/marker-icon.png',
            shadowUrl: '/images/leaflet/marker-shadow.png',
        });
    }, []); // Empty dependency array ensures this runs only once on mount

    // Default map center/zoom if no markers or bounds fitting fails
    const defaultCenter = [56.1304, -106.3468]; // Approx center of Canada
    const defaultZoom = 4;

    // Render a placeholder if markers aren't ready yet (might be handled by loading state in parent)
    // if (!mapMarkers) {
    //     return <div className="flex items-center justify-center h-full">Preparing map...</div>;
    // }

    return (
        <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%', zIndex: 1 }} // zIndex: 1 might be safer than 0
            scrollWheelZoom={true}
            // Key prop can help reset map state if needed, e.g., when filters drastically change
            // key={JSON.stringify(mapMarkers)} // Caution: Might be performance-intensive
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            />

             {/* Only attempt to fit bounds if there are markers */}
            {mapMarkers && mapMarkers.length > 0 && <FitBounds markers={mapMarkers} />}

            <MarkerClusterGroup
                chunkedLoading // Improves performance for large datasets
                // Options can be customized: https://github.com/Leaflet/Leaflet.markercluster#options
                 maxClusterRadius={80}
                 spiderfyOnMaxZoom={true}
                 showCoverageOnHover={false}
            >
                {mapMarkers && mapMarkers.map(marker => (
                    <Marker key={marker.id} position={marker.position}>
                        <Popup minWidth={250} maxWidth={350}> {/* Adjusted widths */}
                            {/* Use dangerouslySetInnerHTML carefully, ensure content is safe */}
                            <div dangerouslySetInnerHTML={{ __html: marker.popupContent }} />
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
};

export default MapDisplay;