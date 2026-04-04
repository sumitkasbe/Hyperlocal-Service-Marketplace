import { useState } from "react";
import { Star, X } from "lucide-react";
import api from "../api/axios";

const ReviewForm = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/reviews", {
        booking_id: booking.id,
        rating,
        comment: comment.trim() || undefined
      });

      if (response.data.success) {
        onSuccess?.(response.data.review);
        onClose();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Rate Your Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">
                {booking.service_name?.charAt(0) || 'S'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{booking.service_name}</h3>
              <p className="text-sm text-slate-500">
                Provider: {booking.provider_name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(booking.booking_date || booking.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Your Rating <span className="text-red-500">*</span>
            </label>
            
            <div className="flex flex-col items-center">
              {/* Stars */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>

              {/* Rating Text */}
              <div className="mt-3 text-sm font-medium">
                {hoverRating || rating ? (
                  <span className="text-slate-700">
                    {hoverRating || rating} out of 5 stars
                  </span>
                ) : (
                  <span className="text-slate-400">Click to rate</span>
                )}
              </div>

              {/* Rating Labels */}
              <div className="flex justify-between w-full mt-2 text-xs text-slate-400">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Write a Review <span className="text-slate-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this provider..."
              rows="4"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
              maxLength={500}
            />
            <div className="text-right text-xs text-slate-400 mt-1">
              {comment.length}/500
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-blue-800 mb-2">Tips for writing a review:</h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Be specific about what you liked</li>
              <li>Mention if the provider was punctual</li>
              <li>Comment on the quality of work</li>
              <li>Share if you would recommend them</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-4 py-3 bg-[#0055b8] text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  ); 
};

export default ReviewForm;