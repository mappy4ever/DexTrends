// components/DashboardAbout.js
import { VscGlobe, VscServerProcess, VscBeaker, VscWarning } from "react-icons/vsc"; // VscGithubInverted, VscLinkExternal removed as unused
import { FaCanadianMapleLeaf } from "react-icons/fa";
// Link from next/link is not used directly in this component, assuming it's for the parent page or other links.

export default function DashboardAbout() { // Renamed from AboutPage to DashboardAbout for clarity as a component
  const dataSetUrl = "https://open.canada.ca/data/en/dataset/009f9a49-c2d9-4d29-a6d4-1a228da335ce";

  return (
    // Removed max-w-4xl, mx-auto, py-8 etc. as these should be on the page layout (about.js)
    // text-slate-700 dark:text-slate-300 removed, will rely on body text color (text-foreground)
    <div>
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center gap-x-3 mb-4">
          <FaCanadianMapleLeaf size={50} className="text-red-600 dark:text-red-500" />
          <h1 className="text-page-heading !mb-0"> {/* Use .text-page-heading, remove its margin for this context */}
            About This Dashboard
          </h1>
        </div>
        <p className="mt-2 text-lg md:text-xl text-foreground-muted">
          Understanding Canadian Federal Government Travel Expenses.
        </p>
      </header>

      <section className="card card-padding-default mb-12"> {/* Use .card and .card-padding-default */}
        <h2 className="flex items-center gap-x-3 text-section-heading mb-4"> {/* Use .text-section-heading */}
          <VscGlobe size={30} className="text-primary" /> Data Source & Purpose
        </h2>
        <div className="space-y-3 text-content-default"> {/* Use .text-content-default for paragraphs */}
          <p>
            This interactive dashboard visualizes travel expenses incurred by the Government of Canada. The data is sourced directly from the official{" "}
            <a
              href={dataSetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-link" // Use .btn-link for styled links
            >
              Proactive Disclosure of Travel Expenses dataset
            </a>
            {" "}on the Government of Canada's Open Data Portal.
          </p>
          <p>
            The primary purpose of this tool is to provide a transparent and accessible way for the public, researchers, and journalists to explore how public funds are allocated for travel across various federal departments, by different officials, and over time. By presenting this data in an interactive format, we aim to foster greater understanding and accountability.
          </p>
          <p>
            The data typically includes details such as the purpose of travel, mode of transport, accommodation costs, meal allowances, and other associated expenses. This dashboard aggregates and visualizes this information to reveal trends, patterns, and significant expenditures.
          </p>
        </div>
      </section>

      <section className="card card-padding-default mb-12">
        <h2 className="flex items-center gap-x-3 text-section-heading mb-4">
          <VscServerProcess size={30} className="text-primary" /> Data Processing & Presentation
        </h2>
        <div className="space-y-3 text-content-default">
          <p>
            The raw data from the Open Data Portal undergoes processing to ensure consistency, handle variations in naming, and structure it for effective visualization. This includes:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Cleaning and standardizing department names, traveler titles, and travel purposes.</li>
            <li>Geocoding destination data for map visualizations (where possible).</li>
            <li>Aggregating monthly totals and creating summaries for key performance indicators (KPIs).</li>
          </ul>
          <p>
            Visualizations are created using ECharts and Leaflet maps to provide various perspectives on the data, from high-level dashboard summaries to detailed breakdowns by organization and individual. Data is typically updated based on the release schedule of the official dataset.
          </p>
          <p className="mt-3">
            Data is current as of: <span className="font-semibold text-text-heading">May 2024</span>. {/* Maintain dynamic/manual update value */}
          </p>
        </div>
      </section>

      <section className="card card-padding-default mb-12">
        <h2 className="flex items-center gap-x-3 text-section-heading mb-4">
          <VscBeaker size={30} className="text-primary" /> How to Interpret the Data
        </h2>
        <div className="space-y-3 text-content-default">
          <p>
            When exploring the dashboard, consider the following:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li><strong>Trends Over Time:</strong> Look for patterns in spending across different months or years. Seasonal variations or significant events might influence these trends.</li>
            <li><strong>Departmental Spending:</strong> Compare spending across different government organizations. Note that department size and mandate heavily influence travel needs.</li>
            <li><strong>Individual Expenses:</strong> The "People" section allows for viewing expenses by specific individuals (e.g., Ministers). Context, such as the individual's role and responsibilities, is important.</li>
            <li><strong>Purpose of Travel:</strong> The data usually specifies the purpose of travel (e.g., meetings, conferences, international delegations), which helps understand the necessity of the expenditure.</li>
            <li><strong>Geographical Data:</strong> The map visualization shows travel destinations, offering insights into where travel is concentrated.</li>
          </ul>
          <p>
            Use the filters at the top of each page (Date Range, Organization, Title, Person) to narrow down the data and focus on specific areas of interest.
          </p>
        </div>
      </section>

      <section className="card card-padding-default"> {/* Removed mb-12 for the last section */}
        <h2 className="flex items-center gap-x-3 text-section-heading mb-4">
          <VscWarning size={30} className="text-primary" /> Limitations & Considerations
        </h2>
        <div className="space-y-3 text-content-default">
          <p>
            While this tool aims for accuracy and transparency, users should be aware of potential limitations:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li><strong>Data Accuracy:</strong> The visualizations are based on the data provided by the Government of Canada. Any inaccuracies or omissions in the source data will be reflected here.</li>
            <li><strong>Reporting Lags:</strong> There might be a delay between when expenses are incurred and when they are reported and published in the open data portal.</li>
            <li><strong>Data Granularity:</strong> The level of detail can vary. Some entries might have more comprehensive information than others.</li>
            <li><strong>Context is Key:</strong> Travel expenses should always be considered within the context of the traveler's role, the purpose of the travel, and the operational needs of the department. This dashboard provides the data; interpreting its significance requires understanding this broader context.</li>
            <li><strong>Amendments:</strong> The source data may be amended over time. This dashboard reflects the data as fetched at the time of its last update.</li>
            <li><strong>Currency:</strong> All monetary values are in Canadian Dollars (CAD).</li>
          </ul>
          <p>
            This dashboard is an independent project and is not officially affiliated with the Government of Canada.
          </p>
        </div>
      </section>
    </div>
  );
}