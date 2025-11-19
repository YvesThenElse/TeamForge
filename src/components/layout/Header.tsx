export function Header() {
  return (
    <header className="border-b border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg">
      <div className="flex h-18 items-center px-6">
        <div className="flex items-center space-x-3">
          {/* TeamForge Logo */}
          <i className="fa-solid fa-fire text-white text-3xl"></i>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white">
              TeamForge
            </h1>
            <p className="text-[0.65rem] text-slate-400 -mt-0.5">Forge Suite for Developers</p>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 font-medium border border-slate-600">
            v0.1.0
          </span>
        </div>
      </div>
    </header>
  );
}
