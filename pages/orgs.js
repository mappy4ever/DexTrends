// pages/orgs.js 
import { useEffect, useState, useMemo, useCallback } from "react";
import useSWR from 'swr';
import dynamic from "next/dynamic";
import "react-datepicker/dist/react-datepicker.css";
//import { useTheme } from 'next-themes';

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

// --- UI Components (TrendsLayout, ChartContainer etc. - kept as is from original) ---
const TrendsLayout = ({ children }) => <div className="p-4 md:p-6">{children}</div>;
const ChartContainer = ({ title, children, isLoading, className = "" }) => (
  <div className={`bg-card text-card-foreground p-4 rounded-lg shadow ${className}`}>
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    {isLoading ? <div className="h-72 w-full bg-muted animate-pulse rounded"></div> : <div style={{ height: '450px', width: '100%' }}>{children}</div>}
  </div>
);
const LoadingSpinner = () => <div className="text-center p-10">Loading...</div>;
const ErrorMessage = ({ message }) => <div className="text-center p-10 text-red-600">Error: {message}</div>;
//const { resolvedTheme } = useTheme();

const ReactEcharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const fetcher = url => fetch(url).then(res => {
    if (!res.ok) {
        // Consider more specific error handling based on response
        const error = new Error('Failed to fetch data');
        error.status = res.status;
        // try to get error message from body
        return res.json().then(body => {
            error.info = body.message || body.error || 'Server error';
            throw error;
        }).catch(() => { // if body is not json or other error
            error.info = res.statusText;
            throw error;
        });
    }
    return res.json();
});

// Helper to generate all months in a range (inclusive) -> ['YYYY-MM', ...]
// (This can also be moved to utils if used by multiple chart pages)
function generateMonthsInRangeForCharts(startDate, endDate) {
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


export default function OrgsPage() { 
    const [startDate, setStartDate] = useState(null); // Date object
    const [endDate, setEndDate] = useState(null);     // Date object

    // selectedFilters for API query (strings/IDs)
    const [selectedFilters, setSelectedFilters] = useState({
        startMonth: '',
        endMonth: '',
        org: 'all',     // Store actual ID or 'all'
        title: 'all',   // Store actual ID or 'all'
    });

    const [availableFilterOptions, setAvailableFilterOptions] = useState({
        orgs: [], // Expects [{ value: 'id', label: 'Name' }, ...]
        titles: [],
    });
    const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);

	useEffect(() => {
		// --- 1. Determine Initial Values (Query > LocalStorage > Default) ---
		const queryParams = new URLSearchParams(window.location.search);
		const queryStart = queryParams.get('start');
		const queryEnd = queryParams.get('end');
	
		const queryOrgId = queryParams.get('orgId');
		const queryTitleId = queryParams.get('titleId');
	
		const savedGlobalDates = loadFromLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {});
		const pageSpecificLocalStorageKey = LOCAL_STORAGE_KEYS.ORGS_PAGE_FILTERS;
		const savedPageSpecificFilters = loadFromLocalStorage(pageSpecificLocalStorageKey, {});
	
		// Determine final initial values with precedence
		const finalInitialStartDate = parseYearMonthToDate(queryStart) || parseYearMonthToDate(savedGlobalDates.startMonth) || getDefaultInitialStartDate();
		const finalInitialEndDate = parseYearMonthToDate(queryEnd) || parseYearMonthToDate(savedGlobalDates.endMonth) || getDefaultInitialEndDate();
	
		const finalSelectedFiltersForState = {
			startMonth: getYearMonthString(finalInitialStartDate),
			endMonth: getYearMonthString(finalInitialEndDate),
			org: queryOrgId !== null ? queryOrgId : (savedPageSpecificFilters.org !== undefined ? savedPageSpecificFilters.org : 'all'),
			title: queryTitleId !== null ? queryTitleId : (savedPageSpecificFilters.title !== undefined ? savedPageSpecificFilters.title : 'all'),
		};
	
		// --- 2. Set React State ---
		setStartDate(finalInitialStartDate);
		setEndDate(finalInitialEndDate);
		setSelectedFilters(finalSelectedFiltersForState);
	
		// --- 3. Explicitly Save These Determined Values to LocalStorage ---
		// This ensures that the state derived from query params (or fallbacks) IS the new persisted state.
		saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {
			startMonth: finalSelectedFiltersForState.startMonth,
			endMonth: finalSelectedFiltersForState.endMonth,
		});
		saveToLocalStorage(pageSpecificLocalStorageKey, {
			org: finalSelectedFiltersForState.org,
			title: finalSelectedFiltersForState.title,
		});
	
		// --- 4. Mark Initial Loading as Complete ---
		setInitialFiltersLoaded(true);
	
	}, []); // Empty dependency array to run once on mount (and when query params change if using a router event listener)

    // Persist filters to localStorage whenever they change
    useEffect(() => {
        if (!initialFiltersLoaded) return;

        if (startDate && endDate) {
            saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {
                startMonth: getYearMonthString(startDate),
                endMonth: getYearMonthString(endDate),
            });
        }
        saveToLocalStorage(LOCAL_STORAGE_KEYS.ORGS_PAGE_FILTERS, {
            org: selectedFilters.org,
            title: selectedFilters.title,
        });
    }, [startDate, endDate, selectedFilters.org, selectedFilters.title, initialFiltersLoaded]);

    // Fetch available filter options (Orgs, Titles)
    // This should ideally come from a dedicated endpoint: /api/filters?optionsFor=orgsPage
    // For now, we'll simulate it or assume data from main trends API can populate it.
    // The original code derived them from `data?.trendsData`. This is okay if trendsData is comprehensive enough.
    // Or use a dedicated API like `/api/filters.js`
    const { data: filterOptionsData, error: filterOptionsError } = useSWR('/api/filters?types=org,title', fetcher);
    
	useEffect(() => {
		if (filterOptionsData) {
			setAvailableFilterOptions({
				// API now returns { id, name }, map directly to { value, label } for react-select
				orgs: filterOptionsData.orgs
					? filterOptionsData.orgs.map(org => ({ value: org.id, label: org.name }))
					: [],
				titles: filterOptionsData.titles
					? filterOptionsData.titles.map(title => ({ value: title.id, label: title.name }))
					: [],
			});
		} else if (filterOptionsError) {
			console.error("Error fetching filter options:", filterOptionsError);
			setAvailableFilterOptions({ orgs: [], titles: [] });
		}
	}, [filterOptionsData, filterOptionsError]);

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
        setSelectedFilters(prev => ({ ...prev, [filterKey]: value }));
    }, []);

    // Define filterConfig for the FilterTopbar
    const filterConfig = useMemo(() => [
        { key: 'startMonth', label: 'Start Date:', type: 'month' },
        { key: 'endMonth', label: 'End Date:', type: 'month' },
        { key: 'org', label: 'Organization:', type: 'select', optionsKey: 'orgs', placeholder: 'Select Organization' },
        { key: 'title', label: 'Traveler Title:', type: 'select', optionsKey: 'titles', placeholder: 'Select Title' },
    ], []);

    // API URL construction
    const apiUrl = useMemo(() => {
        if (!initialFiltersLoaded || !selectedFilters.startMonth || !selectedFilters.endMonth) return null;
        
        const params = new URLSearchParams({
            start: selectedFilters.startMonth,
            end: selectedFilters.endMonth,
        });
        if (selectedFilters.org && selectedFilters.org !== 'all') {
            params.append('orgId', selectedFilters.org);
        }
        if (selectedFilters.title && selectedFilters.title !== 'all') {
            params.append('titleId', selectedFilters.title);
        }
        return `/api/trends?${params.toString()}`;
    }, [selectedFilters, initialFiltersLoaded]);

    const { data: trendsApiData, error: trendsApiError, isLoading: trendsApiIsLoading } = useSWR(apiUrl, fetcher, { keepPreviousData: true });

    // --- ECharts Options (similar to original, adapt as needed) ---
    const spendingTrendsOptions = useMemo(() => {
        const trends = trendsApiData?.trendsData || [];
        if (!startDate || !endDate || !initialFiltersLoaded) return {}; // Added initialFiltersLoaded check

        const allMonthsInRange = generateMonthsInRangeForCharts(startDate, endDate);
        const trendsMap = trends.reduce((map, item) => {
            // Ensure item.month is valid before slicing
            const monthKey = item && item.month ? String(item.month).slice(0, 7) : null; 
            if (monthKey) {
                 if (!map[monthKey]) {
                    map[monthKey] = { total_cost: 0, airfare: 0, other_transport: 0, lodging: 0, meals: 0, other_expenses: 0, record_count: 0 };
                }
                map[monthKey].total_cost += Number(item.total_cost) || 0;
                map[monthKey].airfare += Number(item.airfare) || 0;
                map[monthKey].other_transport += Number(item.other_transport) || 0;
                map[monthKey].lodging += Number(item.lodging) || 0;
                map[monthKey].meals += Number(item.meals) || 0;
                map[monthKey].other_expenses += Number(item.other_expenses) || 0;
                map[monthKey].record_count += Number(item.record_count) || 0;
            }
            return map;
        }, {});

        const monthlyAggregates = allMonthsInRange.map(monthKey => {
            const dataFromApiForMonth = trendsMap[monthKey];
            if (dataFromApiForMonth) {
                return {
                    month: monthKey, // Ensure month property is always present
                    ...dataFromApiForMonth 
                };
            } else {
                // Fallback for months with no data from API
                return { 
                    month: monthKey, 
                    total_cost: 0, airfare: 0, other_transport: 0, 
                    lodging: 0, meals: 0, other_expenses: 0, record_count: 0 
                };
            }
        });
        
        const monthLabels = monthlyAggregates.map(d => {
             // Now d.month should always be a valid 'YYYY-MM' string
             const [year, monthNum] = d.month.split('-'); 
             const dateLabel = new Date(Date.UTC(Number(year), Number(monthNum) - 1, 1));
             return dateLabel.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
        });

        // ... (rest of the spendingTrendsOptions object)
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
                { name: 'Airfare', type: 'line', smooth: true, yAxisIndex: 0, emphasis: { focus: 'series' }, data: monthlyAggregates.map(d => d.airfare) },
                { name: 'Lodging', type: 'line', smooth: true, yAxisIndex: 0, emphasis: { focus: 'series' }, data: monthlyAggregates.map(d => d.lodging) },
                { name: 'Meals', type: 'line', smooth: true, yAxisIndex: 0, emphasis: { focus: 'series' }, data: monthlyAggregates.map(d => d.meals) },
                { name: 'Other Transport', type: 'line', smooth: true, yAxisIndex: 0, emphasis: { focus: 'series' }, data: monthlyAggregates.map(d => d.other_transport) },
                { name: 'Other Expenses', type: 'line', smooth: true, yAxisIndex: 0, emphasis: { focus: 'series' }, data: monthlyAggregates.map(d => d.other_expenses) }
            ]
        };
    }, [trendsApiData?.trendsData, startDate, endDate, initialFiltersLoaded]); // Added initialFiltersLoaded



    // Example for spendingByPurposeOptions - ensure your API and data structure match
    const spendingByPurposeOptions = useMemo(() => {
        const purposeData = trendsApiData?.purposeBreakdown || []; // Assuming API provides this
        const purposeAgg = purposeData.reduce((acc, item) => {
            const name = item.purpose || 'Unknown';
            const value = item.total_cost || 0;
            acc[name] = (acc[name] || 0) + value;
            return acc;
        }, {});
        const formattedData = Object.entries(purposeAgg).map(([name, value]) => ({ name, value })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
        return {
            tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
            legend: { orient: 'vertical', left: 'left', top: 'center', type: 'scroll', textStyle: { color: '#9CA3AF'} },
            series: [{
                name: 'Spending by Purpose', type: 'pie', radius: ['40%', '70%'], center: ['65%', '50%'],
                avoidLabelOverlap: true, itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 1 },
                label: { show: false }, emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
                labelLine: { show: false }, data: formattedData,
            }],
        };
    }, [trendsApiData?.purposeBreakdown]);
    
    const pageIsLoading = !initialFiltersLoaded || trendsApiIsLoading || (filterOptionsData === undefined && !filterOptionsError);


    if (!initialFiltersLoaded || (filterOptionsData === undefined && !filterOptionsError && !pageIsLoading) ) {
         return <TrendsLayout><LoadingSpinner /></TrendsLayout>;
    }


    return (
        <TrendsLayout>
            <h1 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Organization Trends</h1>
            {filterOptionsError && <ErrorMessage message={`Failed to load filter options: ${filterOptionsError.info || filterOptionsError.message}`} />}

            <FilterTopbar
                filterConfig={filterConfig}
                availableFilters={availableFilterOptions}
                selectedFilters={selectedFilters}
                onDateChange={handleDateChange}
                onFilterChange={handleFilterChange}
                startDate={startDate}
                endDate={endDate}
                loading={pageIsLoading && !trendsApiData} // Show loading in filter bar if main data is loading
            />

            {trendsApiError && <ErrorMessage message={`Failed to load trends data: ${trendsApiError.info || trendsApiError.message}`} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <ChartContainer title="Spending Trends Over Time" isLoading={pageIsLoading && !trendsApiData} className="lg:col-span-2">
                    {(!pageIsLoading || trendsApiData) && trendsApiData?.trendsData && <ReactEcharts option={spendingTrendsOptions} notMerge={true} lazyUpdate={true} theme="light" />}
                </ChartContainer>
                <ChartContainer title="Spending by Purpose" isLoading={pageIsLoading && !trendsApiData}>
                     {(!pageIsLoading || trendsApiData) && trendsApiData?.purposeBreakdown && <ReactEcharts option={spendingByPurposeOptions} notMerge={true} lazyUpdate={true} theme="light" />}
                </ChartContainer>
            </div>
        </TrendsLayout>
    );
}