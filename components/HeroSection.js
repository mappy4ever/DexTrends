import { useEffect, useState } from "react";

export default function HeroSection({ title, subtitle, description, backgroundImage }) {
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      let scrollY = window.scrollY;
      setScale(1 + scrollY * 0.00025); // Adjust scale dynamically
      setOpacity(1 - scrollY * 0.0015); // Gradually fade out text
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div
        className="relative flex-grow bg-cover bg-center h-96 md:h-[28rem] flex items-center justify-center transition-transform duration-500"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          transform: `scale(${scale})`  // Smooth scaling effect
        }}
      >
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-white/10 dark:from-black/80 dark:to-black/20 z-10 transition-transform duration-500"></div>

        {/* Animated geometric pattern overlay */}
        <div className="absolute inset-0 bg-[url('/geometric-pattern.png')] opacity-40 z-0"></div>

        {/* Text content with subtle fade on scroll */}
        <div 
          className="relative text-center p-8 rounded-lg max-w-3xl mx-auto z-30 transition-all duration-300"
          style={{
            background: "rgba(53, 42, 30, 0.7)",
            backdropFilter: "blur(5px)",
            opacity: opacity,  // Fading effect
            transform: `translateY(${scale * 5}px)` // Slight lift effect
          }}
        >
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          <p className="hero-description">{description}</p>
        </div>
      </div>

      {/* Gradient border below the hero section */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-background dark:from-background-dark to-transparent z-20 transition-transform duration-500"></div>
    </div>
  );
}
