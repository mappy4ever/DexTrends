import { useEffect } from "react";
import Link from "next/link";
import { AiOutlineBulb, AiOutlineCoffee } from "react-icons/ai";
import Image from "next/image";

export default function AboutSection() {
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll(".parallax-heading");
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const scrollAmount = Math.max(0, window.innerHeight - rect.top) * 0.02;

        heading.style.transform = `translateX(${scrollAmount}px)`; // Moves to the right
        heading.style.opacity = Math.max(0.8, 1 - scrollAmount * 0.02); // Fades to 80% opacity
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="max-w-7xl mx-auto space-y-12 md:space--y-20 py-4 md:py-12 px-4">
      <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Who We Are */}
        <div className="card">
          <h2 className="cardheading-styling">Who We Are</h2>
          <p className="body-styling mt-responsive">
            <strong>At the intersection of technology, strategy, and business intelligence</strong>, we empower organizations to make confident, data-driven decisions:
          </p>
          <ul className="list-disc list-inside body-styling mt-2 ml-4 space-y-2">
            <li><strong>Business Intelligence Solutions -</strong> Unlock data with intuitive dashboards and KPI tracking.</li>
            <li><strong>Cloud Data Engineering -</strong> Seamlessly migrate and scale your business with modern cloud solutions.</li>
            <li><strong>Project Management & Strategy -</strong> PMP-certified leadership to align stakeholders & execute rollouts.</li>
          </ul>
          <p className="body-styling mt-2">
            Our expertise spans across healthcare, finance, technology, retail, and government sectors, delivering innovative solutions that simplify complexity and drive measurable business outcomes.
          </p>
        </div>

        {/* Our Core Values */}
        <div className="card">
          <h2 className="cardheading-styling">Our Values</h2>
          <p className="body-styling mt-responsive">
             <strong>Data Has Purpose:</strong> Data should drive every decision. Our approach is rooted in a data-first mindset where every insight is backed by rigorous analysis and real-world metrics.
          </p>
          <p className="body-styling mt-responsive">
             <strong>Keep Confidently Creative:</strong> Innovation thrives on creativity and bold thinking. We embrace experimentation and out-of-the-box ideas. Our culture pioneers solutions that challenge industry norms.
          </p>
          <p className="body-styling mt-responsive">
             <strong>Always Help Out:</strong> Collaboration and community are at our heart of everything we do. We are dedicated to supporting our clients and partners at every step. We make it a point to lend a helping hand.
          </p>
        </div>

        {/* Our Mission */}
        <div className="card">
          <h2 className="cardheading-styling">Our Mission</h2>
          <p className="body-styling mt-responsive">
             <strong>We make data work for you.</strong>
          </p>
          <p className="body-styling mt-responsive">
             <strong>Every business has untapped potential—our mission is to help you unlock it.</strong>
          </p>
          <p className="body-styling mt-responsive">
             By leveraging innovative cloud and business intelligence solutions, we turn challenges into opportunities, bridging the gap between data and decision-making.
          </p>
          <p className="body-styling mt-responsive">
             We don’t believe in one-size-fits-all solutions—instead, we take a personalized approach, understanding the unique goals and pain points of every business we work with.
          </p>
          <p className="body-styling mt-responsive">
            Our promise? Smarter, faster, and more strategic decision-making that moves your business forward.
          </p>
        </div>
      </div>

      {/* Credentials Section */}
      <div className="mt-responsive">
        <h2 className="heading-styling md:parallax-heading">Credentials</h2>
        <div className="flex flex-wrap gap-8 justify-center items-center">
          <div className="flex flex-col items-center transition-transform transform hover:scale-105">
            <Image src="/pmp.png" alt="PMP Certification" width={200} height={200} className="object-contain" />
            <p className="subheading-styling mt-2">PMP Certified</p>
          </div>
          <div className="flex flex-col items-center transition-transform transform hover:scale-105">
            <Image src="/powerbi.png" alt="Power BI Analyst" width={200} height={200} className="object-contain" />
            <p className="subheading-styling mt-2">Power BI Analyst</p>
          </div>
        </div>
      </div>

      {/* Personal Touch */}
      <div className="card mt-responsive space-y-2">
        <h2 className="cardheading-styling border-l-0 md:parallax-heading flex items-center gap-3"><AiOutlineCoffee size={36}/> Meet Pake Newell: Your BI & Data Strategy Partner</h2>
        <p className="body-styling">
          With over a decade of experience in business intelligence, project management, and cloud analytics, Pake has helped organizations unlock the true value of their data.
        </p>
        <ul className="list-disc list-inside body-styling mt-4 ml-3 md:ml-6">
            <li><strong>PMP-Certified Project Manager -</strong> Expert in leading high-impact BI initiatives with precision and efficiency.</li>
            <li><strong>Business Intelligence Architect -</strong> Specialist in Power BI, Tableau, and cloud-based analytics solutions.</li>
            <li><strong>Industry Leader in Data Strategy -</strong> Experience working with HIPA, PIPEDA, and compliance-focused BI strategies.</li>
            <li><strong>Expert Data Storyteller -</strong> Telling engaging <strong>data-driven stories</strong> from complex data.</li>
          </ul>
        <p className="body-styling">
          When he’s not crafting dashboards or automating workflows, Pake is exploring the intersections of data and human behavior. He believes that behind every dataset lies a story waiting to be uncovered, and it’s his passion to bring those stories to life.
        </p>
        <p className="body-styling">
          Having led high-impact initiatives for the Ontario Ministry of Health, national non-profits, and major private enterprises, Pake’s expertise goes beyond just delivering reports—he builds strategies that drive real-world success.
        </p>        
        <p className="body-styling ml-6 md:ml-12 flex items-center gap-3">
          <AiOutlineBulb size={36}/>
          “Behind every dataset is a story—I help businesses uncover and act on it.”
        </p>
        <p className="body-styling ml-2 md:ml-6">
          Check out Pake's{" "} 
          <Link href="/portfolio" className="text-button hover:text-button-hover font-semibold transition-colors">
            Portfolio
          </Link>
          {" "}to see some of his work.
        </p>
      </div>
    </section>
  );
}
