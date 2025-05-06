// pages/about.js
import { VscGlobe, VscServerProcess, VscBeaker, VscWarning, VscGithubInverted, VscLinkExternal } from "react-icons/vsc";
import { FaCanadianMapleLeaf } from "react-icons/fa"; // For a Canadian touch
import Link from 'next/link';

export default function AboutPage() {
  const dataSetUrl = "https://open.canada.ca/data/en/dataset/009f9a49-c2d9-4d29-a6d4-1a228da335ce";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-slate-700 dark:text-slate-300">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <FaCanadianMapleLeaf size={50} className="text-red-600 dark:text-red-500" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            About This Dashboard
          </h1>
        </div>
        <p className="mt-2 text-lg md:text-xl text-slate-600 dark:text-slate-400">
          Understanding Canadian Federal Government Travel Expenses.
        </p>
      </header>

      <section className="mb-12 p-6 bg-card text-card-foreground rounded-lg shadow-lg">
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
          <VscGlobe size={30} /> Data Source & Purpose
        </h2>
        <p className="mb-3 leading-relaxed">
          This interactive dashboard visualizes travel expenses incurred by the Government of Canada. The data is sourced directly from the official{" "}
          <a
            href={dataSetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:text-primary-focus dark:text-primary-dark dark:hover:text-primary-dark-focus underline"
          >
            Proactive Disclosure of Travel Expenses dataset
          </a>
          {" "}on the Government of Canada's Open Data Portal.
        </p>
        <p className="mb-3 leading-relaxed">
          The primary purpose of this tool is to provide a transparent and accessible way for the public, researchers, and journalists to explore how public funds are allocated for travel across various federal departments, by different officials, and over time. By presenting this data in an interactive format, we aim to foster greater understanding and accountability.
        </p>
        <p className="leading-relaxed">
          The data typically includes details such as the purpose of travel, mode of transport, accommodation costs, meal allowances, and other associated expenses. This dashboard aggregates and visualizes this information to reveal trends, patterns, and significant expenditures.
        </p>
      </section>

      <section className="mb-12 p-6 bg-card text-card-foreground rounded-lg shadow-lg">
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
          <VscServerProcess size={30} /> Data Processing & Presentation
        </h2>
        <p className="mb-3 leading-relaxed">
          The raw data from the Open Data Portal undergoes processing to ensure consistency, handle variations in naming, and structure it for effective visualization. This includes:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 pl-4">
          <li>Cleaning and standardizing department names, traveler titles, and travel purposes.</li>
          <li>Geocoding destination data for map visualizations (where possible).</li>
          <li>Aggregating monthly totals and creating summaries for key performance indicators (KPIs).</li>
        </ul>
        <p className="leading-relaxed">
          Visualizations are created using ECharts and Leaflet maps to provide various perspectives on the data, from high-level dashboard summaries to detailed breakdowns by organization and individual. Data is typically updated based on the release schedule of the official dataset.
        </p>
         <p className="mt-3 leading-relaxed">
          Data is current as of: <span className="font-semibold">May 2024</span>. {/* Update this manually or dynamically */}
        </p>
      </section>

      <section className="mb-12 p-6 bg-card text-card-foreground rounded-lg shadow-lg">
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
          <VscBeaker size={30} /> How to Interpret the Data
        </h2>
        <p className="mb-3 leading-relaxed">
          When exploring the dashboard, consider the following:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 pl-4">
          <li><strong>Trends Over Time:</strong> Look for patterns in spending across different months or years. Seasonal variations or significant events might influence these trends.</li>
          <li><strong>Departmental Spending:</strong> Compare spending across different government organizations. Note that department size and mandate heavily influence travel needs.</li>
          <li><strong>Individual Expenses:</strong> The "People" section allows for viewing expenses by specific individuals (e.g., Ministers). Context, such as the individual's role and responsibilities, is important.</li>
          <li><strong>Purpose of Travel:</strong> The data usually specifies the purpose of travel (e.g., meetings, conferences, international delegations), which helps understand the necessity of the expenditure.</li>
          <li><strong>Geographical Data:</strong> The map visualization shows travel destinations, offering insights into where travel is concentrated.</li>
        </ul>
        <p className="leading-relaxed">
          Use the filters at the top of each page (Date Range, Organization, Title, Person) to narrow down the data and focus on specific areas of interest.
        </p>
      </section>

      <section className="p-6 bg-card text-card-foreground rounded-lg shadow-lg">
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
          <VscWarning size={30} /> Limitations & Considerations
        </h2>
        <p className="mb-3 leading-relaxed">
          While this tool aims for accuracy and transparency, users should be aware of potential limitations:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 pl-4">
          <li><strong>Data Accuracy:</strong> The visualizations are based on the data provided by the Government of Canada. Any inaccuracies or omissions in the source data will be reflected here.</li>
          <li><strong>Reporting Lags:</strong> There might be a delay between when expenses are incurred and when they are reported and published in the open data portal.</li>
          <li><strong>Data Granularity:</strong> The level of detail can vary. Some entries might have more comprehensive information than others.</li>
          <li><strong>Context is Key:</strong> Travel expenses should always be considered within the context of the traveler's role, the purpose of the travel, and the operational needs of the department. This dashboard provides the data; interpreting its significance requires understanding this broader context.</li>
          <li><strong>Amendments:</strong> The source data may be amended over time. This dashboard reflects the data as fetched at the time of its last update.</li>
          <li><strong>Currency:</strong> All monetary values are in Canadian Dollars (CAD).</li>
        </ul>
        <p className="leading-relaxed">
          This dashboard is an independent project and is not officially affiliated with the Government of Canada.
        </p>
      </section>
    </div>
  );
}