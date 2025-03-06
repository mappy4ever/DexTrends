import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import TravelExpenseChart from "../components/TravelExpenseChart";
import { FiDatabase } from "react-icons/fi";
import { AiOutlineBulb, AiOutlineRocket, AiOutlineThunderbolt, AiOutlineCloud, AiOutlineTeam } from "react-icons/ai";


export default function Portfolio() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll(".parallax-heading");
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const scrollAmount = Math.max(0, window.innerHeight - rect.top) * 0.04;
  
        heading.style.transform = `translateX(${scrollAmount}px)`; // Moves only to the right
        heading.style.opacity = Math.max(0.8, 1 - scrollAmount * 0.01); // Fades only to 50% opacity
      });
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title="Pake's Portfolio"
        subtitle="Showcasing Work in Business Intelligence"
        description="Explore my experience in data visualization, process automation, and transforming insights into impactful solutions."
        backgroundImage="/portfolio-hero.jpg"
      />

      <div className="max-w-5xl mx-auto py-4 md:py-20 px-4 space-y-14 mb-14">
        {/* My Approach to BI Solutions */}
        <div className="text-left space-y-4">
          <h1 className="heading-styling parallax-heading">
            Our Approach to BI Solutions
          </h1>
          <p className="body-styling max-w-7xl mx-auto leading-relaxed">
             Our work isn’t just about analyzing numbers—it’s about solving real business challenges with data-driven solutions. Explore how PakePoint Analytics has helped organizations optimize decision-making, automate processes, and uncover hidden insights through powerful business intelligence strategies.
          </p>

          <p className="body-styling max-w-7xl mx-auto leading-relaxed">
            Growing businesses need more than just reports—they need <strong>insights they can act on</strong>. That’s why we focus on three key areas:
          </p>

          <h2 className="subheading-styling max-w-5xl md:ml-4 inline-flex items-center">
            <FiDatabase size={36} className="mr-4" /> Data – The Foundation of Smarter Decisions
          </h2>
          <p className="body-styling max-w-5xl md:ml-4 mx-auto leading-relaxed">
            Data is only valuable when it’s accurate, secure, and actionable.
          </p>
          <ul className="list-disc list-inside max-w-5xl pl-4 md:pl-12 body-styling space-y-2">
            <li><strong>Robust Data Governance -</strong> Ensuring <strong>accuracy, security, and compliance</strong> (HIPA, PIPEDA).</li>
            <li><strong>Secure Cloud Solutions -</strong> Optimizing <strong>data storage & performance</strong> with Azure & GCP.</li>
            <li><strong>Advanced Analytics -</strong> Forecasting <strong>trends, risks, and opportunities</strong> before they happen.</li>
          </ul>

          <h2 className="subheading-styling md:ml-4 inline-flex items-center">
            <AiOutlineCloud size={36} className="mr-4" /> Technology – Powering Insights with Innovation</h2>
          <p className="body-styling max-w-7xl md:ml-4 mx-auto leading-relaxed">
            We leverage industry-leading tools to automate workflows and provide real-time visibility into business performance.
          </p>
          <ul className="list-disc list-inside max-w-5xl pl-4 md:pl-12 body-styling space-y-2">
            <li><strong>Custom Dashboards -</strong> Built with Power BI, Tableau, and web-based charting for real-time decision-making.</li>
            <li><strong>AI-Powered Automation -</strong> Eliminating <strong>manual work</strong> and <strong>speeding up decisions</strong>.</li>
            <li><strong>Cloud-Powered Scalability -</strong> Connecting <strong>your systems for seamless reporting & analysis</strong>.</li>
          </ul>

          <h2 className="subheading-styling md:ml-4 inline-flex items-center">
            <AiOutlineTeam size={36} className="mr-4" /> People – Empowering Teams to Use Data Effectively</h2>
          <p className="body-styling max-w-7xl md:ml-4 mx-auto leading-relaxed">
            Data solutions only succeed when teams are empowered to use them effectively.
          </p>
          <ul className="list-disc list-inside max-w-5xl pl-4 md:pl-12 body-styling space-y-2">
            <li><strong>Data Training & Adoption -</strong> Helping teams <strong>become data-driven</strong>.</li>
            <li><strong>Seamless Collaboration -</strong> Aligning <strong>business & technical users</strong> for better outcomes.</li>
            <li><strong>Ongoing Support -</strong> Embedding data-driven decision-making within organizations.</li>
          </ul>

        </div>
            
        <TravelExpenseChart />

      </div>
    </div>
  );
}
