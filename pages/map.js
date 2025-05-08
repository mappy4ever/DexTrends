// pages/map.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';

import FilterTopbar from '../components/FilterTopbar'; // Already styled
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
const MapLayout = ({ children }) => (
    // Full height flex column for map page structure
    <div className="flex flex-col h-screen bg-background text-foreground">
        {children}
    </div>
);

const MapArea = ({ children }) => (
    // Flex grow to take available vertical space, relative for absolute positioning of overlays
    <div className="flex-grow h-full relative">
        {children}
    </div>
);

const MapSpinner = () => (
    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-[1001] text-white rounded-app-md">
        <svg className="animate-spin h-10 w-10 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-medium">Loading Map Data...</p>
    </div>
);

const MapErrorMessage = ({ message }) => (
    <div className="absolute inset-0 bg-red-100/80 backdrop-blur-sm flex items-center justify-center z-[1001] p-4 rounded-app-md">
        <div className="bg-card p-6 rounded-app-lg shadow-app-md text-center">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Map Error</h3>
            <p className="text-foreground-muted">{message}</p>
        </div>
    </div>
);

const MapDisplay = dynamic(() => import('../components/MapDisplay'), { // Assuming MapDisplay handles Leaflet instantiation
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-surface-subtle"><MapSpinner /></div>,
});

// General LoadingSpinner and ErrorMessage for page-level states (if different from map-specific ones)
const PageLoadingSpinner = () => (
    <div className="flex justify-center items-center h-64 text-foreground-muted">
        <svg className="animate-spin h-8 w-8 text-primary mr-3" viewBox="0 0 24 24"> {/* SVG Spinner */} </svg>
        Loading page data...
    </div>
);
const PageErrorMessage = ({ message }) => (
    <div className="p-4 my-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-app-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
        Error: {message}
    </div>
);


const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching map data.');
        try {
            const info = await res.json();
            error.info = info?.message || info?.error || res.statusText;
        } catch (e) { error.info = res.statusText; }
        error.status = res.status;
        throw error;
    }
    return res.json();
};

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

    const { data: mapApiResponse, error: mapError, isLoading: dataIsLoading, isValidating } = useSWR(mapApiUrl, fetcher, {
        keepPreviousData: true, revalidateOnFocus: false,
    });

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
        return aggregatedLocationData.map((loc) => ({
            id: loc.location_id,
            position: loc.position,
            popupContent: `
                <strong class="text-base text-text-heading">${loc.city || 'N/A'}, ${loc.region || 'N/A'}, ${loc.country || 'N/A'}</strong><br/>
                <span class="text-sm text-foreground-muted">Total Trips:</span> <span class="text-sm text-foreground">${loc.trip_count}</span><br/>
                <span class="text-sm text-foreground-muted">Total Spent:</span> <span class="text-sm text-foreground">$${(loc.total_spending_at_location || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><br/>
                <hr class="my-1 border-border"/>
                <small class="text-xs text-foreground-muted">Departments: ${loc.involved_orgs.join(', ').substring(0,1000) || 'N/A'}${loc.involved_orgs.join(', ').length > 1000 ? '...' : ''}</small><br/>
				<hr class="my-1 border-border"/>
                <small class="text-xs text-foreground-muted">People: ${loc.involved_names.join(', ').substring(0,1000) || 'N/A'}${loc.involved_names.join(', ').length > 1000 ? '...' : ''}</small>
            ` // Added Tailwind classes to popup HTML
        }));
    }, [aggregatedLocationData]);

    const pageIsLoading = !initialFiltersLoaded || dataIsLoading || isValidating;
    const displayError = mapError;

    if (!initialFiltersLoaded && !pageIsLoading) { // Check if initial loading of filters is complete
        return <MapLayout><div className="w-full h-full flex items-center justify-center"><PageLoadingSpinner /></div></MapLayout>;
    }

    return (
        <MapLayout>
            {/* FilterTopbar is outside MapArea to be fixed at the top */}
            <FilterTopbar
                filterConfig={mapFilterConfig}
                availableFilters={{}} // No dropdowns other than dates for map currently
                selectedFilters={{ startMonth: selectedFilters.startMonth, endMonth: selectedFilters.endMonth }}
                onDateChange={handleDateChange}
                onFilterChange={handleFilterChange} // For potential non-date filters
                startDate={startDate}
                endDate={endDate}
                loading={!initialFiltersLoaded} // Loading state for the filter bar itself
            />
            <MapArea>
                {pageIsLoading && <MapSpinner />}
                {displayError && !pageIsLoading && (
                    <MapErrorMessage message={`Failed to load map data: ${displayError.info || displayError.message}`} />
                )}
                {!pageIsLoading && !displayError && mapApiResponse && (
                     <MapDisplay mapMarkers={mapMarkers} />
                )}
                 {!pageIsLoading && !displayError && (!mapApiResponse || mapMarkers.length === 0) && ( // Check if mapApiResponse is empty or markers are empty
                    <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                        No map data available for the selected filters or date range.
                    </div>
                )}
            </MapArea>
        </MapLayout>
    );
}