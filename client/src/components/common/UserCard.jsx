import { MapPin } from 'lucide-react';
import SkillBadge from './SkillBadge';
import StarRating from './StarRating';

const UserCard = ({ user, onViewProfile, onSendRequest, matchScore }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl border border-indigo-200 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
              {user.location && (
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <MapPin size={14} className="mr-1" />
                  {user.location}
                </div>
              )}
              <div className="mt-1">
                <StarRating rating={Math.round(user.rating || 0)} />
              </div>
            </div>
          </div>
          {matchScore && (
            <div className="flex flex-col items-center justify-center h-12 w-12 rounded-full border-4 border-green-500 bg-green-50 shrink-0">
              <span className="text-sm font-bold text-green-700">{matchScore}%</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-gray-600 text-sm line-clamp-2">{user.bio || "No bio provided."}</p>
        </div>

        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Can Teach</h4>
          <div className="flex flex-wrap gap-2">
            {user.skillsKnown?.length > 0 ? (
              user.skillsKnown.slice(0, 3).map(skill => (
                <SkillBadge key={skill._id} skill={skill} size="sm" />
              ))
            ) : (
              <span className="text-sm text-gray-400">None listed</span>
            )}
            {user.skillsKnown?.length > 3 && (
              <span className="text-xs text-gray-500 flex items-center">+{user.skillsKnown.length - 3} more</span>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onViewProfile(user._id)}
            className="flex-1 py-2 px-4 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
          >
            View Profile
          </button>
          <button
            onClick={() => onSendRequest(user)}
            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
