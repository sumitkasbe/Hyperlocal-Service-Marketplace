import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ServiceSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Only navigate if search term is not empty
    if (searchTerm.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchTerm.trim())}`);
    }
    // If empty, do nothing - stays on current page
  };

  return (
    <form onSubmit={handleSearch} className="max-w-3xl mx-auto w-full">
      <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
        <div className="pl-5 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for plumbing, electrical, cleaning..."
          className="w-full bg-transparent px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button 
          type="submit"
          disabled={!searchTerm.trim()}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold m-1.5 whitespace-nowrap transition-all
            ${!searchTerm.trim() 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-[#0055b8] text-white hover:bg-blue-700 active:scale-95'
            }`}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default ServiceSearch;