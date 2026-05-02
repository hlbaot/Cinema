export default function MembershipBanner() {
  return (
    <section className="w-full bg-black">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#243247] bg-[linear-gradient(135deg,#1a2330_0%,#202938_46%,#1a2230_100%)] px-7 py-8 md:px-10 md:py-9">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.08),transparent_22%),radial-gradient(circle_at_88%_78%,rgba(239,68,68,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%)]"
          />
          <div
            aria-hidden="true"
            className="absolute right-[10%] top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-yellow-500/8 blur-3xl"
          />

          <div className="relative flex flex-col items-center gap-7 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl flex-1 text-center md:text-left">
              <span className="mb-4 inline-flex items-center rounded-full bg-[#5e4a1f]/70 px-4 py-1.5 text-sm font-semibold text-yellow-300">
                {"\u2728 \u01afu \u0111\u00e3i \u0111\u1eb7c bi\u1ec7t"}
              </span>

              <h2 className="mb-4 text-3xl font-black leading-tight text-white md:whitespace-nowrap md:text-[2.95rem]">
                {"Tr\u1edf th\u00e0nh th\u00e0nh vi\u00ean "}
                <span className="text-[#ffbf0f]">VIP</span>
              </h2>

              <p className="mb-6 max-w-2xl text-base leading-8 text-[#a6b1c3]">
                {
                  "\u0110\u0103ng k\u00fd th\u00e0nh vi\u00ean VIP ngay h\u00f4m nay \u0111\u1ec3 nh\u1eadn \u0111\u01b0\u1ee3c nh\u1eefng \u01b0u \u0111\u00e3i \u0111\u1ed9c quy\u1ec1n: gi\u1ea3m 20% m\u1ecdi v\u00e9 phim, b\u1ecfng n\u01b0\u1edbc mi\u1ec5n ph\u00ed, v\u00e0 nhi\u1ec1u \u0111\u1eb7c quy\u1ec1n h\u1ea5p d\u1eabn kh\u00e1c!"
                }
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row md:justify-start">
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-r from-[#ffb703] to-[#ffae00] px-8 py-3 text-lg font-bold text-black shadow-[0_14px_30px_rgba(255,183,3,0.22)] transition-all duration-300 hover:scale-[1.02] hover:from-[#ffc21a] hover:to-[#ffb700]"
                >
                  {"\u0110\u0103ng k\u00fd ngay"}
                </button>

                <button
                  type="button"
                  className="rounded-full border border-[#4a576d] bg-transparent px-8 py-3 text-lg font-semibold text-white transition-all duration-300 hover:border-[#62738f] hover:bg-white/[0.03]"
                >
                  {"T\u00ecm hi\u1ec3u th\u00eam"}
                </button>
              </div>
            </div>

            <div className="shrink-0 md:pr-2">
              <div className="h-44 w-72 rotate-3 transform rounded-2xl bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-400 p-6 shadow-2xl shadow-yellow-500/30 transition-transform hover:rotate-0">
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-black/60">CINEPRO</p>
                    <p className="text-xl font-bold text-black">VIP MEMBER</p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/20">
                    <span className="text-2xl">{"\ud83d\udc51"}</span>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-black/60">Cardholder</p>
                    <p className="font-semibold text-black">YOUR NAME</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-black/60">Points</p>
                    <p className="font-bold text-black">{"\u221e"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
