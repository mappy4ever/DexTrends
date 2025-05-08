// pages/index.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import dynamic from 'next/dynamic';
// Datepicker CSS is in _app.js and globals.css
import { useTheme } from 'next-themes';

import FilterTopbar from '../components/FilterTopbar';
import Modal from '../components/ui/Modal'; // Corrected path assuming 'ui' subfolder

import {
    getDefaultInitialStartDate,
    getDefaultInitialEndDate,
    getYearMonthString,
    parseYearMonthToDate,
    LOCAL_STORAGE_KEYS,
    loadFromLocalStorage,
    saveToLocalStorage,
    debounce
} from '../utils/filterUtils'; // Assuming filterUtils.js exists and is correct

import { FaRegLightbulb } from "react-icons/fa";
import { VscDashboard, VscOrganization, VscAccount, VscGlobe, VscInfo } from "react-icons/vsc";


// --- UI Components ---
const DashboardLayout = ({ children }) => (
    // Using section-spacing-y-default for consistent vertical padding, px for horizontal
    <div className="section-spacing-y-default px-4 md:px-6 bg-background min-h-screen">
        {children}
    </div>
);

const KPICard = ({ title, value, isLoading }) => (
  // Using .card and .card-padding-default from globals.css
  <div className="card card-padding-default">
    <h3 className="text-sm font-medium text-foreground-muted mb-1">{title}</h3> {/* Adjusted title style for KPI */}
    {isLoading ? (
        <div className="h-10 w-2/3 bg-foreground-muted/20 animate-pulse mt-1 rounded-app-sm"></div>
    ) : (
        <p className="text-kpi-value">{value}</p> // .text-kpi-value from globals.css
    )}
  </div>
);

const ChartContainer = ({ title, children, isLoading, className = "" }) => (
  <div className={`card card-padding-default ${className}`}>
    <h2 className="text-section-heading mb-4">{title}</h2> {/* .text-section-heading from globals.css */}
    {isLoading ? (
        <div className="h-72 w-full bg-foreground-muted/20 animate-pulse rounded-app-md"></div>
    ) : (
        // Ensure child (ReactEcharts) takes up available space. height is often critical.
        <div className="h-[400px] w-full">{children}</div>
    )}
  </div>
);

const ListContainer = ({ title, items, isLoading, renderItem }) => (
    <div className="card card-padding-default">
        <h2 className="text-section-heading mb-3">{title}</h2>
        {isLoading ? (
            <ul className="space-y-2">
                {[...Array(3)].map((_, i) => ( // Placeholder for 3 items
                     <li key={i} className="h-6 w-full bg-foreground-muted/20 animate-pulse rounded-app-sm"></li>
                ))}
            </ul>
        ) : items && items.length > 0 ? (
            <ul className="space-y-2 text-sm text-foreground">{items.map(renderItem)}</ul>
        ) : (
            <p className="text-foreground-muted">No data available for the selected period.</p>
        )}
    </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64 text-foreground-muted">
        {/* You can use an actual SVG spinner here */}
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-2">Loading...</span>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="p-4 my-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-app-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
        Error: {message}
    </div>
);

// Dynamic import for ECharts
const ReactEcharts = dynamic(() => import('echarts-for-react'), {
    ssr: false,
    loading: () => <LoadingSpinner /> // Show spinner while ECharts component loads
});

// SWR fetcher
const fetcher = async url => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.info = await res.json().catch(() => res.statusText); // Try to get more info
        error.status = res.status;
        throw error;
    }
    return res.json();
};

// Generates YYYY-MM strings for all months in a date range
function generateMonthsInRange(startDate, endDate) {
    if (!startDate || !endDate) return [];
    const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
    const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));
    const months = [];
    let current = new Date(start);

    while (current <= end) {
        months.push(getYearMonthString(current)); // Expects YYYY-MM
        current.setUTCMonth(current.getUTCMonth() + 1);
    }
    return months;
}

export default function DashboardPage() {
    const [startDate, setStartDate] = useState(null); // Date object
    const [endDate, setEndDate] = useState(null);     // Date object
    // selectedFilters now primarily for non-date string filters if any,
    // date string versions (startMonth, endMonth) are derived for API calls.
    const [selectedNonDateFilters, setSelectedNonDateFilters] = useState({});
    const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
    const [showSplashModal, setShowSplashModal] = useState(false);
    const { resolvedTheme, theme } = useTheme(); // Use resolvedTheme for ECharts

    // Load filters from localStorage
    useEffect(() => {
        const savedGlobalFilters = localStorage.getItem(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS);
        let initialStartDate = getDefaultInitialStartDate();
        let initialEndDate = getDefaultInitialEndDate();

        if (savedGlobalFilters) {
            try {
                const { startMonth: savedStartStr, endMonth: savedEndStr } = JSON.parse(savedGlobalFilters);
                const parsedStart = parseYearMonthToDate(savedStartStr); // Expects YYYY-MM
                const parsedEnd = parseYearMonthToDate(savedEndStr);   // Expects YYYY-MM
                if (parsedStart) initialStartDate = parsedStart;
                if (parsedEnd) initialEndDate = parsedEnd;
            } catch (e) {
                console.error("Failed to parse saved date filters:", e);
                // Keep defaults if parsing fails
            }
        }
        setStartDate(initialStartDate);
        setEndDate(initialEndDate);
        setInitialFiltersLoaded(true);
    }, []);

    // Persist date filters to localStorage
    useEffect(() => {
        if (!initialFiltersLoaded || !startDate || !endDate) return;

        const filtersToSave = {
            startMonth: getYearMonthString(startDate), // YYYY-MM
            endMonth: getYearMonthString(endDate),     // YYYY-MM
        };
        localStorage.setItem(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, JSON.stringify(filtersToSave));
    }, [startDate, endDate, initialFiltersLoaded]);

    // Splash modal logic
    useEffect(() => {
        if (initialFiltersLoaded) {
            const hasVisitedBefore = localStorage.getItem('hasVisitedTravelDashboard');
            if (!hasVisitedBefore) {
                setShowSplashModal(true);
            }
        }
    }, [initialFiltersLoaded]);

    const handleDateChange = useCallback((dateKey, dateObject) => {
        if (dateKey === 'startDate') {
            setStartDate(dateObject);
        } else if (dateKey === 'endDate') {
            setEndDate(dateObject);
        }
    }, []);
    
    const handleNonDateFilterChange = useCallback((filterKey, value) => {
        setSelectedNonDateFilters(prev => ({ ...prev, [filterKey]: value }));
    }, []);

    const handleCloseSplashModal = () => {
        setShowSplashModal(false);
        localStorage.setItem('hasVisitedTravelDashboard', 'true');
    };

    const filterConfig = useMemo(() => [
        { key: 'startDate', label: 'Start Date:', type: 'month' },
        { key: 'endDate', label: 'End Date:', type: 'month' },
        // Add other non-date filters here if needed
        // { key: 'department', label: 'Department:', type: 'select', optionsKey: 'departments', placeholder: 'All Departments' },
    ], []);

    // API URL construction using date objects
    const apiUrl = useMemo(() => {
        if (!initialFiltersLoaded || !startDate || !endDate) return null;
        const startMonthStr = getYearMonthString(startDate); // YYYY-MM
        const endMonthStr = getYearMonthString(endDate);     // YYYY-MM
        const params = new URLSearchParams({
            start: startMonthStr,
            end: endMonthStr,
            ...selectedNonDateFilters // Spread other string-based filters
        });
        return `/api/dashboard?${params.toString()}`;
    }, [startDate, endDate, selectedNonDateFilters, initialFiltersLoaded]);

    const { data, error, isLoading: dataIsLoading, isValidating } = useSWR(
        apiUrl,
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false, // Optional: prevent revalidation on window focus
        }
    );
    
    const isLoading = !initialFiltersLoaded || dataIsLoading || isValidating;

    // ECharts theme based on NextJS theme
    const echartTheme = resolvedTheme === 'dark' ? 'dark' : 'light'; // ECharts has built-in 'dark' theme

    // --- ECharts Options ---
    const spendingOverTimeOptions = useMemo(() => {
        const spendingData = data?.spendingOverTime || [];
        if (!startDate || !endDate) return { series: [] }; // Return empty series if no dates

        const allMonthsInRange = generateMonthsInRange(startDate, endDate); // YYYY-MM strings
        const spendingMap = spendingData.reduce((map, item) => {
            const monthKey = item.month ? item.month.slice(0, 7) : null; // Ensure YYYY-MM from data
            if (monthKey) map[monthKey] = item;
            return map;
        }, {});

        const monthlyAggregates = allMonthsInRange.map(monthKey => {
            return spendingMap[monthKey] || {
                month: monthKey, total_airfare: 0, total_other_transport: 0,
                total_lodging: 0, total_meals: 0, total_other_expenses: 0
            };
        });
        
        const monthLabels = monthlyAggregates.map(d => {
             const [year, monthNum] = d.month.split('-');
             const dateLabel = new Date(Date.UTC(Number(year), Number(monthNum) - 1, 1));
             return dateLabel.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
        });

        const seriesColors = ['#00A9B5', '#FF6B6B', '#FFD166', '#06D6A0', '#7884D5']; // Example palette

        return {
            tooltip: { trigger: 'axis', backgroundColor: 'var(--color-surface-default)', borderColor: 'var(--color-border-default)', textStyle: { color: 'var(--color-foreground-default)'} },
            legend: { data: ['Airfare', 'Other Transport', 'Lodging', 'Meals', 'Other Expenses'], inactiveColor: resolvedTheme === 'dark' ? '#718096' : '#A0AEC0', textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' }, top: '5%', type: 'scroll', show: true },
            grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true }, // Increased bottom for dataZoom
            xAxis: { type: 'category', boundaryGap: false, data: monthLabels, axisLabel: { color: 'var(--color-text-muted)'} },
            yAxis: { type: 'value', axisLabel: { formatter: '${value}', color: 'var(--color-text-muted)' }, splitLine: { lineStyle: { color: 'var(--color-border-default)' }}},
            dataZoom: [
                { type: 'inside', start: 0, end: 100, zoomLock: false },
                { show: true, type: 'slider', bottom: 10, height: 20, start: 0, end: 100, backgroundColor: 'var(--color-surface-default)', borderColor: 'var(--color-border-default)', dataBackground: { lineStyle: { color: 'var(--color-primary-default)/0.2' }, areaStyle: { color: 'var(--color-primary-default)/0.1'}}, selectedDataBackground: {lineStyle: {color: 'var(--color-primary-default)'}, areaStyle: {color: 'var(--color-primary-default)/0.3'}}, fillerColor: 'var(--color-primary-default)/0.2', handleStyle: { color: 'var(--color-primary-default)'}, textStyle: {color: 'var(--color-text-muted)'}}
            ],
            series: [
                 { name: 'Airfare', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_airfare), color: seriesColors[0] },
                 { name: 'Other Transport', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_other_transport), color: seriesColors[1] },
                 { name: 'Lodging', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_lodging), color: seriesColors[2] },
                 { name: 'Meals', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_meals), color: seriesColors[3] },
                 { name: 'Other Expenses', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_other_expenses), color: seriesColors[4] },
            ].map(s => ({ ...s, showSymbol: false, lineStyle: { width: 2.5 } })) // Common series styling
        };
    }, [data?.spendingOverTime, startDate, endDate, resolvedTheme]);

    const spendingByPurposeOptions = useMemo(() => ({
        tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)', backgroundColor: 'var(--color-surface-default)', borderColor: 'var(--color-border-default)', textStyle: { color: 'var(--color-foreground-default)'} },
        legend: { type: 'scroll', orient: 'vertical', left: 10, top: 20, bottom: 20, inactiveColor: 'var(--color-foreground-muted)', textStyle: { color: 'var(--color-text-body)'} },
        series: [{
            name: 'Spending by Purpose', type: 'pie', radius: ['50%', '70%'], center: ['60%', '50%'], // Adjusted center
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 5, borderColor: 'var(--color-card-background)', borderWidth: 1.5 }, // Themed border
            label: { show: false, position: 'center' }, // Keep label hidden, or configure as needed
            emphasis: {
                label: { show: true, fontSize: '16', fontWeight: 'bold', color: 'var(--color-text-heading)' },
                itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'var(--color-shadow-default)' }
            },
            labelLine: { show: false },
            data: data?.spendingByPurpose || [],
            // Consider defining colors here if they don't match theme defaults well
        }],
    }), [data?.spendingByPurpose, resolvedTheme]);

    const heatmapOptions = useMemo(() => {
        const rawData = data?.heatmapData || [];
        const cleanData = rawData.filter(item =>
            Array.isArray(item) && item.length === 3 &&
            typeof item[0] === 'number' && typeof item[1] === 'number' && typeof item[2] === 'number'
        );

        if (cleanData.length === 0) return null;

        const years = [...new Set(cleanData.map(d => d[1]))].sort((a, b) => a - b);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // Map month numbers (1-12) to month names for xAxis labels
        const monthLabels = Array.from({ length: 12 }, (_, i) => months[i]);


        const values = cleanData.map(d => d[2]);
        const minValue = values.length > 0 ? Math.min(...values) : 0;
        const maxValue = values.length > 0 ? Math.max(...values) : 1; // Ensure maxValue is at least 1

        // Transform data for ECharts: [xAxisIndex, yAxisIndex, value]
        // xAxisIndex maps to month (0-11), yAxisIndex maps to year index
        const heatmapChartData = cleanData.map(item => [item[0] - 1, years.indexOf(item[1]), item[2]]);


        return {
            tooltip: {
                position: 'top',
                formatter: params => {
                    if (!params || !params.value) return '';
                    const monthIndex = params.value[0]; // 0-11
                    const yearIndex = params.value[1]; // index in `years` array
                    const year = years[yearIndex];
                    return `Year: ${year}, Month: ${months[monthIndex]}<br/>Spend: $${params.value[2]?.toLocaleString()}`;
                },
                backgroundColor: 'var(--color-surface-default)', borderColor: 'var(--color-border-default)', textStyle: { color: 'var(--color-foreground-default)'}
            },
            grid: { top: '10%', bottom: '25%', left: '12%', right: '5%' },
            xAxis: {
                type: 'category', data: monthLabels, splitArea: { show: true, areaStyle: { color: ['var(--color-surface-default)/0.5', 'var(--color-background-default)/0.5']}},
                name: 'Month', nameLocation: 'center', nameGap: 30,
                axisLabel: { color: 'var(--color-text-muted)'}, nameTextStyle: { color: 'var(--color-text-body)'}
            },
            yAxis: {
                type: 'category', data: years.map(y => y.toString()), splitArea: { show: true, areaStyle: { color: ['var(--color-surface-default)/0.5', 'var(--color-background-default)/0.5']}},
                name: 'Year', nameLocation: 'middle', nameGap: 45,
                axisLabel: { color: 'var(--color-text-muted)'}, nameTextStyle: { color: 'var(--color-text-body)'}
            },
            visualMap: {
                min: minValue, max: maxValue, calculable: true, orient: 'horizontal',
                left: 'center', bottom: '2%',
                inRange: { color: resolvedTheme === 'dark' ? ['#1A4D2E', '#4F6F52', '#739072', '#ECE3CE'] : ['#D6EFED', '#A1CCD1', '#7C9D96', '#5B9A8B'] }, // Dark and Light mode specific colors
                textStyle: { color: 'var(--color-text-muted)'}
            },
            series: [{
                name: 'Monthly Spending', type: 'heatmap', data: heatmapChartData,
                label: { show: false },
                emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'var(--color-shadow-default)' } }
            }]
        };
    }, [data?.heatmapData, resolvedTheme]);


    if (!initialFiltersLoaded) {
        return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <Modal
                isOpen={showSplashModal}
                onClose={handleCloseSplashModal}
                title={
                    <div className="flex items-center gap-x-3">
                        <FaRegLightbulb size={24} className="text-primary" />
                        <span className="text-xl font-semibold text-foreground">Welcome to OnOurDime.ca!</span>
                    </div>
                }
                size="xl"
            >
                <div className="text-sm text-foreground-default space-y-4">
                    <p>This dashboard provides insights into Canadian federal government travel expenses. Here’s a quick guide:</p>
                    <ul className="list-none space-y-3">
                        {[
                            { icon: <VscDashboard size={20} className="text-primary" />, title: "Dashboard", text: "Overview of spending, trends, top departments/officials. Use date filters.", link: null },
                            { icon: <VscOrganization size={20} className="text-primary" />, title: "Department Trends", text: "Visit Orgs for department spending.", link: "/orgs" },
                            { icon: <VscAccount size={20} className="text-primary" />, title: "Person Inspector", text: "See individual expenses on the People page.", link: "/people" },
                            { icon: <VscGlobe size={20} className="text-primary" />, title: "Map Explorer", text: "Visualize destinations on the Map.", link: "/map" },
                        ].map(item => (
                            <li key={item.title} className="flex items-start gap-x-3 p-2.5 rounded-app-md hover:bg-surface-hovered transition-colors">
                                <span className="mt-0.5 flex-shrink-0 w-5 h-5">{item.icon}</span>
                                <div>
                                    <strong className="text-text-heading font-medium">{item.title}:</strong>
                                    <span className="block text-xs text-foreground-muted">
                                        {item.text}
                                        {item.link && <Link href={item.link} onClick={handleCloseSplashModal} className="ml-1 btn-link text-xs">Go to {item.title.split(' ')[0]}</Link>}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-5 text-xs text-foreground-muted">Data from Open.Canada.ca. More on the <Link href="/about" onClick={handleCloseSplashModal} className="btn-link text-xs">About page</Link>.</p>
                    <div className="mt-6 text-right">
                        <button onClick={handleCloseSplashModal} className="btn-primary">Got it, let's explore!</button>
                    </div>
                </div>
            </Modal>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-page-heading">Dashboard</h1> {/* Uses .text-page-heading from globals.css */}
                <button
                    onClick={() => setShowSplashModal(true)}
                    className="p-2 text-foreground-muted hover:text-primary transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Show Welcome Guide" aria-label="Show Welcome Guide"
                >
                    <VscInfo size={22}/>
                </button>
            </div>

            <FilterTopbar
                filterConfig={filterConfig}
                availableFilters={{ /* Pass actual available filters if any, e.g., for departments */ }}
                selectedFilters={{ ...selectedNonDateFilters /* Pass string filters */ }}
                onFilterChange={handleNonDateFilterChange}
                startDate={startDate} // Pass Date object
                endDate={endDate}   // Pass Date object
                onDateChange={handleDateChange}
                loading={!initialFiltersLoaded} // Loading state for filters themselves
            />

            {error && <ErrorMessage message={error.info?.message || error.message || 'Failed to load dashboard data.'} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                <KPICard title="Total Spending" value={data?.kpiData?.totalSpending != null ? `$${data.kpiData.totalSpending.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}` : '...'} isLoading={isLoading} />
                <KPICard title="Total Expense Reports" value={data?.kpiData?.recordCount != null ? data.kpiData.recordCount.toLocaleString() : '...'} isLoading={isLoading} />
                <KPICard title="Average Trip Cost" value={data?.kpiData?.avgTripCost != null ? `$${data.kpiData.avgTripCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '...'} isLoading={isLoading} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <ListContainer
                   title="Top Spending Departments"
                   isLoading={isLoading}
                   items={data?.topOrgs}
                   renderItem={(org) => {
                       const queryParams = new URLSearchParams();
                       if (startDate) queryParams.append('start', getYearMonthString(startDate));
                       if (endDate) queryParams.append('end', getYearMonthString(endDate));
                       queryParams.append('orgId', org.id); // Assuming orgs page can filter by org

                       return (
                           <li key={org.name} className="flex justify-between items-center py-1.5 border-b border-border last:border-b-0">
                               <Link href={`/orgs?${queryParams.toString()}`} className="btn-link text-sm">
                                   {org.name}
                               </Link>
                               <span className="font-medium text-foreground">${(org.value || 0).toLocaleString()}</span>
                           </li>
                       );
                   }}
                />
                <ListContainer
                   title="Top Spending People"
                   isLoading={isLoading}
                   items={data?.topNames}
                   renderItem={(person) => {
                       const queryParams = new URLSearchParams();
                       if (startDate) queryParams.append('start', getYearMonthString(startDate));
                       if (endDate) queryParams.append('end', getYearMonthString(endDate));
                       if (person.id) queryParams.append('personId', person.id); // If person ID available
                       else queryParams.append('personName', person.name); // Fallback to name

                       return (
                           <li key={person.name} className="flex justify-between items-center py-1.5 border-b border-border last:border-b-0">
                               <Link href={`/people?${queryParams.toString()}`} className="btn-link text-sm">
                                   {person.name}
                               </Link>
                               <span className="font-medium text-foreground">${(person.value || 0).toLocaleString()}</span>
                           </li>
                       );
                   }}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartContainer title="Spending Over Time" isLoading={isLoading} className="xl:col-span-2">
                    {(!isLoading && data && startDate && endDate) && <ReactEcharts option={spendingOverTimeOptions} notMerge={true} lazyUpdate={true} theme={echartTheme} style={{ height: '100%', width: '100%' }} />}
                </ChartContainer>
                <ChartContainer title="Spending by Purpose" isLoading={isLoading}>
                    {(!isLoading && data) && <ReactEcharts option={spendingByPurposeOptions} notMerge={true} lazyUpdate={true} theme={echartTheme} style={{ height: '100%', width: '100%' }} />}
                </ChartContainer>
                <ChartContainer title="Monthly Spending Heatmap" isLoading={isLoading} className={!heatmapOptions && !isLoading ? 'flex items-center justify-center text-foreground-muted' : ''}>
                    {heatmapOptions && !isLoading && (
                        <ReactEcharts option={heatmapOptions} notMerge={true} lazyUpdate={true} theme={echartTheme} style={{ height: '100%', width: '100%' }} />
                    )}
                    {!heatmapOptions && !isLoading && (
                        <div>No heatmap data available for the selected period.</div>
                    )}
                </ChartContainer>
            </div>
        </DashboardLayout>
    );
}