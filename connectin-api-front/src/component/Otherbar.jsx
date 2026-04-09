function Otherbar({ searchTerm, onSearchChange, changerLeTri }) {
  return (
    <div className="h-full bg-white border-l border-gray-100 p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-[#1e3a8a] px-2">Filtrage</h2>

      <div className="px-2">
        <input
          type="text"
          placeholder="Rechercher par mot clé..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a8a]/30 transition-all placeholder-gray-400 shadow-sm"
        />
      </div>

      <div className="w-full flex flex-col gap-4 mt-2 px-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
          Trier par
        </h3>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => changerLeTri("recents")}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-[#1e3a8a] bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm flex items-center gap-3"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Les plus récents
          </button>

          <button
            onClick={() => changerLeTri("populaires")}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-[#1e3a8a] bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm flex items-center gap-3"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            Les plus populaires
          </button>
        </div>
      </div>
    </div>
  );
}

export default Otherbar;
