// pages/map.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import { VscInfo } from "react-icons/vsc";

// Shared Utils & Components
import { fetcher } from '../utils/apiUtils';
import {
    formatCurrency,
    // formatDatePretty,
} from '../utils/formatters';
import {
    getDefaultInitialStartDate,
    getDefaultInitialEndDate,
    getYearMonthString,
    parseYearMonthToDate,
    LOCAL_STORAGE_KEYS,
    loadFromLocalStorage,
    saveToLocalStorage
} from '../utils/filterUtils';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// --- UI Components ---
import FilterTopbar from '../components/FilterTopbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Tooltip from '../components/ui/Tooltip';
import { TOOLTIP_TEXTS } from '../components/ui/data/tooltips';

const MapPageLayout = ({ children }) => (
    // Full height flex column for map page structure
    <div className="flex flex-col h-screen bg-background text-foreground">
        {children}
    </div>
);

const MapViewArea = ({ children }) => (
    // Flex grow to take available vertical space, relative for absolute positioning of overlays
    <div className="flex-grow h-full relative">
        {children}
    </div>
);

// Map-specific spinner (overlay for the map itself)
const MapDataSpinner = () => (
    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-[1001] text-white rounded-app-md">
        <svg className="animate-spin h-10 w-10 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-medium">Loading Map Data...</p>
    </div>
);

// Map-specific error message (overlay for the map itself)
const MapDataErrorMessage = ({ message }) => (
    <div className="absolute inset-0 bg-red-100/80 backdrop-blur-sm flex items-center justify-center z-[1001] p-4 rounded-app-md">
        <div className="bg-card p-6 rounded-app-lg shadow-app-md text-center">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Map Error</h3>
            <p className="text-foreground-muted">{message}</p>
        </div>
    </div>
);

const MapDisplay = dynamic(() => import('../components/MapDisplay'), {
    ssr: false,
    // Use the map-specific spinner for the dynamic import loading state
    loading: () => <div className="w-full h-full flex items-center justify-center bg-surface-subtle"><MapDataSpinner /></div>,
});

export default function MapExplorerPage() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({ startMonth: '', endMonth: '' });
    const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);

    useEffect(() => {
        const savedGlobalDates = loadFromLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {});
        let initialStartDate = parseYearMonthToDate(savedGlobalDates.startMonth) || getDefaultInitialStartDate();
        let initialEndDate = parseYearMonthToDate(savedGlobalDates.endMonth) || getDefaultInitialEndDate();
        setStartDate(initialStartDate);
        setEndDate(initialEndDate);
        setSelectedFilters({
            startMonth: getYearMonthString(initialStartDate),
            endMonth: getYearMonthString(initialEndDate),
        });
        setInitialFiltersLoaded(true);
    }, []);

    useEffect(() => {
        if (!initialFiltersLoaded || !startDate || !endDate) return;
        saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {
            startMonth: getYearMonthString(startDate),
            endMonth: getYearMonthString(endDate),
        });
    }, [startDate, endDate, initialFiltersLoaded]);

    const handleDateChange = useCallback((filterKey, dateObject) => {
        const newDateString = dateObject ? getYearMonthString(dateObject) : ''; // Handle null date for clearing
        if (filterKey === 'startDate') { // Adjusted key based on FilterTopbar
            setStartDate(dateObject);
            setSelectedFilters(prev => ({ ...prev, startMonth: newDateString }));
        } else if (filterKey === 'endDate') { // Adjusted key
            setEndDate(dateObject);
            setSelectedFilters(prev => ({ ...prev, endMonth: newDateString }));
        }
    }, []);

    const handleFilterChange = useCallback((filterKey, value) => {
        // Currently no non-date filters on map page, but placeholder for future
        setSelectedFilters(prev => ({ ...prev, [filterKey]: value }));
        console.warn(`MapPage: Non-date filter changed - ${filterKey}: ${value}`);
    }, []);

    const mapFilterConfig = useMemo(() => [
        { key: 'startDate', label: 'Start Date:', type: 'month' }, // Key matches FilterTopbar expectation
        { key: 'endDate', label: 'End Date:', type: 'month' },   // Key matches FilterTopbar expectation
    ], []);

    const mapApiUrl = useMemo(() => {
        if (!initialFiltersLoaded || !selectedFilters.startMonth || !selectedFilters.endMonth) return null;
        const params = new URLSearchParams({
            startMonth: selectedFilters.startMonth,
            endMonth: selectedFilters.endMonth,
        });
        return `/api/map?${params.toString()}`;
    }, [selectedFilters.startMonth, selectedFilters.endMonth, initialFiltersLoaded]);

    const { 
        data: mapApiResponse, 
        error: mapError, 
        isLoading: dataIsLoading, // SWR's loading state for the current request
        isValidating               // SWR's validating state (can be true during revalidation)
    } = useSWR(mapApiUrl, fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false,
    });

    // Combined loading state for map data area after initial filters are set
    const isMapDataLoading = initialFiltersLoaded && (dataIsLoading || isValidating);

    const aggregatedLocationData = useMemo(() => {
        // Aggregation logic remains the same
        if (!mapApiResponse) return [];
        const locationSummary = mapApiResponse.reduce((acc, point) => {
            if (point.location_id == null || point.lat == null || point.long == null) return acc;
            const key = point.location_id;
            if (!acc[key]) {
                acc[key] = {
                    location_id: point.location_id, position: [point.lat, point.long], city: point.city,
                    region: point.region, country: point.country, trip_count: 0, total_spending_at_location: 0,
                    total_travel_days: 0, involved_orgs: new Set(), involved_names: new Set(), months: new Set(),
                };
            }
            acc[key].trip_count += Number(point.trip_count) || 0;
            acc[key].total_spending_at_location += Number(point.total_spending_at_location) || 0;
            acc[key].total_travel_days += Number(point.total_travel_days) || 0;
            if(point.month) acc[key].months.add(String(point.month).slice(0, 7));
            (point.involved_org_ids || []).forEach(org => acc[key].involved_orgs.add(org)); // Ensure array
            (point.involved_names || []).forEach(name => acc[key].involved_names.add(name)); // Ensure array
            return acc;
        }, {});
        return Object.values(locationSummary).map(loc => ({
            ...loc,
            involved_orgs: Array.from(loc.involved_orgs).sort(),
            involved_names: Array.from(loc.involved_names).sort(),
            months: Array.from(loc.months).sort(),
        }));
    }, [mapApiResponse]);

	const mapMarkers = useMemo(() => {
		// Ensure aggregatedLocationData is available and is an array
		if (!Array.isArray(aggregatedLocationData)) {
			console.warn("aggregatedLocationData is not an array or is undefined, returning empty mapMarkers.");
			return [];
		}
	
		return aggregatedLocationData.map((loc) => {
			// Basic validation for essential location data
			if (!loc || typeof loc.location_id === 'undefined' || !loc.position) {
				console.warn("Skipping marker due to missing id or position:", loc);
				return null; // Will be filtered out later
			}
	
			// Prepare lists, handling potential undefined or non-array values gracefully
			const orgsList = Array.isArray(loc.involved_orgs) ? loc.involved_orgs.join(', ') : 'N/A';
			const peopleList = Array.isArray(loc.involved_names) ? loc.involved_names.join(', ') : 'N/A';
	
			// Truncate long lists for display in popup
			const maxDisplayLength = 1000; // Max characters for lists in popup before truncating
			const displayOrgs = orgsList.length > maxDisplayLength ? `${orgsList.substring(0, maxDisplayLength)}...` : orgsList;
			const displayPeople = peopleList.length > maxDisplayLength ? `${peopleList.substring(0, maxDisplayLength)}...` : peopleList;
	
			return {
				id: loc.location_id,
				position: loc.position, // Should be [latitude, longitude]
				// The entire content string is wrapped in 'custom-map-popup-content'
            popupContent: `
                <div class="custom-map-popup-content">
                    <div class="text-base text-text-heading font-semibold">${loc.city || 'N/A'}, ${loc.region || 'N/A'}, ${loc.country || 'N/A'}</div>
                    <div class="text-sm">
                        <span class="text-foreground">Total Spent:</span>
                        <span class="text-foreground ml-1">$${formatCurrency(loc.total_spending_at_location)}</span>
                    </div>
                    <div class="text-sm">
                        <span class="text-foreground">Total Trips:</span>
                        <span class="text-foreground ml-1">${loc.trip_count !== undefined ? loc.trip_count : 'N/A'}</span>
                    </div>
                    <hr class="mt-1 border-border"/>
                    <div class="small text-xs">
                        <span class="text-foreground">Departments:</span>
                        <span class="text-foreground-muted ml-1">${displayOrgs}</span>
                    </div>
                    <hr class="mt-2 border-border"/>
                    <div class="small text-xs">
                        <span class="text-foreground">People:</span>
                        <span class="text-foreground-muted ml-1">${displayPeople}</span>
                    </div>
                </div>
            `,
				// You can also pass through other data needed by renderPopupContent if you extended it:
				// monthsTraveled: loc.months,
				// involvedOrgs: loc.involved_orgs, // Full list for detailed view if needed
				// involvedPeople: loc.involved_names, // Full list
				// detailsLink: `/some-path/${loc.location_id}` // Example
			};
		}).filter(marker => marker !== null); // Filter out any null markers due to invalid data
	}, [aggregatedLocationData, formatCurrency]); // Add formatCurrency to dependency array if it's not a stable import

    // Overall page loading state (primarily for initial filter setup)
    if (!initialFiltersLoaded) {
        return (
            <MapPageLayout>
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <FilterTopbar loading={true} filterConfig={mapFilterConfig} selectedFilters={{}} startDate={null} endDate={null} onDateChange={()=>{}} onFilterChange={()=>{}}/>
                    <div className="flex-grow w-full flex items-center justify-center">
                        <LoadingSpinner />
                    </div>
                </div>
            </MapPageLayout>
        );
    }

     return (
        <MapPageLayout>
            {/* Optional: Page Title/Description - uncomment if needed 
            <div className="p-4 md:p-6 text-center md:text-left">
                <h1 className="text-2xl font-semibold text-text-heading mb-2">Travel Map Explorer</h1>
                <p className="text-foreground-muted">
                    Visualize the destinations of Canadian federal government travel. See where officials traveled within the selected date range. Click on markers for a summary.
                </p>
            </div>
            */}
            <FilterTopbar
                filterConfig={mapFilterConfig}
                availableFilters={{}} // No dynamic dropdowns for map currently
                selectedFilters={{ startMonth: selectedFilters.startMonth, endMonth: selectedFilters.endMonth }}
                onDateChange={handleDateChange}
                onFilterChange={handleFilterChange}
                startDate={startDate}
                endDate={endDate}
                loading={!initialFiltersLoaded} // Filters are loaded at this point, so can be false
                                                // or tied to 'isValidating' if filters depend on async data
            />

            <MapViewArea>
                {isMapDataLoading && <MapDataSpinner />}
                {mapError && !isMapDataLoading && (
                    <MapDataErrorMessage message={`Failed to load map data: ${mapError.info || mapError.message}`} />
                )}
                {!isMapDataLoading && !mapError && mapApiResponse && (
                    <MapDisplay mapMarkers={mapMarkers} />
                )}
                {!isMapDataLoading && !mapError && (!mapApiResponse || mapMarkers.length === 0) && (
                     <div className="w-full h-full flex items-center justify-center text-foreground-muted p-4 text-center">
                        No map data available for the selected filters or date range.
                    </div>
                )}
                <div className="absolute top-2 left-2 z-[1000] md:top-4 md:left-4"> {/* Ensure z-index is above map tiles */}
                    <Tooltip text={TOOLTIP_TEXTS.DESTINATION_CLEANING} position="right">
                        <button
                            aria-label="Information about destination data"
                            className="p-1 bg-card dark:bg-slate-700 rounded-full shadow-lg hover:bg-muted dark:hover:bg-slate-600 transition-colors"
                        >
                            <VscInfo size={30} className="text-foreground" /> {/* Adjusted icon size slightly */}
                        </button>
                    </Tooltip>
                </div>
            </MapViewArea>
        </MapPageLayout>
    );
}