import { useEffect, useState } from "react";
import faqData from "../public/data/faq-content.json";

export default function FAQ() {
  const [offset, setOffset] = useState(0);
  const [lockedIndex, setLockedIndex] = useState(null); // Tracks locked question

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll(".parallax-heading");
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const scrollAmount = Math.max(0, window.innerHeight - rect.top) * 0.08;

        heading.style.transform = `translateX(${scrollAmount}px)`; // Moves only to the right
        heading.style.opacity = Math.max(0.8, 1 - scrollAmount * 0.02); // Fades only to 50% opacity
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLock = (index) => {
    setLockedIndex(lockedIndex === index ? null : index);
  };

  return (
    <section className="max-w-7xl mx-auto mt-12 px-4">
      <h2 className="heading-styling parallax-heading">
        FAQ
      </h2>
      <div className="max-w-5xl mx-auto space-y-6 mt-12">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="group border-b border-text-subheading pb-6"
          >
            <button
              className="text-left w-full blogheading-styling lg:text-2xl font-semibold py-3 focus:outline-none transition-colors duration-300"
              onClick={() => toggleLock(index)}
            >
              {faq.question}
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                lockedIndex === index ? "max-h-screen" : "group-hover:max-h-screen max-h-0"
              }`}
            >
              <p className="body-styling text-lg">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
