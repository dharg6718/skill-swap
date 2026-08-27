import { useState, useEffect } from 'react';
import { getStats } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatsCard from '../../components/common/StatsCard';
import { Users, BookOpen, Send, Calendar, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="large" className="mt-20" />;
  if (!stats) return <div className="text-center mt-20 text-gray-500">Failed to load admin stats.</div>;

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
  const reqData = [
    { name: 'Pending', value: stats.requests.pending },
    { name: 'Accepted', value: stats.requests.accepted },
    { name: 'Rejected', value: stats.requests.rejected },
    { name: 'Cancelled', value: stats.requests.cancelled }
  ];

  const sessData = [
    { name: 'Scheduled', value: stats.sessions.scheduled },
    { name: 'Completed', value: stats.sessions.completed },
    { name: 'Cancelled', value: stats.sessions.cancelled }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard icon={Users} label="Total Users" value={stats.users.total} />
        <StatsCard icon={BookOpen} label="Total Skills" value={stats.skills.total} colorClass="bg-pink-100 text-pink-600" />
        <StatsCard icon={Send} label="Total Requests" value={stats.requests.total} colorClass="bg-yellow-100 text-yellow-600" />
        <StatsCard icon={Calendar} label="Total Sessions" value={stats.sessions.total} colorClass="bg-green-100 text-green-600" />
        <StatsCard icon={Star} label="Avg Rating" value={stats.reviews.averageRating.toFixed(1)} colorClass="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Requests Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reqData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label>
                  {reqData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sessions Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sessData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label>
                  {sessData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
