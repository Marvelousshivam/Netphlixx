export default function Footer() {
  return (
    <footer className="w-full py-10 mt-16 border-t border-white/[0.06] bg-[#0f1014] relative z-10 select-none">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 flex flex-col items-center justify-center space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-black text-[#E50914] tracking-tighter font-display">
            NETPHLIX
          </span>
          <span className="text-xs text-[#8a8a93] font-mono">© {new Date().getFullYear()}</span>
        </div>

        <p className="text-[#8a8a93] text-xs text-center max-w-md font-medium">
          Cinejoy Edition • Personal entertainment streaming portal by{' '}
          <span className="text-white font-semibold">
            Shivam Raj
          </span>
        </p>

        <div className="text-[11px] text-[#8a8a93]/70 text-center font-normal">
          Media metadata and imagery provided by TMDB. Not affiliated with or endorsed by Netflix, Inc.
        </div>
      </div>
    </footer>
  );
}
