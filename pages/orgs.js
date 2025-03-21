import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function MinistryTrends() {
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [selectedOrg2, setSelectedOrg2] = useState(null);
  const [data, setData] = useState(null);
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("start_date", customStartDate.toISOString());
      localStorage.setItem("end_date", customEndDate.toISOString());
    }

    let url = `/api/data?type=org&start=${customStartDate.toISOString().slice(0, 7)}&end=${customEndDate.toISOString().slice(0, 7)}&org=${selectedOrg}`;
    if (comparisonMode && selectedOrg2) {
      url += `&org2=${selectedOrg2}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customStartDate, customEndDate, selectedOrg, selectedOrg2, comparisonMode]);

  // Spending by purpose chart
  const spendingByPurposeChart = useMemo(() => ({
    series: [
      {
        type: "pie",
        data: Object.values(
          data?.orgData?.reduce((acc, p) => {
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
    if (!data?.orgData) return {};
  
    const groupedData = data.orgData.reduce((acc, entry) => {
      if (!acc[entry.month]) {
        acc[entry.month] = {
          month: entry.month,
          airfare_spent: 0,
          other_transport_spent: 0,
          lodging_spent: 0,
          meals_spent: 0,
          other_expenses_spent: 0,
        };
      }
      acc[entry.month].airfare_spent += entry.airfare_spent || 0;
      acc[entry.month].other_transport_spent += entry.other_transport_spent || 0;
      acc[entry.month].lodging_spent += entry.lodging_spent || 0;
      acc[entry.month].meals_spent += entry.meals_spent || 0;
      acc[entry.month].other_expenses_spent += entry.other_expenses_spent || 0;
      return acc;
    }, {});
  
    const sortedMonths = Object.keys(groupedData).sort();
  
    return {
      xAxis: { type: "category", data: sortedMonths },
      yAxis: { type: "value" },
      series: [
        { name: "Airfare", type: "line", data: sortedMonths.map(month => groupedData[month].airfare_spent) },
        { name: "Other Transport", type: "line", data: sortedMonths.map(month => groupedData[month].other_transport_spent) },
        { name: "Lodging", type: "line", data: sortedMonths.map(month => groupedData[month].lodging_spent) },
        { name: "Meals", type: "line", data: sortedMonths.map(month => groupedData[month].meals_spent) },
        { name: "Other Expenses", type: "line", data: sortedMonths.map(month => groupedData[month].other_expenses_spent) },
      ],
    };
  }, [data]);

  const totalSpending = useMemo(() => data?.orgData?.reduce((acc, item) => acc + item.total_spent, 0) || 0, [data]);
  const numExpenseReports = useMemo(() => data?.orgData?.reduce((acc, item) => acc + item.record_count, 0) || 0, [data]);
  const avgTripCost = numExpenseReports > 0 ? totalSpending / numExpenseReports : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Ministry Trends</h1>

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
            {data?.orgData?.map((org) => (
              <option key={org.owner_org_title} value={org.owner_org_title}>
                {org.owner_org_title}
              </option>
            ))}
          </select>
        </div>
      </div>

        {comparisonMode && (
          <div className="flex flex-col">
            <label className="font-medium mb-1">Compare With:</label>
            <select value={selectedOrg2} onChange={(e) => setSelectedOrg2(e.target.value)} className="w-full p-2 border rounded">
              <option value="">Select an Organization</option>
              <option value="Ministry A">Ministry A</option>
              <option value="Ministry B">Ministry B</option>
            </select>
          </div>
        )}
        
        <div className="flex items-center mt-2">
          <label className="mr-2">Comparison Mode</label>
          <input type="checkbox" checked={comparisonMode} onChange={() => setComparisonMode(!comparisonMode)} />
        </div>  

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Spending</h2>
          <p className="text-2xl">${totalSpending.toLocaleString() || "0"}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Expense Reports</h2>
          <p className="text-2xl">{numExpenseReports.toLocaleString() || "0"}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Average Trip Cost</h2>
          <p className="text-2xl">${avgTripCost.toLocaleString() || "0"}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <ECharts option={spendingOverTimeChart} style={{ height: "400px" }} />
        <ECharts option={spendingByPurposeChart} style={{ height: "400px" }} />
      </div>
    </div>
  );
}
