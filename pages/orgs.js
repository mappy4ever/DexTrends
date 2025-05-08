import { useEffect, useState, useMemo, useCallback } from "react";
import useSWR from 'swr';
import dynamic from "next/dynamic";
import { useTheme } from 'next-themes';

import FilterTopbar from '../components/FilterTopbar'; // Assuming this component is suitably flexible
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

const DEFAULT_ORG_ID = '1'; // Default organization ID if none is found

// --- Helper Function for Currency Formatting ---
const formatCurrency = (amount) => {
  const number = Number(amount) || 0;
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// --- UI Components ---
const TrendsLayout = ({ children }) => (
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
      <p className="text-2xl font-bold text-text-heading mt-1">
        {/* Format number as currency, otherwise display value as is (e.g., for trip count) */}
        {typeof value === 'number' && title !== "Total Trips" ? `$${formatCurrency(value)}` : value}
      </p>
    )}
  </div>
);

const ChartContainer = ({ title, children, isLoading, className = "" }) => (
  <div className={`card card-padding-default ${className}`}>
    <h2 className="text-section-heading mb-4">{title}</h2>
    {isLoading ? (
      <div className="h-[400px] w-full bg-foreground-muted/20 animate-pulse rounded-app-md"></div>
    ) : (
      <div className="h-[400px] w-full">{children}</div>
    )}
  </div>
);

const ListContainer = ({ title, items, isLoading, renderItem, className = "" }) => (
    <div className={`card card-padding-default ${className}`}>
        <h2 className="text-section-heading mb-3">{title}</h2>
        {isLoading ? (
            <ul className="space-y-2">
                {[...Array(5)].map((_, i) => ( // Placeholder for 5 items
                    <li key={i} className="h-6 w-full bg-foreground-muted/20 animate-pulse rounded-app-sm"></li>
                ))}
            </ul>
        ) : items && items.length > 0 ? (
            <ul className="space-y-2 text-sm text-foreground">{items.map(renderItem)}</ul>
        ) : (
            <p className="text-foreground-muted text-sm">No data available.</p>
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
  loading: () => <div className="h-[400px] w-full flex justify-center items-center"><LoadingSpinner /></div>
});

// --- Fetcher ---
const fetcher = async url => {
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

// --- Date Utilities ---
function generateMonthsInRangeForCharts(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));
  const months = [];
  let current = new Date(start);
  while (current <= end) {
    months.push(getYearMonthString(current)); // Returns 'YYYY-MM'
    current.setUTCMonth(current.getUTCMonth() + 1);
  }
  return months;
}
export default function OrgsPage() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    startMonth: '',
    endMonth: '',
    org: null, // Will be initialized by useEffect to a specific ID (string)
  });
  const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  // SWR hook to fetch ALL organizations for the dropdown
  const { data: allOrgsData, error: allOrgsError } = useSWR(
    '/api/filters?types=org', // Ensure this matches API expectation
    fetcher
  );

  const organizationOptions = useMemo(() => {
    if (allOrgsData && allOrgsData.orgs) {
      return allOrgsData.orgs.map(org => ({
        value: org.id.toString(), // Ensure value is a string if IDs are numbers
        label: org.name,
      }));
    }
    return [];
  }, [allOrgsData]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const queryStart = queryParams.get('start');
    const queryEnd = queryParams.get('end');
    const queryOrgId = queryParams.get('orgId'); // From URL (followed link)

    const savedGlobalDates = loadFromLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {});
    const pageSpecificFilters = loadFromLocalStorage(LOCAL_STORAGE_KEYS.ORGS_PAGE_FILTERS, {}); // From local storage

    const finalInitialStartDate = parseYearMonthToDate(queryStart) || parseYearMonthToDate(savedGlobalDates.startMonth) || getDefaultInitialStartDate();
    const finalInitialEndDate = parseYearMonthToDate(queryEnd) || parseYearMonthToDate(savedGlobalDates.endMonth) || getDefaultInitialEndDate();
    
    let initialOrgId = DEFAULT_ORG_ID; // Default as last resort
    if (queryOrgId) {
        initialOrgId = queryOrgId; // 1. URL parameter
    } else if (pageSpecificFilters.org) {
        initialOrgId = pageSpecificFilters.org; // 2. Local storage
    }
    // `initialOrgId` will now be a specific ID string.

    const finalSelected = {
      startMonth: getYearMonthString(finalInitialStartDate),
      endMonth: getYearMonthString(finalInitialEndDate),
      org: initialOrgId,
    };

    setStartDate(finalInitialStartDate);
    setEndDate(finalInitialEndDate);
    setSelectedFilters(finalSelected);

    // Persist the determined initial filters
    saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, { startMonth: finalSelected.startMonth, endMonth: finalSelected.endMonth });
    saveToLocalStorage(LOCAL_STORAGE_KEYS.ORGS_PAGE_FILTERS, { org: finalSelected.org });

    setInitialFiltersLoaded(true);
  }, []); // Run once on mount to set initial state

  // Persist filters to localStorage on change
  useEffect(() => {
    if (!initialFiltersLoaded || !startDate || !endDate || !selectedFilters.org) return; // Ensure all are set
    
    saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, {
      startMonth: getYearMonthString(startDate),
      endMonth: getYearMonthString(endDate),
    });
    saveToLocalStorage(LOCAL_STORAGE_KEYS.ORGS_PAGE_FILTERS, {
      org: selectedFilters.org, // Only save org ID
    });
  }, [startDate, endDate, selectedFilters.org, initialFiltersLoaded]);

  const handleDateChange = useCallback((filterKey, dateObject) => {
    const newDateString = dateObject ? getYearMonthString(dateObject) : '';
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey === 'startDate' ? 'startMonth' : 'endMonth']: newDateString,
    }));
    if (filterKey === 'startDate') setStartDate(dateObject);
    else setEndDate(dateObject);
  }, []);

  const handleFilterChange = useCallback((filterKey, selectedValue) => {
    // `selectedValue` from a simple select is usually the direct value string, or null if cleared.
    // If your FilterTopbar's 'select' passes an object {value, label}, this will also handle it.
    setSelectedFilters(prev => {
        let newFilterValue;
        if (filterKey === 'org') {
            if (selectedValue && typeof selectedValue === 'object' && selectedValue.hasOwnProperty('value')) {
                newFilterValue = selectedValue.value; // Handles {value, label} object
            } else if (selectedValue) { // Handles direct value string
                newFilterValue = selectedValue;
            } else { // Handles null or undefined (e.g., if select is cleared)
                newFilterValue = DEFAULT_ORG_ID; // Reset to default
            }
        } else {
            newFilterValue = selectedValue;
        }
        return { ...prev, [filterKey]: newFilterValue };
    });
  }, []); // DEFAULT_ORG_ID is a const

  const filterConfig = useMemo(() => [
    { key: 'startDate', label: 'Start Date:', type: 'month' },
    { key: 'endDate', label: 'End Date:', type: 'month' },
    { 
        key: 'org', 
        label: 'Department:', 
        type: 'select', // Type for a simple dropdown
        placeholder: 'Select department...', 
        options: organizationOptions, // Populated from the SWR call to get all orgs
        isClearable: true, // If true, clearing will reset to DEFAULT_ORG_ID via handleFilterChange
                           // Set to false if the dropdown should never be "empty" before defaulting.
        // isLoading: !allOrgsData && !allOrgsError, // Optional: pass loading state for these options
    },
  ], [organizationOptions]); // Depends on the fetched list of all organizations

  const apiUrl = useMemo(() => {
    if (!initialFiltersLoaded || !selectedFilters.startMonth || !selectedFilters.endMonth || !selectedFilters.org) {
      return null; // Don't fetch if essential filters (including org) aren't ready
    }
    const params = new URLSearchParams({
      start: selectedFilters.startMonth,
      end: selectedFilters.endMonth,
      orgId: selectedFilters.org, // selectedFilters.org will always be a specific ID string
    });
    return `/api/trends?${params.toString()}`;
  }, [selectedFilters, initialFiltersLoaded]);

  const { data: trendsApiData, error: trendsApiError, isLoading: dataIsLoading, isValidating } = useSWR(
    apiUrl, 
    fetcher, 
    { keepPreviousData: true, revalidateOnFocus: false, revalidateOnError: false }
  );
  
  // Data from the main API call (for the selected org)
  const { orgDetails, trips, purposeBreakdown: apiPurposeBreakdown } = trendsApiData || {};

  const orgKPIs = useMemo(() => {
    const currentTrips = trips || [];
    const totalSpent = currentTrips.reduce((sum, trip) => sum + (Number(trip.total) || 0), 0);
    const tripCount = currentTrips.length;
    const avgTripCost = tripCount > 0 ? totalSpent / tripCount : 0;
    return { totalSpent, avgTripCost, tripCount };
  }, [trips]);

  const echartThemeName = resolvedTheme === 'dark' ? 'dark' : 'light';
  const filtersAreLoading = !initialFiltersLoaded || !selectedFilters.org;
  // Combined loading state for rendering decisions
  const pageIsEffectivelyLoading = dataIsLoading || isValidating || filtersAreLoading || (!allOrgsData && !allOrgsError);


  // --- ECHARTS OPTIONS (using the full versions from previous response) ---
  const spendingTrendsOptions = useMemo(() => {
    const currentTrips = trips || [];
    if (!startDate || !endDate ) return {series: []};
    const allMonthsInRange = generateMonthsInRangeForCharts(startDate, endDate);
    const dataByMonthMap = currentTrips.reduce((map, trip) => {
        const monthKey = trip.start_date ? String(trip.start_date).slice(0, 7) : 'unknown_month';
        if (monthKey === 'unknown_month') return map;
        if (!map[monthKey]) {
            map[monthKey] = { airfare: 0, lodging: 0, meals: 0, other_transport: 0, other_expenses: 0, total_cost:0 };
        }
        map[monthKey].total_cost += Number(trip.total) || 0;
        map[monthKey].airfare += Number(trip.airfare) || 0;
        map[monthKey].lodging += Number(trip.lodging) || 0;
        map[monthKey].meals += Number(trip.meals) || 0;
        map[monthKey].other_transport += Number(trip.other_transport) || 0;
        map[monthKey].other_expenses += Number(trip.other_expenses) || 0;
        return map;
    }, {});
    const monthLabels = allMonthsInRange.map(monthKey => {
        const [year, monthNum] = monthKey.split('-');
        return new Date(Date.UTC(Number(year), Number(monthNum) - 1, 1)).toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    });
    const seriesColors = ['#00A9B5', '#FF6B6B', '#FFD166', '#06D6A0', '#7884D5', '#3C5B6F'];
    const seriesDataConfig = [
      { name: 'Airfare', key: 'airfare' }, { name: 'Lodging', key: 'lodging' }, { name: 'Meals', key: 'meals' },
      { name: 'Other Transport', key: 'other_transport' }, { name: 'Other Expenses', key: 'other_expenses' },
    ];
    const series = seriesDataConfig.map((sConfig, index) => ({
      name: sConfig.name, type: 'line', smooth: true, color: seriesColors[index % seriesColors.length], showSymbol: false, lineStyle: { width: 2.5 }, emphasis: { focus: 'series' },
      data: allMonthsInRange.map(monthKey => parseFloat((dataByMonthMap[monthKey]?.[sConfig.key] || 0).toFixed(2)))
    }));
    return {
      tooltip: { trigger: 'axis', backgroundColor: resolvedTheme === 'dark' ? 'rgba(26,32,44,0.8)' : 'rgba(255,255,255,0.8)', borderColor: resolvedTheme === 'dark' ? '#4A5568' : '#E2E8F0', textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' },
        formatter: (params) => {
          let tooltipHtml = `${params[0].axisValueLabel}<br/>`; let monthlyTotal = 0;
          params.forEach(param => { monthlyTotal += Number(param.value) || 0; tooltipHtml += `${param.marker} ${param.seriesName}: $${formatCurrency(param.value)}<br/>`; });
          tooltipHtml += `<strong>Total: $${formatCurrency(monthlyTotal)}</strong>`; return tooltipHtml;
        }},
      legend: { data: series.map(s => s.name), inactiveColor: resolvedTheme === 'dark' ? '#718096' : '#A0AEC0', textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' }, top: '5%', type: 'scroll', show: true },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '20%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: monthLabels, axisLabel: { color: resolvedTheme === 'dark' ? '#A0AEC0' : '#4A5568' } },
      yAxis: { type: 'value', name: 'Cost', nameTextStyle: { color: resolvedTheme === 'dark' ? '#A0AEC0' : '#4A5568' }, axisLabel: { formatter: (value) => `$${value.toLocaleString()}`, color: resolvedTheme === 'dark' ? '#A0AEC0' : '#4A5568' }, splitLine: { lineStyle: { color: resolvedTheme === 'dark' ? '#4A5568' : '#E2E8F0', type: 'dashed' }}},
      dataZoom: [ { type: 'inside', start: 0, end: 100, zoomLock: false, }, { show: true, type: 'slider', bottom: 10, height: 20, backgroundColor: resolvedTheme === 'dark' ? 'rgba(74, 85, 104, 0.3)' : 'rgba(226, 232, 240, 0.3)', borderColor: resolvedTheme === 'dark' ? '#4A5568' : '#E2E8F0', dataBackground: { lineStyle: { color: resolvedTheme === 'dark' ? 'rgba(0, 169, 181, 0.2)' : 'rgba(0, 169, 181, 0.2)' }, areaStyle: { color: resolvedTheme === 'dark' ? 'rgba(0, 169, 181, 0.1)' : 'rgba(0, 169, 181, 0.1)' } }, selectedDataBackground: {lineStyle: {color: seriesColors[0]}, areaStyle: {color: `${seriesColors[0]}33`}}, fillerColor: `${seriesColors[0]}33`, handleStyle: { color: seriesColors[0] }, textStyle: {color: resolvedTheme === 'dark' ? '#A0AEC0' : '#4A5568'}} ],
      series: series
    };
  }, [trips, startDate, endDate, resolvedTheme]);

  const spendingByPurposeOptions = useMemo(() => {
    const currentPurposeData = apiPurposeBreakdown || []; 
    if (!currentPurposeData.length) return { series: [] };
    const formattedData = currentPurposeData.map(item => ({ name: item.name, value: parseFloat(Number(item.value).toFixed(2)) })).filter(item => item.value > 0);
    return {
      tooltip: { trigger: 'item', formatter: (params) => `${params.name}: $${formatCurrency(params.value)} (${params.percent}%)`, backgroundColor: resolvedTheme === 'dark' ? 'rgba(26,32,44,0.8)' : 'rgba(255,255,255,0.8)', borderColor: resolvedTheme === 'dark' ? '#4A5568' : '#E2E8F0', textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' }},
      legend: { type: 'scroll', orient: 'vertical', left: 10, top: 20, bottom: 20, inactiveColor: resolvedTheme === 'dark' ? '#718096' : '#A0AEC0', textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' } },
      series: [{ name: 'Spending by Purpose', type: 'pie', radius: ['50%', '70%'], center: ['60%', '50%'], avoidLabelOverlap: false, itemStyle: { borderRadius: 8, borderColor: resolvedTheme === 'dark' ? '#2D3748' : '#FFFFFF', borderWidth: 2 }, label: { show: false, position: 'center' }, emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold', color: resolvedTheme === 'dark' ? '#FFFFFF' : '#1A202C' }, itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 0, 0, 0.5)'}}, labelLine: { show: false }, data: formattedData, }],
    };
  }, [apiPurposeBreakdown, resolvedTheme]);

  const topSpendingTitles = useMemo(() => {
    const currentTrips = trips || [];
    if (!currentTrips.length) return [];
    const spendingByTitle = currentTrips.reduce((acc, trip) => {
        const titleName = trip.title || 'Unknown Title'; const cost = Number(trip.total) || 0;
        acc[titleName] = (acc[titleName] || 0) + cost; return acc;
    }, {});
    return Object.entries(spendingByTitle).map(([name, totalSpent]) => ({ name, totalSpent: parseFloat(totalSpent.toFixed(2)) })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [trips]);


  // --- JSX ---
  if (filtersAreLoading) {
    return <TrendsLayout><LoadingSpinner /></TrendsLayout>;
  }

  return (
    <TrendsLayout>
      <h1 className="text-page-heading">Department Trends</h1>
      {/* Display details of the currently selected organization */}
      {orgDetails && (selectedFilters.org === orgDetails.org_title_id?.toString()) && ( // Ensure orgDetails matches selected org
        <div className="mb-4 p-4 card bg-surface-raised shadow">
          <h2 className="text-xl font-semibold text-text-heading">{orgDetails.org_name || `Department ID: ${selectedFilters.org}`}</h2>
          {/* You can add more details from orgDetails here if available */}
          {/* e.g., <p className="text-sm text-foreground-muted">Director: {orgDetails.director_name || 'N/A'}</p> */}
        </div>
      )}
       {/* Display placeholder if orgDetails are for a different org or not yet loaded but filter is set */}
       {!orgDetails && selectedFilters.org && !dataIsLoading && !isValidating && (
         <div className="mb-4 p-4 card bg-surface-raised shadow">
           <h2 className="text-xl font-semibold text-text-heading">{organizationOptions.find(opt => opt.value === selectedFilters.org)?.label || `Department ID: ${selectedFilters.org}`}</h2>
         </div>
       )}


      <FilterTopbar
        filterConfig={filterConfig.map(fc => {
            if (fc.key === 'org') { // Pass loading state for org dropdown options
              return { ...fc, isLoading: !allOrgsData && !allOrgsError };
            }
            return fc;
          })}
        selectedFilters={selectedFilters}
        onDateChange={handleDateChange}
        onFilterChange={handleFilterChange}
        startDate={startDate}
        endDate={endDate}
        loading={dataIsLoading || isValidating} // Overall data loading for the page (trips, etc.)
      />

      {trendsApiError && <ErrorMessage message={`Failed to load trends data: ${trendsApiError.info || trendsApiError.message}`} />}
      {allOrgsError && <ErrorMessage message={`Failed to load department options: ${allOrgsError.info || allOrgsError.message}`} />}
      
      {(dataIsLoading || isValidating) && !trendsApiError && !allOrgsError && <LoadingSpinner />}

      {!pageIsEffectivelyLoading && !trendsApiError && !allOrgsError && (
        <>
          {(!trips || trips.length === 0) ? (
             <div className="card card-padding-default mt-6 text-center text-foreground-muted">
                No trip data available for the selected department and period.
             </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <KPICard title="Total Spent" value={orgKPIs.totalSpent} isLoading={dataIsLoading && !trips} />
                <KPICard title="Average Trip Cost" value={orgKPIs.avgTripCost} isLoading={dataIsLoading && !trips} />
                <KPICard title="Total Trips" value={orgKPIs.tripCount} isLoading={dataIsLoading && !trips} />
              </div>
            
              <div className="mt-6 grid grid-cols-1 gap-6">
                <ChartContainer title="Spending Trends Over Time" isLoading={dataIsLoading && !trips}>
                  {(trips && trips.length > 0) && <ReactEcharts option={spendingTrendsOptions} theme={echartThemeName} notMerge={true} lazyUpdate={true} style={{ height: '100%', width: '100%' }} />}
                </ChartContainer>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ChartContainer title="Spending by Purpose" isLoading={dataIsLoading && !apiPurposeBreakdown}>
                    {(apiPurposeBreakdown && apiPurposeBreakdown.length > 0) && <ReactEcharts option={spendingByPurposeOptions} theme={echartThemeName} notMerge={true} lazyUpdate={true} style={{ height: '100%', width: '100%' }} />}
                 </ChartContainer>
                 <ListContainer
                    title="Top 5 Spending Titles"
                    items={topSpendingTitles}
                    isLoading={dataIsLoading && !trips} 
                    renderItem={(item, index) => (
                        <li key={index} className="flex justify-between items-center py-1.5 border-b border-border-subtle last:border-b-0">
                            <span className="truncate pr-2" title={item.name}>{item.name}</span>
                            <span className="font-semibold text-foreground-muted">${formatCurrency(item.totalSpent)}</span>
                        </li>
                    )}
                />
              </div>
            </>
          )}
        </>
      )}
    </TrendsLayout>
  );
}