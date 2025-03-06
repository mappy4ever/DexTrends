import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import ServicesOverview from "../components/ServicesOverview";
import { AiOutlineBulb, AiOutlineRocket, AiOutlineThunderbolt, AiOutlineBarChart, AiOutlineFundView, AiOutlineFileDone, AiOutlineSetting, AiOutlineGlobal, AiOutlineSketch, AiOutlineCheckCircle, AiOutlineCloud, AiOutlineTeam } from "react-icons/ai";
import { FaBuildingColumns } from "react-icons/fa6";
import { FiDatabase } from "react-icons/fi";
import { VscRocket, VscRobot } from "react-icons/vsc";

export default function Home() {
  const [offset, setOffset] = useState(0);

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
        heading.style.opacity = Math.max(0.8, 1 - scrollAmount * 0.01); // Fades to XX% opacity
      });
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <HeroSection
        title="Turning Data into Strategy"
        subtitle="Empowering Your Business with Intelligent Insights"
        description="Bridging data, technology, and strategy to help businesses unlock their full potential."
        backgroundImage="/index-hero.jpg"
      />

      <section className="py-4 md:py-12 px-6 bg-background dark:bg-background-dark transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-styling ml-0 md:parallax-heading">
            Your Data. Your Vision. Our Expertise.
          </h2>
          <p className="body-styling max-w-5xl mx-auto">
            In a world where data drives success, we don’t just analyze numbers—we unlock opportunities. Our mission is simple: to empower businesses with actionable intelligence, bridging the gap between technology, strategy, and real-world impact.
          </p>
          <p className="body-styling mt-4 md:mt-8 mb-6 md:mb-10 max-w-3xl mx-auto flex items-center gap-3">
            <AiOutlineBulb size={48}/>
            From business intelligence to automation, cloud migration, and analytics, we ensure your data works for you—not the other way around.
          </p>
          <h3 className="subheading-styling parallax-heading flex items-center gap-2">
            <VscRocket /> Why Choose Us?
          </h3>
          <p className="body-styling py-2 md:py-4">
            We approach every project with the same dedication as if it were our own business. From high-level strategy to hands-on execution, we craft cost-effective, results-driven solutions tailored to your unique needs.
          </p>
          <ul className="list-disc list-inside body-styling mt-2 ml-6 space-y-2">
            <li className="flex items-start gap-3">
              <AiOutlineCheckCircle size={48}/>
              <div>
                <strong>Industry-Leading Expertise. </strong>
                No jargon, just clear, real-world solutions that help you grow.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <AiOutlineCheckCircle size={48}/>
              <div>
                <strong>We Work as Partners. </strong>
                Data isn’t just numbers...it’s your roadmap to scalability, efficiency, and success.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <AiOutlineCheckCircle size={48}/>
              <div>
                <strong>Cost-Effective, Scalable Solutions. </strong>
                Your success is our success, and we build solutions with your business in mind.
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-4 md:py-12 px-6 space-y-12">
        <div className="flex flex-col md:flex-row items-center gap-12 scroll-fade-in">
          <div className="w-full md:w-1/2">
            <img
              src="/bi-matters.jpg"
              alt="Harness Your Data"
              className="rounded-lg object-cover shadow-lg transition-transform duration-500 ease-in-out transform hover:scale-105 h-[225px] md:h-full w-full max-w-lg mx-auto"
            />
          </div>
          <div className="max-w-xl space-y-4">
            <h3 className="subheading-styling flex items-center gap-2">
              <VscRobot size={48} /> Harness the Full Potential of Your Data
            </h3>
            <p className="body-styling">
               Data is more than just information—it’s the foundation of every decision that shapes the future of your business. But raw data alone isn’t enough. You need clarity, automation, and strategy to turn insights into action.
            </p>
            <p className="body-styling">
               We help businesses navigate complex data landscapes, eliminate inefficiencies, and optimize decision-making through tailored BI solutions. Whether you're scaling operations, improving reporting, or migrating to the cloud, our expertise ensures you stay ahead of the curve.
            </p>
            <h3 className="subheading-styling">
              The Power of BI
            </h3>
            <ul className="list-inside body-styling mt-2 ml-4 space-y-4">
              <li className="flex items-start gap-3">
                <AiOutlineGlobal size={48} />
                <div>
                  <strong>Make Smarter, Data-Driven Decisions. </strong>
                  Move beyond gut instincts with analytics-driven strategy.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AiOutlineSetting size={48} />
                <div>
                  <strong>Enhance Efficiency & Automation. </strong>
                  Streamline processes to maximize productivity and reduce manual effort.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AiOutlineSketch size={48} />
                <div>
                  <strong>Seamless Integration Across Teams. </strong>
                  Foster collaboration through intuitive dashboards and real-time insights.
                </div>
              </li>
            </ul>
          </div>
        </div>

        <section className="w-full px-4 space-y-6 text-center">
          <h3 className="subheading-styling parallax-heading text-3xl md:text-4xl flex items-center gap-3"> 
            <FaBuildingColumns size={48} /> Our Approach: 3 Pillars of BI Success
          </h3>
          <p className="body-styling">
            Our proven approach is built on three key pillars that drive results and help organizations leverage data effectively.
          </p>
        </section>

        <div className="flex flex-col md:flex-row-reverse items-center gap-4 md:gap-12 scroll-fade-in">
          <div className="w-full md:w-1/2">
            <img
              src="/three-pillars.jpg"
              alt="Our 3 Pillars of BI Success"
              className="rounded-lg object-cover shadow-lg transition-transform duration-500 ease-in-out transform hover:scale-105 h-[225px] md:h-full w-full max-w-lg mx-auto"
            />
          </div>
          <div className="max-w-xl">

            <div className="mt-4 md:mt-8 space-y-6">
              <div>
                <h4 className="subheading-styling inline-flex items-center">
                  <FiDatabase size={36} className="mr-4" /> Data: Foundation of Strategy
                </h4>
                <p className="body-styling mt-2">
                  Your business is only as strong as the data driving it. We ensure your data is accurate, secure, and actionable.
                </p>
                <ul className="list-inside body-styling mt-4 ml-4 space-y-2 md:space-y-4">
                  <li><strong>Robust Data Governance -</strong> Compliance with HIPA, PIPEDA, and industry best practices.</li>
                  <li><strong>Secure Cloud Solutions -</strong> Expertise in Azure, GCP, and scalable infrastructure.</li>
                  <li><strong>Advanced Analytics -</strong> Predict trends and uncover opportunities before your competitors.</li>
                </ul>
              </div>

              <div>
                <h4 className="subheading-styling inline-flex items-center">
                  <AiOutlineCloud size={36} className="mr-4" /> Technology: Powering Your Insights
                </h4>
                <p className="body-styling mt-2">
                  Transform complex data into meaningful insights with cutting-edge BI tools.
                </p>
                <ul className="list-inside body-styling mt-4 ml-4 space-y-2 md:space-y-4">
                  <li><strong>Interactive Dashboards -</strong> Power BI, Tableau, and Apache Echarts for real-time decision-making.</li>
                  <li><strong>Scalable Cloud Solutions -</strong> Efficient storage, processing, and analysis in the cloud.</li>
                  <li><strong>Workflow Automation -</strong> Reduce manual processes and streamline business operations.</li>
                </ul>
              </div>

              <div>
                <h4 className="subheading-styling inline-flex items-center">
                  <AiOutlineTeam size={36} className="mr-2 text-xl" /> People: Enabling Data-Driven Cultures
                </h4>
                <p className="body-styling mt-2">
                  Data alone isn’t enough—it must be accessible, understandable, and actionable for your team.
                </p>
                <ul className="list-inside body-styling mt-4 ml-4 space-y-2 md:space-y-4">
                  <li><strong>Training & Upskilling -</strong> Build data literacy and empower employees at every level.</li>
                  <li><strong>Seamless Collaboration -</strong> Break down silos between teams with centralized, intuitive tools.</li>
                  <li><strong>Ongoing Support -</strong> We’re with you every step of the way, ensuring long-term success.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12 scroll-fade-in">
          <div className="w-full md:w-1/2">
            <img
              src="/process.jpg"
              alt="Our Process"
              className="rounded-lg object-cover shadow-lg transition-transform duration-500 ease-in-out transform hover:scale-105 h-[225px] md:h-full w-full max-w-lg mx-auto"
            />
          </div>
          <div className="max-w-xl">
            <h3 className="subheading-styling flex items-center gap-3">
              <AiOutlineFileDone size={36}/> Our Process: Vision to Value
            </h3>
            <p className="body-styling">
              We take a structured, collaborative approach to business intelligence, ensuring your investment delivers meaningful business impact.
            </p>
            <div className="body-styling mt-2 md:mt-6 ml-4 space-y-4">
              <p><strong>Discovery:</strong> We dive deep into your goals, challenges, and data landscape to identify opportunities and pain points that shape our strategy aligned with both technical and broader business objectives.</p>
              <p><strong>Strategy Development:</strong> Using insights from discovery, we design practical and future-proof BI solutions that improve decision-making, streamline operations, and unlock growth.</p>
              <p><strong>Implementation:</strong> We integrate systems with minimal disruption, empowering your team with the tools and knowledge to succeed, while keeping you informed throughout.</p>
              <p><strong>Optimization:</strong> We monitor, refine, and scale your solutions as your business evolves, ensuring your investment delivers long-term value and adapts to new opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      <ServicesOverview />
    </div>
  );
}
