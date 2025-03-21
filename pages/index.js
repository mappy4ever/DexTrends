import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customStartDate, setCustomStartDate] = useState(() => {
    if (typeof window !== "undefined") {
      const storedStart = localStorage.getItem("start_date");
      return storedStart ? new Date(storedStart) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    }
    return new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  });

  const [customEndDate, setCustomEndDate] = useState(() => {
    if (typeof window !== "undefined") {
      const storedEnd = localStorage.getItem("end_date");
      return storedEnd ? new Date(storedEnd) : new Date();
    }
    return new Date();
  });
  
  const [selectedOrg, setSelectedOrg] = useState("all");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("start_date", customStartDate.toISOString());
      localStorage.setItem("end_date", customEndDate.toISOString());
    }

    let url = `/api/data?type=dashboard&start=${customStartDate.toISOString().slice(0, 7)}&end=${customEndDate.toISOString().slice(0, 7)}&org=${selectedOrg}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);

        // Transform heatmap data: Ensure valid numbers and remove any undefined/null values
        const transformedHeatmap = data.spendingHeatmap
          .filter(({ year, month, total_spent }) => year && month && total_spent)
          .map(({ year, month, total_spent }) => [month, year, total_spent]);

        setHeatmapData(transformedHeatmap);
      })
      .catch(() => setLoading(false));
  }, [customStartDate, customEndDate, selectedOrg]);

  // Spending by purpose chart
  const spendingByPurposeChart = useMemo(() => ({
    series: [
      {
        type: "pie",
        data: Object.values(
          data?.spendingByPurpose?.reduce((acc, p) => {
            acc[p.purpose_category] = acc[p.purpose_category] || { name: p.purpose_category, value: 0 };
            acc[p.purpose_category].value += p.total_spent;
            return acc;
          }, {}) || {}
        ),
      },
    ],
  }), [data]);

  // Spending over time chart
  const spendingOverTimeChart = useMemo(() => {
    if (!data?.spendingByOrg) return {};
    
    const groupedData = data.spendingByOrg.reduce((acc, t) => {
      if (!acc[t.month]) {
        acc[t.month] = { month: t.month, airfare: 0, other_transport: 0, lodging: 0, meals: 0, other_expenses: 0 };
      }
      acc[t.month].airfare += t.airfare;
      acc[t.month].other_transport += t.other_transport;
      acc[t.month].lodging += t.lodging;
      acc[t.month].meals += t.meals;
      acc[t.month].other_expenses += t.other_expenses;
      return acc;
    }, {});

    const sortedMonths = Object.keys(groupedData).sort();

    return {
      xAxis: { type: "category", data: sortedMonths },
      yAxis: { type: "value" },
      series: [
        { name: "Airfare", type: "line", data: sortedMonths.map(month => groupedData[month].airfare) },
        { name: "Other Transport", type: "line", data: sortedMonths.map(month => groupedData[month].other_transport) },
        { name: "Lodging", type: "line", data: sortedMonths.map(month => groupedData[month].lodging) },
        { name: "Meals", type: "line", data: sortedMonths.map(month => groupedData[month].meals) },
        { name: "Other Expenses", type: "line", data: sortedMonths.map(month => groupedData[month].other_expenses) },
      ],
    };
  }, [data]);

  const maxHeatmapValue = heatmapData.length > 0 ? Math.max(...heatmapData.map(d => d[2])) : 0;
  
  const heatmapChart = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `Year: ${params.value[1]}<br>Month: ${params.value[0]}<br>Spending: $${params.value[2].toLocaleString()}`;
      },
    },
    grid: {
      height: '70%',
      top: '10%',
    },
    xAxis: {
      type: 'category',
      name: 'Month',
      data: Array.from({ length: 12 }, (_, i) => i + 1), // 1-12 for months
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      name: 'Year',
      data: [...new Set(heatmapData.map(d => d[1]))].sort(),
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxHeatmapValue || 10000,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "10",
      inRange: { color: ["#ffffb2", "#fd8d3c", "#bd0026"] },
    },
    series: [
      {
        name: "Spending",
        type: "heatmap",
        data: heatmapData,
        emphasis: {
          itemStyle: {
            borderColor: "#333",
            borderWidth: 1,
          },
        },
      },
    ],
  };

  const totalSpending = useMemo(() => data?.spendingByPurpose?.reduce((acc, item) => acc + item.total_spent, 0) || 0, [data]);
  const numExpenseReports = useMemo(() => data?.spendingByPurpose?.reduce((acc, item) => acc + item.record_count, 0) || 0, [data]);
  const avgTripCost = numExpenseReports > 0 ? totalSpending / numExpenseReports : 0;
  
  const aggregateTop10Data = (arr, key) => {
    return Object.values(arr?.reduce((acc, item) => {
      if (!acc[item[key]]) {
        acc[item[key]] = { ...item };
      } else {
        acc[item[key]].total_spent += item.total_spent;
      }
      return acc;
    }, {}) || {}).sort((a, b) => b.total_spent - a.total_spent).slice(0, 10);
  };

  const topOrgs = aggregateTop10Data(data?.spendingByOrg, "owner_org_title");
  const topNames = aggregateTop10Data(data?.spendingByName, "name");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Date & Organization Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="font-medium mb-1">Select Date Range:</label>
          <div className="flex gap-2">
            <DatePicker selected={customStartDate} onChange={setCustomStartDate} className="w-full p-2 border rounded" />
            <DatePicker selected={customEndDate} onChange={setCustomEndDate} className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">Select Organization:</label>
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="all">All Organizations</option>
            {data?.spendingByOrg?.map((org) => (
              <option key={org.owner_org_title} value={org.owner_org_title}>
                {org.owner_org_title}
              </option>
            ))}
          </select>
        </div>
      </div>

	  {/* Summary Cards */}
      <div className="grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Spending</h2>
          <p className="text-2xl">${totalSpending.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Expense Reports</h2>
          <p className="text-2xl">{numExpenseReports}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Average Trip Cost</h2>
          <p className="text-2xl">${avgTripCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Top People</h2>
          <ul>
            {topNames.map((person, index) => (
              <li key={index}>{person.name}: ${person.total_spent.toLocaleString()}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Top Organizations</h2>
          <ul>
            {topOrgs.map((org, index) => (
              <li key={index}>{org.owner_org_title}: ${org.total_spent.toLocaleString()}</li>
            ))}
          </ul>
        </div>
      </div>
	  
	  {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6 pb-16">
		<div className="bg-white p-4 rounded shadow mt-6">
          <h2 className="text-lg font-semibold">Spending Over Time</h2>
          {!loading && <ECharts option={spendingOverTimeChart} style={{ height: "400px" }} />}
        </div>
 
		<div className="bg-white p-4 rounded shadow mt-6">
          <h2 className="text-lg font-semibold">Spending by Purpose</h2>
          {!loading && <ECharts option={spendingByPurposeChart} style={{ height: "400px" }} />}
        </div>
	    
        <div className="bg-white p-4 rounded shadow mt-6">
          <h2 className="text-lg font-semibold">Monthly Spending Heatmap</h2>
          {!loading && <ECharts option={heatmapChart} style={{ height: "400px" }} />}
        </div>
	  </div>
    </div>
  );
}
