import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMatches } from '../services/matchService';
import { getSkills } from '../services/skillService';
import MatchCard from '../components/common/MatchCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import SwapRequestModal from '../components/modals/SwapRequestModal';
import { SKILL_CATEGORIES } from '../utils/constants';
import { Sparkles, ArrowUpDown, Filter, RotateCcw, BookOpen, Compass } from 'lucide-react';
import { toast } from 'react-toastify';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Filters & Sorting
  const [sortBy, setSortBy] = useState('matchScore'); // 'matchScore' | 'rating' | 'name'
  const [minScore, setMinScore] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const fetchMatchesData = async () => {
    setLoading(true);
    try {
      const res = await getMatches();
      if (res.success) {
        setMatches(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load matches', err);
      toast.error('Unable to calculate skill matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllSkills = async () => {
      try {
        const res = await getSkills({ limit: 100 });
        if (res.success) setSkills(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllSkills();
    fetchMatchesData();
  }, []);

  const handleSendRequest = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Filtered & Sorted Matches
  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
        const score = m.matchScore ?? m.score ?? 0;
        if (minScore && score < parseFloat(minScore)) return false;

        const allSkills = [
          ...(m.skillsYouCanTeach || m.teachableSkills || []),
          ...(m.skillsYouCanLearn || m.learnableSkills || [])
        ];

        if (categoryFilter && !allSkills.some((s) => s.category === categoryFilter)) {
          return false;
        }

        if (skillFilter && !allSkills.some((s) => s._id === skillFilter || s.name?.toLowerCase().includes(skillFilter.toLowerCase()))) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'matchScore') {
          return (b.matchScore ?? b.score ?? 0) - (a.matchScore ?? a.score ?? 0);
        }
        if (sortBy === 'rating') {
          return (b.user?.rating || 0) - (a.user?.rating || 0);
        }
        if (sortBy === 'name') {
          return (a.user?.name || '').localeCompare(b.user?.name || '');
        }
        return 0;
      });
  }, [matches, sortBy, minScore, categoryFilter, skillFilter]);

  const handleClearFilters = () => {
    setSortBy('matchScore');
    setMinScore('');
    setCategoryFilter('');
    setSkillFilter('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-300" /> Your Skill Matches
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base mt-1">
            People who can teach what you want to learn and learn what you can teach.
          </p>
        </div>
        <Link
          to="/profile/edit"
          className="self-start sm:self-center px-4 py-2 bg-white text-indigo-900 font-bold rounded-xl text-xs sm:text-sm hover:bg-indigo-50 transition shadow-sm"
        >
          Update My Skills
        </Link>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Sorting */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" /> Sort Matches By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="matchScore">Highest Match Score</option>
              <option value="rating">Highest Rating</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Min Match % */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Minimum Match %</label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full py-2.5 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Matches</option>
              <option value="80">80%+ (Excellent)</option>
              <option value="60">60%+ (Strong)</option>
              <option value="40">40%+ (Good)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Skill Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Categories</option>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Skill */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Specific Skill</label>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Skills</option>
              {skills.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            Found {filteredMatches.length} matching {filteredMatches.length === 1 ? 'peer' : 'peers'}
          </span>
          {(minScore || categoryFilter || skillFilter || sortBy !== 'matchScore') && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMatches.map((m) => (
            <MatchCard
              key={m.user?._id || Math.random()}
              match={m}
              onSendRequest={handleSendRequest}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No strong skill matches found yet"
          description="Add more skills you know and want to learn to your profile so our matching engine can find the perfect peers for you."
          actionText="Edit Skills & Profile"
          onAction={() => navigate('/profile/edit')}
        />
      )}

      {/* Swap Request Modal */}
      {selectedUser && (
        <SwapRequestModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          receiver={selectedUser}
          onSuccess={() => {
            fetchMatchesData();
          }}
        />
      )}
    </div>
  );
};

export default Matches;
