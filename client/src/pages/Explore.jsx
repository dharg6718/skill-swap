import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../services/userService';
import { getSkills } from '../services/skillService';
import UserCard from '../components/common/UserCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import SwapRequestModal from '../components/modals/SwapRequestModal';
import { SKILL_CATEGORIES } from '../utils/constants';
import { Search, Filter, RotateCcw, Compass, MapPin, Star, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

const Explore = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 12;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState('');

  // Modal
  const [selectedUserForSwap, setSelectedUserForSwap] = useState(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllSkills = async () => {
      try {
        const res = await getSkills({ limit: 100 });
        if (res.success) {
          setSkills(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load skill list', err);
      }
    };
    fetchAllSkills();
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim(),
        skill: selectedSkill,
        category: selectedCategory,
        location: location.trim(),
        rating: minRating
      };

      const res = await getUsers(params);
      if (res.success) {
        setUsers(res.data || []);
        if (res.pagination) {
          setTotal(res.pagination.total || 0);
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error fetching users', err);
      toast.error('Unable to load users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedSkill, selectedCategory, location, minRating]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
    setLocation(locationInput);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setSelectedSkill('');
    setSelectedCategory('');
    setLocationInput('');
    setLocation('');
    setMinRating('');
    setPage(1);
  };

  const handleSendSwapRequest = (user) => {
    setSelectedUserForSwap(user);
    setIsSwapModalOpen(true);
  };

  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Compass className="w-8 h-8 text-indigo-600" /> Explore Skills
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-1">
          Find people who can teach what you want to learn and connect directly with peers worldwide.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <form onSubmit={handleApplyFilters} className="space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search users by name, skills, or bio..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Skill Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Specific Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => {
                  setSelectedSkill(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2.5 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Skills</option>
                {skills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2.5 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Categories</option>
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. New York, Bangalore..."
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => {
                  setMinRating(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2.5 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Any Rating</option>
                <option value="4.5">⭐⭐⭐⭐⭐ 4.5 & up</option>
                <option value="4.0">⭐⭐⭐⭐ 4.0 & up</option>
                <option value="3.0">⭐⭐⭐ 3.0 & up</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500 font-medium">
              {total > 0
                ? `Showing ${startRecord}-${endRecord} of ${total} users`
                : '0 users found'}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-1"
              >
                <Filter className="w-3.5 h-3.5" /> Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* User Grid & Content Area */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((u) => (
              <UserCard
                key={u._id}
                user={u}
                onViewProfile={(id) => navigate(`/profile/${id}`)}
                onSendRequest={handleSendSwapRequest}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="pt-6">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState
          icon={Search}
          title="No users found"
          description="Try modifying your search keywords or clearing active filters."
          actionText="Clear All Filters"
          onAction={handleClearFilters}
        />
      )}

      {/* Swap Request Modal */}
      {selectedUserForSwap && (
        <SwapRequestModal
          isOpen={isSwapModalOpen}
          onClose={() => {
            setIsSwapModalOpen(false);
            setSelectedUserForSwap(null);
          }}
          receiver={selectedUserForSwap}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default Explore;
