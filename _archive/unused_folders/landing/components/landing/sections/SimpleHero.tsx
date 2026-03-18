"use client";

export default function SimpleHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#FAF9F6] pt-20">
      <div className="max-w-7xl mx-auto px-8 text-center">
        {/* Main Headline */}
        <h1
          className="font-serif leading-[1.05] mb-16"
          style={{
            fontSize: "clamp(3.5rem, 9vw, 8rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "#0A0A0A"
          }}
        >
          Don't let your talent
          <br />
          <span
            className="italic"
            style={{
              color: "#C9A55A",
              fontWeight: 400
            }}
          >
            get lost.
          </span>
        </h1>

        {/* Scroll Hint */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <div
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{
              color: "rgba(10, 10, 10, 0.4)",
              fontWeight: 500
            }}
          >
            SCROLL TO CURATE
          </div>
        </div>
      </div>
    </section>
  );
}
