import { useEffect, useState, useMemo, useCallback } from "react";
import useSWR from 'swr';
import { useTheme } from 'next-themes';
import { VscInfo } from "react-icons/vsc";

// Utils
import { formatCurrency } from '../utils/formatters';
import { fetcher } from '../utils/apiUtils';
import { generateMonthsInRangeForCharts } from '../utils/dateUtils';
import { CHART_PALETTES, SPENDING_SERIES_CONFIG } from '../components/ui/data/chartConstants';
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

// UI Components
import FilterTopbar from '../components/FilterTopbar';
import TrendsLayout from '../components/layout/TrendsLayout';
import KPICard from '../components/ui/KPICard';
import ChartContainer from '../components/ui/ChartContainer';
import ListContainer from '../components/ui/ListContainer';
import OrgDetailsCard from '../components/ui/OrgDetailsCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Tooltip from '../components/ui/Tooltip';
import { TOOLTIP_TEXTS } from '../components/ui/data/tooltips';

// Chart Components
import SpendingOverTimeChart from '../components/charts/SpendingOverTimeChart';
import SpendingByPurposeChart from '../components/charts/SpendingByPurposeChart';

const DEFAULT_ORG_ID = '1';

export default function OrgsPage() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    startMonth: '',
    endMonth: '',
    org: null, // Will be initialized by useEffect to a specific ID (string)
  });
  const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
	
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

  // Run once on mount to set initial state
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
  }, []); 

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
  }, []);

  const filterConfig = useMemo(() => [
    { key: 'startDate', label: 'Start Date:', type: 'month' },
    { key: 'endDate', label: 'End Date:', type: 'month' },
    { 
        key: 'org', label: 'Department:', type: 'select', placeholder: 'Select department...', 
        options: organizationOptions, isClearable: false,
        isLoading: !allOrgsData && !allOrgsError && organizationOptions.length === 0,
    },
  ], [organizationOptions, allOrgsData, allOrgsError]);

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

  // const echartThemeName = resolvedTheme === 'dark' ? 'dark' : 'light';
  const filtersAreLoading = !initialFiltersLoaded || !selectedFilters.org;
  const pageIsEffectivelyLoading = dataIsLoading || isValidating || filtersAreLoading || (!allOrgsData && !allOrgsError);

  // Data preparation for SpendingOverTimeChart
  const processedLineChartData = useMemo(() => {
    const currentTrips = trips || [];
    if (!startDate || !endDate) return { monthLabels: [], seriesData: [] };

    const allMonthsInRange = generateMonthsInRangeForCharts(startDate, endDate);
    const dataByMonthMap = currentTrips.reduce((map, trip) => {
      const monthKey = trip.start_date ? String(trip.start_date).slice(0, 7) : 'unknown_month';
      if (monthKey === 'unknown_month') return map;
      if (!map[monthKey]) {
        map[monthKey] = {};
        SPENDING_SERIES_CONFIG.forEach(conf => map[monthKey][conf.dataKey] = 0);
      }
      SPENDING_SERIES_CONFIG.forEach(conf => {
        map[monthKey][conf.dataKey] += Number(trip[conf.dataKey]) || 0;
      });
      return map;
    }, {});

    const monthLabels = allMonthsInRange.map(monthKey => {
      const [year, monthNum] = monthKey.split('-');
      return new Date(Date.UTC(Number(year), Number(monthNum) - 1, 1)).toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    });

    const seriesData = SPENDING_SERIES_CONFIG.map(sConfig => ({
      name: sConfig.name,
      data: allMonthsInRange.map(monthKey => parseFloat((dataByMonthMap[monthKey]?.[sConfig.dataKey] || 0).toFixed(2)))
    }));
    
    return { monthLabels, seriesData };
  }, [trips, startDate, endDate]);

  // Data for SpendingByPurposeChart
  const processedPieChartData = useMemo(() => {
    return apiPurposeBreakdown || []; // apiPurposeBreakdown is [{name, value}, ...]
  }, [apiPurposeBreakdown]);
  
  const topSpendingTitles = useMemo(() => {
    const currentTrips = trips || [];
    if (!currentTrips.length) return [];
    const spendingByTitle = currentTrips.reduce((acc, trip) => {
        const titleName = trip.title || 'Unknown Title'; const cost = Number(trip.total) || 0;
        acc[titleName] = (acc[titleName] || 0) + cost; return acc;
    }, {});
    return Object.entries(spendingByTitle).map(([name, totalSpent]) => ({ name, totalSpent: parseFloat(totalSpent.toFixed(2)) })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [trips]);

  // Prepare org data for OrgDetailsCard
  const orgDetailsForCard = orgDetails 
    ? orgDetails 
    : (selectedFilters.org && organizationOptions.length > 0 
        ? { org_title_id: selectedFilters.org, org_name: organizationOptions.find(opt => opt.value === selectedFilters.org)?.label } 
        : null);
		
  if (filtersAreLoading) {
    return <TrendsLayout><LoadingSpinner /></TrendsLayout>;
  }

  return (
    <TrendsLayout>
      <h1 className="text-page-heading">Department Trends</h1>
      <p className="mb-4 md:mb-6 text-base text-center md:text-left text-foreground-default mx-auto md:mx-0 px-5">
        Explore travel spending trends across different Government of Canada organizations. Filter by date range and specific department to analyze how different parts of the government utilize travel funds.
      </p>

      <FilterTopbar
        filterConfig={filterConfig}
        selectedFilters={selectedFilters}
        onDateChange={handleDateChange}
        onFilterChange={handleFilterChange}
        startDate={startDate}
        endDate={endDate}
        loading={dataIsLoading || isValidating}
      />
      
      {selectedFilters.org && ( // Only render if an org is selected
        <OrgDetailsCard 
            org={orgDetailsForCard} 
            isLoading={dataIsLoading && !orgDetails} // Loading if fetching and no specific details yet
            className="my-4" 
        />
      )}
       
      {trendsApiError && <ErrorMessage message={`Failed to load trends data: ${trendsApiError.info || trendsApiError.message}`} />}
      {allOrgsError && <ErrorMessage message={`Failed to load department options: ${allOrgsError.info || allOrgsError.message}`} />}
      
      {(dataIsLoading || isValidating) && !trendsApiError && !allOrgsError && <LoadingSpinner />}

      {!pageIsEffectivelyLoading && !trendsApiError && !allOrgsError && (
        <>
          {(!trips || trips.length === 0) ? (
             <div className="card card-padding-default mt-2 md:mt-6 text-center text-foreground-muted">
                No trip data available for the selected department and period.
             </div>
          ) : (
            <>
              <div className="mt-2 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <KPICard title={<div className="flex items-center gap-1.5"><span>Total Spending</span><Tooltip text={TOOLTIP_TEXTS.TOTAL_SPENDING_KPI}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} value={formatCurrency(orgKPIs.totalSpent)} isLoading={dataIsLoading && !trips} />
                <KPICard title={<div className="flex items-center gap-1.5"><span>Average Trip Cost</span><Tooltip text={TOOLTIP_TEXTS.AVG_TRIP_COST_KPI}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} value={formatCurrency(orgKPIs.avgTripCost)} isLoading={dataIsLoading && !trips} />
                <KPICard title={<div className="flex items-center gap-1.5"><span>Total Trips</span><Tooltip text={TOOLTIP_TEXTS.TOTAL_TRIPS_KPI}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} value={orgKPIs.tripCount} isLoading={dataIsLoading && !trips} />
              </div>
            
              <div className="mt-4 md:mt-6 grid grid-cols-1 gap-4 md:gap-6">
                <ChartContainer 
                    title={<div className="flex items-center gap-1.5"><span>Spending Over Time</span><Tooltip text={TOOLTIP_TEXTS.SPENDING_OVER_TIME}><VscInfo size={18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>}
                    isLoading={dataIsLoading && (!trips || trips.length === 0)} // Show skeleton if trips are loading or empty for chart
                >
                  <SpendingOverTimeChart
                    monthLabels={processedLineChartData.monthLabels}
                    seriesData={processedLineChartData.seriesData}
                    palette={CHART_PALETTES.LINE_PALETTE}
                    formatCurrencyFn={formatCurrency} // Pass the imported formatCurrency
                    // isLoading can be true if trips are empty but still loading, handled by ChartContainer now
                  />
                </ChartContainer>
              </div>
              <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 <ChartContainer 
                    title={<div className="flex items-center gap-1.5"><span>Spending by Purpose</span><Tooltip text={TOOLTIP_TEXTS.PURPOSE_CLEANING}><VscInfo size={18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>}
                    isLoading={dataIsLoading && (!processedPieChartData || processedPieChartData.length === 0)}
                 >
                    <SpendingByPurposeChart
                        purposeData={processedPieChartData}
                        palette={CHART_PALETTES.PIE_PALETTE} // Use the new PIE_PALETTE
                        formatCurrencyFn={formatCurrency}
                    />
                 </ChartContainer>
                 <ListContainer
                    title={<div className="flex items-center gap-1.5"><span>Top Spending Titles</span><Tooltip text={TOOLTIP_TEXTS.TITLE_CLEANING}><VscInfo size={18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>}
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
