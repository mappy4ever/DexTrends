// components/FAQ.js
import { useEffect, useState } from "react";
import faqData from "../public/data/faq-content.json"; // Assuming path is correct
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Using different icons for expand/collapse

export default function FAQ() {
  // Parallax effect for the main FAQ heading is handled by _app.js targeting ".parallax-heading"
  // No offset state needed here if the JS in _app.js handles the parallax transformation.

  const [activeIndex, setActiveIndex] = useState(null); // Tracks active/open question

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="mt-12"> {/* Removed max-w-7xl and mx-auto, should be handled by page layout */}
      {/* The h2 below will be targeted by the global parallax effect script in _app.js */}
      <h2 className="text-page-heading text-center md:text-left mb-10">
        Frequently Asked Questions
      </h2>
      <div className="max-w-5xl mx-auto space-y-4"> {/* Centered content for FAQ items */}
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="border-b border-border last:border-b-0" // Use themed border
          >
            <button
              className="flex items-center justify-between text-left w-full text-lg font-semibold text-text-heading py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-app-sm"
              onClick={() => toggleFAQ(index)}
              aria-expanded={activeIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span>{faq.question}</span>
              {activeIndex === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
            <div
              id={`faq-answer-${index}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out text-content-default text-base leading-relaxed`}
              style={{ maxHeight: activeIndex === index ? '1000px' : '0px' }} // Inline style for dynamic max-height
            >
              <p className="pt-1 pb-4 pr-6">{faq.answer}</p> {/* Added padding for content visibility */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}