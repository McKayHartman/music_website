import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = "Search for songs...", initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery || '');

	const handleSubmit = (e) => {
		e.preventDefault();
		if (onSearch && query.trim()) {
			onSearch(query.trim());
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleSubmit(e);
		}
	};

	return (
<div className="w-full max-w-2xl mx-auto">
  <div className="flex w-full border border-slate-200 rounded-md overflow-hidden shadow-sm">
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder={placeholder}
      className="flex-1 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
    />
    <button
      type="button"
      onClick={handleSubmit}
      className="flex flex-row bg-slate-800 text-white px-4 py-2 text-sm hover:bg-slate-700 focus:bg-slate-700"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 mr-1"
      >
        <path
          fillRule="evenodd"
          d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
          clipRule="evenodd"
        />
      </svg>
      Search
    </button>
  </div>
</div>
	);
}
