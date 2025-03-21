import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
import * as echarts from "echarts/core";
import worldGeoJSON from "world-atlas/countries-50m.json";

echarts.registerMap("world", worldGeoJSON);


export default function People() {
  const [selectedPerson, setSelectedPerson] = useState("");
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

    let url = `/api/data?type=person&start=${customStartDate.toISOString().slice(0, 7)}&end=${customEndDate.toISOString().slice(0, 7)}`;
    if (selectedPerson) {
      url += `&name=${selectedPerson}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customStartDate, customEndDate, selectedPerson]);

  // Spending over time chart
  const spendingOverTimeChart = useMemo(() => {
    if (!data?.personData?.spendingByMonth) return {};

    const sortedMonths = [...new Set(data.personData.spendingByMonth.map(d => d.month))].sort();

    return {
      xAxis: { type: "category", data: sortedMonths },
      yAxis: { type: "value" },
      series: [
        { name: "Airfare", type: "line", data: sortedMonths.map(month => data.personData.spendingByMonth.find(d => d.month === month)?.airfare || 0) },
        { name: "Other Transport", type: "line", data: sortedMonths.map(month => data.personData.spendingByMonth.find(d => d.month === month)?.other_transport || 0) },
        { name: "Lodging", type: "line", data: sortedMonths.map(month => data.personData.spendingByMonth.find(d => d.month === month)?.lodging || 0) },
        { name: "Meals", type: "line", data: sortedMonths.map(month => data.personData.spendingByMonth.find(d => d.month === month)?.meals || 0) },
      ],
    };
  }, [data]);

  // Spending by purpose chart
  const spendingByPurposeChart = useMemo(() => ({
    series: [
      {
        type: "pie",
        data: data?.personData?.spendingByPurpose?.map(p => ({ name: p.purpose_category, value: p.total_spent })) || [],
      },
    ],
  }), [data]);

  // Country map visualization
  const countrySpendingMap = useMemo(() => {
    if (!data || !data.personData || !Array.isArray(data.personData.spendingByCountry)) return {}; // Prevents error

    return {
      tooltip: {
        trigger: "item",
        formatter: (params) => `${params.name}: $${params.value?.toLocaleString() || 0}`,
      },
      visualMap: {
        min: 0,
        max: data?.personData?.maxCountrySpending || 10000,
        left: "right",
        top: "bottom",
        inRange: { color: ["#e0ffff", "#006edd"] },
      },
      series: [
        {
          type: "map",
          map: "world",
          roam: true,
          data: data.personData.spendingByCountry.map((d) => ({
            name: d.country,
            value: d.total_spent,
          })),
        },
      ],
    };
  }, [data]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">People Spending Trends</h1>

      {/* Date & Person Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="font-medium mb-1">Select Date Range:</label>
          <div className="flex gap-2">
            <DatePicker selected={customStartDate} onChange={setCustomStartDate} className="w-full p-2 border rounded" />
            <DatePicker selected={customEndDate} onChange={setCustomEndDate} className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">Select Person:</label>
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="all">All People</option>
            {data?.spendingByOrg?.map((org) => (
              <option key={person.name} value={person.name}>{person.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Spending</h2>
          <p className="text-2xl">${data?.personData?.totalSpending?.toLocaleString() || "0"}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Expense Reports</h2>
          <p className="text-2xl">{data?.personData?.expenseReports || "0"}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Average Trip Cost</h2>
          <p className="text-2xl">${data?.personData?.avgTripCost?.toLocaleString() || "0"}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <ECharts option={spendingOverTimeChart} style={{ height: "400px" }} />
        <ECharts option={spendingByPurposeChart} style={{ height: "400px" }} />
      </div>

      {/* Country Map */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h2 className="text-lg font-semibold">Spending by Country</h2>
        <ECharts option={countrySpendingMap} style={{ height: "500px" }} />
      </div>
    </div>
  );
}
