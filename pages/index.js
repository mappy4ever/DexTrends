// pages/index.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-datepicker/dist/react-datepicker.css';
import { useTheme } from 'next-themes';

// Import the shared FilterTopBar
import FilterTopbar from '../components/FilterTopbar';

// Import utility functions
import {
    getDefaultInitialStartDate,
    getDefaultInitialEndDate,
    getYearMonthString,
    parseYearMonthToDate,
    LOCAL_STORAGE_KEYS,
    loadFromLocalStorage,
    saveToLocalStorage
} from '../utils/filterUtils';

import Modal from '../components/ui/Modal';
import { FaRegLightbulb } from "react-icons/fa";
import { VscDashboard, VscOrganization, VscAccount, VscGlobe, VscInfo } from "react-icons/vsc";

// --- UI Components (KPICard, ChartContainer, etc. - kept as is from original) ---
const DashboardLayout = ({ children }) => <div className="p-4 md:p-6">{children}</div>;
const KPICard = ({ title, value, isLoading }) => (
  <div className="bg-card text-card-foreground p-4 rounded-lg shadow">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    {isLoading ? <div className="h-8 w-2/3 bg-muted animate-pulse mt-1 rounded"></div> : <p className="text-2xl font-bold mt-1">{value}</p>}
  </div>
);
const ChartContainer = ({ title, children, isLoading, className = "" }) => (
  <div className={`bg-card text-card-foreground p-4 rounded-lg shadow ${className}`}>
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    {isLoading ? <div className="h-72 w-full bg-muted animate-pulse rounded"></div> : <div style={{ height: '400px', width: '100%' }}>{children}</div>}
  </div>
);
const ListContainer = ({ title, items, isLoading, renderItem }) => ( // Keep your ListContainer definition
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {isLoading ? (
            <ul className="space-y-1">
                <li className="h-5 w-3/4 bg-muted animate-pulse rounded my-1"></li>
                <li className="h-5 w-2/3 bg-muted animate-pulse rounded my-1"></li>
                <li className="h-5 w-full bg-muted animate-pulse rounded my-1"></li>
            </ul>
        ) : items && items.length > 0 ? (
            <ul className="space-y-1 text-sm">{items.map(renderItem)}</ul>
        ) : (
            <p className="text-sm text-muted-foreground">No data available for the selected period.</p>
        )}
    </div>
);

const LoadingSpinner = () => <div className="text-center p-10">Loading...</div>; // Keep or use a global one
const ErrorMessage = ({ message }) => <div className="text-center p-10 text-red-600">Error: {message}</div>; // Keep or use a global one

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const fetcher = url => fetch(url).then(res => {
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.info = res.statusText;
        error.status = res.status;
        throw error;
    }
    return res.json();
});

function generateMonthsInRange(startDate, endDate) {
    const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
    const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));
    const months = [];
    let current = new Date(start);
    while (current <= end) {
        months.push(getYearMonthString(current)); // Use UTC consistent YYYY-MM
        current.setUTCMonth(current.getUTCMonth() + 1);
    }
    return months;
}

export default function DashboardPage() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({ startMonth: '', endMonth: '' });
    const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
    const [showSplashModal, setShowSplashModal] = useState(false); // Moved to top
    const { resolvedTheme } = useTheme(); // Assuming this is used for chart themes

    // Load filters from localStorage on initial mount
    useEffect(() => {
        const savedGlobalFilters = localStorage.getItem(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS);
        let initialStartDate = getDefaultInitialStartDate();
        let initialEndDate = getDefaultInitialEndDate();

        if (savedGlobalFilters) {
            try {
                const { startMonth: savedStartStr, endMonth: savedEndStr } = JSON.parse(savedGlobalFilters);
                const parsedStart = parseYearMonthToDate(savedStartStr);
                const parsedEnd = parseYearMonthToDate(savedEndStr);
                if (parsedStart) initialStartDate = parsedStart;
                if (parsedEnd) initialEndDate = parsedEnd;
            } catch (e) {
                console.error("Failed to parse saved date filters from localStorage", e);
            }
        }
        setStartDate(initialStartDate);
        setEndDate(initialEndDate);
        setSelectedFilters({
            startMonth: getYearMonthString(initialStartDate),
            endMonth: getYearMonthString(initialEndDate),
        });
        setInitialFiltersLoaded(true);
    }, []);

    // Persist filters to localStorage whenever they change
    useEffect(() => {
        if (!initialFiltersLoaded) return; // Don't save uninitialized dates

        if (startDate && endDate) {
            const filtersToSave = {
                startMonth: getYearMonthString(startDate),
                endMonth: getYearMonthString(endDate),
            };
            localStorage.setItem(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, JSON.stringify(filtersToSave));
        }
    }, [startDate, endDate, initialFiltersLoaded]);

    // useEffect for splash modal logic (depends on initialFiltersLoaded being potentially set first)
    useEffect(() => {
        // Only run this check after initial filters (and potentially component hydration) are done
        if (initialFiltersLoaded) { // Ensure this runs after initial setup
            const hasVisitedBefore = localStorage.getItem('hasVisitedTravelDashboard');
            if (!hasVisitedBefore) {
                setShowSplashModal(true);
            }
        }
    }, [initialFiltersLoaded]); // Depend on initialFiltersLoaded
	
    // Handler for FilterTopbar's onDateChange
    const handleDateChange = useCallback((filterKey, dateObject) => {
        if (filterKey === 'startMonth' || filterKey === 'startDate') {
            setStartDate(dateObject);
            setSelectedFilters(prev => ({ ...prev, startMonth: getYearMonthString(dateObject) }));
        } else if (filterKey === 'endMonth' || filterKey === 'endDate') {
            setEndDate(dateObject);
            setSelectedFilters(prev => ({ ...prev, endMonth: getYearMonthString(dateObject) }));
        }
    }, []);
    
    // Handler for FilterTopbar's onFilterChange (not used by Dashboard, but good practice to have)
    // const handleFilterChange = useCallback((filterKey, value) => {
    //     setSelectedFilters(prev => ({ ...prev, [filterKey]: value }));
    // }, []);

    const handleCloseSplashModal = () => {
        setShowSplashModal(false);
        localStorage.setItem('hasVisitedTravelDashboard', 'true');
    };

    // Define filterConfig for the FilterTopbar
    const filterConfig = useMemo(() => [
        { key: 'startMonth', label: 'Start Date:', type: 'month' },
        { key: 'endMonth', label: 'End Date:', type: 'month' },
    ], []);

    // API URL construction based on selectedFilters (string values)
    // Only generate URL if dates are valid to prevent unnecessary fetches
    const apiUrl = useMemo(() => {
        if (!selectedFilters.startMonth || !selectedFilters.endMonth || !initialFiltersLoaded) {
            return null; // Prevent fetching if filters aren't ready
        }
        return `/api/dashboard?start=${selectedFilters.startMonth}&end=${selectedFilters.endMonth}`;
    }, [selectedFilters.startMonth, selectedFilters.endMonth, initialFiltersLoaded]);

    const { data, error, isLoading: dataIsLoading } = useSWR(apiUrl, fetcher, {
        keepPreviousData: true, // Optional: good for UX
    });
    
    // --- ECharts Options & Data Processing (largely similar to original, ensure dependencies are correct) ---
    const spendingOverTimeOptions = useMemo(() => {
        const spendingData = data?.spendingOverTime || [];
        if (!startDate || !endDate) return {}; // Ensure dates are loaded

        const allMonthsInRange = generateMonthsInRange(startDate, endDate);
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
             return dateLabel.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
        });

        return {
            tooltip: { trigger: 'axis' },
            legend: { data: ['Airfare', 'Other Transport', 'Lodging', 'Meals', 'Other Expenses'], textStyle: { color: '#9CA3AF'} }, // Muted legend
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: monthLabels, axisLabel: { color: '#9CA3AF'} },
            yAxis: { type: 'value', axisLabel: { formatter: '${value}', color: '#9CA3AF' } },
            dataZoom: [
                { type: 'inside', start: 0, end: 100 },
                { show: true, type: 'slider', bottom: 10, start: 0, end: 100 }
            ],
            series: [
                 { name: 'Airfare', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_airfare) },
                 { name: 'Other Transport', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_other_transport) },
                 { name: 'Lodging', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_lodging) },
                 { name: 'Meals', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_meals) },
                 { name: 'Other Expenses', type: 'line', smooth: true, data: monthlyAggregates.map(d => d.total_other_expenses) },
            ]
        };
    }, [data?.spendingOverTime, startDate, endDate]);

    const spendingByPurposeOptions = useMemo(() => ({
        tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
        legend: { type: 'scroll', orient: 'vertical', left: 10, top: 20, bottom: 20, textStyle: { color: '#9CA3AF'} },
        series: [{
            name: 'Spending by Purpose', type: 'pie', radius: ['50%', '70%'], center: ['65%', '50%'],
            avoidLabelOverlap: false, itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 1 },
            label: { show: false }, emphasis: { scale: true }, labelLine: { show: false },
            data: data?.spendingByPurpose || [],
        }],
    }), [data?.spendingByPurpose]);

    const heatmapOptions = useMemo(() => {
        const rawData = data?.heatmapData || [];

        // Ensure data is clean (optional, but good practice)
        const cleanData = rawData.filter(item =>
            Array.isArray(item) && item.length === 3 &&
            typeof item[0] === 'number' && // month_num
            typeof item[1] === 'number' && // year
            typeof item[2] === 'number'    // value
        );

        if (cleanData.length === 0) {
            // Return a configuration that shows "No Data" or similar
            // ECharts doesn't have a built-in "no data" message easily for heatmap,
            // so returning empty options or handling it in render is better.
             console.warn("No valid data available for heatmap.");
             return null; // Indicate no options to render below
        }

        const years = [...new Set(cleanData.map(d => d[1]))].sort((a, b) => a - b); // Sort years numerically
        const months = Array.from({ length: 12 }, (_, i) => i + 1); // Months 1-12

        // Find min/max values for visualMap after ensuring data exists
        const values = cleanData.map(d => d[2]);
        const minValue = Math.min(...values); // Can be used in visualMap if needed
        const maxValue = Math.max(...values);

        return {
            tooltip: {
                position: 'top',
                formatter: params => {
                    // params.value should be [month_num, year, value]
                    if (!params || !params.value) return '';
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const monthIndex = params.value[0] - 1; // month_num is 1-12
                    return `Year: ${params.value[1]}, Month: ${monthNames[monthIndex]}<br/>Spend: $${params.value[2]?.toLocaleString()}`;
                }
            },
            grid: { height: '60%', top: '10%', bottom: '30%', left: '10%', right: '10%' }, // Adjust grid
            xAxis: {
                type: 'category',
                data: months.map(m => m.toString()), // Ensure data is string for category axis
                splitArea: { show: true },
                name: 'Month',
                nameLocation: 'center',
                nameGap: 35, // Increase gap if name overlaps visualMap
                axisLabel: { color: '#9CA3AF'},
                nameTextStyle: { color: '#9CA3AF'}
            },
            yAxis: {
                type: 'category',
                data: years.map(y => y.toString()), // Ensure data is string for category axis
                splitArea: { show: true },
                name: 'Year',
                nameLocation: 'center',
                nameGap: 35, // Adjust gap if needed
                axisLabel: { color: '#9CA3AF'},
                nameTextStyle: { color: '#9CA3AF'}
            },
            visualMap: {
                min: minValue, // Use calculated min
                max: Math.max(1, maxValue), // Use calculated max, ensure at least 1
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '5%', // Position visualMap at bottom
                // Example Yellow-Green-Blue scale
                inRange: { color: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'] },
                textStyle: { color: '#9CA3AF'}
            },
            series: [{
                name: 'Monthly Spending',
                type: 'heatmap',
                data: cleanData, // Use the cleaned data
                label: { show: false }, // Heatmaps usually don't show labels on cells
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
    }, [data?.heatmapData]);

    // Overall loading state for UI (considers initial filter load and data fetch)
    const pageIsLoading = !initialFiltersLoaded || dataIsLoading;

    if (!initialFiltersLoaded) { // Or a more specific initial loading state if preferred
        return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            {/* --- Splash/Welcome Modal --- */}
            <Modal
                isOpen={showSplashModal}
                onClose={handleCloseSplashModal}
                title={
                    <div className="flex items-center gap-3">
                        <FaRegLightbulb size={26} className="text-primary dark:text-primary-dark" />
                        <span>Welcome to the Travel Expense Explorer!</span>
                    </div>
                }
                size="xl" // Adjust size as needed: "md", "lg", "xl", "2xl"
            >
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        This dashboard provides insights into Canadian federal government travel expenses. Here’s a quick guide to get you started:
                    </p>
                    <ul className="list-none space-y-3 pl-1">
                        <li className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 dark:hover:bg-slate-700/50 transition-colors">
                            <VscDashboard size={24} className="mt-0.5 flex-shrink-0 text-primary dark:text-primary-dark" />
                            <div>
                                <strong className="text-foreground">Dashboard (You are here!):</strong>
                                <span className="block text-xs">Get an overview of total spending, key trends, top spending departments, and officials. Use the date filters to explore different periods.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 dark:hover:bg-slate-700/50 transition-colors">
                            <VscOrganization size={24} className="mt-0.5 flex-shrink-0 text-primary dark:text-primary-dark" />
                            <div>
                                <strong className="text-foreground">Organization Trends:</strong>
                                <span className="block text-xs">Navigate to the <Link href="/orgs" onClick={handleCloseSplashModal} className="font-medium underline hover:text-primary-focus dark:hover:text-primary-dark-focus">Orgs page</Link> to see detailed spending trends for specific departments and filter by traveler titles.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 dark:hover:bg-slate-700/50 transition-colors">
                            <VscAccount size={24} className="mt-0.5 flex-shrink-0 text-primary dark:text-primary-dark" />
                            <div>
                                <strong className="text-foreground">People Inspector:</strong>
                                <span className="block text-xs">Use the <Link href="/people" onClick={handleCloseSplashModal} className="font-medium underline hover:text-primary-focus dark:hover:text-primary-dark-focus">People page</Link> to look up travel expenses for individual officials and see their spending patterns.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 dark:hover:bg-slate-700/50 transition-colors">
                             <VscGlobe size={24} className="mt-0.5 flex-shrink-0 text-primary dark:text-primary-dark" />
                            <div>
                                <strong className="text-foreground">Map Explorer:</strong>
                                <span className="block text-xs">Visit the <Link href="/map" onClick={handleCloseSplashModal} className="font-medium underline hover:text-primary-focus dark:hover:text-primary-dark-focus">Map page</Link> to visualize travel destinations across the globe.</span>
                            </div>
                        </li>
                    </ul>
                    <p className="mt-5 text-xs">
                        All data is sourced from Open.Canada.ca. For more details, check out the <Link href="/about" onClick={handleCloseSplashModal} className="font-medium underline hover:text-primary-focus dark:hover:text-primary-dark-focus">About page</Link>.
                    </p>
                    <div className="mt-6 text-right">
                        <button
                            onClick={handleCloseSplashModal}
                            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-focus dark:bg-primary-dark dark:hover:text-primary-dark-focus rounded-md text-sm font-medium transition-colors"
                        >
                            Got it, let's explore!
                        </button>
                    </div>
                </div>
            </Modal>
			
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
                <button
                    onClick={() => setShowSplashModal(true)}
                    className="p-2 text-muted-foreground hover:text-primary dark:hover:text-primary-dark transition-colors"
                    title="Show Welcome Guide"
                    aria-label="Show Welcome Guide"
                >
                    <VscInfo size={22}/>
                </button>
            </div>
            <FilterTopbar
                filterConfig={filterConfig}
                availableFilters={{}}
                selectedFilters={selectedFilters}
                onDateChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                loading={!initialFiltersLoaded || (dataIsLoading && !data)}
            />

            {error && <ErrorMessage message={error.message || 'Failed to load dashboard data.'} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <KPICard title="Total Spending" value={`$${data?.kpiData?.totalSpending?.toLocaleString() ?? '...'}`} isLoading={pageIsLoading} />
                <KPICard title="Total Expense Reports" value={data?.kpiData?.recordCount?.toLocaleString() ?? '...'} isLoading={pageIsLoading} />
                <KPICard title="Average Trip Cost" value={`$${data?.kpiData?.avgTripCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '...'}`} isLoading={pageIsLoading} />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <ListContainer
                    title="Top Spending Departments"
                    isLoading={pageIsLoading}
                    items={data?.topOrgs} // Expects array of { id, name, value }
                    renderItem={(org) => {
                        const queryParams = new URLSearchParams();
                        // Use startMonth/endMonth from selectedFilters (which are YYYY-MM strings)
                        if (selectedFilters.startMonth) queryParams.append('start', selectedFilters.startMonth);
                        if (selectedFilters.endMonth) queryParams.append('end', selectedFilters.endMonth);
                        if (org.id) queryParams.append('orgId', org.id);

                        return (
                            <li key={org.id || org.name} className="flex justify-between items-center py-1.5">
                                <Link
                                    href={`/orgs?${queryParams.toString()}`}
                                    className="text-primary hover:text-primary-focus dark:text-primary-dark dark:hover:text-primary-dark-focus underline-offset-2 hover:underline"
                                >
                                    {org.name}
                                </Link>
                                <span className="font-medium">${(org.value || 0).toLocaleString()}</span>
                            </li>
                        );
                    }}
                 />
                 <ListContainer
                    title="Top Spending Ministers"
                    isLoading={pageIsLoading}
                    items={data?.topNames} // Expects array of { id, name, value }
                    renderItem={(person) => {
                        const queryParams = new URLSearchParams();
                        if (selectedFilters.startMonth) queryParams.append('start', selectedFilters.startMonth);
                        if (selectedFilters.endMonth) queryParams.append('end', selectedFilters.endMonth);
                        if (person.id) queryParams.append('personId', person.id);

                        return (
                            <li key={person.id || person.name} className="flex justify-between items-center py-1.5">
                                <Link
                                    href={`/people?${queryParams.toString()}`}
                                    className="text-primary hover:text-primary-focus dark:text-primary-dark dark:hover:text-primary-dark-focus underline-offset-2 hover:underline"
                                >
                                    {person.name}
                                </Link>
                                <span className="font-medium">${(person.value || 0).toLocaleString()}</span>
                            </li>
                        );
                    }}
                 />
             </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartContainer title="Spending Over Time" isLoading={pageIsLoading} className="xl:col-span-2">
                    {!pageIsLoading && data && <ReactEcharts option={spendingOverTimeOptions} notMerge={true} lazyUpdate={true} theme="light" />}
                </ChartContainer>

                <ChartContainer title="Spending by Purpose" isLoading={pageIsLoading}>
                     {!pageIsLoading && data && <ReactEcharts option={spendingByPurposeOptions} notMerge={true} lazyUpdate={true} theme="light" />}
                </ChartContainer>

                <ChartContainer title="Monthly Spending Heatmap" isLoading={pageIsLoading} className={!heatmapOptions ? 'flex items-center justify-center text-muted-foreground' : ''}>
                    {/* Render chart only if options are generated */}
                    {heatmapOptions && !pageIsLoading && (
                        <ReactEcharts option={heatmapOptions} notMerge={true} lazyUpdate={true} theme="light" />
                    )}
                    {/* Show message if options are null (e.g., no data) and not loading */}
                    {!heatmapOptions && !pageIsLoading && (
                        <div>No data available for the selected period.</div>
                    )}
                     {/* Loading overlay is handled by ChartContainer's isLoading prop */}
                </ChartContainer>
            </div>
        </DashboardLayout>
    );
}