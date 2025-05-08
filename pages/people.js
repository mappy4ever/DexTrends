// pages/people.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

import FilterTopbar from '../components/FilterTopbar'; // Already styled
import {
    getDefaultInitialStartDate,
    getDefaultInitialEndDate,
    getYearMonthString,
    parseYearMonthToDate,
    LOCAL_STORAGE_KEYS,
    loadFromLocalStorage,
    saveToLocalStorage,
    debounce
} from '../utils/filterUtils';

// --- Helper Function for Date Formatting ---
const formatDatePretty = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // The dateString is already in a full ISO format with UTC timezone (Z)
        const date = new Date(dateString);

        // Check if the date is valid after parsing
        if (isNaN(date.getTime())) {
            console.warn("Invalid date string provided to formatDatePretty:", dateString);
            return dateString; // Return original if parsing fails
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short', // e.g., "Aug"
            day: 'numeric',  // e.g., "27"
            timeZone: 'UTC'  // Explicitly state we want the output based on UTC
                             // since the input was UTC. This prevents the user's
                             // local timezone from shifting the date if the time part
                             // was near midnight.
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString; // Fallback to original string on error
    }
};

// --- Helper Function for Currency Formatting ---
const formatCurrency = (amount) => {
    const number = Number(amount) || 0;
    return number.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};


// --- UI Components ---
const PeopleLayout = ({ children }) => (
    <div className="section-spacing-y-default px-4 md:px-6 bg-background min-h-screen text-foreground">
        {children}
    </div>
);

const KPICard = ({ title, value, isLoading, className = "" }) => (
  <div className={`card card-padding-default ${className}`}>
    <h3 className="text-sm font-medium text-foreground-muted mb-1">{title}</h3>
    {isLoading ? (
      <div className="h-8 w-2/3 bg-foreground-muted/20 animate-pulse mt-1 rounded-app-sm"></div>
    ) : (
      // Assuming value might already be formatted with '$' or needs it
      <p className="text-2xl font-bold text-text-heading mt-1">
        {typeof value === 'number' ? `$${formatCurrency(value)}` : value}
      </p>
    )}
  </div>
);

const PersonDetailsCard = ({ person, isLoading, className = "" }) => (
     <div className={`card card-padding-default ${className}`}> {/* Removed mb-6 */}
        <h2 className="text-xl font-semibold text-text-heading mb-2">
            {isLoading ? 'Loading Person...' : person?.name || 'Person Details'}
        </h2>
        {isLoading && !person ? (
             <div className="space-y-1">
                <div className="h-4 w-1/2 bg-foreground-muted/20 animate-pulse rounded-app-sm"></div>
                <div className="h-4 w-1/3 bg-foreground-muted/20 animate-pulse rounded-app-sm"></div>
            </div>
        ) : person ? (
             <>
                <p className="text-content-default text-sm">ID: <span className="font-medium text-foreground">{person?.name_id || 'N/A'}</span></p>
                {/*<p className="text-content-default text-sm">Party: <span className="font-medium text-foreground">{person?.party || 'N/A'}</span></p>*/}
             </>
        ) : (
            <p className="text-foreground-muted">Select a person to view details.</p>
        )}
     </div>
);

const TripTable = ({ trips, isLoading }) => (
    <div className="card card-padding-default"> {/* Removed mt-6 */}
        <h3 className="text-section-heading mb-3">Associated Trips</h3>
        {isLoading ? (
             <div className="space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-10 w-full bg-foreground-muted/20 animate-pulse rounded-app-sm"></div>)}
             </div>
         ) : trips && trips.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-foreground">
                    <thead className="text-xs text-foreground-muted uppercase bg-surface-hovered">
                        <tr>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Days</th>
                            <th scope="col" className="px-4 py-3">Organization</th>
                            <th scope="col" className="px-4 py-3">Title</th>
                            <th scope="col" className="px-4 py-3">Purpose</th>
                            <th scope="col" className="px-4 py-3">Destinations</th>
                            <th scope="col" className="px-4 py-3 text-right">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip, index) => (
                            <tr key={trip.id || trip.ref_number || `trip-${index}`} className="border-b border-border hover:bg-surface-hovered transition-colors duration-150">
                                {/* REFACTOR: Format date pretty */}
                                <td className="px-4 py-2.5 font-medium text-text-heading">{formatDatePretty(trip.start_date)}</td>
                                <td className="px-4 py-2.5">{trip.traveldays}</td>
                                <td className="px-4 py-2.5">{trip.owner_org_title || 'N/A'}</td>
                                <td className="px-4 py-2.5">{trip.title || 'N/A'}</td>
                                <td className="px-4 py-2.5">{trip.purpose_en || trip.purpose || 'N/A'}</td>
                                <td className="px-4 py-2.5">{trip.destination_en || 'N/A'}</td>
                                {/* REFACTOR: Consistent currency formatting (already good) */}
                                <td className="px-4 py-2.5 text-right font-medium text-text-heading">${formatCurrency(trip.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-foreground-muted py-4">No trips found for this person in the selected date range.</p>
        )}
    </div>
);

const ChartContainer = ({ title, children, isLoading, className = "" }) => (
  <div className={`card card-padding-default ${className}`}>
    <h2 className="text-section-heading mb-4">{title}</h2>
    {isLoading ? (
        <div className="h-72 w-full bg-foreground-muted/20 animate-pulse rounded-app-md"></div>
    ) : (
        <div className="h-[400px] w-full">{children}</div>
    )}
  </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64 text-foreground-muted">
        <svg className="animate-spin h-8 w-8 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading data...
    </div>
);
const ErrorMessage = ({ message }) => (
    <div className="p-4 my-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-app-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
        Error: {message}
    </div>
);

const ReactEcharts = dynamic(() => import('echarts-for-react'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full flex justify-center items-center"><LoadingSpinner/></div>
});

const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching data.');
        try { const info = await res.json(); error.info = info?.message || info?.error || res.statusText; }
        catch (e) { error.info = res.statusText; }
        error.status = res.status;
        throw error;
    }
    return res.json();
};

function generateMonthsInRangeYYYYMM(startDate, endDate) {
    if (!startDate || !endDate) return [];
    const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
    const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));
    const months = []; let current = new Date(start);
    while (current <= end) { months.push(getYearMonthString(current)); current.setUTCMonth(current.getUTCMonth() + 1); }
    return months;
}

export default function PersonInspectorPage() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({ startMonth: '', endMonth: '', person: null, person_label: '' });
    const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const savedGlobalDates = loadFromLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {});
        const savedPageFilters = loadFromLocalStorage(LOCAL_STORAGE_KEYS.PEOPLE_PAGE_FILTERS, {});

        const finalInitialStartDate = parseYearMonthToDate(queryParams.get('start')) || parseYearMonthToDate(savedGlobalDates.startMonth) || getDefaultInitialStartDate();
        const finalInitialEndDate = parseYearMonthToDate(queryParams.get('end')) || parseYearMonthToDate(savedGlobalDates.endMonth) || getDefaultInitialEndDate();

        const finalSelected = {
            startMonth: getYearMonthString(finalInitialStartDate),
            endMonth: getYearMonthString(finalInitialEndDate),
            person: queryParams.get('personId') || savedPageFilters.person || null,
            person_label: queryParams.get('person_label') || savedPageFilters.person_label || '',
        };

        setStartDate(finalInitialStartDate);
        setEndDate(finalInitialEndDate);
        setSelectedFilters(finalSelected);

        saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, { startMonth: finalSelected.startMonth, endMonth: finalSelected.endMonth });
        saveToLocalStorage(LOCAL_STORAGE_KEYS.PEOPLE_PAGE_FILTERS, { person: finalSelected.person, person_label: finalSelected.person_label });

        setInitialFiltersLoaded(true);
    }, []);

    useEffect(() => {
        if (!initialFiltersLoaded || !startDate || !endDate) return;
        saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, { startMonth: getYearMonthString(startDate), endMonth: getYearMonthString(endDate) });
        saveToLocalStorage(LOCAL_STORAGE_KEYS.PEOPLE_PAGE_FILTERS, { person: selectedFilters.person, person_label: selectedFilters.person_label });
    }, [startDate, endDate, selectedFilters.person, selectedFilters.person_label, initialFiltersLoaded]);

    const handleDateChange = useCallback((filterKey, dateObject) => {
        const newDateString = dateObject ? getYearMonthString(dateObject) : '';
        if (filterKey === 'startDate') {
            setStartDate(dateObject);
            setSelectedFilters(prev => ({ ...prev, startMonth: newDateString }));
        } else if (filterKey === 'endDate') {
            setEndDate(dateObject);
            setSelectedFilters(prev => ({ ...prev, endMonth: newDateString }));
        }
    }, []);

    const handleFilterChange = useCallback((filterKey, value) => {
        if (filterKey === 'person') {
            setSelectedFilters(prev => ({ ...prev, person: value, person_label: value === null ? '' : prev.person_label }));
        } else if (filterKey === 'person_label') {
             setSelectedFilters(prev => ({ ...prev, person_label: value }));
        }
        else {
            setSelectedFilters(prev => ({ ...prev, [filterKey]: value }));
        }
    }, []);

    const loadPersonOptions = useCallback(debounce(async (inputValue, callback) => {
        if (!inputValue || inputValue.length < 2) { callback([]); return; }
        try {
            const response = await fetch(`/api/filters?searchPerson=${encodeURIComponent(inputValue)}&limit=30`);
            if (!response.ok) throw new Error('Failed to fetch person suggestions');
            const data = await response.json();
            const options = data.persons ? data.persons.map(p => ({ value: p.id, label: p.name })) : [];
            callback(options);
        } catch (error) { console.error("Error loading person options:", error); callback([]); }
    }, 300), []);

    const filterConfig = useMemo(() => [
        { key: 'startDate', label: 'Start Date:', type: 'month' },
        { key: 'endDate', label: 'End Date:', type: 'month' },
        {
            key: 'person', label: 'Person:', type: 'async_creatable_select',
            placeholder: 'Search by name...', loadOptions: loadPersonOptions, creatable: false,
        },
    ], [loadPersonOptions]);

    const personApiUrl = useMemo(() => {
        if (!initialFiltersLoaded || !selectedFilters.person || !selectedFilters.startMonth || !selectedFilters.endMonth) return null;
        return `/api/people?personId=${selectedFilters.person}&start=${selectedFilters.startMonth}&end=${selectedFilters.endMonth}`;
    }, [selectedFilters, initialFiltersLoaded]);

    const { data: personData, error: personError, isLoading: dataIsLoading, isValidating } = useSWR(personApiUrl, fetcher, {
        keepPreviousData: true, revalidateOnFocus: false,
    });

    const personKPIs = useMemo(() => {
        if (!personData?.personTrips || personData.personTrips.length === 0) return { totalSpent: 0, avgTripCost: 0, tripCount: 0 };
        const trips = personData.personTrips; const tripCount = trips.length;
        const totalSpent = trips.reduce((sum, trip) => sum + (Number(trip.total) || 0), 0);
        const avgTripCost = tripCount > 0 ? totalSpent / tripCount : 0;
        // REFACTOR: Ensure KPI values are numbers for KPICard to format
        return {
            totalSpent: Number(totalSpent) || 0,
            avgTripCost: Number(avgTripCost) || 0,
            tripCount
        };
    }, [personData?.personTrips]);

    const echartTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
    const uiIsLoading = !initialFiltersLoaded || (dataIsLoading && selectedFilters.person) || (isValidating && selectedFilters.person) ;

    const spendingOverTimeOptions = useMemo(() => {
        const trips = personData?.personTrips || [];
        if (!startDate || !endDate ) return {series: []}; // Should have an empty option structure
        const allMonthsInRange = generateMonthsInRangeYYYYMM(startDate, endDate);

        const spendingMap = trips.reduce((map, trip) => {
            if (!trip || !trip.start_date) return map;
            const monthKey = String(trip.start_date).slice(0, 7);
            if (!map[monthKey]) {
                map[monthKey] = { total_cost: 0, airfare: 0, other_transport: 0, lodging: 0, meals: 0, other_expenses: 0, record_count: 0 };
            }
            // REFACTOR: Ensure numbers are used for aggregation
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
            if(dataForMonth) {
                return { month: monthKey, ...dataForMonth };
            }
            return { month: monthKey, total_cost: 0, airfare: 0, other_transport: 0, lodging: 0, meals: 0, other_expenses: 0, record_count: 0 };
        });

        const monthLabels = monthlyAggregates.map(d => {
             if (!d || !d.month) return 'Unknown Date';
             const [year, monthNum] = d.month.split('-');
             const dateLabel = new Date(Date.UTC(Number(year), Number(monthNum) - 1, 1));
             return dateLabel.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
        });
        const seriesColors = ['#00A9B5', '#FF6B6B', '#FFD166', '#06D6A0', '#7884D5']; // Teal, Red, Yellow, Green, Purple

        const seriesData = [
            { name: 'Airfare', data: monthlyAggregates.map(d => parseFloat(d.airfare.toFixed(2))) },
            { name: 'Lodging', data: monthlyAggregates.map(d => parseFloat(d.lodging.toFixed(2))) },
            { name: 'Meals', data: monthlyAggregates.map(d => parseFloat(d.meals.toFixed(2))) },
            { name: 'Other Transport', data: monthlyAggregates.map(d => parseFloat(d.other_transport.toFixed(2))) },
            { name: 'Other Expenses', data: monthlyAggregates.map(d => parseFloat(d.other_expenses.toFixed(2))) },
        ];


        return {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'var(--color-surface-default)',
                borderColor: 'var(--color-border-default)',
                textStyle: { color: 'var(--color-foreground-default)'},
                // REFACTOR: Format tooltip currency
                formatter: (params) => {
                    let tooltipHtml = `${params[0].axisValueLabel}<br/>`;
                    params.forEach(param => {
                        tooltipHtml += `${param.marker} ${param.seriesName}: $${formatCurrency(param.value)}<br/>`;
                    });
                    return tooltipHtml;
                }
            },
            // REFACTOR: Ensure legend is shown and positioned
            legend: {
                data: ['Airfare', 'Lodging', 'Meals', 'Other Transport', 'Other Expenses'],
                inactiveColor: resolvedTheme === 'dark' ? '#718096' : '#A0AEC0',
                textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' },
                top: '5%', // Position legend at the top explicitly
                type: 'scroll', // In case of many items, allow scrolling
                show: true // Explicitly show legend
            },
            grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true, top: '15%' /* Adjust top to make space for legend */ },
            xAxis: { type: 'category', boundaryGap: false, data: monthLabels, axisLabel: { color: 'var(--color-text-muted)'} },
            yAxis: {
                type: 'value',
                name: 'Cost',
                axisLabel: {
                    // REFACTOR: Format Y-axis currency
                    formatter: (value) => `$${value.toLocaleString()}`, // Simpler formatting for axis, tooltips provide detail
                    color: 'var(--color-text-muted)'
                },
                splitLine: { lineStyle: { color: 'var(--color-border-default)' }}
            },
            dataZoom: [
                { type: 'inside', start: 0, end: 100, zoomLock: false },
                { show: true, type: 'slider', bottom: 10, height: 20, backgroundColor: 'var(--color-surface-default)', borderColor: 'var(--color-border-default)', dataBackground: { lineStyle: { color: 'var(--color-primary-default)/0.2' }, areaStyle: { color: 'var(--color-primary-default)/0.1'}}, selectedDataBackground: {lineStyle: {color: 'var(--color-primary-default)'}, areaStyle: {color: 'var(--color-primary-default)/0.3'}}, fillerColor: 'var(--color-primary-default)/0.2', handleStyle: { color: 'var(--color-primary-default)'}, textStyle: {color: 'var(--color-text-muted)'}}
            ],
            series: seriesData.map((s, index) => ({
                ...s,
                type: 'line',
                smooth: true,
                color: seriesColors[index % seriesColors.length], // Use modulo for safety
                showSymbol: false,
                lineStyle: { width: 2.5 },
                emphasis: { focus: 'series' }
            }))
        };
    }, [personData?.personTrips, startDate, endDate, resolvedTheme]);

    const spendingByPurposeOptions = useMemo(() => {
        const trips = personData?.personTrips || [];
        if (!trips.length) return { series: [] }; // Return basic structure
        const purposeAgg = trips.reduce((acc, trip) => {
            const name = trip.purpose || trip.purpose_en || 'Unknown';
            // REFACTOR: Ensure numbers are used for aggregation
            acc[name] = (acc[name] || 0) + (Number(trip.total) || 0);
            return acc;
        }, {});

        const formattedData = Object.entries(purposeAgg)
            .map(([name, value]) => ({
                name,
                // REFACTOR: Round to 2 decimal places for pie chart data
                value: parseFloat(value.toFixed(2))
            }))
            .filter(item => item.value > 0)
            .sort((a,b)=>b.value-a.value);

        return {
            tooltip: {
                trigger: 'item',
                // REFACTOR: Format tooltip currency
                formatter: (params) => `${params.name}: $${formatCurrency(params.value)} (${params.percent}%)`,
                backgroundColor: 'var(--color-surface-default)',
                borderColor: 'var(--color-border-default)',
                textStyle: { color: 'var(--color-foreground-default)'}
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                left: 10,
                top: 20,
                bottom: 20,
                inactiveColor: 'var(--color-foreground-muted)',
                textStyle: { color: 'var(--color-text-body)'}
            },
            series: [{
                name: 'Spending by Purpose',
                type: 'pie',
                radius: ['50%', '70%'],
                center: ['60%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: { borderRadius: 5, borderColor: 'var(--color-surface-default)', borderWidth: 1.5 },
                label: { show: false },
                emphasis: {
                    label: { show: true, fontSize: 16, fontWeight: 'bold', color: 'var(--color-text-heading)' },
                    itemStyle: { shadowBlur: 10, shadowColor: 'var(--color-shadow-default)'}
                },
                data: formattedData,
            }],
        };
    }, [personData?.personTrips, resolvedTheme]);


    if (!initialFiltersLoaded && !uiIsLoading) { // Should be checking initialFiltersLoaded first
        return <PeopleLayout><LoadingSpinner /></PeopleLayout>;
    }

    return (
        <PeopleLayout>
            <h1 className="text-page-heading">Person Inspector</h1>

            <FilterTopbar
                filterConfig={filterConfig}
                availableFilters={{}} // This seems empty, ensure it's intentional
                selectedFilters={selectedFilters}
                onDateChange={handleDateChange}
                onFilterChange={handleFilterChange}
                startDate={startDate}
                endDate={endDate}
                loading={!initialFiltersLoaded} // Loading for filter bar is when initial filters haven't loaded
            />

            {personError && selectedFilters.person && <ErrorMessage message={`Failed to load person data: ${personError.info || personError.message}`} />}

            <div className="mt-6 space-y-6">

                {selectedFilters.person ? (
                    <>
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="lg:w-1/3 xl:w-1/4 flex">
                                <PersonDetailsCard
                                    person={personData?.personDetails}
                                    isLoading={uiIsLoading} // This uiIsLoading combines initial load and data fetch for selected person
                                    className="w-full"
                                />
                            </div>
                            <div className="lg:w-2/3 xl:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <KPICard title="Total Spent" value={personKPIs.totalSpent} isLoading={uiIsLoading} />
                                <KPICard title="Average Trip Cost" value={personKPIs.avgTripCost} isLoading={uiIsLoading} />
                                <KPICard title="Total Trips" value={personKPIs.tripCount.toLocaleString()} isLoading={uiIsLoading} />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6">
                            <ChartContainer title="Spending Over Time" isLoading={uiIsLoading}>
                                {(!uiIsLoading && personData?.personTrips && personData.personTrips.length > 0) ? (
                                    <ReactEcharts option={spendingOverTimeOptions} notMerge={true} lazyUpdate={true} theme={echartTheme} style={{ height: '100%', width: '100%' }} />
                                ) : !uiIsLoading ? (
                                    <p className="text-foreground-muted text-center py-10">No spending data to display for the selected period.</p>
                                ) : null}
                            </ChartContainer>
						</div>
						<div className="mt-6 grid grid-cols-1 gap-6">
                            <ChartContainer title="Spending by Purpose" isLoading={uiIsLoading}>
                                 {(!uiIsLoading && personData?.personTrips && personData.personTrips.length > 0) ? (
                                    <ReactEcharts option={spendingByPurposeOptions} notMerge={true} lazyUpdate={true} theme={echartTheme} style={{ height: '100%', width: '100%' }} />
                                  ) : !uiIsLoading ? (
                                    <p className="text-foreground-muted text-center py-10">No purpose data to display for the selected period.</p>
                                  ) : null}
                            </ChartContainer>
                        </div>

                        <div>
                            <TripTable trips={personData?.personTrips} isLoading={uiIsLoading} />
                        </div>
                    </>
                ) : !uiIsLoading ? (
                    <div className="card card-padding-default text-center text-foreground-muted py-10">
                        Please select a person from the dropdown to view their details and spending patterns.
                    </div>
                ) : null }

                {/* This specific spinner is for when a person IS selected, but their data is loading. */}
                {(uiIsLoading && selectedFilters.person && !personData) && <LoadingSpinner />}

            </div>
        </PeopleLayout>
    );
}