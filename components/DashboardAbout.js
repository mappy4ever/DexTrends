import { VscMapFilled, VscTools } from "react-icons/vsc";

export default function DashboardAbout() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Canadian Federal Travel Expenses */}
      <div className="text-left">
        <h1 className="heading-styling parallax-heading text-3xl md:text-4xl flex items-center gap-3">
          <VscMapFilled size={60}/> Canadian Federal Travel Expenses
        </h1>

        <h2 className="subheading-styling max-w-7xl mx-auto text-center">
            How are public funds being allocated for travel?
        </h2>
      
        <p className="body-styling max-w-7xl mx-auto leading-relaxed">
          This interactive dashboard tracks federal travel spending across departments, using data from the{" "}
          <a
            href="https://open.canada.ca/data/en/dataset/009f9a49-c2d9-4d29-a6d4-1a228da335ce"
            target="_blank"
            rel="noopener noreferrer"
            className="text-button hover:text-button-hover font-semibold transition-colors"
          >
            Government of Canada's Open Data Portal.
          </a>
          {" "}Designed to increase transparency, optimize budgeting, and identify trends, this project showcases our expertise in:
        </p>
        <ul className="list-disc list-inside body-styling leading-relaxed mt-4 mb-8 ml-6">
          <li><strong>Data Engineering & Automation -</strong> Built on a serverless Python backend for real-time data updates.</li>
          <li><strong>Advanced Visualization -</strong> Interactive charts powered by Next.js & Apache ECharts.</li>
          <li><strong>Actionable Insights -</strong> Drill-down analytics to explore expenses at a granular level.</li>
          <li><strong>User-Friendly Navigation -</strong> Simple toggles to filter spending by category (airfare, lodging, meals, etc.).</li>
        </ul>
      </div>

      {/* How to Use This Dashboard */}
      <div className="card border-l-0 hover:scale-100 max-w-5xl mb-8 mx-auto">
        <h2 className="subheading-styling mb-4 flex items-center gap-3"><VscTools size={36}/> How to Use</h2>
        <ul className="list-disc list-inside body-styling text-base space-y-2">
          <li>
            <strong>Filter by Organization:</strong> Who's spending the most? Analyze individual federal department spending.
          </li>
          <li>
            <strong>Interactive Charts:</strong> Where did the money go? Hover over data to reveal detailed insights.
          </li>
          <li>
            <strong>Customize Your View:</strong> Toggle categories such as airfare, lodging, or meals by clicking the chart legend.
          </li>
          <li>
            <strong>Zoom & Pan:</strong> Use the chart controls to explore data over different time periods.
          </li>
        </ul>
      </div>
    </div>
  );
}
