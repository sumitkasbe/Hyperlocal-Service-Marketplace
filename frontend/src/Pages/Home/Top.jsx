import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Top = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Only navigate if search term is not empty
    if (searchTerm.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchTerm.trim())}`);
    }
    // If empty, do nothing - no navigation
  };

  const handlePopularSearch = (term) => {
    setSearchTerm(term);
    navigate(`/services?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="max-w-7xl mx-auto mt-16 px-4 mb-10">
      {/* Header Section */}
      <div className="text-center text-6xl font-bold">
        <p className="text-slate-900">Expert services for every</p>
        <p className="text-6xl font-extrabold inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#0055b8] via-[#1a84a7] to-[#46bc84] tracking-tighter">
          home need.
        </p>
      </div>

      {/* Subtext */}
      <p className="text-2xl text-center text-gray-500 mt-8">
        From cleaning and repairs to moving and painting, find trusted local
        <br /> professionals for any task, big or small.
      </p>

      {/* Search Bar Container */}
      <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
        <div className="flex items-center bg-white p-1 rounded-2xl border border-gray-200 drop-shadow-xl shadow-sm focus-within:ring-5 focus-within:ring-blue-500/10 focus-within:border-blue-700 transition-all">
          <label htmlFor="search-services" className="sr-only">
            Search services
          </label>
          
          {/* Search Icon */}
          <div className="pl-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            id="search-services"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="What do you need help with? (e.g., AC Repair, Plumbing)"
            className="w-full bg-transparent px-4 py-3 text-base text-gray-900 outline-none placeholder:text-gray-400"
          />
          
          <button
            type="submit"
            disabled={!searchTerm.trim()}
            className={`flex-none rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all
              ${!searchTerm.trim() 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-blue-600 hover:bg-indigo-500'
              }`}
          >
            Search
          </button>
        </div>
      </form>

      {/* Popular Searches */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        <span className="text-sm text-gray-500 mr-2">Popular:</span>
        {['AC Repair', 'Plumbing', 'Electrical', 'Cleaning', 'Painting'].map((term) => (
          <button
            key={term}
            onClick={() => handlePopularSearch(term)}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Top;