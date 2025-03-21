import ReactECharts from "echarts-for-react";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { TbTableDown } from "react-icons/tb";
import { LuImageDown } from "react-icons/lu";

export default function MonthlySpendingByOrg() {
  const chartRef = useRef(null);
  const [selectedOrg, setSelectedOrg] = useState("");
  const { theme } = useTheme();
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedData = useRef(false);
  
  useEffect(() => {
      const fetchData = async () => {
          if (hasFetchedData.current) return;
          hasFetchedData.current = true;
  
          setIsLoading(true);
          setError(null);
          try {
			  const response = await fetch("/api/get-travel-data");
              if (!response.ok) {
                  console.error('API error headers:', response.headers);
                  throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
              }
  
              const data = await response.json();
  
              if (!isValidChartData(data)) {
                  console.error("Invalid data format received from API");
                  throw new Error("Invalid data format received from API");
              }
  
              setChartData(data);
          } catch (error) {
              console.error("Error fetching data:", error);
              setError(error);
          } finally {
              setIsLoading(false);
          }
      };
  
      fetchData();
  }, []);

  // Function to validate chart data structure
  const isValidChartData = (data) => {
      return (
          data &&
          typeof data === "object" &&
          Array.isArray(data.data) &&
          data.data.every(
              (row) =>
                  row.month &&
                  typeof row.month === "string" &&
                  row.owner_org_title &&
                  typeof row.owner_org_title === "string" &&
                  typeof row.count === "number" &&
                  typeof row.airfare === "number" &&
                  typeof row.other_transport === "number" &&
                  typeof row.lodging === "number" &&
                  typeof row.meals === "number" &&
                  typeof row.other_expenses === "number"
          )
      );
  };
	
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll(".parallax-heading");
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const scrollAmount = Math.max(0, window.innerHeight - rect.top) * 0.04;
  
        heading.style.transform = `translateX(${scrollAmount}px)`; // Moves only to the right
        heading.style.opacity = Math.max(0.8, 1 - scrollAmount * 0.01); // Fades only to 80% opacity
      });
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Functions to highlight chart elements
  function highlightChartElement(actionType) {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();

      if (actionType === "legend") {
        chartInstance.dispatchAction({
          type: "highlight",
          seriesIndex: 0, // Highlight first series (adjust as needed)
        });
      } else if (actionType === "slider") {
        chartInstance.dispatchAction({
          type: "dataZoom",
          start: 10,
          end: 90,
        });
      }
    }
  }

  function removeChartHighlight(actionType) {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();

      if (actionType === "legend") {
        chartInstance.dispatchAction({
          type: "downplay",
          seriesIndex: 0,
        });
      } else if (actionType === "slider") {
        chartInstance.dispatchAction({
          type: "dataZoom",
          start: 0,
          end: 100,
        });
      }
    }
  }

  const expenseMapping = {
    airfare: "Airfare",
    other_transport: "Other Transport",
    lodging: "Lodging",
    meals: "Meals",
    other_expenses: "Other Expenses",
  };

    const filteredData = chartData?.data
        ? selectedOrg
            ? chartData.data.filter((row) => row.owner_org_title === selectedOrg)
            : chartData.data.reduce((acc, row) => {
                  let existingMonth = acc.find((item) => item.month === row.month);
                  if (existingMonth) {
                      Object.keys(expenseMapping).forEach((expense) => {
                          existingMonth[expense] += row[expense] || 0;
                      });
                      existingMonth.count += row.count || 0;
                  } else {
                      let newItem = { month: row.month, count: row.count || 0 };
                      Object.keys(expenseMapping).forEach((expense) => {
                          newItem[expense] = row[expense] || 0;
                      });
                      acc.push(newItem);
                  }
                  return acc;
              }, [])
        : [];

  const allMonths = chartData?.data
	? [...new Set(chartData.data.map((row) => row.month))].sort()
	: [];

  const isDarkMode = theme === "dark";

  const formatCurrency = (value) => {
    if (value < 1000) {
      return `$${value.toFixed(2)}`;
    } else if (value >= 1000 && value < 1000000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else if (value >= 1000000 && value < 1000000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const chartOption = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        let tooltipText = `${params[0].axisValue}<br/>`;
        const dataItem = filteredData.find(
          (row) => row.month === params[0].axisValue
        );
        if (dataItem) {
          tooltipText += `Number of expenses: ${dataItem.count || 0}<br/>`;
        }
        params.forEach((item) => {
          tooltipText += `${item.marker} ${item.seriesName}: $${item.value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}<br/>`;
        });
        return tooltipText;
      },
    },
    legend: {
      data: Object.values(expenseMapping),
      textStyle: {
        color: isDarkMode ? "#FFF3E6" : "#1C1513", // Toggle based on theme
      },
    },
    xAxis: {
      type: "category",
      data: allMonths,
      axisLine: {
        lineStyle: {
          color: isDarkMode ? "#FFF3E6" : "#1C1513",
        },
      },
      axisLabel: {
        color: isDarkMode ? "#FFF3E6" : "#1C1513",
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: {
          color: isDarkMode ? "#FFF3E6" : "#1C1513",
        },
      },
      axisLabel: {
        color: isDarkMode ? "#FFF3E6" : "#1C1513",
        formatter: formatCurrency,
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? "#4a3f3a" : "#D1D6D6", // Grid line color
        },
      },
    },
    
  dataZoom: [
      {
        type: "slider",
        start: 0,
        end: 100,
        backgroundColor: "rgba(255,255,255,0.1)",
        dataBackground: {
          areaStyle: {
            color: "rgba(255,255,255,0.3)",
          },
        },
      },
      {
        type: "inside",
        start: 0,
        end: 100,
      },
    ],
  
    series: Object.keys(expenseMapping).map((expense) => ({
      name: expenseMapping[expense],
      type: "line",
	  smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: {
        width: 2,
      },
      data: allMonths.map(
        (month) => filteredData.find((row) => row.month === month)?.[expense] || 0
      ),
      itemStyle: {
        color:
          expense === "airfare"
            ? isDarkMode ? "#6495ED" : "#6495ED"
            : expense === "other_transport"
            ? isDarkMode ? "#ADFF2F" : "#ADFF2F"
            : expense === "lodging"
            ? isDarkMode ? "#FFD700" : "#FFD700"
            : expense === "meals"
            ? isDarkMode ? "#FF6347" : "#FF6347"
            : isDarkMode ? "#20B2AA" : "#20B2AA",
      },
    })),
    
	backgroundColor: isDarkMode ? "#1C1513" : "#fdf8f3", // Chart background
  };

  // Export CSV
  const exportCSV = () => {
    const csvData = Papa.unparse(filteredData);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "travel_expenses.csv");
  };

  // Export PNG
  const exportPNG = async () => {
    if (!chartRef.current) return;
    const chartCanvas = await html2canvas(chartRef.current.getEchartsInstance().getDom());
    chartCanvas.toBlob((blob) => {
      saveAs(blob, "travel_expenses.png");
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4">

    <div className="py-4">
        <select
          className="form-input w-full md:w-1/2 lg:w-2/3 rounded-lg text-[#1c1513] dark:text-[#1c1513]"
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
        >
          <option value="">Select Organization (eg. Office of the Prime Minister)</option>
          {chartData?.data
			? [...new Set(chartData.data.map((row) => row.owner_org_title))].sort().map((org, index) => (
			  <option key={index} value={org}>
			  {org}
			  </option>
			  ))
			: []}
        </select>
      </div>

      <div className="w-full h-[300px] md:h-[450px] lg:h-[550px] bg-chart p-4 rounded-lg shadow-lg">
        {isLoading ? (
          <div className="heading-styling animate-pulse bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 flex items-center justify-center h-full">
            LOADING
          </div>
        ) : error ? (
          <div className="text-red-500">Error: {error.message}</div>
        ) : chartData?.data ? (
	      <ReactECharts
			ref={chartRef}
			option={chartOption}
			style={{ height: "100%", width: "100%" }}
			opts={{ renderer: "svg" }} 
          />
        ) : (
          <div>No data available</div>
        )}
      </div>
          
	  {chartData?.updated_date && ( 
        <div className="comment-styling text-sm mt-2 pl-2">
          Data updated: {chartData.updated_date}
        </div>
      )}
	  
	  {/* Export Buttons */}
      <div className="mt-4 flex gap-4">
        <button onClick={exportCSV} className="btn-primary flex items-center gap-3"><TbTableDown size={30} /> Export CSV</button>
        <button onClick={exportPNG} className="btn-primary flex items-center gap-3"><LuImageDown size={30} /> Export PNG</button>
      </div>
    </div>
  );
}
