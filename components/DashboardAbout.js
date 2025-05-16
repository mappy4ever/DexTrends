// components/DashboardAbout.js
import { VscGlobe, VscServerProcess, VscBeaker, VscWarning, VscLaw, VscCommentDiscussion } from "react-icons/vsc";
import { FaCanadianMapleLeaf, FaBalanceScale } from "react-icons/fa";


export default function DashboardAbout() { 
  const dataSetUrl = "https://open.canada.ca/data/en/dataset/009f9a49-c2d9-4d29-a6d4-1a228da335ce";

  return (
    <div>
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center gap-x-3 mb-4">
          <FaCanadianMapleLeaf size={50} className="text-red-600 dark:text-red-500" />
          <h1 className="text-page-heading !mb-0">
            About The Project
          </h1>
        </div>
        <p className="mt-2 text-lg md:text-xl text-foreground-muted">
          An Open Look at Canadian Federal Government Travel Expenses.
        </p>
      </header>

      <section className="card card-padding-default mb-8">
        <h2 className="flex items-center gap-x-3 text-section-heading mb-4">
          <FaBalanceScale size={28} className="text-primary dark:text-primary-dark" /> Our Mission
        </h2>
        <div className="space-y-3 text-content-default dark:text-slate-300">
          <p>
            OnOurDime was created to provide an accessible and user-friendly tool for exploring Canadian federal government travel expenses. Often, this type of data is published in spreadsheets or on less accessible government websites. Our aim is to transform this public data into clear, interactive visualizations.
          </p>
          <p>
            We believe that government investments, made with taxpayer money on behalf of citizens, should be understandable and accessible. By presenting this travel expense data clearly, we hope to promote greater public interest in government spending and contribute to a more informed civic discourse on accountability. This platform is intended as a resource for citizens, journalists, and researchers alike.
          </p>
        </div>
      </section>
	  
      <section className="card card-padding-default mb-8">
        <h2 className="flex items-center gap-x-3 text-section-heading mb-4">
          <VscGlobe size={30} className="text-primary" /> Data Source
        </h2>
        <div className="space-y-3 text-content-default dark:text-slate-300">
          <p>
            All visualizations on this platform are based on data from the official{" "}
            <a href={dataSetUrl} target="_blank" rel="noopener noreferrer" className="btn-link">
              Proactive Disclosure of Travel Expenses dataset
            </a>
            {" "}published by the Government of Canada on its Open Data Portal. This is publicly available information.
          </p>
          <p>
            The data typically includes details on the traveler, department, purpose of travel, destination, dates, and costs broken down by categories like airfare, accommodation, meals, and other expenses.
          </p>
           <p className="mt-3 text-sm">
            Last checked for updates: <span className="font-semibold">May 13, 2025</span>.
            Data itself reflects the period covered by the government's publications.
          </p>
        </div>
      </section>

      <section className="card card-padding-default mb-8">
        <h2 className="flex items-center gap-x-3 text-section-heading mb-4">
          <VscServerProcess size={30} className="text-primary" /> Data Processing & Cleaning
        </h2>
        <div className="space-y-3 text-content-default dark:text-slate-300">
          <p>
            To enhance usability and consistency for analysis, the raw data undergoes some automated processing:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li><strong>Text Normalization:</strong> Fields like department names, traveler titles, and names are standardized (e.g., trimming whitespace, consistent casing) to improve aggregation and filtering. For example, "Minister of X" and "MINISTER OF X" would be treated as the same title.</li>
            <li><strong>Name Cleaning:</strong> Traveler names are processed to improve consistency. This may involve removing honorifics for grouping or attempting to standardize formats. The original disclosed name is always the ultimate reference.</li>
            <li><strong>Destination Parsing:</strong> Destination information, often provided as free text (e.g., "Paris, France" or "Paris (France)"), is parsed to identify cities and countries for geographical mapping.
                <ul className="list-disc list-inside text-sm space-y-1 pl-5 mt-1 mb-2">
                    <li>Due to variations and potential spelling errors in the source data, not all destinations can be parsed with 100% accuracy.</li>
                    <li>When a destination cannot be reliably geocoded, it will not appear on the map. The original destination text from the source data is retained and can be seen in detailed views where applicable for full transparency.</li>
                </ul>
            </li>
          </ul>
          <p>Our processing aims to make the data more explorable while striving to maintain the integrity of the original information.</p>
        </div>
      </section>

      <section className="card card-padding-default mb-8">
        <h2 className="flex items-center gap-x-3 text-section-heading mb-4">
          <VscBeaker size={30} className="text-primary" /> Interpreting the Information
        </h2>
        <div className="space-y-3 text-content-default">
          <p>This dashboard is a tool for exploration. When viewing the data, remember:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Travel is a necessary function of government. Expenses should be viewed in the context of a department's mandate or an official's responsibilities.</li>
            <li>Use the provided filters (dates, departments, etc.) to focus your analysis.</li>
            <li>Compare trends over time rather than isolated figures where possible.</li>
          </ul>
          <p>For more questions, please see our FAQ below.</p>
        </div>
      </section>

      <section className="card card-padding-default">
        <h2 className="flex items-center gap-x-3 text-section-heading mb-4">
          <VscWarning size={30} className="text-primary" /> Data Limitations
        </h2>
        <div className="space-y-3 text-content-default">
          <p>
            While we strive for accuracy, the visualizations reflect the data as published by the Government of Canada. Users should be aware of:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li><strong>Source Data Accuracy:</strong> Any errors or omissions in the original dataset will be reflected here.</li>
            <li><strong>Reporting Timeliness:</strong> There can be a lag between when travel occurs and when it's publicly disclosed.</li>
            <li><strong>Data Granularity & Amendments:</strong> The level of detail can vary, and the source data may be amended over time. This dashboard is updated periodically from the source.</li>
            <li><strong>Currency:</strong> All monetary values are in Canadian Dollars (CAD).</li>
          </ul>
          <p>
            OnOurDime is an independent project and is not affiliated with or endorsed by the Government of Canada.
          </p>
        </div>
      </section>
    </div>
  );
}