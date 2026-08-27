import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getReviewsByUser } from '../services/reviewService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StarRating from '../components/common/StarRating';
import { Star } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getReviewsByUser(user._id);
        if (res.success) setReviews(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user._id]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Your Reviews</h1>
          <p className="text-gray-500 mt-1">Feedback from your skill exchange partners.</p>
        </div>
        
        {reviews.length > 0 && (
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
            <div>
              <StarRating rating={Math.round(averageRating)} />
              <p className="text-sm text-gray-500 mt-1">Based on {reviews.length} reviews</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner size="large" className="py-20" />
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {review.reviewer?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{review.reviewer?.name}</h3>
                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              
              <p className="text-gray-700">{review.comment}</p>
              
              {review.session && (
                <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-2 rounded inline-block">
                  Session: <span className="font-medium text-gray-700">{review.session.skill?.name || 'Unknown Skill'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Complete some sessions to start receiving feedback from your partners."
        />
      )}
    </div>
  );
};

export default Reviews;
