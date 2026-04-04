import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";
import {
  Wrench,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Brush,
  Scissors,
  Truck,
  Book,
  Settings, // Using Settings instead of Tool
  Search,
  Loader2,
} from "lucide-react";

// Map icon names to Lucide components
const iconMap = {
  Wrench: Wrench,
  Zap: Zap,
  Droplets: Droplets,
  Hammer: Hammer,
  Paintbrush: Paintbrush,
  Brush: Brush,
  Scissors: Scissors,
  Truck: Truck,
  Book: Book,
  Settings: Settings, // Using Settings as the fallback icon
};

const Services = () => {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");

  // Get search param from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchTerm(search);
    }
  }, [location]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log("Fetching service categories...");
      const res = await api.get("/service-categories");
      console.log("Categories response:", res.data);
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group categories by main category
  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.category || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {});

  // Filter categories by search
  const filteredGroups = Object.entries(groupedCategories).reduce(
    (acc, [group, items]) => {
      const filtered = items.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.description &&
            cat.description.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      if (filtered.length > 0) {
        acc[group] = filtered;
      }
      return acc;
    },
    {},
  );

  // Get unique groups for filter tabs
  const groups = ["all", ...Object.keys(groupedCategories)];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0055b8] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-slate-600 font-medium">
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Professional Services
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0055b8] to-blue-600">
                At Your Doorstep
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Choose from a wide range of trusted professionals in your area
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for services (e.g., AC Repair, Plumbing)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 gap-2 scrollbar-hide">
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  selectedGroup === group
                    ? "bg-[#0055b8] text-white shadow-lg shadow-blue-500/30"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {group === "all" ? "All Services" : group}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {Object.entries(
          selectedGroup === "all"
            ? filteredGroups
            : { [selectedGroup]: filteredGroups[selectedGroup] || [] },
        ).map(([group, items]) => (
          <div key={group} className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900">{group}</h2>
              <span className="text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200">
                {items.length} services
              </span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <p className="text-lg text-slate-500">
                  No services found in this category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((category) => {
                  // Use Settings as fallback instead of Tool
                  const IconComponent = iconMap[category.icon] || Settings;
                  return (
                    <Link
                      key={category.id}
                      to={`/services/${category.id}/providers`}
                      className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-200"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                        <IconComponent className="w-8 h-8 text-[#0055b8]" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                        {category.description ||
                          `Professional ${category.name} services at your doorstep`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-600">
                          View Providers →
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                          {category.provider_count || "0"} available
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {Object.keys(filteredGroups).length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No services found
            </h3>
            <p className="text-slate-500">
              Try adjusting your search or browse all categories
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-6 px-6 py-3 bg-[#0055b8] text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
