import { useState } from 'react';
import { toast } from 'react-toastify';
import { createReview } from '../../services/reviewService';
import StarRating from '../common/StarRating';

const ReviewModal = ({ isOpen, onClose, session, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createReview({
        sessionId: session._id,
        rating,
        comment
      });
      if (res.success) {
        toast.success('Review submitted successfully');
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="inline-block bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-md sm:w-full z-10 animate-fadeIn">
          <div className="bg-white p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Leave a Review
            </h3>
            <p className="text-sm text-gray-500 mb-4">How was your session for <strong>{session.skill.name}</strong>?</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex justify-center mb-6">
                <StarRating rating={rating} onChange={setRating} interactive={true} max={5} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Share your experience..."
                  required
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
