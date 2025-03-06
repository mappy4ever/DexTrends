export default function Footer() {
  return (
    <footer className="bg-navbar w-full text-text-navbar py-4 mt-12 z-20 transition-colors duration-300">
	  {/* Gradient border at top of footer */}
      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-transparent to-navbar transition-colors duration-300 z-20">
      </div>
	  
	  <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">
          © {new Date().getFullYear()}  PakePoint Analytics. All rights reserved. Empowering businesses with intelligent insights.
        </p>
      </div>
    </footer>
  );
}
