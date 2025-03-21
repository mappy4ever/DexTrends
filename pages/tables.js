import { useState, useEffect, useRef } from "react";
import HeroSection from "../components/HeroSection";
import { 
  AiOutlineBarChart, 
  AiOutlineFundView, 
  AiOutlineFileDone, 
  AiOutlineDeploymentUnit, 
  AiFillFire,
  AiOutlineBulb 
} from "react-icons/ai";

export default function Services() {
  const biSolutionsRef = useRef(null);
  const dataStratRef = useRef(null);
  const projManRef = useRef(null);
  const cloudRef = useRef(null);
  const automationRef = useRef(null);

  const [isShrunk, setIsShrunk] = useState(false);
  const [lockedIndices, setLockedIndices] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsShrunk(true);
      } else {
        setIsShrunk(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle the locked state for a given service (by its serviceIndex) and item index
  const toggleLock = (serviceIndex, itemIndex) => {
    setLockedIndices((prev) => {
      // If the clicked section is already open for that service, close it; otherwise, open it.
      if (prev[serviceIndex] === itemIndex) {
        return { ...prev, [serviceIndex]: null };
      }
      return { ...prev, [serviceIndex]: itemIndex };
    });
  };

  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-fade-in");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll(".parallax-heading");
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const scrollAmount = Math.max(0, window.innerHeight - rect.top) * 0.04;
  
        heading.style.transform = `translateX(${scrollAmount}px)`; // Moves to the right
        heading.style.opacity = Math.max(0.8, 1 - scrollAmount * 0.01); // Fades to 80% opacity
      });
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const services = [
    {
      ref: biSolutionsRef,
      num: 1,
      icon: <AiOutlineBarChart />,
      title: "Business Intelligence & Analytics",
      image: "/bi-solutions.jpg",
      intro: "Turning raw data into powerful insights. We design intelligent, intuitive BI solutions that enable your team to make data-driven decisions with confidence.",
      content: [
        {
          heading: "Custom Dashboard Development & Optimization",
          text: "Transform your data into visually compelling, interactive dashboards with Power BI and Tableau. Our customized solutions help stakeholders track performance, identify trends, and make informed business decisions effortlessly.",
        },
        {
          heading: "Predictive Analytics & Trend Forecasting",
          text: "Stay ahead of the curve with data-driven predictions. Using advanced analytics, we help businesses anticipate market trends and make proactive decisions that align with their goals.",
        },
        {
          heading: "Self-Service BI Enablement",
          text: "Empower your teams to access the data they need, when they need it. We provide intuitive, user-friendly reporting solutions that encourage data-driven decision-making across all levels of your organization.",
        },
      ],
    },
    {
      ref: dataStratRef,
      num: 2,
      icon: <AiOutlineDeploymentUnit />,
      title: "Data Strategy & Governance",
      image: "/data-strat.jpg",
      intro: "Securing, structuring, and managing your most valuable asset—data. A strong data strategy ensures compliance, security, and reliability while enabling scalability and efficiency.",
      content: [
        {
          heading: "Data Governance Framework Implementation",
          text: "Establish strong data governance policies tailored to your industry. We help organizations meet regulatory requirements, ensuring data quality, security, and consistency."
        },
        {
          heading: "Data Security & Compliance Audits",
          text: "Our audit processes help identify vulnerabilities and ensure alignment with critical regulations such as HIPA, PHIPA, and GDPR, safeguarding your organization from potential risks.",
        },
        {
          heading: "Master Data Management (MDM)",
          text: "Centralize your critical business data to improve accuracy and accessibility across departments, creating a single source of truth for better decision-making.",
        },
      ],
    },
    {
      ref: projManRef,
      num: 3,
      icon: <AiOutlineFundView />,
      title: "Project Management for Data Initiatives",
      image: "/project-management.jpg",
      intro: "Seamless execution of BI and data projects from concept to completion. We align stakeholders, reduce risk, and ensure timely, impactful project rollouts.",
      content: [
        {
          heading: "Agile Project Execution for BI Solutions",
          text: "Delivering data projects with agility and precision. Our PMP-certified project management expertise ensures your BI initiatives stay on track and align with strategic goals.",
        },
        {
          heading: "Stakeholder Collaboration & Requirement Analysis",
          text: "Engaging key stakeholders to gather comprehensive business requirements and bridge the gap between technical teams and executive leadership.",
        },
        {
          heading: "Risk Management in Data Projects",
          text: "Identifying and mitigating risks related to cloud migrations, data platform transitions, and compliance challenges.",
        },
      ],
    },
    {
      ref: cloudRef,
      num: 4,
      icon: <AiOutlineFileDone />,
      title: "Cloud Data Engineering & Migration",
      image: "/cloud.jpg",
      intro: "Scalable, secure, and seamless cloud transformations. Modernize your infrastructure and migrate to cloud platforms like Azure & GCP with confidence.",
      content: [
        {
          heading: "Cloud Transition Strategy (Azure & GCP)",
          text: "Future-proof your business with expert cloud migration strategies that ensure minimal downtime and operational continuity across platforms.",
        },
        {
          heading: "ETL Pipeline Optimization",
          text: "Improve your data flow with robust ETL solutions, enhancing data quality and reducing reporting time.",
        },
        {
          heading: "Cost Optimization Strategies",
          text: "Maximize cost efficiency without compromising on performance by implementing the right cloud solutions tailored to your business needs.",
        },
      ],
    },
    {
      ref: automationRef,
      num: 5,
      icon: <AiFillFire />,
      title: "Workflow Automation & Process Optimization",
      image: "/automation.jpg",
      intro: "Eliminate inefficiencies and boost productivity with automation. We integrate AI-powered and automated solutions to streamline operations, saving you time and resources.",
      content: [
        {
          heading: "Process Automation with Power Automate & Python",
          text: "Automate repetitive tasks to free up valuable resources and improve operational efficiency across all business functions.",
        },
        {
          heading: "AI-Powered Decision Support Systems",
          text: "Harness AI-driven insights to make smarter, faster business decisions without the guesswork.",
        },
        {
          heading: "End-to-End Integration Solutions",
          text: "Eliminate silos and unify your business systems with seamless integrations across Microsoft, Google, and custom cloud platforms.",
        },
      ],
    },
  ];

  return (
    <div>
      <HeroSection
        title="Our Services"
        subtitle="Transforming Data into Actionable Insights"
        description="Explore our data-driven services to empower your business."
        backgroundImage="/services-hero.jpg"
      />

      {/* Navigation Buttons */}
      <div
        className={`sticky top-16 py-4 z-10 text-center transition-all duration-300 transform ${
          isShrunk ? "scale-75 opacity-20" : "scale-100 opacity-100"
        } hover:opacity-100`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4">
          {[
            { ref: biSolutionsRef, icon: <AiOutlineBarChart size={20} />, label: "BI Solutions" },
            { ref: dataStratRef, icon: <AiOutlineDeploymentUnit size={20} />, label: "Data Strategy" },
            { ref: projManRef, icon: <AiOutlineFundView size={20} />, label: "Project Management" },
            { ref: cloudRef, icon: <AiOutlineFileDone size={20} />, label: "Cloud Migration" },
            { ref: automationRef, icon: <AiFillFire size={20} />, label: "Process Automation" },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(item.ref)}
              className="btn-secondary font-semibold px-4 py-2"
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Service Sections */}
      <div className="max-w-7xl mx-auto p-2 md:py-12 space-y-4 md:space-y-12 h-full">
        <p className="body-styling text-lg md:text-xl lg:text-2xl text-center max-w-5xl mx-auto">
          Your business needs more than just data—it needs clarity, strategy, and execution. We provide tailored business intelligence solutions designed to unlock growth, enhance efficiency, and drive smarter decisions.
        </p>
        <p className="body-styling text-center max-w-3xl mx-auto flex items-center gap-2">
          <AiOutlineBulb size={48}/> From advanced analytics to cloud migration, we ensure your data works for you—securely, efficiently, and powerfully.
        </p>
{services.map((service, sIndex) => (
  <div key={service.title} ref={service.ref} className="scroll-fade-in">
    <div className={`relative flex flex-col md:flex-row h-full items-center gap-4 md:gap-12 ${service.num % 2 !== 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
      
      {/* Image Section (Behind Title on Small Screens, Normal on Larger Screens) */}
	  <div className="w-full md:w-1/2 relative">
	  <img
	 	 src={service.image}
	 	 alt={service.title}
	 	 className="w-full h-[125px] md:h-full object-cover opacity-70 md:opacity-100 rounded-t-2xl md:rounded-2xl md:shadow-2xl"
	  />
	  {/* Icon Overlay on Small Screens */}
      <div className="absolute inset-0 flex items-center justify-center md:hidden">
        <span className="text-5xl bg-background text-button p-2 rounded-xl text-center flex items-center gap-2 relative z-20">{service.icon}</span>
      </div>
	  {/* Gradient Overlay on Small Screens*/}
	  <div className="absolute bottom-0 left-0 z-10 w-full h-2/3 bg-gradient-to-b from-transparent to-[--color-background] md:hidden pointer-events-none"></div>
	  <div className="absolute bottom-0 left-0 z-10 w-full h-1/3 bg-gradient-to-b from-transparent to-[--color-background] md:hidden pointer-events-none"></div>
	  </div>
	  

      {/* Text Content */}
	  <div className="relative w-full md:w-1/2 flex flex-col justify-center h-full z-10">
	    {/* Semi-transparent background with padding */}
	    <div className="p-4 bg-[rgba(255,251,247,0.7)] dark:bg-[rgba(19,16,10,0.7)] rounded-2xl md:bg-transparent">
	  	  <h2 className="subheading-styling md:parallax-heading text-center">
	  	  {service.title}
	  	  </h2>
	  	  <p className="body-styling mt-2 mb-2 relative z-20">{service.intro}</p>
	  	  <div className="space-y-6 relative z-20">
	  	  {service.content.map((item, index) => (
	  	 	 <div key={index} className="group border-b border-text-subheading">
	  	 	 <button 
	  	 		 className="text-left w-full body-styling font-semibold py-3 focus:outline-none transition-colors ease-in-out duration-500"
	  	 		 onClick={() => toggleLock(sIndex, index)}
	  	 	 >
	  	 		 {item.heading}
	  	 	 </button>
	  	 	 <div 
	  	 		 className={`overflow-hidden transition-all duration-500 ease-in-out ${
	  	 		 lockedIndices[sIndex] === index ? "max-h-screen" : "group-hover:max-h-screen max-h-0"
	  	 		 }`}
	  	 	 >
	  	 		 <p className="body-styling mt-2">{item.text}</p>
	  	 	 </div>
	  	 	 </div>
	  	  ))}
	  	  </div>
	    </div>
	  </div>
    </div>
  </div>
))}


      </div>
    </div>
  );
}
