export default function Footer() {
  return (
    <footer className="bg-navbar-scrolled w-full text-text-navbar md:pl-16 py-4 mt-12 z-20 transition-colors duration-300 fixed bottom-0">
	  <div className="text-center">
        <p className="text-sm">
          © {new Date().getFullYear()}  DexTrends - A{" "}
		  <a
            href="https://www.pakepoint.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-button hover:text-button-hover font-semibold transition-colors"
          >
			PakePoint 
		  </a>
		  {" "}Project. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
