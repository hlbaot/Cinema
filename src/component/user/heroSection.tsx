const heroBackgroundUrl =
  "https://res.cloudinary.com/delxvq3zp/image/upload/v1777626980/zUJCqWdZQlgTZz2MajVT_f1eyxi.webp";

export default function HeroSection() {
  return (
    <section className="relative h-[500px] w-full overflow-hidden bg-black">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[70%] bg-contain bg-right bg-no-repeat opacity-60 blur-[1px] [filter:brightness(1.12)]"
        style={{ backgroundImage: `url(${heroBackgroundUrl})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[70%] bg-contain bg-right bg-no-repeat opacity-28 blur-[0.5px] [filter:brightness(1.34)]"
        style={{
          backgroundImage: `url(${heroBackgroundUrl})`,
          clipPath: "inset(0 0 0 50%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[68%] bg-[linear-gradient(90deg,rgba(0,0,0,0.98),rgba(0,0,0,0.92)_34%,rgba(0,0,0,0.70)_62%,rgba(0,0,0,0.22)_88%,transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),rgba(0,0,0,0.34)_42%,rgba(0,0,0,0.52)_70%,rgba(0,0,0,0.82))]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.82),rgba(0,0,0,0.42)_24%,rgba(0,0,0,0.60)_58%,rgba(0,0,0,0.88))]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_18%),radial-gradient(circle_at_78%_18%,rgba(127,29,29,0.14),transparent_22%),radial-gradient(circle_at_center,transparent_48%,rgba(0,0,0,0.36)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:88px_88px]"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
          <span className="bg-linear-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
            Phim
          </span>{" "}
          {"\u0110ang Chi\u1ebfu"}
        </h1>

        <p className="max-w-2xl text-lg text-gray-300 md:text-xl">
          {
            "Kh\u00e1m ph\u00e1 nh\u1eefng b\u1ed9 phim bom t\u1ea5n m\u1edbi nh\u1ea5t v\u1edbi tr\u1ea3i nghi\u1ec7m \u0111i\u1ec7n \u1ea3nh \u0111\u1ec9nh cao t\u1ea1i CINEPRO"
          }
        </p>

        <div className="mt-8 max-w-xl">
          <div className="group relative">
            <input
              type="text"
              placeholder={"T\u00ecm ki\u1ebfm phim, \u0111\u1ea1o di\u1ec5n..."}
              className="w-full rounded-full border border-white/14 bg-white/[0.08] px-6 py-4 pl-14 text-white placeholder-gray-400 shadow-[0_0_0_rgba(0,0,0,0)] backdrop-blur-md transition-all duration-300 hover:border-white/22 hover:bg-white/[0.12] hover:shadow-[0_12px_32px_rgba(0,0,0,0.24)] focus:border-yellow-500 focus:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
            <svg
              className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-hover:text-yellow-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
