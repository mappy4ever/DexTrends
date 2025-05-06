import DashboardAbout from "../components/DashboardAbout";
import FAQ from "../components/FAQ";

export default function About() {
  return (
    <div>

      <div className="max-w-7xl mx-auto p2-2 md:px-4 py-4 md:py-12 space-y-12">
        
		<DashboardAbout />
        <FAQ />
		
      </div>
    </div>
  );
}
