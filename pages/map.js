// pages/map.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';

import FilterTopbar from '../components/FilterTopbar';
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
const MapLayout = ({ children }) => <div className="flex h-screen flex-col">{children}</div>;
const MapArea = ({ children }) => <div className="flex-grow h-full relative">{children}</div>;
const MapSpinner = () => <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[1001]"><p className="text-white text-xl p-4 bg-black/70 rounded-lg shadow-lg">Loading Map Data...</p></div>;
const MapErrorMessage = ({ message }) => <div className="absolute inset-0 bg-red-100 flex items-center justify-center z-[1001]"><p className="text-red-700 p-4 bg-white rounded shadow">{message}</p></div>;

const MapDisplay = dynamic(() => import('../components/MapDisplay'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-200"><MapSpinner/></div>,
});

const LoadingSpinner = () => <div className="text-center p-10">Loading...</div>;
const ErrorMessage = ({ message }) => <div className="text-center p-10 text-red-600">Error: {message}</div>;

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
    const [startDate, setStartDate] = useState(null); // Date object
    const [endDate, setEndDate] = useState(null);     // Date object

    const [selectedFilters, setSelectedFilters] = useState({
        startMonth: '',
        endMonth: '',
    });
    const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);

    // Load filters from localStorage
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

    // Persist filters to localStorage
    useEffect(() => {
        if (!initialFiltersLoaded) return;
        if (startDate && endDate) {
            saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {
                startMonth: getYearMonthString(startDate),
                endMonth: getYearMonthString(endDate),
            });
        }
        // No longer saving MAP_PAGE_FILTERS as 'org' is removed
        // window.localStorage.removeItem(LOCAL_STORAGE_KEYS.MAP_PAGE_FILTERS); // Optional: clean up old key
    }, [startDate, endDate, initialFiltersLoaded]);
    
    // Fetch available org filter options
    // This assumes your /api/filters endpoint can provide orgs.
    // Adjust the endpoint if your orgs list comes from somewhere else.
    // const { data: orgOptionsData, error: orgOptionsError } = useSWR('/api/filters?type=org', fetcher);

    /*useEffect(() => {
        if (orgOptionsData && orgOptionsData.orgs) {
            setAvailableFilterOptions(prev => ({
                ...prev,
                orgs: orgOptionsData.orgs.map(o => ({ value: o.id, label: o.name })),
            }));
        }
    }, [orgOptionsData]);*/


    // Handlers for FilterTopbar
    const handleDateChange = useCallback((filterKey, dateObject) => {
        const newDateString = getYearMonthString(dateObject);
        if (filterKey === 'startMonth' || filterKey === 'startDate') {
            setStartDate(dateObject);
            setSelectedFilters(prev => ({ ...prev, startMonth: newDateString }));
        } else if (filterKey === 'endMonth' || filterKey === 'endDate') {
            setEndDate(dateObject);
            setSelectedFilters(prev => ({ ...prev, endMonth: newDateString }));
        }
    }, []);

    const handleFilterChange = useCallback((filterKey, value) => {
        // setSelectedFilters(prev => ({ ...prev, [filterKey]: value })); // No other keys to set
        console.warn(`handleFilterChange called on MapPage with key: ${filterKey}, value: ${value}. No non-date filters configured.`);
    }, []);

    // Define filterConfig for FilterTopbar
    const mapFilterConfig = useMemo(() => [
        { key: 'startMonth', label: 'Start Month:', type: 'month' },
        { key: 'endMonth', label: 'End Month:', type: 'month' },
        // { key: 'org', label: 'Organization:', type: 'select', optionsKey: 'orgs', placeholder: 'All Organizations' },
    ], []);

    // API URL for map data
    const mapApiUrl = useMemo(() => {
        if (!initialFiltersLoaded || !selectedFilters.startMonth || !selectedFilters.endMonth) return null;
        const params = new URLSearchParams({
            startMonth: selectedFilters.startMonth,
            endMonth: selectedFilters.endMonth,
        });
        // 'org' parameter removed from API call
        return `/api/map?${params.toString()}`;
    }, [selectedFilters.startMonth, selectedFilters.endMonth, initialFiltersLoaded]); // Removed selectedFilters.org dependency


    const { data: mapApiResponse, error: mapError, isLoading: mapIsLoading } = useSWR(mapApiUrl, fetcher, {
        keepPreviousData: true,
    });

    const aggregatedLocationData = useMemo(() => {
        // Aggregation logic from original map.js - ensure it handles new mapApiResponse structure if it changed
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
            (point.involved_org_ids || []).forEach(org => acc[key].involved_orgs.add(org));
            (point.involved_names || []).forEach(name => acc[key].involved_names.add(name));
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
                <b>${loc.city || 'N/A'}, ${loc.country || 'N/A'}</b><br/>
                Total Trips: ${loc.trip_count}<br/>
                Total Spent: $${(loc.total_spending_at_location || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
                <small>Orgs: ${loc.involved_orgs.join(', ') || 'N/A'}</small>
            `
        }));
    }, [aggregatedLocationData]);

    const pageIsLoading = !initialFiltersLoaded || mapIsLoading;
    const displayError = mapError;

    if (!initialFiltersLoaded) {
        return <MapLayout><div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div></MapLayout>;
    }

    return (
        <MapLayout>
            <FilterTopbar
                filterConfig={mapFilterConfig}
                availableFilters={{}}
                selectedFilters={selectedFilters}
                onDateChange={handleDateChange}
                onFilterChange={handleFilterChange}
                startDate={startDate}
                endDate={endDate}
                loading={!initialFiltersLoaded}
            />
            <MapArea>
                {pageIsLoading && <MapSpinner />}
                {displayError && !pageIsLoading && (
                    <MapErrorMessage message={`Failed to load data: ${displayError.info || displayError.message}`} />
                )}
                {!pageIsLoading && !displayError && mapApiResponse && (
                     <MapDisplay mapMarkers={mapMarkers} /> // Ensure MapDisplay is robust
                )}
                 {!pageIsLoading && !displayError && !mapApiResponse && (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No map data available for selected filters.</div>
                )}
            </MapArea>
        </MapLayout>
    );
}