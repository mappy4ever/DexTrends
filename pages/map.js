import MonthlySpendingByOrg from "../components/MonthlySpendingByOrg";
import { useEffect, useState } from "react";
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
      <div className="max-w-5xl mx-auto py-4 md:py-20 px-4 space-y-14 mb-14">
		
        <MonthlySpendingByOrg />

      </div>
    </div>
  );
}
