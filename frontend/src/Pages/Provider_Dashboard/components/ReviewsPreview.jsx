import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import api from "../../../api/axios";
import { getUser } from "../../../Utils/auth";

const ReviewsPreview = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const hasFetched = useRef(false); // Use ref instead of state
  const user = getUser();

  useEffect(() => {
    // Only fetch if we haven't fetched yet and user exists
    if (user?.id && !hasFetched.current) {
      hasFetched.current = true; // Set ref immediately to prevent double fetch
      fetchReviews();
    }
  }, [user?.id]); // Remove hasFetched from dependencies

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/provider/${user.id}`);
      setReviews(response.data.reviews.slice(0, 3)); // Get only 3 most recent
      setAverageRating(response.data.stats.average_rating);
      setTotalReviews(response.data.stats.total_reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate(`/provider/reviews`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Reviews</h2>
          <div className="h-5 w-16 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <div key={s} className="w-4 h-4 bg-slate-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {/* Header with Rating Summary */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Reviews
          </h2>
          {totalReviews > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              ⭐ {averageRating} • {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          )}
        </div>
        {totalReviews > 3 && (
          <button 
            onClick={handleViewAll}
            className="text-sm text-blue-600 hover:underline"
          >
            View all ({totalReviews})
          </button>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border rounded-lg p-4 hover:shadow transition"
            >
              {/* Customer Name + Rating + Date */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium text-gray-800">
                    {review.user_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(review.created_at)}
                  </p>
                </div>

                {/* Star Rating */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
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
                <p className="text-sm text-gray-600 line-clamp-2">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Complete jobs to get reviews from customers
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsPreview;