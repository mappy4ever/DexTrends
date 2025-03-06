import Link from "next/link";

export default function CallToActionButton() {
  return (
    <div className="fixed bottom-8 right-8 z-50 transition-transform duration-300 ease-in-out hover:scale-105">
      <Link
        href="/contact"
        className="bg-button hover:bg-button-hover text-button-title px-5 py-2 md:px-10 md:py-5 font-bold tracking-wide shadow-2xl transition-all duration-300 text-lg md:text-xl lg:text-2xl transform ease-in-out hover:scale-105"
        style={{
          borderTopLeftRadius: "50px",
          borderBottomRightRadius: "50px",
        }}
      >
        🚀 Let's Get Started!
      </Link>
    </div>
  );
}
