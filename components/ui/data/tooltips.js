// public/data/tooltips.js

export const TOOLTIP_TEXTS = {
  DEPARTMENT_CLEANING: "Department names are standardized for consistency. This involves unifying variations in naming (e.g., 'Dept. of ...' and 'Department of ...'), converting to title case, and trimming whitespaces. The aim is to allow accurate aggregation and filtering by department.",
  TITLE_CLEANING: "Officials' titles are cleaned by standardizing common abbreviations, correcting inconsistencies, converting to title case, and trimming whitespaces. This helps in grouping similar roles for analysis, though variations may still exist based on source data.",
  NAME_CLEANING: "Names of officials are processed to improve data consistency for aggregation and search. This includes converting to title case and removing special characters and whitespaces. While efforts are made for accuracy, variations in how names are reported in the source data can exist.",
  DESTINATION_CLEANING: "Destination data is parsed from free-text entries in the source. We attempt to map city, region, and country, but due to spelling variations, abbreviations, or non-standard entries (e.g., 'Various locations'), not all destinations can be precisely geocoded. The original destination is retained in the source data. Mapped locations are best-effort interpretations.",
  PURPOSE_CLEANING: "Travel purposes are grouped by similar descriptions using key word matching. This allows for more meaningful aggregation and analysis of why travel was undertaken. Original descriptions may vary.",
  TOTAL_SPENDING_KPI: "The aggregated sum of all expense amounts for the trips during the filtered time period.",
  TOTAL_TRIPS_KPI: "The total number of trips (expense reports) during the filtered time period.",
  AVG_TRIP_COST_KPI: "Calculated as Total Spending divided by Total Number of Trips for the filtered time period.",
  SPENDING_OVER_TIME: "Data shows monthly aggregated totals derived from reported expenses. Figures are subject to errors inherent in the underlying data, such as potential typos or reporting lags.",
  NAME_TITLE_DEPT: "An official's title and department are based off their most recently reported expense and may not reflect their current role.",
};