import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateUser } from '../services/userService';
import { getSkills } from '../services/skillService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Search, Check, Sparkles, BookOpen, User, MapPin } from 'lucide-react';

const EditProfile = () => {
  const { user, updateUser: updateContextUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    availability: {
      days: user?.availability?.days || [],
      startTime: user?.availability?.startTime || '',
      endTime: user?.availability?.endTime || ''
    }
  });
  
  const [allSkills, setAllSkills] = useState([]);
  const [selectedKnown, setSelectedKnown] = useState([]);
  const [selectedWanted, setSelectedWanted] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [fetchingSkills, setFetchingSkills] = useState(true);

  // Sync state when user object loads/changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        availability: {
          days: user.availability?.days || [],
          startTime: user.availability?.startTime || '',
          endTime: user.availability?.endTime || ''
        }
      });
      setSelectedKnown(
        user.skillsKnown?.map(s => String(typeof s === 'object' && s ? s._id : s)) || []
      );
      setSelectedWanted(
        user.skillsWanted?.map(s => String(typeof s === 'object' && s ? s._id : s)) || []
      );
    }
  }, [user]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getSkills({ limit: 200 });
        if (res.success) setAllSkills(res.data || []);
      } catch (err) {
        toast.error('Failed to load skills list');
      } finally {
        setFetchingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const days = prev.availability.days.includes(day)
        ? prev.availability.days.filter((d) => d !== day)
        : [...prev.availability.days, day];

      return {
        ...prev,
        availability: {
          ...prev.availability,
          days
        }
      };
    });
  };

  const toggleSkill = (skillId, list, setList) => {
    const targetId = String(skillId);
    const exists = list.some(id => String(id) === targetId);
    if (exists) {
      setList(list.filter(id => String(id) !== targetId));
    } else {
      setList([...list, targetId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await updateUser(user._id, {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        skillsKnown: selectedKnown,
        skillsWanted: selectedWanted,
        availability: {
          days: formData.availability.days,
          startTime: formData.availability.startTime,
          endTime: formData.availability.endTime
        }
      });
      if (res.success) {
        updateContextUser(res.data);
        toast.success('Profile updated successfully!');
        navigate('/profile');
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(allSkills.map(s => s.category).filter(Boolean))];

  const filteredSkills = allSkills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(skillSearch.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (fetchingSkills) return <LoadingSpinner size="large" className="mt-20" />;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 animate-fadeIn">
      <div className="border-b border-gray-100 pb-5 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="text-indigo-600 w-6 h-6" /> Edit Profile
        </h1>
        <p className="text-gray-500 text-sm mt-1">Update your personal information and skill preferences.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. San Francisco, Remote, London"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">About Me (Bio)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Describe your background, what you love to build or teach..."
            ></textarea>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Availability</h2>
            <p className="text-xs text-gray-500 mt-1">Optional. Matching quality improves when your schedules overlap.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const selected = formData.availability.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.availability.startTime}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  availability: {
                    ...prev.availability,
                    startTime: e.target.value
                  }
                }))}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={formData.availability.endTime}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  availability: {
                    ...prev.availability,
                    endTime: e.target.value
                  }
                }))}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Skill Search & Category Filter */}
        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 custom-scrollbar">
              {categories.slice(0, 6).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills I Know */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Skills I Know (Can Teach)
              <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-bold">
                {selectedKnown.length} selected
              </span>
            </label>
            <span className="text-xs text-gray-400">Click to add/remove</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-gray-100 rounded-xl bg-slate-50/50 custom-scrollbar">
            {filteredSkills.map(skill => {
              const isSelected = selectedKnown.some(id => String(id) === String(skill._id));
              return (
                <button
                  key={`known-${skill._id}`}
                  type="button"
                  onClick={() => toggleSkill(skill._id, selectedKnown, setSelectedKnown)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 border shadow-sm ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                  }`}
                >
                  {isSelected && <Check size={14} className="text-white" />}
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Skills I Want to Learn */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Skills I Want to Learn
              <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full font-bold">
                {selectedWanted.length} selected
              </span>
            </label>
            <span className="text-xs text-gray-400">Click to add/remove</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-gray-100 rounded-xl bg-slate-50/50 custom-scrollbar">
            {filteredSkills.map(skill => {
              const isSelected = selectedWanted.some(id => String(id) === String(skill._id));
              return (
                <button
                  key={`wanted-${skill._id}`}
                  type="button"
                  onClick={() => toggleSkill(skill._id, selectedWanted, setSelectedWanted)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 border shadow-sm ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                  }`}
                >
                  {isSelected && <Check size={14} className="text-white" />}
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
