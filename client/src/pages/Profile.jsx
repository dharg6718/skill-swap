import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserById } from '../services/userService';
import { getReviewsByUser } from '../services/reviewService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SkillBadge from '../components/common/SkillBadge';
import StarRating from '../components/common/StarRating';
import SwapRequestModal from '../components/modals/SwapRequestModal';
import { MapPin, Calendar, Edit, MessageSquare } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOwnProfile = !id || id === currentUser._id;
  const profileId = isOwnProfile ? currentUser._id : id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, reviewsRes] = await Promise.all([
          getUserById(profileId),
          getReviewsByUser(profileId)
        ]);
        if (userRes.success) setUser(userRes.data);
        if (reviewsRes.success) setReviews(reviewsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profileId]);

  if (loading) return <LoadingSpinner size="large" className="mt-20" />;
  if (!user) return <div className="text-center mt-20 text-gray-500">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-indigo-600"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 mb-4">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white border-4 border-white flex items-center justify-center text-4xl font-bold text-indigo-700 shadow-sm bg-indigo-50">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              {isOwnProfile ? (
                <Link to="/profile/edit" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md font-medium hover:bg-indigo-100 transition-colors">
                  <Edit size={18} /> Edit Profile
                </Link>
              ) : (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <MessageSquare size={18} /> Send Request
                </button>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              {user.location && (
                <div className="flex items-center gap-1"><MapPin size={16} /> {user.location}</div>
              )}
              <div className="flex items-center gap-1"><Calendar size={16} /> Joined {formatDate(user.createdAt)}</div>
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(user.rating || 0)} />
                <span>({reviews.length} reviews)</span>
              </div>
            </div>
            <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl">
              {user.bio || (isOwnProfile ? "You haven't added a bio yet." : "No bio provided.")}
            </p>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Skills I Know</h2>
          <div className="flex flex-wrap gap-2">
            {user.skillsKnown?.length > 0 ? (
              user.skillsKnown.map(skill => <SkillBadge key={skill._id} skill={skill} />)
            ) : (
              <p className="text-gray-500 text-sm">No skills added yet.</p>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Skills I Want to Learn</h2>
          <div className="flex flex-wrap gap-2">
            {user.skillsWanted?.length > 0 ? (
              user.skillsWanted.map(skill => <SkillBadge key={skill._id} skill={skill} />)
            ) : (
              <p className="text-gray-500 text-sm">No skills wanted added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {review.reviewer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{review.reviewer?.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-gray-700 text-sm mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No reviews yet.</p>
        )}
      </div>

      {!isOwnProfile && (
        <SwapRequestModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          receiver={user} 
        />
      )}
    </div>
  );
};

export default Profile;
