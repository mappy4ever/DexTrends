export default function Footer() {
  return (
    <footer className="glass-card elevated w-full text-text-navbar md:pl-16 py-4 mt-12 z-20 transition-colors duration-300 fixed bottom-0 shadow-2xl border border-border backdrop-blur-xl bg-white/70">
      <div className="text-center">
        <p className="text-sm text-foreground-muted">
          © {new Date().getFullYear()}  DexTrends - A{" "}
          <a
            href="https://www.pakepoint.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:text-secondary transition-colors"
          >
            PakePoint
          </a>
          {" "}Project. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
