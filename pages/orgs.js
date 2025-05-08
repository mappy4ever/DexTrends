// pages/orgs.js
import { useEffect, useState, useMemo, useCallback } from "react";
import useSWR from 'swr';
import dynamic from "next/dynamic";
// Datepicker CSS is in _app.js and globals.css
import { useTheme } from 'next-themes'; // Import useTheme

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

// --- UI Components ---
const TrendsLayout = ({ children }) => (
    // Using section-spacing-y-default for consistent vertical padding, px for horizontal
    <div className="section-spacing-y-default px-4 md:px-6 bg-background min-h-screen text-foreground">
        {children}
    </div>
);

const ChartContainer = ({ title, children, isLoading, className = "" }) => (
  // Using .card and .card-padding-default from globals.css
  <div className={`card card-padding-default ${className}`}>
    <h2 className="text-section-heading mb-4">{title}</h2>
    {isLoading ? (
        <div className="h-72 w-full bg-foreground-muted/20 animate-pulse rounded-app-md"></div>
    ) : (
        <div className="h-[450px] w-full">{children}</div> // Ensure specific height for charts
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

const ReactEcharts = dynamic(() => import("echarts-for-react"), {
    ssr: false,
    loading: () => <div className="h-[450px] w-full flex justify-center items-center"><LoadingSpinner/></div>
});

const fetcher = async url => { // fetcher remains the same
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('Failed to fetch data');
        error.status = res.status;
        try {
            const body = await res.json();
            error.info = body.message || body.error || 'Server error';
        } catch (e) {
            error.info = res.statusText;
        }
        throw error;
    }
    return res.json();
};

function generateMonthsInRangeForCharts(startDate, endDate) {
    // Logic remains the same
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
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({
        startMonth: '', endMonth: '', org: 'all', title: 'all',
    });
    const [availableFilterOptions, setAvailableFilterOptions] = useState({ orgs: [], titles: [] });
    const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
    const { resolvedTheme } = useTheme(); // For ECharts theme

    // useEffect for loading initial filters (logic largely same, ensure keys match)
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const queryStart = queryParams.get('start');
        const queryEnd = queryParams.get('end');
        const queryOrgId = queryParams.get('orgId') || queryParams.get('orgName'); // Accept orgName for backward compatibility if dashboard links use it
        const queryTitleId = queryParams.get('titleId');

        const savedGlobalDates = loadFromLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {});
        const pageSpecificFilters = loadFromLocalStorage(LOCAL_STORAGE_KEYS.ORGS_PAGE_FILTERS, {});

        const finalInitialStartDate = parseYearMonthToDate(queryStart) || parseYearMonthToDate(savedGlobalDates.startMonth) || getDefaultInitialStartDate();
        const finalInitialEndDate = parseYearMonthToDate(queryEnd) || parseYearMonthToDate(savedGlobalDates.endMonth) || getDefaultInitialEndDate();

        const finalSelected = {
            startMonth: getYearMonthString(finalInitialStartDate),
            endMonth: getYearMonthString(finalInitialEndDate),
            org: queryOrgId !== null ? queryOrgId : (pageSpecificFilters.org !== undefined ? pageSpecificFilters.org : 'all'),
            title: queryTitleId !== null ? queryTitleId : (pageSpecificFilters.title !== undefined ? pageSpecificFilters.title : 'all'),
        };

        setStartDate(finalInitialStartDate);
        setEndDate(finalInitialEndDate);
        setSelectedFilters(finalSelected);

        saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, { startMonth: finalSelected.startMonth, endMonth: finalSelected.endMonth });
        saveToLocalStorage(LOCAL_STORAGE_KEYS.ORGS_PAGE_FILTERS, { org: finalSelected.org, title: finalSelected.title });

        setInitialFiltersLoaded(true);
    }, []);

    // Persist filters to localStorage (logic largely same)
    useEffect(() => {
        if (!initialFiltersLoaded || !startDate || !endDate) return;
        saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {
            startMonth: getYearMonthString(startDate),
            endMonth: getYearMonthString(endDate),
        });
        saveToLocalStorage(LOCAL_STORAGE_KEYS.ORGS_PAGE_FILTERS, {
            org: selectedFilters.org,
            title: selectedFilters.title,
        });
    }, [startDate, endDate, selectedFilters.org, selectedFilters.title, initialFiltersLoaded]);

    const { data: filterOptionsData, error: filterOptionsError } = useSWR('/api/filters?types=org,title', fetcher);

    useEffect(() => {
        if (filterOptionsData) {
            setAvailableFilterOptions({
                orgs: filterOptionsData.orgs ? filterOptionsData.orgs.map(o => ({ value: o.id, label: o.name })) : [],
                titles: filterOptionsData.titles ? filterOptionsData.titles.map(t => ({ value: t.id, label: t.name })) : [],
            });
        } else if (filterOptionsError) {
            console.error("Error fetching filter options for Orgs page:", filterOptionsError);
        }
    }, [filterOptionsData, filterOptionsError]);

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
        setSelectedFilters(prev => ({ ...prev, [filterKey]: value }));
    }, []);

    const filterConfig = useMemo(() => [
        { key: 'startDate', label: 'Start Date:', type: 'month' },
        { key: 'endDate', label: 'End Date:', type: 'month' },
        { key: 'org', label: 'Organization:', type: 'select', optionsKey: 'orgs', placeholder: 'All Organizations' },
        { key: 'title', label: 'Traveler Title:', type: 'select', optionsKey: 'titles', placeholder: 'All Titles' },
    ], []);

    const apiUrl = useMemo(() => {
        if (!initialFiltersLoaded || !selectedFilters.startMonth || !selectedFilters.endMonth) return null;
        const params = new URLSearchParams({
            start: selectedFilters.startMonth,
            end: selectedFilters.endMonth,
        });
        if (selectedFilters.org && selectedFilters.org !== 'all') params.append('orgId', selectedFilters.org);
        if (selectedFilters.title && selectedFilters.title !== 'all') params.append('titleId', selectedFilters.title);
        return `/api/trends?${params.toString()}`;
    }, [selectedFilters, initialFiltersLoaded]);

    const { data: trendsApiData, error: trendsApiError, isLoading: dataIsLoading, isValidating } = useSWR(apiUrl, fetcher, { keepPreviousData: true, revalidateOnFocus: false });

    const echartTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
    const pageIsLoading = !initialFiltersLoaded || dataIsLoading || isValidating || (filterOptionsData === undefined && !filterOptionsError);


    // ECharts options (spendingTrendsOptions, spendingByPurposeOptions) - use CSS vars for colors
    const spendingTrendsOptions = useMemo(() => {
        const trends = trendsApiData?.trendsData || [];
        if (!startDate || !endDate ) return { series: [] };

        const allMonthsInRange = generateMonthsInRangeForCharts(startDate, endDate);
        const trendsMap = trends.reduce((map, item) => {
            const monthKey = item && item.month ? String(item.month).slice(0, 7) : null;
            if (monthKey) {
                if (!map[monthKey]) map[monthKey] = { total_cost: 0, airfare: 0, other_transport: 0, lodging: 0, meals: 0, other_expenses: 0, record_count: 0 };
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
            const dataForMonth = trendsMap[monthKey];
            if(dataForMonth) {
                // Ensure the month property is added if it came from trendsMap
                return { month: monthKey, ...dataForMonth };
            }
            // Fallback for months with no data in trendsMap for this monthKey
            return { month: monthKey, total_cost: 0, airfare: 0, other_transport: 0, lodging: 0, meals: 0, other_expenses: 0, record_count: 0 };
        });
        
        const monthLabels = monthlyAggregates.map(d => {
             // This check adds robustness, though the fix above should prevent d.month from being undefined
             if (!d || !d.month) return 'Unknown Date';
             const [year, monthNum] = d.month.split('-');
             const dateLabel = new Date(Date.UTC(Number(year), Number(monthNum) - 1, 1));
             return dateLabel.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
        });
        const seriesColors = ['#00A9B5', '#FF6B6B', '#FFD166', '#06D6A0', '#7884D5'];

        return {
            tooltip: { trigger: 'axis', backgroundColor: 'var(--color-surface-default)', borderColor: 'var(--color-border-default)', textStyle: { color: 'var(--color-foreground-default)'} },
            legend: { data: ['Airfare', 'Lodging', 'Meals', 'Other Transport', 'Other Expenses'], inactiveColor: 'var(--color-foreground-muted)', textStyle: { color: 'var(--color-text-body)'} },
            grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: monthLabels, axisLabel: { color: 'var(--color-text-body)'} },
            yAxis: { type: 'value', name: 'Cost', axisLabel: { formatter: '${value}', color: 'var(--color-text-body)' }, splitLine: { lineStyle: { color: 'var(--color-border-default)' }}},
            dataZoom: [
                { type: 'inside', start: 0, end: 100, zoomLock: false },
                { show: true, type: 'slider', bottom: 10, height: 20, backgroundColor: 'var(--color-surface-default)', borderColor: 'var(--color-border-default)', dataBackground: { lineStyle: { color: 'var(--color-primary-default)/0.2' }, areaStyle: { color: 'var(--color-primary-default)/0.1'}}, selectedDataBackground: {lineStyle: {color: 'var(--color-primary-default)'}, areaStyle: {color: 'var(--color-primary-default)/0.3'}}, fillerColor: 'var(--color-primary-default)/0.2', handleStyle: { color: 'var(--color-primary-default)'}, textStyle: {color: 'var(--color-text-muted)'}}
            ],
            series: [ /* Series data mapping */
                { name: 'Airfare', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.airfare), color: seriesColors[0] },
                { name: 'Lodging', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.lodging), color: seriesColors[1] },
                { name: 'Meals', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.meals), color: seriesColors[2] },
                { name: 'Other Transport', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.other_transport), color: seriesColors[3] },
                { name: 'Other Expenses', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.other_expenses), color: seriesColors[4] },
            ].map(s => ({ ...s, showSymbol: false, lineStyle: { width: 2.5 }, emphasis: { focus: 'series' } }))
        };
    }, [trendsApiData?.trendsData, startDate, endDate, resolvedTheme]);

    const spendingByPurposeOptions = useMemo(() => {
        const purposeData = trendsApiData?.purposeBreakdown || [];
        const purposeAgg = purposeData.reduce((acc, item) => {
            const name = item.purpose || 'Unknown';
            acc[name] = (acc[name] || 0) + (Number(item.total_cost) || 0);
            return acc;
        }, {});
        const formattedData = Object.entries(purposeAgg).map(([name, value]) => ({ name, value })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
        return {
            tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)', backgroundColor: 'var(--color-surface-default)', borderColor: 'var(--color-border-default)', textStyle: { color: 'var(--color-foreground-default)'} },
            legend: { type: 'scroll', orient: 'vertical', left: 10, top: 20, bottom: 20, inactiveColor: 'var(--color-foreground-muted)', textStyle: { color: 'var(--color-text-body)'} },
            series: [{
                name: 'Spending by Purpose', type: 'pie', radius: ['50%', '70%'], center: ['60%', '50%'],
                avoidLabelOverlap: true, itemStyle: { borderRadius: 5, borderColor: 'var(--color-card-background)', borderWidth: 2 },
                label: { show: false }, emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold', color: 'var(--color-text-heading)' }, itemStyle: { shadowBlur: 10, shadowColor: 'var(--color-shadow-default)'}},
                data: formattedData,
            }],
        };
    }, [trendsApiData?.purposeBreakdown, resolvedTheme]);


    if (!initialFiltersLoaded || (filterOptionsData === undefined && !filterOptionsError && !pageIsLoading) ) {
         return <TrendsLayout><LoadingSpinner /></TrendsLayout>;
    }

    return (
        <TrendsLayout>
            <h1 className="text-page-heading">Organization Trends</h1>
            {filterOptionsError && <ErrorMessage message={`Failed to load filter options: ${filterOptionsError.info || filterOptionsError.message}`} />}

            <FilterTopbar
                filterConfig={filterConfig}
                availableFilters={availableFilterOptions}
                selectedFilters={selectedFilters}
                onDateChange={handleDateChange}
                onFilterChange={handleFilterChange}
                startDate={startDate}
                endDate={endDate}
                loading={pageIsLoading && !trendsApiData && !filterOptionsData}
            />

            {trendsApiError && <ErrorMessage message={`Failed to load trends data: ${trendsApiError.info || trendsApiError.message}`} />}

            {(!pageIsLoading && !trendsApiError && !trendsApiData?.trendsData?.length) && (
                <div className="card card-padding-default mt-6 text-center text-foreground-muted">
                    No trend data available for the selected filters.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <ChartContainer title="Spending Trends Over Time" isLoading={pageIsLoading && !trendsApiData} className="lg:col-span-2">
                    {(!pageIsLoading || trendsApiData?.trendsData) && <ReactEcharts option={spendingTrendsOptions} notMerge={true} lazyUpdate={true} theme={echartTheme} style={{ height: '100%', width: '100%' }} />}
                </ChartContainer>
                <ChartContainer title="Spending by Purpose" isLoading={pageIsLoading && !trendsApiData}>
                     {(!pageIsLoading || trendsApiData?.purposeBreakdown) && <ReactEcharts option={spendingByPurposeOptions} notMerge={true} lazyUpdate={true} theme={echartTheme} style={{ height: '100%', width: '100%' }} />}
                </ChartContainer>
            </div>
        </TrendsLayout>
    );
}