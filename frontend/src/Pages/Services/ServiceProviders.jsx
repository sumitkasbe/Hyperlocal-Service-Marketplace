import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Star,
  MapPin,
  ChevronLeft,
  Filter,
  Clock,
  Award,
  ThumbsUp,
  Loader2,
  Wrench,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Brush,
  Scissors,
  Truck,
  Book,
  Settings,
} from "lucide-react";

const ServiceProviders = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating");
  const [filterAvailable, setFilterAvailable] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [serviceId]);

  const fetchProviders = async () => {
    try {
      console.log("Fetching providers for service:", serviceId);
      const res = await api.get(`/service-categories/${serviceId}/providers`);
      console.log("Providers response:", res.data);
      setProviders(res.data.providers || []);

      // Get service name from first provider if available
      if (res.data.providers?.length > 0) {
        setService({
          name: res.data.providers[0].service_name,
          id: serviceId,
        });
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (provider) => {
    // Navigate to booking form with provider and service details
    navigate(`/book/${provider.provider_id}`, {
      state: {
        provider: {
          id: provider.provider_id,
          name: provider.provider_name,
          price: provider.price,
        },
        service: {
          id: serviceId,
          name: service?.name,
        },
      },
    });
  };

  // Sort and filter providers
  const filteredProviders = providers
    .filter((p) => (filterAvailable ? p.is_available : true))
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortBy === "experience")
        return (b.experience_years || 0) - (a.experience_years || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0055b8] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-slate-600 font-medium">
            Finding best providers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">
              {service?.name || "Service"} Providers
            </h1>
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              {filteredProviders.length} available
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                Sort by:
              </span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              <option value="rating">Top Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="experience">Most Experienced</option>
            </select>

            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={filterAvailable}
                onChange={(e) => setFilterAvailable(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">Available now</span>
            </label>
          </div>
        </div>
      </div>

      {/* Providers List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProviders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ThumbsUp className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No providers found
            </h3>
            <p className="text-slate-500">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200 group"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/20">
                    {provider.provider_name?.charAt(0) || "P"}
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {provider.provider_name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          {/* Rating */}
                          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-yellow-700">
                              {provider.avg_rating
                                ? provider.avg_rating
                                : "New"}
                            </span>
                            <span className="text-sm text-yellow-600">
                              ({provider.total_reviews || 0} reviews)
                            </span>
                          </div>

                          {/* Experience */}
                          <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                            <Award className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">
                              {provider.experience_years || 0}+ years exp.
                            </span>
                          </div>

                          {/* Availability */}
                          <div
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                              provider.is_available
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-50 text-slate-500"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                provider.is_available
                                  ? "bg-green-500 animate-pulse"
                                  : "bg-slate-300"
                              }`}
                            ></span>
                            <span className="text-sm font-medium">
                              {provider.is_available
                                ? "Available Now"
                                : "Unavailable"}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {provider.description && (
                          <p className="text-slate-600 mt-4 leading-relaxed">
                            {provider.description}
                          </p>
                        )}
                      </div>

                      {/* Price and Book Button */}
                      <div className="text-right bg-slate-50 p-4 rounded-2xl min-w-[180px]">
                        <div className="text-3xl font-bold text-slate-900">
                          ₹{provider.price}
                        </div>
                        <div className="text-sm text-slate-500 mb-3">
                          starting price
                        </div>
                        <button
                          onClick={() => handleBookNow(provider)}
                          className="w-full px-4 py-3 bg-[#0055b8] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceProviders;
