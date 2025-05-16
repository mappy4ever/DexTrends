// pages/people.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { useTheme } from 'next-themes';
import { VscInfo } from "react-icons/vsc";

// Utils
import { formatCurrency, formatDatePretty } from '../utils/formatters';
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
import PersonDetailsCard from '../components/ui/PersonDetailsCard';
import TripTable from '../components/ui/TripTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Tooltip from '../components/ui/Tooltip';
import { TOOLTIP_TEXTS } from '../components/ui/data/tooltips';

// Chart Components
import SpendingOverTimeChart from '../components/charts/SpendingOverTimeChart';
import SpendingByPurposeChart from '../components/charts/SpendingByPurposeChart';

export default function PersonInspectorPage() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({ 
    startMonth: '', 
    endMonth: '', 
    person: null,       // Stores person ID
    person_label: ''    // Stores person name for display in filter if needed
  });
  const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);
  // const { resolvedTheme } = useTheme(); // Chart components use this internally

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
      person_label: queryParams.get('personName') || savedPageFilters.person_label || '',
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
    setSelectedFilters(prev => ({ ...prev, [filterKey === 'startDate' ? 'startMonth' : 'endMonth']: newDateString }));
    if (filterKey === 'startDate') setStartDate(dateObject);
    else setEndDate(dateObject);
  }, []);

  const handleFilterChange = useCallback((filterKey, value) => {
    if (filterKey === 'person') {
      if (value && typeof value === 'object' && value.hasOwnProperty('value')) {
        setSelectedFilters(prev => ({ ...prev, person: value.value, person_label: value.label }));
      } else if (value === null) {
        setSelectedFilters(prev => ({ ...prev, person: null, person_label: '' }));
      }
      // If creatable were true, handle string value here
    } else {
      setSelectedFilters(prev => ({ ...prev, [filterKey]: value }));
    }
  }, []);

  const loadPersonOptions = useCallback(debounce(async (inputValue, callback) => {
    if (!inputValue || inputValue.length < 2) { callback([]); return; }
    try {
      const response = await fetch(`/api/filters?searchPerson=${encodeURIComponent(inputValue)}&limit=30`);
      if (!response.ok) throw new Error('Failed to fetch person suggestions');
      const data = await response.json();
      const options = data.persons ? data.persons.map(p => ({ value: p.id.toString(), label: p.name })) : [];
      callback(options);
    } catch (error) { console.error("Error loading person options:", error); callback([]); }
  }, 300), []);

  const filterConfig = useMemo(() => [
    { key: 'startDate', label: 'Start Date:', type: 'month' },
    { key: 'endDate', label: 'End Date:', type: 'month' },
    {
      key: 'person', label: 'Person:', type: 'async_select', // Changed from async_creatable_select if not creatable
      placeholder: 'Search by name...', loadOptions: loadPersonOptions, creatable: false, isClearable: true,
    },
  ], [loadPersonOptions]);

  const personApiUrl = useMemo(() => {
    if (!initialFiltersLoaded || !selectedFilters.person || !selectedFilters.startMonth || !selectedFilters.endMonth) return null;
    return `/api/people?personId=${selectedFilters.person}&start=${selectedFilters.startMonth}&end=${selectedFilters.endMonth}`;
  }, [selectedFilters, initialFiltersLoaded]);

  const { data: personData, error: personError, isLoading: swrIsLoading, isValidating: swrIsValidating } = useSWR(
    personApiUrl, fetcher, { keepPreviousData: true, revalidateOnFocus: false }
  );

  const pageIsLoading = !initialFiltersLoaded || (swrIsLoading && !!selectedFilters.person) || (swrIsValidating && !!selectedFilters.person);

  const personKPIs = useMemo(() => {
    const trips = personData?.personTrips || [];
    if (trips.length === 0) return { totalSpent: 0, avgTripCost: 0, tripCount: 0 };
    const tripCount = trips.length;
    const totalSpent = trips.reduce((sum, trip) => sum + (Number(trip.total) || 0), 0);
    const avgTripCost = tripCount > 0 ? totalSpent / tripCount : 0;
    return { totalSpent, avgTripCost, tripCount };
  }, [personData?.personTrips]);

  const processedLineChartData = useMemo(() => {
    const trips = personData?.personTrips || [];
    if (!startDate || !endDate) return { monthLabels: [], seriesData: [] };
    const allMonthsInRange = generateMonthsInRangeForCharts(startDate, endDate, getYearMonthString); // Pass getYearMonthString
    const dataByMonthMap = trips.reduce((map, trip) => {
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
  }, [personData?.personTrips, startDate, endDate]);

  const processedPieChartData = useMemo(() => {
    const trips = personData?.personTrips || [];
    if (!trips.length) return [];
    const purposeAgg = trips.reduce((acc, trip) => {
      const name = trip.purpose || trip.purpose_en || 'Unknown';
      acc[name] = (acc[name] || 0) + (Number(trip.total) || 0);
      return acc;
    }, {});
    return Object.entries(purposeAgg)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [personData?.personTrips]);


  if (!initialFiltersLoaded) {
    return <TrendsLayout><LoadingSpinner /></TrendsLayout>;
  }

  return (
    <TrendsLayout>
      <h1 className="text-page-heading">Person Inspector</h1>
      <p className="mb-4 md:mb-6 text-base text-center md:text-left text-foreground-default mx-auto md:mx-0 px-5">
        Investigate the travel expenses of individual federal officials. Search for a person and select a date range to view their trip history and spending patterns.
      </p>

      <FilterTopbar
        filterConfig={filterConfig}
        selectedFilters={selectedFilters}
        onDateChange={handleDateChange}
        onFilterChange={handleFilterChange}
        startDate={startDate}
        endDate={endDate}
        loading={!initialFiltersLoaded}
      />

      {personError && selectedFilters.person && <ErrorMessage message={`Failed to load data for ${selectedFilters.person_label || 'selected person'}: ${personError.info || personError.message}`} />}

      <div className="mt-4 md:mt-6 space-y-6">
        {selectedFilters.person ? (
          <>
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
              <div className="lg:w-1/3 xl:w-1/4 flex">
                <PersonDetailsCard
                  person={personData?.personDetails || { name: selectedFilters.person_label, name_id: selectedFilters.person }} // Pass basic info if details not yet loaded
                  isLoading={pageIsLoading && !personData?.personDetails}
                  className="w-full"
                />
              </div>
              <div className="lg:w-2/3 xl:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <KPICard title={<div className="flex items-center gap-1.5"><span>Total Spending</span><Tooltip text={TOOLTIP_TEXTS.TOTAL_SPENDING_KPI}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} value={formatCurrency(personKPIs.totalSpent)} isLoading={pageIsLoading && !personData} />
                <KPICard title={<div className="flex items-center gap-1.5"><span>Average Trip Cost</span><Tooltip text={TOOLTIP_TEXTS.AVG_TRIP_COST_KPI}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} value={formatCurrency(personKPIs.avgTripCost)} isLoading={pageIsLoading && !personData} />
                <KPICard title={<div className="flex items-center gap-1.5"><span>Total Trips</span><Tooltip text={TOOLTIP_TEXTS.TOTAL_TRIPS_KPI}><VscInfo className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} value={personKPIs.tripCount.toLocaleString()} isLoading={pageIsLoading && !personData} />
              </div>
            </div>

            <div className="mt-2 md:mt-6 grid grid-cols-1 gap-2 md:gap-6">
              <ChartContainer title={<div className="flex items-center gap-1.5"><span>Spending Over Time</span><Tooltip text={TOOLTIP_TEXTS.SPENDING_OVER_TIME}><VscInfo size={18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} isLoading={pageIsLoading && (!processedLineChartData.monthLabels || processedLineChartData.monthLabels.length === 0)}>
                <SpendingOverTimeChart
                  monthLabels={processedLineChartData.monthLabels}
                  seriesData={processedLineChartData.seriesData}
                  palette={CHART_PALETTES.LINE_PALETTE}
                  formatCurrencyFn={formatCurrency}
                  isLoading={pageIsLoading && !processedLineChartData.monthLabels.length && !!personApiUrl}
                />
              </ChartContainer>
            </div>
            <div className="mt-2 md:mt-6 grid grid-cols-1 gap-4 md:gap-6">
              <ChartContainer title={<div className="flex items-center gap-1.5"><span>Spending by Purpose</span><Tooltip text={TOOLTIP_TEXTS.PURPOSE_CLEANING}><VscInfo size={18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div>} isLoading={pageIsLoading && (!processedPieChartData || processedPieChartData.length === 0)}>
                <SpendingByPurposeChart
                  purposeData={processedPieChartData}
                  palette={CHART_PALETTES.PIE_PALETTE || CHART_PALETTES.LINE_PALETTE}
                  formatCurrencyFn={formatCurrency}
                  isLoading={pageIsLoading && !processedPieChartData.length && !!personApiUrl}
                />
              </ChartContainer>
            </div>
            <div className="mt-2 md:mt-6 gap-4 md:gap-6">
              <TripTable trips={personData?.personTrips} isLoading={pageIsLoading && !personData?.personTrips} />
            </div>
          </>
        ) : !pageIsLoading ? ( // Only show this message if not in an initial loading state
          <div className="card card-padding-default text-center text-foreground-muted py-10">
            Please search and select a person using the filters above to view their travel spending details.
          </div>
        ) : null}
        {/* General loading spinner if page is loading but no specific person selected yet for data fetch */}
        {(pageIsLoading && !selectedFilters.person) && <LoadingSpinner />}
      </div>
    </TrendsLayout>
  );
}
