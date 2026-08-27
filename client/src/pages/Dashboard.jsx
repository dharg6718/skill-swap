import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats } from '../services/dashboardService';
import { getMatches } from '../services/matchService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Users, Send, CalendarDays, Star, TrendingUp, ArrowRight, Sparkles, 
  Clock, CheckCircle2, XCircle, Bell, BookOpen, ChevronRight, Zap,
  Award, Activity, Compass
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatDateTime, timeAgo } from '../utils/formatDate';

const Avatar = ({ name, size = 'md', className = '' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  const colors = ['from-indigo-400 to-indigo-600','from-purple-400 to-purple-600','from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600','from-orange-400 to-orange-600'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, change, color = 'indigo', link }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
  };
  const content = (
    <div className="card p-5 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
          {change !== undefined && (
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={10} /> {change > 0 ? `+${change}` : change} this week
            </p>
          )}
        </div>
        <div className={`h-11 w-11 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, matchRes] = await Promise.all([
          getDashboardStats(),
          getMatches({ limit: 5 })
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (matchRes.success) setMatches(matchRes.data.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const profileCompletion = () => {
    let score = 0;
    if (user?.name) score += 20;
    if (user?.bio) score += 20;
    if (user?.location) score += 15;
    if (user?.skillsKnown?.length > 0) score += 25;
    if (user?.skillsWanted?.length > 0) score += 20;
    return score;
  };

  const completion = profileCompletion();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="large" />
    </div>
  );

  const chartData = stats?.sessionTimeline || [];
  const statusColor = { pending: 'yellow', accepted: 'green', rejected: 'red', cancelled: 'gray' };
  const statusIcon = { pending: Clock, accepted: CheckCircle2, rejected: XCircle, cancelled: XCircle };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="gradient-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -right-4 w-56 h-56 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-indigo-200 text-sm font-medium">Welcome back 👋</p>
          <h1 className="text-2xl font-bold mt-1">{user?.name?.split(' ')[0]}</h1>
          <p className="text-indigo-200 text-sm mt-2">
            {stats?.pendingRequests > 0 
              ? `You have ${stats.pendingRequests} pending request${stats.pendingRequests > 1 ? 's' : ''} waiting.`
              : "You're all caught up! Keep exploring new skills."}
          </p>
          <div className="mt-4 flex gap-3">
            <Link to="/explore" className="flex items-center gap-1.5 bg-white text-indigo-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all">
              <Compass size={15} /> Explore Skills
            </Link>
            <Link to="/matches" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
              <Sparkles size={15} /> View Matches
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Matches" value={stats?.totalMatches} color="indigo" link="/matches" />
        <StatCard icon={Send} label="Requests" value={stats?.totalRequests} color="purple" link="/requests" />
        <StatCard icon={CalendarDays} label="Sessions" value={stats?.totalSessions} color="green" link="/sessions" />
        <StatCard icon={Star} label="Rating" value={stats?.avgRating ? stats.avgRating.toFixed(1) : 'N/A'} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Session Activity</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">Last 6 months</span>
          </div>
          {chartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="sessions" stroke="#4F46E5" strokeWidth={2.5} fill="url(#sessionGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No session data yet. <Link to="/explore" className="text-indigo-600 ml-1">Start exploring!</Link>
            </div>
          )}
        </div>

        {/* Profile Completion */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4">Profile Strength</h2>
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#4F46E5" strokeWidth="2.5"
                  strokeDasharray={`${completion}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{completion}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Add your name', done: !!user?.name },
              { label: 'Write a bio', done: !!user?.bio },
              { label: 'Add location', done: !!user?.location },
              { label: 'Add skills you know', done: user?.skillsKnown?.length > 0 },
              { label: 'Add skills to learn', done: user?.skillsWanted?.length > 0 },
            ].map(({ label, done }) => (
              <div key={label} className={`flex items-center gap-2 ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                <CheckCircle2 size={14} className={done ? 'text-emerald-500' : 'text-gray-300'} />
                {label}
              </div>
            ))}
          </div>
          {completion < 100 && (
            <Link to="/profile/edit" className="mt-4 btn-primary w-full justify-center text-sm py-2">
              Complete Profile
            </Link>
          )}
        </div>
      </div>

      {/* Top Matches */}
      {matches.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><Sparkles size={18} className="text-indigo-500" /> Top Matches</h2>
            <Link to="/matches" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {matches.map(match => (
              <Link
                key={match.user._id}
                to={`/users/${match.user._id}`}
                className="flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
              >
                <Avatar name={match.user.name} size="lg" />
                <p className="font-semibold text-gray-900 text-sm mt-2 text-center">{match.user.name}</p>
                <span className="mt-1 badge bg-indigo-100 text-indigo-700">
                  {match.matchScore}% match
                </span>
                {match.skillsYouCanLearn?.[0] && (
                  <span className="mt-2 text-xs text-gray-500 text-center line-clamp-1">
                    Learns {match.skillsYouCanLearn[0].name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recentRequests?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><Activity size={18} className="text-indigo-500" /> Recent Requests</h2>
            <Link to="/requests" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentRequests.slice(0, 5).map(req => {
              const Icon = statusIcon[req.status] || Clock;
              return (
                <div key={req._id} className="flex items-center gap-3 py-3">
                  <Avatar name={req.sender?.name || '?'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{req.sender?.name}</p>
                    <p className="text-xs text-gray-500 truncate">wants to swap: {req.offeredSkill?.name} ↔ {req.requestedSkill?.name}</p>
                  </div>
                  <span className={`badge ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {req.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
