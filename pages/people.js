// pages/people.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import 'react-datepicker/dist/react-datepicker.css';
//import { useTheme } from 'next-themes';

import FilterTopbar from '../components/FilterTopbar';
import {
    getDefaultInitialStartDate,
    getDefaultInitialEndDate,
    getYearMonthString,
    parseYearMonthToDate,
    LOCAL_STORAGE_KEYS,
    loadFromLocalStorage,
    saveToLocalStorage,
    debounce // For loadOptions if needed, though AsyncCreatableSelect handles some debouncing
} from '../utils/filterUtils';

//const { resolvedTheme } = useTheme();

// --- UI Components (PeopleLayout, PersonDetailsCard, etc. - kept as is) ---
const PeopleLayout = ({ children }) => <div className="p-4 md:p-6">{children}</div>;
const KPICard = ({ title, value, isLoading, className = "" }) => (
  <div className={`bg-card text-card-foreground p-4 rounded-lg shadow ${className}`}>
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    {isLoading ? (
      <div className="h-8 w-2/3 bg-muted animate-pulse mt-1 rounded"></div>
    ) : (
      <p className="text-2xl font-bold mt-1">{value}</p>
    )}
  </div>
);

const PersonDetailsCard = ({ person, isLoading }) => (
     <div className="bg-card text-card-foreground p-4 rounded-lg shadow mb-6 min-h-[100px]">
        <h2 className="text-xl font-semibold mb-2">{isLoading ? 'Loading Person...' : person?.name || 'Person Details'}</h2>
        {isLoading && !person ? (
             <div className="space-y-1"><div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div><div className="h-4 w-1/3 bg-muted animate-pulse rounded"></div></div>
        ) : person ? (
             <>
                <p className="text-muted-foreground text-sm">ID: {person?.name_id}</p>
                <p className="text-muted-foreground text-sm">Party: {person?.party || 'N/A'}</p>
             </>
        ) : (
            <p className="text-muted-foreground">Select a person to view details.</p>
        )}
     </div>
);
const TripTable = ({ trips, isLoading }) => (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow mt-6">
        <h3 className="text-lg font-semibold mb-2">Associated Trips</h3>
        {isLoading ? (
             <div className="space-y-2"><div className="h-8 w-full bg-muted animate-pulse rounded"></div><div className="h-8 w-full bg-muted animate-pulse rounded"></div><div className="h-8 w-full bg-muted animate-pulse rounded"></div></div>
         ) : trips && trips.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                     <thead className="text-xs text-muted-foreground uppercase bg-muted/50 dark:bg-slate-700">
                         <tr>
                             <th scope="col" className="px-4 py-2">Date</th><th scope="col" className="px-4 py-2">Days</th>
                             <th scope="col" className="px-4 py-2">Org</th><th scope="col" className="px-4 py-2">Title</th>
                             <th scope="col" className="px-4 py-2">Purpose</th><th scope="col" className="px-4 py-2">Destinations</th>
                             <th scope="col" className="px-4 py-2 text-right">Cost</th>
                         </tr>
                     </thead>
                     <tbody>
                         {trips.map((trip, index) => ( // Added index for key fallback
                            <tr key={trip.id || trip.ref_number || `trip-${index}`} className="border-b border-border dark:border-slate-700 hover:bg-muted/40 dark:hover:bg-slate-600/30">
                                 <td className="px-4 py-2 font-medium">{trip.start_date}</td>
                                 <td className="px-4 py-2">{trip.traveldays}</td>
                                 <td className="px-4 py-2">{trip.owner_org_title || 'N/A'}</td>
                                 <td className="px-4 py-2">{trip.title || 'N/A'}</td>
                                 <td className="px-4 py-2">{trip.purpose_en || trip.purpose || 'N/A'}</td>
                                 <td className="px-4 py-2">{trip.destination_en || trip.destination_en || 'N/A'}</td>
                                 <td className="px-4 py-2 text-right">${(Number(trip.total) || 0).toLocaleString()}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
            </div>
        ) : (
            <p className="text-muted-foreground">No trips found for this person in the selected date range.</p>
        )}
    </div>
);
const ChartContainer = ({ title, children, isLoading, className = "" }) => (
  <div className={`bg-card text-card-foreground p-4 rounded-lg shadow ${className}`}>
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    {isLoading ? <div className="h-72 w-full bg-muted animate-pulse rounded"></div> : <div style={{ height: '400px', width: '100%' }}>{children}</div>}
  </div>
);
const LoadingSpinner = () => <div className="text-center p-10">Loading...</div>;
const ErrorMessage = ({ message }) => <div className="text-center p-10 text-red-600">Error: {message}</div>;


const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false });

import { useTheme } from 'next-themes';

const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching data.');
        try {
            const info = await res.json();
            error.info = info?.message || info?.error || res.statusText;
        } catch (e) {
            error.info = res.statusText;
        }
        error.status = res.status;
        throw error;
    }
    return res.json();
};

function generateMonthsInRangeYYYYMM(startDate, endDate) {
    if (!startDate || !endDate) return [];
    const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
    const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));
    const months = [];
    let current = new Date(start);
    while (current <= end) {
        months.push(getYearMonthString(current));
        current.setUTCMonth(current.getUTCMonth() + 1);
    }
    return months;
}

export default function PersonInspectorPage() {
    const [startDate, setStartDate] = useState(null); // Date object
    const [endDate, setEndDate] = useState(null);     // Date object

    // selectedFilters for API query and FilterTopbar state
    const [selectedFilters, setSelectedFilters] = useState({
        startMonth: '',
        endMonth: '',
        person: null,       // Store person_id
        person_label: '',   // Store person's name for display in AsyncCreatableSelect
    });
    const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
	const { resolvedTheme } = useTheme(); // For chart theming

	useEffect(() => {
		// --- 1. Determine Initial Values (Query > LocalStorage > Default) ---
		const queryParams = new URLSearchParams(window.location.search);
		const queryStart = queryParams.get('start');
		const queryEnd = queryParams.get('end');
	
		const queryPersonId = queryParams.get('personId');
		// A 'person_label' might not always be passed in query params, especially if ID is sufficient
		// and the label can be fetched or is part of the AsyncSelect's initial option loading.
		// However, if your dashboard link constructs it, this is fine.
		const queryPersonLabel = queryParams.get('person_label'); // This is an addition to consider.
	
		// const queryTitleId = queryParams.get('titleId'); // Not needed for people.js
	
		const savedGlobalDates = loadFromLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {});
		const pageSpecificLocalStorageKey = LOCAL_STORAGE_KEYS.PEOPLE_PAGE_FILTERS;
		const savedPageSpecificFilters = loadFromLocalStorage(pageSpecificLocalStorageKey, {});
	
		// Determine final initial values with precedence
		const finalInitialStartDate = parseYearMonthToDate(queryStart) || parseYearMonthToDate(savedGlobalDates.startMonth) || getDefaultInitialStartDate();
		const finalInitialEndDate = parseYearMonthToDate(queryEnd) || parseYearMonthToDate(savedGlobalDates.endMonth) || getDefaultInitialEndDate();
	
		const finalSelectedFiltersForState = {
			startMonth: getYearMonthString(finalInitialStartDate),
			endMonth: getYearMonthString(finalInitialEndDate),
			person: queryPersonId !== null ? queryPersonId : (savedPageSpecificFilters.person !== undefined ? savedPageSpecificFilters.person : null),
			person_label: queryPersonLabel !== null ? queryPersonLabel : (savedPageSpecificFilters.person_label !== undefined ? savedPageSpecificFilters.person_label : ''),
		};
	
		// --- 2. Set React State ---
		setStartDate(finalInitialStartDate);
		setEndDate(finalInitialEndDate);
		setSelectedFilters(finalSelectedFiltersForState);
	
		// --- 3. Explicitly Save These Determined Values to LocalStorage ---
		saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {
			startMonth: finalSelectedFiltersForState.startMonth,
			endMonth: finalSelectedFiltersForState.endMonth,
		});
		saveToLocalStorage(pageSpecificLocalStorageKey, {
			person: finalSelectedFiltersForState.person,
			person_label: finalSelectedFiltersForState.person_label,
		});
	
		// --- 4. Mark Initial Loading as Complete ---
		setInitialFiltersLoaded(true);
	
	}, []); // Empty dependency array ensures this runs once on mount

    // Persist filters to localStorage
    useEffect(() => {
        if (!initialFiltersLoaded) return;
        if (startDate && endDate) {
            saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {
                startMonth: getYearMonthString(startDate),
                endMonth: getYearMonthString(endDate),
            });
        }
        saveToLocalStorage(LOCAL_STORAGE_KEYS.PEOPLE_PAGE_FILTERS, {
            person: selectedFilters.person,
            person_label: selectedFilters.person_label,
        });
    }, [startDate, endDate, selectedFilters.person, selectedFilters.person_label, initialFiltersLoaded]);

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
        // Special handling for person_label when person is cleared
        if (filterKey === 'person' && value === null) {
            setSelectedFilters(prev => ({ ...prev, person: null, person_label: '' }));
        } else {
            setSelectedFilters(prev => ({ ...prev, [filterKey]: value }));
        }
    }, []);

    // Function to load person options for AsyncCreatableSelect
    const loadPersonOptions = useCallback(debounce(async (inputValue, callback) => {
        if (!inputValue || inputValue.length < 2) { // Adjust min length if needed
            callback([]);
            return;
        }
        try {
            const response = await fetch(`/api/filters?searchPerson=${encodeURIComponent(inputValue)}&limit=30`);
            if (!response.ok) throw new Error('Failed to fetch person suggestions');
            const data = await response.json();
            // Assuming /api/filters returns { persons: [{ id, name }] }
            const options = data.persons ? data.persons.map(p => ({ value: p.id, label: p.name })) : [];
            callback(options);
        } catch (error) {
            console.error("Error loading person options:", error);
            callback([]);
        }
    }, 300), []);

    // Define filterConfig for FilterTopbar
    const filterConfig = useMemo(() => [
        { key: 'startMonth', label: 'Start Date:', type: 'month' },
        { key: 'endMonth', label: 'End Date:', type: 'month' },
        {
            key: 'person',
            label: 'Person:',
            type: 'async_creatable_select', // Use the new type
            placeholder: 'Search by name...',
            loadOptions: loadPersonOptions,
            creatable: false, // Assuming we don't want to create new people from this UI for now
            // onCreateOption: (key, inputValue) => { /* handle creation if needed */ }
        },
    ], [loadPersonOptions]);

    // API URL for fetching selected person's details and trips
    const personApiUrl = useMemo(() => {
        if (!initialFiltersLoaded || !selectedFilters.person || !selectedFilters.startMonth || !selectedFilters.endMonth) {
            return null;
        }
        return `/api/people?personId=${selectedFilters.person}&start=${selectedFilters.startMonth}&end=${selectedFilters.endMonth}`;
    }, [selectedFilters, initialFiltersLoaded]);

    const { data: personData, error: personError, isLoading: personIsLoading } = useSWR(personApiUrl, fetcher, {
        keepPreviousData: true,
    });
    
    // --- Calculate KPIs for the selected person ---
    const personKPIs = useMemo(() => {
        if (!personData || !personData.personTrips || personData.personTrips.length === 0) {
            return { totalSpent: 0, avgTripCost: 0, tripCount: 0 };
        }
        const trips = personData.personTrips;
        const tripCount = trips.length;
        const totalSpent = trips.reduce((sum, trip) => sum + (Number(trip.total) || 0), 0);
        const avgTripCost = tripCount > 0 ? totalSpent / tripCount : 0;

        return {
            totalSpent,
            avgTripCost,
            tripCount
        };
    }, [personData?.personTrips]);	
	
    // -- ECharts options (similar to original, ensure data dependencies are correct) --
    const spendingOverTimeOptions = useMemo(() => {
        const trips = personData?.personTrips || [];
        if (!startDate || !endDate || !initialFiltersLoaded) return {};

        const allMonthsInRange = generateMonthsInRangeYYYYMM(startDate, endDate);
        const spendingMap = trips.reduce((map, trip) => {
            if (!trip || !trip.start_date) return map;
            const monthKey = String(trip.start_date).slice(0, 7);
            if (!map[monthKey]) {
                map[monthKey] = { total_cost: 0, airfare: 0, other_transport: 0, lodging: 0, meals: 0, other_expenses: 0, record_count: 0 };
            }
            map[monthKey].total_cost += Number(trip.total) || 0;
            map[monthKey].airfare += Number(trip.airfare) || 0;
            map[monthKey].other_transport += Number(trip.other_transport) || 0;
            map[monthKey].lodging += Number(trip.lodging) || 0;
            map[monthKey].meals += Number(trip.meals) || 0;
            map[monthKey].other_expenses += Number(trip.other_expenses) || 0;
            map[monthKey].record_count += 1;
            return map;
        }, {});

        const monthlyAggregates = allMonthsInRange.map(monthKey => {
            const dataForMonth = spendingMap[monthKey];
            if(dataForMonth) return { month: monthKey, ...dataForMonth };
            return { month: monthKey, total_cost: 0, airfare: 0, other_transport: 0, lodging: 0, meals: 0, other_expenses: 0, record_count: 0 };
        });
        
        const monthLabels = monthlyAggregates.map(d => {
             const [year, monthNum] = d.month.split('-');
             const dateLabel = new Date(Date.UTC(Number(year), Number(monthNum) - 1, 1));
             return dateLabel.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
        });

        return {
            tooltip: { trigger: 'axis' },
            legend: { data: ['Airfare', 'Lodging', 'Meals', 'Other Transport', 'Other Expenses'], textStyle: { color: '#9CA3AF'} },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: monthLabels, axisLabel: { color: '#9CA3AF'} },
            yAxis: [
                { type: 'value', name: 'Cost', axisLabel: { formatter: '${value}', color: '#9CA3AF' } },
            ],
            dataZoom: [ { type: 'inside' }, { show: true, type: 'slider', bottom: 10 } ],
            series: [
                { name: 'Airfare', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.airfare) },
                { name: 'Lodging', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.lodging) },
				{ name: 'Meals', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.meals) },
                { name: 'Other Transport', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.other_transport) },
                { name: 'Other Expenses', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.other_expenses) }
            ]
        };
    }, [personData?.personTrips, startDate, endDate, initialFiltersLoaded]);

    const spendingByPurposeOptions = useMemo(() => {
        const trips = personData?.personTrips || [];
        if(!initialFiltersLoaded) return {};

        const purposeAgg = trips.reduce((acc, trip) => {
            const name = trip.purpose || trip.purpose || 'Unknown';
            const value = Number(trip.total) || 0;
            acc[name] = (acc[name] || 0) + value;
            return acc;
        }, {});

        const formattedData = Object.entries(purposeAgg).map(([name, value]) => ({ name, value })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
        return {
            tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
            legend: { type: 'scroll', orient: 'vertical', left: 10, top: 20, bottom: 20, textStyle: { color: '#9CA3AF'} },
            series: [{
                name: 'Spending by Purpose', type: 'pie', radius: ['40%', '70%'], center: ['65%', '50%'],
                avoidLabelOverlap: true, itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 1 },
                label: { show: false }, emphasis: { scale: true }, labelLine: { show: false }, data: formattedData,
            }],
        };
    }, [personData?.personTrips, initialFiltersLoaded]);

    const uiIsLoading = !initialFiltersLoaded || (personIsLoading && selectedFilters.person);

    if (!initialFiltersLoaded) {
        return <PeopleLayout><LoadingSpinner /></PeopleLayout>;
    }

    return (
        <PeopleLayout>
             <h1 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Person Inspector</h1>

             <FilterTopbar
                 filterConfig={filterConfig}
                 availableFilters={{}} // Async person select manages its own options
                 selectedFilters={selectedFilters}
                 onDateChange={handleDateChange}
                 onFilterChange={handleFilterChange}
                 startDate={startDate}
                 endDate={endDate}
                 loading={!initialFiltersLoaded}
             />

             {personError && selectedFilters.person && <ErrorMessage message={`Failed to load person data: ${personError.info || personError.message}`} />}

            {/* Section for Person Details and KPIs */}
            {selectedFilters.person && ( // Only show this section if a person is selected
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <PersonDetailsCard
                        person={personData?.personDetails}
                        isLoading={uiIsLoading}
                        className="md:col-span-1" // Takes 1 column on medium screens and up
                    />
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* KPIs take 2 columns */}
                        <KPICard
                            title="Total Spent"
                            value={`$${personKPIs.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            isLoading={uiIsLoading}
                        />
                        <KPICard
                            title="Average Trip Cost"
                            value={`$${personKPIs.avgTripCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            isLoading={uiIsLoading}
                        />
                         {/* You can also add a trip count KPI if desired */}
                         <KPICard
                            title="Total Trips"
                            value={personKPIs.tripCount.toLocaleString()}
                            isLoading={uiIsLoading}
                            className="sm:col-span-2" // Span full width if only 3 KPIs and this is the third
                        />
                    </div>
                </div>
            )}


             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* TripTable now effectively takes full width if charts are in the other column or hidden */}
                 <div className={`lg:col-span-${selectedFilters.person ? '2' : '3'} space-y-6`}>
                      {selectedFilters.person && <TripTable trips={personData?.personTrips} isLoading={uiIsLoading} />}
                 </div>

                 {/* Charts Column - only show if a person is selected */}
                 {selectedFilters.person && (
                     <div className="space-y-6 lg:col-span-1">
                        <ChartContainer title="Spending Over Time" isLoading={uiIsLoading}>
                            {(!uiIsLoading || personData?.personTrips) && <ReactEcharts option={spendingOverTimeOptions} notMerge={true} lazyUpdate={true} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />}
                        </ChartContainer>
                        <ChartContainer title="Spending by Purpose" isLoading={uiIsLoading}>
                            {(!uiIsLoading || personData?.personTrips) && <ReactEcharts option={spendingByPurposeOptions} notMerge={true} lazyUpdate={true} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />}
                        </ChartContainer>
                     </div>
                 )}
                 
                 {!selectedFilters.person && !uiIsLoading && (
                      <div className="lg:col-span-3 p-6 text-center text-muted-foreground bg-card rounded-lg shadow dark:bg-slate-800">
                          Please select a person from the dropdown to view their details and spending patterns.
                      </div>
                  )}
             </div>
        </PeopleLayout>
    );
}