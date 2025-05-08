// components/MapDisplay.js
import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import DOMPurify from 'dompurify';

// --- FONT AWESOME IMPORTS ---
import ReactDOMServer from 'react-dom/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'; // The specific icon

// Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// --- Font Awesome Marker Icon Definition ---
// You can customize the size, color, and className for the FontAwesomeIcon
// The `iconSize` and `iconAnchor` for L.DivIcon should correspond to the rendered size and desired anchor point.
// For faLocationDot, `size="3x"` is roughly 48px. Anchor should be bottom-center.
const FONT_AWESOME_ICON_COLOR = '#2f7494'; // Example: A nice red color

const createFontAwesomeMarkerIcon = (iconData = {}) => {
    const { size = "2x", color = FONT_AWESOME_ICON_COLOR, className = "" } = iconData;

    const iconHtml = ReactDOMServer.renderToString(
        <FontAwesomeIcon icon={faLocationDot} size={size} className={className} style={{ color: color }} />
    );

    // Estimate pixel size based on Font Awesome size prop (this is approximate)
    // 1x ~ 16px, 2x ~ 32px, 3x ~ 48px. Adjust if your base font size differs.
    let pixelSize;
    switch (size) {
        case "lg": pixelSize = 24; break;
        case "2x": pixelSize = 32; break;
        case "3x": pixelSize = 48; break;
        // Add more cases or a default based on your needs
        default: pixelSize = 24; // Default to a reasonable size
    }

    return L.divIcon({
        html: iconHtml,
        className: 'map-fa-icon-marker-container', // Class for the L.DivIcon wrapper (transparent background, no border)
        iconSize: [pixelSize, pixelSize],         // Width, Height of the icon container
        iconAnchor: [pixelSize / 2, pixelSize],   // Point of the icon which will correspond to marker's location (bottom-center)
        popupAnchor: [0, -pixelSize]              // Point from which the popup should open relative to the iconAnchor
    });
};

// Default Font Awesome icon instance
const defaultFAMarkerIcon = createFontAwesomeMarkerIcon({ size: "2x" }); // You can change default size/color here

// --- Helper Component to Fit Bounds (remains the same) ---
const FitBounds = ({ markers, map, padding = [50, 50], maxZoom = 16 }) => {
    useEffect(() => {
        if (map && markers && markers.length > 0) {
            const validMarkers = markers.filter(m => m.position && L.Util.isArray(m.position) && m.position.length === 2);
            if (validMarkers.length === 0) return;

            const bounds = L.latLngBounds(validMarkers.map(m => m.position));
            if (bounds.isValid()) {
                const timerId = setTimeout(() => {
                    map.fitBounds(bounds, { padding, maxZoom });
                }, 100);
                return () => clearTimeout(timerId);
            }
        }
    }, [markers, map, padding, maxZoom]);
    return null;
};

// --- Placeholder for No Markers (remains the same) ---
const NoMarkersDisplay = ({ message = "No locations to display." }) => (
    <div className="map-no-markers-overlay">
        <p>{message}</p>
    </div>
);


// --- Popup Content Rendering (with added fields) ---
const renderPopupContent = (markerData) => {
    const cleanBaseHtml = markerData.popupContent ? DOMPurify.sanitize(markerData.popupContent) : '';
    return (
        <div className="custom-popup-content">
            {cleanBaseHtml && <div dangerouslySetInnerHTML={{ __html: cleanBaseHtml }} />}
            {markerData.monthsTraveled && markerData.monthsTraveled.length > 0 && (
                <div className="popup-section">
                    <h4>Months Traveled:</h4>
                    <ul className="popup-list">
                        {markerData.monthsTraveled.map((month, index) => (<li key={`month-${index}`}>{month}</li>))}
                    </ul>
                </div>
            )}
            {markerData.involvedOrgs && markerData.involvedOrgs.length > 0 && (
                <div className="popup-section">
                    <h4>Involved Organizations:</h4>
                    <ul className="popup-list popup-long-text-list">
                        {markerData.involvedOrgs.map((org, index) => (<li key={`org-${index}`}>{org}</li>))}
                    </ul>
                </div>
            )}
            {markerData.involvedPeople && markerData.involvedPeople.length > 0 && (
                <div className="popup-section">
                    <h4>Involved People:</h4>
                    <ul className="popup-list popup-long-text-list">
                        {markerData.involvedPeople.map((person, index) => (<li key={`person-${index}`}>{person}</li>))}
                    </ul>
                </div>
            )}
            {markerData.detailsLink && (
                <a href={markerData.detailsLink} target="_blank" rel="noopener noreferrer" className="popup-details-link">
                    View More Details
                </a>
            )}
        </div>
    );
};


// --- Main Map Display Component ---
const MapDisplay = ({ mapMarkers, isLoading = false, initialCenter, initialZoom }) => {
    const [mapInstance, setMapInstance] = useState(null);

    // Standard Leaflet Icon Fix (if you were using default L.Icon.Default elsewhere, keep it)
    useEffect(() => {
        if (typeof window === 'undefined' || window.__LEAFLET_ICON_FIX_APPLIED__) {
            return;
        }
        // This fix is for L.Icon.Default, not directly for L.DivIcon,
        // but good to keep if any part of Leaflet might fall back to it.
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/leaflet/marker-icon-2x.png', // Ensure these paths are correct in your public folder
            iconUrl: '/images/leaflet/marker-icon.png',
            shadowUrl: '/images/leaflet/marker-shadow.png',
        });
        window.__LEAFLET_ICON_FIX_APPLIED__ = true;
    }, []);

    const defaultCenter = initialCenter || [43.6532, -79.3832]; // Toronto, ON, Canada
    const defaultZoom = initialZoom || 10;

    const handleMarkerClick = (markerData) => {
        if (mapInstance && markerData.position) {
            // mapInstance.setView(markerData.position, mapInstance.getZoom(), { animate: true });
        }
    };

    const createClusterCustomIcon = useCallback((cluster) => {
        const count = cluster.getChildCount();
        let size = 'large';
        if (count < 10) size = 'small';
        else if (count < 100) size = 'medium';
        return L.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: `custom-marker-cluster custom-marker-cluster-${size}`,
            iconSize: L.point(40, 40, true),
        });
    }, []);

    if (isLoading) {
        return <div className="map-loading-placeholder">Loading map data...</div>;
    }

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                scrollWheelZoom={true}
                // For smoother scroll wheel zoom, you can experiment with these:
                // wheelDebounceTime={60} // Default 40
                // wheelPxPerZoomLevel={70} // Default 60
                // zoomAnimation={true} // Default true
                whenCreated={setMapInstance}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <ZoomControl position="topright" />

                {mapMarkers && mapMarkers.length > 0 ? (
                    <>
                        {mapInstance && <FitBounds markers={mapMarkers} map={mapInstance} />}
                        <MarkerClusterGroup
                            chunkedLoading
                            maxClusterRadius={70}
                            spiderfyOnMaxZoom={true}
                            showCoverageOnHover={true}
                            iconCreateFunction={createClusterCustomIcon}
                        >
                            {mapMarkers.map(marker => {
                                if (!marker.position || marker.position.length !== 2) {
                                    console.warn("Invalid marker position:", marker);
                                    return null;
                                }
                                // Allow per-marker icon customization if needed, otherwise use default FA icon
                                const iconToUse = marker.customIconData
                                    ? createFontAwesomeMarkerIcon(marker.customIconData)
                                    : defaultFAMarkerIcon;

                                return (
                                    <Marker
                                        key={marker.id}
                                        position={marker.position}
                                        icon={iconToUse} // Use the Font Awesome icon
                                        eventHandlers={{ click: () => handleMarkerClick(marker) }}
                                    >
                                        <Popup minWidth={280} maxWidth={450}>
                                            {renderPopupContent(marker)}
                                        </Popup>
                                        {marker.tooltipContent && <Tooltip>{marker.tooltipContent}</Tooltip>}
                                    </Marker>
                                );
                            })}
                        </MarkerClusterGroup>
                    </>
                ) : (
                    !isLoading && <NoMarkersDisplay />
                )}
            </MapContainer>
        </div>
    );
};

export default MapDisplay;