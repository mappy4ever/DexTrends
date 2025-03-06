import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import HeroSection from "../../components/HeroSection";
import { AiOutlineCaretLeft, AiOutlineCheckCircle } from "react-icons/ai";

const blogPosts = [
  {
    slug: "launching-our-business",
    title: "Launching Our Website",
    subtitle: "Transforming Data into Business Success",
    date: "February 1, 2025",
    content: [
      {
        heading: "Harnessing the Power of Data to Drive Change",
        text: (
          <>
            <p>
              Every great business starts with a question—mine was,{" "}
              <i>"How can data be used to truly transform the way businesses operate?"</i>
            </p>
            <p>
              From my early days in university, I was fascinated by the ways data could reveal patterns,
              predict trends, and ultimately drive smarter decisions. That curiosity led me to a career where
              I’ve had the privilege of designing and implementing business intelligence (BI) solutions that
              have reshaped operations in healthcare, non-profits, and corporate enterprises.
            </p>
            <p>
              Whether it was optimizing reporting systems for the Ministry of Health, leading data infrastructure
              modernization at non-profits, or creating analytics solutions that unlocked millions in funding
              for critical public health programs, my focus has always been on{" "}
              <b>turning raw data into meaningful action</b>.
            </p>
            <p>
              Now, with PakePoint Analytics, I’m bringing that same strategic mindset and technical expertise to
              businesses looking to <b>leverage data for growth, efficiency, and innovation</b>.
            </p>
          </>
        ),
      },
      {
        heading: "Innovation and Excellence at the Core",
        text: (
          <>
            <p>
              In today’s fast-paced digital economy, businesses that fail to adapt <b>fall behind</b>. That’s why I’ve
              dedicated my career to helping organizations modernize their data infrastructure, streamline reporting
              processes, and unlock insights that drive real impact.
            </p>
            <p>At PakePoint Analytics, we specialize in:</p>
            <ul className="list-disc list-inside ml-2 md:ml-6 space-y-2">
              <li className="flex inline-flex items-center gap-3">
                <AiOutlineCheckCircle size={48} />
                <div>
                  <strong>Data Infrastructure & Integration</strong> – Designing scalable, efficient data warehouses
                  and lakehouses using <i>Microsoft Fabric, Google Cloud Platform, SQL, Power BI, and Tableau</i>.
                </div>
              </li>
              <li className="flex inline-flex items-center gap-3">
                <AiOutlineCheckCircle size={48} />
                <div>
                  <strong>Real-Time Analytics & Dashboarding</strong> – Delivering{" "}
                  <b>powerful, interactive dashboards</b> that provide actionable insights using{" "}
                  <i>Power BI, Tableau, SQL, and advanced data modeling techniques</i>.
                </div>
              </li>
              <li className="flex inline-flex items-center gap-3">
                <AiOutlineCheckCircle size={48} />
                <div>
                  <strong>Process Automation & ETL Solutions</strong> – Developing <b>seamless data pipelines</b>{" "}
                  using <i>Azure Data Factory, SSIS, Python, and R</i> to automate workflows and eliminate manual
                  inefficiencies.
                </div>
              </li>
              <li className="flex inline-flex items-center gap-3">
                <AiOutlineCheckCircle size={48} />
                <div>
                  <strong>Strategic Data Governance</strong> – Ensuring data integrity, compliance, and security
                  while aligning analytics with business objectives.
                </div>
              </li>
            </ul>
            <p>
              My work has <b>improved operational efficiencies by over 50%</b>, <b>reduced data anomalies by 75%</b>,
              and <b>helped organizations increase key business segments by 30-50%</b>. With PakePoint Analytics, I’m
              bringing these same capabilities to businesses that want{" "}
              <b>custom-tailored BI solutions that actually drive results</b>.
            </p>
          </>
        ),
      },
      {
        heading: "Why Real-Time Analytics Is a Game-Changer",
        text: (
          <>
            <p>
              One of the biggest shifts in BI today is <b>real-time analytics</b>—and for a good reason.
              In a world where business decisions need to be made <b>faster than ever</b>, static reporting simply isn’t enough.
            </p>
            <p>Companies that leverage <b>real-time data streams</b> are able to:</p>
            <ul className="ml-6 list-inside space-y-2">
              <li>
                📊 <b>Identify market trends as they happen</b>, not months later.
              </li>
              <li>
                ⚡ <b>Respond to customer needs instantly</b>, boosting satisfaction and retention.
              </li>
              <li>
                📈 <b>Optimize operations in real-time</b>, cutting inefficiencies before they become costly.
              </li>
            </ul>
            <p>
              With tools like <i>Azure Synapse Analytics, Power BI, and predictive modeling</i>, PakePoint Analytics
              is helping businesses stay ahead of the competition, because <b>data should work for you, not the other way around</b>.
            </p>
          </>
        ),
      },
      {
        heading: "Let’s Build Something Exceptional Together",
        text: (
          <>
            <p>
              If you’re ready to <b>elevate your business intelligence strategy</b>, let’s talk. Whether you need{" "}
              <b>a full-scale BI implementation</b>, <b>help optimizing existing dashboards</b>, or{" "}
              <b>a strategic consultation to uncover hidden opportunities in your data</b>, PakePoint Analytics is here to help.
            </p>
            <p>
              🚀 <b>Let’s make your data work smarter.</b> Connect with me today and let’s craft a BI strategy that transforms your business.
            </p>
            <p>
              <b>
                Click the "Let's Get Started!" button, or reach out at{" "}
                <a href="mailto:pake@pakepoint.com" className="text-text-highlight underline">
                  pake@pakepoint.com
                </a>.
              </b>
            </p>
          </>
        ),
      }
    ],
    tags: ["Consulting", "Analytics", "Strategy", "Business", "Enterprise"],
  },
];

export default function BlogPost() {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const { slug } = router.query || {}; // Avoid errors if undefined
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    const handleScroll = () => {
      const scrollAmount = window.scrollY * 0.05;
      setOffset(Math.min(scrollAmount, window.innerWidth * 0.2));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <h1 className="heading-styling">Post Not Found</h1>
        <p className="body-styling">Sorry, we couldn't find that blog post.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title={post.title}
        subtitle={post.subtitle}
        description=""
        backgroundImage="/blog-1-slug.jpg"
      />

      <div className="max-w-5xl py-4 md:py-12 mx-auto">
        <h1 className="heading-styling text-center mb-4">{post.title}</h1>
        <div className="max-w-3xl md:py-4 px-4 mx-auto">
          <h2 className="comment-styling px-2 md:px-4 mb-2">{post.date}</h2>

          {post.content.map((section, index) => (
            <div key={index} className="mb-6">
              <h2 className="subheading-styling space-y-6">{section.heading}</h2>
              <div className="body-styling space-y-4">{section.text}</div>
            </div>
          ))}

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-sm bg-secondary px-2 py-1 rounded-full">{tag}</span>
            ))}
          </div>

          <Link href="/blog" className="btn-secondary flex mt-4 items-center w-fit">
            <AiOutlineCaretLeft size={24} /> Back to Insights
          </Link>
        </div>
      </div>
    </div>
  );
}
