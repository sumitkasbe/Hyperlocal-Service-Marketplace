import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import api from "../../../api/axios";
import { getUser } from "../../../Utils/auth";

const AllReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState({
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0
  });
  
  const hasFetched = useRef(false);
  const componentMounted = useRef(true);
  const user = getUser();

  useEffect(() => {
    componentMounted.current = true;
    
    if (user?.id && !hasFetched.current) {
      hasFetched.current = true;
      fetchAllReviews();
    }

    return () => {
      componentMounted.current = false;
    };
  }, [user?.id]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/provider/${user.id}`);
      
      if (componentMounted.current) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.stats.average_rating);
        setTotalReviews(response.data.stats.total_reviews);
        setRatingBreakdown({
          five_star: response.data.stats.five_star,
          four_star: response.data.stats.four_star,
          three_star: response.data.stats.three_star,
          two_star: response.data.stats.two_star,
          one_star: response.data.stats.one_star
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      if (componentMounted.current) {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const calculatePercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0055b8] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-slate-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/provider')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            All Reviews
          </h1>
          <p className="text-lg text-slate-500">
            See what customers are saying about your services
          </p>
        </div>

        {/* Rating Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-5xl font-black text-slate-900">{averageRating}</div>
              <div className="flex justify-center md:justify-start gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingBreakdown[`${star}_star`];
                const percentage = calculatePercentage(count);
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600 w-12">{star} star</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews yet</h3>
            <p className="text-slate-500">
              Complete jobs to get reviews from customers
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
              >
                {/* Customer Info and Rating */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{review.user_name}</h3>
                    <p className="text-sm text-slate-400">{formatDate(review.created_at)}</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                {review.comment && (
                  <p className="text-slate-600 leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {/* Booking Reference */}
                {review.booking_id && (
                  <p className="text-xs text-slate-400 mt-3">
                    Booking ID: {review.booking_id.substring(0, 8)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReviews;