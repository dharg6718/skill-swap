import { Link } from 'react-router-dom';
import SkillBadge from './SkillBadge';
import StarRating from './StarRating';
import { MapPin, Sparkles, Send, User } from 'lucide-react';

const MatchCard = ({ match, onSendRequest }) => {
  const { user } = match;
  const score = match.matchScore ?? match.score ?? 0;
  const teachSkills = match.skillsYouCanTeach || match.teachableSkills || [];
  const learnSkills = match.skillsYouCanLearn || match.learnableSkills || [];
  const reasons = match.reasons || [];
  const reliability = match.reliability ?? 0;
  const availabilityMatch = Boolean(match.availabilityMatch);
  const completedSessions = match.completedSessions ?? 0;

  const getTierInfo = (score) => {
    if (score >= 90) return { label: 'Excellent Match', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'border-emerald-500' };
    if (score >= 75) return { label: 'Strong Match', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', ring: 'border-indigo-500' };
    if (score >= 60) return { label: 'Good Match', bg: 'bg-blue-50 text-blue-700 border-blue-200', ring: 'border-blue-500' };
    return { label: 'Potential Match', bg: 'bg-amber-50 text-amber-700 border-amber-200', ring: 'border-amber-500' };
  };

  const tier = getTierInfo(score);

  const generateExplanation = () => {
    if (reasons.length > 0) {
      return reasons.join(' • ');
    }

    const teachNames = teachSkills.slice(0, 2).map((s) => s.name).join(', ');
    const learnNames = learnSkills.slice(0, 2).map((s) => s.name).join(', ');

    if (teachNames && learnNames) {
      return `You can teach ${teachNames}, and ${user.name} can teach ${learnNames} to you.`;
    } else if (learnNames) {
      return `${user.name} knows ${learnNames}, which matches your learning goals.`;
    } else if (teachNames) {
      return `You know ${teachNames}, which ${user.name} is looking to learn.`;
    }
    return 'Compatible profile based on mutual learning interests.';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg uppercase shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">
                {user.name}
              </h3>
              {user.location && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {user.location}
                </p>
              )}
              <div className="mt-1">
                <StarRating rating={user.rating || 0} size="small" />
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex flex-col items-end">
              <span className="text-2xl font-black text-indigo-700 tracking-tight">
                {score}%
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tier.bg}`}>
                {tier.label}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50/60 rounded-xl p-3 mb-4 border border-indigo-100/70 text-xs text-indigo-900 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <span className="font-bold">Why this match? </span>
            {generateExplanation()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700 mb-5">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
            <div className="font-bold text-emerald-700">Rating</div>
            <div>{(user.rating || 0).toFixed(1)} / 5</div>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-2">
            <div className="font-bold text-sky-700">Reliability</div>
            <div>{reliability}%</div>
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-2">
            <div className="font-bold text-violet-700">Sessions</div>
            <div>{completedSessions} successful</div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
            <div className="font-bold text-amber-700">Availability</div>
            <div>{availabilityMatch ? 'Match' : 'No overlap'}</div>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <h4 className="font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> You can teach:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {teachSkills.length > 0 ? (
                teachSkills.map((s) => (
                  <SkillBadge key={s._id || s.name} skill={s} size="sm" />
                ))
              ) : (
                <span className="text-gray-400 italic">No direct overlap</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> You can learn:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {learnSkills.length > 0 ? (
                learnSkills.map((s) => (
                  <SkillBadge key={s._id || s.name} skill={s} size="sm" />
                ))
              ) : (
                <span className="text-gray-400 italic">No direct overlap</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 mt-6 pt-4 border-t border-gray-100">
        <Link
          to={`/profile/${user._id}`}
          className="flex-1 py-2.5 px-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition text-center flex items-center justify-center gap-1"
        >
          <User className="w-3.5 h-3.5" /> View Profile
        </Link>
        <button
          onClick={() => onSendRequest(user)}
          className="flex-1 py-2.5 px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" /> Send Request
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
