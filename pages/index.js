// pages/index.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { FaRegLightbulb } from "react-icons/fa";
import { VscDashboard, VscOrganization, VscAccount, VscGlobe, VscInfo } from "react-icons/vsc";

// Utils
import { formatCurrency } from '../utils/formatters';
import { fetcher } from '../utils/apiUtils';
import { generateMonthsInRangeForCharts } from '../utils/dateUtils';
import { CHART_PALETTES, SPENDING_SERIES_DASHBOARD_CONFIG } from '../components/ui/data/chartConstants';
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
import Modal from '../components/ui/Modal';
import TrendsLayout from '../components/layout/TrendsLayout'; // Using TrendsLayout as DashboardLayout
import KPICard from '../components/ui/KPICard';
import ChartContainer from '../components/ui/ChartContainer';
import ListContainer from '../components/ui/ListContainer';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import FilterTopbar from '../components/FilterTopbar';
import Tooltip from '../components/ui/Tooltip';
import { TOOLTIP_TEXTS } from '../components/ui/data/tooltips';

// Chart Components
import SpendingOverTimeChart from '../components/charts/SpendingOverTimeChart';
import SpendingByPurposeChart from '../components/charts/SpendingByPurposeChart';
import MonthlySpendingHeatmap from '../components/charts/MonthlySpendingHeatmap';

export default function DashboardPage() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedNonDateFilters, setSelectedNonDateFilters] = useState({}); // For any non-date filters
  const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
  const [showSplashModal, setShowSplashModal] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const savedGlobalFilters = loadFromLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, null);
    let initialStartDate = getDefaultInitialStartDate();
    let initialEndDate = getDefaultInitialEndDate();

    if (savedGlobalFilters) {
      const parsedStart = parseYearMonthToDate(savedGlobalFilters.startMonth);
      const parsedEnd = parseYearMonthToDate(savedGlobalFilters.endMonth);
      if (parsedStart) initialStartDate = parsedStart;
      if (parsedEnd) initialEndDate = parsedEnd;
    }
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setInitialFiltersLoaded(true);
  }, []);

  useEffect(() => {
    if (!initialFiltersLoaded || !startDate || !endDate) return;
    const filtersToSave = {
      startMonth: getYearMonthString(startDate),
      endMonth: getYearMonthString(endDate),
    };
    saveToLocalStorage(LOCAL_STORAGE_KEYS.GLOBAL_DATE_FILTERS, filtersToSave);
  }, [startDate, endDate, initialFiltersLoaded]);

  useEffect(() => {
    if (initialFiltersLoaded) {
      const hasVisitedBefore = localStorage.getItem('hasVisitedTravelDashboard');
      if (!hasVisitedBefore) {
        setShowSplashModal(true);
      }
    }
  }, [initialFiltersLoaded]);

  const handleDateChange = useCallback((dateKey, dateObject) => {
    if (dateKey === 'startDate') setStartDate(dateObject);
    else if (dateKey === 'endDate') setEndDate(dateObject);
  }, []);
  
  const handleNonDateFilterChange = useCallback((filterKey, value) => {
    setSelectedNonDateFilters(prev => ({ ...prev, [filterKey]: value }));
  }, []);

  const handleCloseSplashModal = useCallback(() => {
    setShowSplashModal(false);
    localStorage.setItem('hasVisitedTravelDashboard', 'true');
  }, []);

  const filterConfig = useMemo(() => [
    { key: 'startDate', label: 'Start Date:', type: 'month' },
    { key: 'endDate', label: 'End Date:', type: 'month' },
    // Add other non-date filter configurations here if needed
  ], []);

  const apiUrl = useMemo(() => {
    if (!initialFiltersLoaded || !startDate || !endDate) return null;
    const startMonthStr = getYearMonthString(startDate);
    const endMonthStr = getYearMonthString(endDate);
    const params = new URLSearchParams({
      start: startMonthStr,
      end: endMonthStr,
      ...selectedNonDateFilters
    });
    return `/api/dashboard?${params.toString()}`; // Ensure this API endpoint exists
  }, [startDate, endDate, selectedNonDateFilters, initialFiltersLoaded]);

  const { data, error, isLoading: swrIsLoading, isValidating: swrIsValidating } = useSWR(
    apiUrl, fetcher, { keepPreviousData: true, revalidateOnFocus: false }
  );
  
  const pageIsLoading = !initialFiltersLoaded || swrIsLoading || swrIsValidating;

  // Data preparation for SpendingOverTimeChart
  const processedLineChartData = useMemo(() => {
    const spendingData = data?.spendingOverTime || []; 
    if (!startDate || !endDate) return { monthLabels: [], seriesData: [] };

    const allMonthsInRange = generateMonthsInRangeForCharts(startDate, endDate); 

    const spendingMap = spendingData.reduce((map, item) => {
      const monthKey = item.month ? String(item.month).slice(0, 7) : null;
      if (monthKey) map[monthKey] = item;
      return map;
    }, {});

    const monthLabels = allMonthsInRange.map(monthKey => {
      const [year, monthNum] = monthKey.split('-');
      return new Date(Date.UTC(Number(year), Number(monthNum) - 1, 1))
        .toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    });

    const seriesData = SPENDING_SERIES_DASHBOARD_CONFIG.map(sConfig => ({
      name: sConfig.name,
      data: allMonthsInRange.map(monthKey =>
        parseFloat((spendingMap[monthKey]?.[sConfig.dashboardKey || sConfig.dataKey] || 0).toFixed(2))
      )
    }));
    
    return { monthLabels, seriesData };
  }, [data?.spendingOverTime, startDate, endDate]);


  // Data preparation for SpendingByPurposeChart
  const processedPieChartData = useMemo(() => data?.spendingByPurpose || [], [data?.spendingByPurpose]);
  
  // Data for Heatmap (raw data from API)
  const heatmapRawApiData = useMemo(() => data?.heatmapData || [], [data?.heatmapData]);

  if (!initialFiltersLoaded) { 
    return <TrendsLayout><LoadingSpinner /></TrendsLayout>;
  }

  return (
    <TrendsLayout> 
      <Modal isOpen={showSplashModal} onClose={handleCloseSplashModal} title={<div className="flex items-center gap-x-3"><FaRegLightbulb size={24} className="text-primary" /><span className="text-xl font-semibold text-foreground">Welcome to OnOurDime.ca!</span></div>} size="xl">
        <div className="text-sm text-foreground-default space-y-2 md:space-y-4">
          <p>Welcome to <strong>OnOurDime</strong> - your window into Canadian federal government travel expenses.</p>
          <p>We believe that understanding where taxpayer money is invested is crucial for informed citizenship.</p>
          <p>This platform transforms publicly available data from the Government of Canada into interactive visualizations. Our goal is to make it easier for everyone to see how public funds are utilized for travel, fostering understanding and promoting interest in government accountability.</p>
          <p>Here’s a quick guide to help you navigate:</p>
          <ul className="list-none space-y-1">
            {[
              { icon: <VscDashboard size={20} className="text-primary" />, title: "Dashboard", text: "An overview of spending, key trends, and top expenditures. Use filters to explore different time periods.", link: null },
              { icon: <VscOrganization size={20} className="text-primary" />, title: "Department Trends", text: "Dive into spending by specific government departments.", link: "/orgs" },
              { icon: <VscAccount size={20} className="text-primary" />, title: "Person Inspector", text: "Explore travel expenses for individual officials.", link: "/people" },
              { icon: <VscGlobe size={20} className="text-primary" />, title: "Map Explorer", text: "Visualize travel globally on a map.", link: "/map" },
            ].map(item => (
              <li key={item.title} className="flex items-start gap-x-3 p-2 rounded-app-md hover:bg-surface-hovered transition-colors">
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
          <p className="mt-5 text-sm text-foreground-default">For detailed information on data sources and limitations, please see our <Link href="/about" onClick={handleCloseSplashModal} className="btn-link text-sm">About page</Link>.</p>
          <div className="mt-6 text-right">
            <button onClick={handleCloseSplashModal} className="btn-primary">Got it, let's explore!</button>
          </div>
        </div>
      </Modal>
      
      <div className="flex justify-between items-center">
        <h1 className="text-page-heading">Dashboard</h1>
        <button onClick={() => setShowSplashModal(true)} className="p-2 text-foreground-muted hover:text-primary transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" title="Show Welcome Guide" aria-label="Show Welcome Guide">
          <VscInfo size={22}/>
        </button>
      </div>

      <p className="mb-4 md:mb-6 text-base text-center md:text-left text-foreground-default mx-auto md:mx-0 px-5">
        Welcome to the main Dashboard. Get a high-level overview of Canadian federal government travel expenses by exploring key spending indicators and trends over time, top spending departments and officials, and a heatmap of monthly expenditures. Use the date filters below to narrow your focus.
      </p>

      <FilterTopbar
        filterConfig={filterConfig}
        availableFilters={{}} 
        selectedFilters={{ ...selectedNonDateFilters }} 
        onFilterChange={handleNonDateFilterChange}
        startDate={startDate} 
        endDate={endDate}   
        onDateChange={handleDateChange}
        loading={!initialFiltersLoaded} 
      />

      {error && <ErrorMessage message={error.info?.message || error.message || 'Failed to load dashboard data.'} />}
      {pageIsLoading && !error && <LoadingSpinner />}

      {!pageIsLoading && !error && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            <KPICard title={<div className="flex items-center gap-1.5"><span>Total Spending</span><Tooltip text={TOOLTIP_TEXTS.TOTAL_SPENDING_KPI}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} value={data.kpiData?.totalSpending} isLoading={swrIsLoading && !data} />
            <KPICard title={<div className="flex items-center gap-1.5"><span>Average Trip Cost</span><Tooltip text={TOOLTIP_TEXTS.AVG_TRIP_COST_KPI}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} value={data.kpiData?.avgTripCost} isLoading={swrIsLoading && !data} />
            <KPICard title={<div className="flex items-center gap-1.5"><span>Total Trips</span><Tooltip text={TOOLTIP_TEXTS.TOTAL_TRIPS_KPI}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} value={data.kpiData?.recordCount} isLoading={swrIsLoading && !data} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <ListContainer title={<div className="flex items-center gap-1.5"><span>Top Spending Departments</span><Tooltip text={TOOLTIP_TEXTS.DEPARTMENT_CLEANING}><VscInfo size={18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} isLoading={swrIsLoading && !data} items={data.topOrgs}
              renderItem={(org) => {
                const queryParams = new URLSearchParams();
                if (startDate) queryParams.append('start', getYearMonthString(startDate));
                if (endDate) queryParams.append('end', getYearMonthString(endDate));
                queryParams.append('orgId', org.id);
                return (
                  <li key={org.name} className="flex justify-between items-center py-1.5 border-b border-border-subtle last:border-b-0">
                    <Link href={`/orgs?${queryParams.toString()}`} className="btn-link text-sm hover:underline">{org.name}</Link>
                    <span className="font-medium text-foreground-muted">${formatCurrency(org.value)}</span>
                  </li>);
              }}
            />
            <ListContainer title={<div className="flex items-center gap-1.5"><span>Top Spending Officials</span><Tooltip text={TOOLTIP_TEXTS.NAME_CLEANING}><VscInfo size={18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} isLoading={swrIsLoading && !data} items={data.topNames}
              renderItem={(person) => {
                const queryParams = new URLSearchParams();
                if (startDate) queryParams.append('start', getYearMonthString(startDate));
                if (endDate) queryParams.append('end', getYearMonthString(endDate));
                if (person.id) queryParams.append('personId', person.id);
                return (
                  <li key={person.name} className="flex justify-between items-center py-1.5 border-b border-border-subtle last:border-b-0">
                    <Link href={`/people?personId=${person.id}&start=${getYearMonthString(startDate)}&end=${getYearMonthString(endDate)}`} className="btn-link text-sm hover:underline">{person.name}</Link>
                    <span className="font-medium text-foreground-muted">${formatCurrency(person.value)}</span>
                  </li>);
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6"> 
            <ChartContainer title={<div className="flex items-center gap-1.5"><span>Spending Over Time</span><Tooltip text={TOOLTIP_TEXTS.SPENDING_OVER_TIME}><VscInfo size={18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} 
                            isLoading={swrIsLoading && (!processedLineChartData.monthLabels || processedLineChartData.monthLabels.length === 0)} 
                            className="xl:col-span-1"> 
                <SpendingOverTimeChart
                    monthLabels={processedLineChartData.monthLabels}
                    seriesData={processedLineChartData.seriesData}
                    palette={CHART_PALETTES.LINE_PALETTE}
                    formatCurrencyFn={formatCurrency}
                    isLoading={swrIsLoading && !processedLineChartData.monthLabels.length && !!apiUrl} 
                />
            </ChartContainer>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6"> 
            <ChartContainer 
                title={<div className="flex items-center gap-1.5"><span>Spending by Purpose</span><Tooltip text={TOOLTIP_TEXTS.PURPOSE_CLEANING}><VscInfo size={18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} 
                isLoading={swrIsLoading && (!processedPieChartData || processedPieChartData.length === 0 ) && !!apiUrl}
            >
              <SpendingByPurposeChart
                purposeData={processedPieChartData}
                palette={CHART_PALETTES.PIE_PALETTE || CHART_PALETTES.LINE_PALETTE} // Fallback to line palette if pie not defined
                formatCurrencyFn={formatCurrency}
                isLoading={swrIsLoading && !processedPieChartData.length && !!apiUrl}
              />
            </ChartContainer>
            <ChartContainer 
                title={<div className="flex items-center gap-1.5"><span>Monthly Spending Heatmap</span><Tooltip text={TOOLTIP_TEXTS.HEATMAP}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} 
                isLoading={swrIsLoading && !heatmapRawApiData.length && !!apiUrl} // Check raw data for heatmap loading
            >
              <MonthlySpendingHeatmap
                heatmapRawData={heatmapRawApiData}
                palette={CHART_PALETTES.HEATMAP_PALETTE}
                darkPalette={CHART_PALETTES.HEATMAP_PALETTE_DARK} // Pass the dark mode palette
                formatCurrencyFn={formatCurrency}
                isLoading={swrIsLoading && !heatmapRawApiData.length && !!apiUrl} // Pass loading state
              />
            </ChartContainer>
          </div>
        </>
      )}
    </TrendsLayout>
  );
}
