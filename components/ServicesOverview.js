import Link from "next/link";
import { AiOutlineBarChart, AiOutlineDeploymentUnit, AiOutlineFileDone, AiFillFire, AiOutlineStock } from "react-icons/ai";
import { VscRocket } from "react-icons/vsc";

const services = [
  {
    icon: <AiOutlineBarChart size={48} />,
    title: "Business Intelligence & Analytics",
    description: (
      <>
        <p className="font-semibold">Smarter Decisions, Faster Growth</p>
        <ul className="list-disc ml-5 mt-2">
          <li>Custom Dashboards – Real-time insights.</li>
          <li>Predictive Analytics – Spot opportunities early.</li>
          <li>Self-Service BI – Empower your team.</li>
        </ul>
        <p className="mt-2 hover:text-text-highlightHover">Explore Analytics Solutions →</p>
      </>
    ),
    link: "/services#business-intelligence",
    image: "/bi-overview.jpg",
  },
  {
    icon: <AiOutlineDeploymentUnit size={48} />,
    title: "Data Strategy & Governance",
    description: (
      <>
        <p className="font-semibold">Trust Your Data, Stay Compliant</p>
        <ul className="list-disc ml-5 mt-2">
          <li>Data Security – Protect and standardize.</li>
          <li>Data Organization – Eliminate duplicates.</li>
          <li>Master Data – Keep info structured.</li>
        </ul>
        <p className="mt-2 hover:text-text-highlightHover">See How We Manage Data →</p>
      </>
    ),
    link: "/services#data-strategy",
    image: "/datagov-overview.jpg",
  },
  {
    icon: <AiOutlineFileDone size={48} />,
    title: "Project Management & Strategy",
    description: (
      <>
        <p className="font-semibold">Strategic Execution, Real Results</p>
        <ul className="list-disc ml-5 mt-2">
          <li>Clear Roadmapping – Actionable plans.</li>
          <li>Agile Leadership – On-time, on-budget delivery.</li>
          <li>Risk & Alignment – Mitigate challenges.</li>
        </ul>
        <p className="mt-2 hover:text-text-highlightHover">Discover Our Expertise →</p>
      </>
    ),
    link: "/services#project-management",
    image: "/pm-overview.jpg",
  },
  {
    icon: <AiOutlineFileDone size={48} />,
    title: "Cloud Migration & Data Engineering",
    description: (
      <>
        <p className="font-semibold">Scale Without Limits</p>
        <ul className="list-disc ml-5 mt-2">
          <li>Seamless Cloud Transition – Minimal disruption.</li>
          <li>Optimized ETL – Accelerate processing.</li>
          <li>Cost Efficiency – Maximize performance.</li>
        </ul>
        <p className="mt-2 hover:text-text-highlightHover">Learn More About Cloud Solutions →</p>
      </>
    ),
    link: "/services#cloud-data",
    image: "/cloud-migration.jpg",
  },
  {
    icon: <AiFillFire size={48} />,
    title: "Workflow Automation & AI-Powered Insights",
    description: (
      <>
        <p className="font-semibold">Boost Productivity & Innovate</p>
        <ul className="list-disc ml-5 mt-2">
          <li>Automated Reporting – Real-time insights.</li>
          <li>AI Decision Support – Smarter strategies.</li>
          <li>Integrated Processes – Seamless connectivity.</li>
        </ul>
        <p className="mt-2 hover:text-text-highlightHover">Discover Automation Benefits →</p>
      </>
    ),
    link: "/services#process-automation",
    image: "/process-automation.jpg",
  },
];

export default function ServicesOverview() {
  return (
    <div className="max-w-7xl mx-auto py-4 md:py-20 px-6">
      <h2 className="heading-styling parallax-heading text-left py-4 mb-2 md:mb-8 inline-flex items-center gap-3">
        <VscRocket size={60} /> How We Help Businesses Grow
      </h2>
      <p className="body-styling text-center max-w-4xl mx-auto py-4 mb-2 md:mb-16">
        PakePoint crafts data-driven strategies that align with your business goals, offering scalable solutions that bring measurable impact.
      </p>

      <div className="space-y-12">
        {services.map((service, index) => {
          const isEven = index % 2 === 0;
          return (
            <Link key={index} href={service.link} passHref>
              <div className="relative group mb-6 md:mb-12 flex items-center min-h-[350px] overflow-hidden">
                {isEven ? (
                  <>
                    {/* Text Container (left) */}
                    <div className="absolute left-0 md:w-2/3 lg:w-1/2 z-10 p-8 flex flex-col justify-center bg-[rgba(255,251,247,0.8)] dark:bg-[rgba(19,16,10,0.8)] rounded-3xl transform transition-transform hover:-translate-y-1">
                      <h3 className="subheading-styling hover:text-text-highlightHover inline-flex items-center gap-3">{service.icon}{service.title}</h3>
                      <div className="body-styling">{service.description}</div>
                    </div>
                    {/* Image Container (right) */}
                    <div className="absolute right-0 w-2/3 h-full overflow-hidden">
                      <img 
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover rounded-3xl" />
                      <div className="absolute top-0 left-0 h-full w-[24rem] bg-gradient-to-r from-background to-transparent"></div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Image Container (left) */}
                    <div className="absolute left-0 w-2/3 h-full">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover rounded-3xl"
                      />
                      <div className="absolute top-0 right-0 h-full w-[24rem] bg-gradient-to-l from-background to-transparent"></div>
                    </div>
                    {/* Text Container (right) */}
                    <div className="absolute right-0 md:2/3 lg:w-1/2 z-10 p-8 flex flex-col justify-center bg-[rgba(255,251,247,0.8)] dark:bg-[rgba(19,16,10,0.8)] rounded-3xl transform transition-transform hover:-translate-y-1">
                      <h3 className="subheading-styling hover:text-text-highlightHover inline-flex items-center gap-3">{service.icon}{service.title}</h3>
                      <div className="body-styling">{service.description}</div>
                    </div>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
