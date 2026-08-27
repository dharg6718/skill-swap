import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { usePagination } from '../hooks/usePagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { Bell, Check, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { timeAgo } from '../utils/formatDate';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, limit, totalPages, setPage, setTotalPages } = usePagination(1, 15);

  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filter === 'unread') params.unread = true;
      const res = await getNotifications(params);
      if (res.success) {
        setNotifications(res.data);
        setTotalPages(res.pagination?.totalPages || res.pagination?.pages || 1);
      }
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, limit, filter]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllAsRead();
      if (res.success) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        toast.success('All marked as read');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-indigo-600 w-6 h-6" /> Notifications
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Stay updated on your swaps, sessions, and messages</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(1); }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === 'unread' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread
            </button>
          </div>

          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="large" className="py-20" />
      ) : notifications.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {notifications.map(notif => (
              <div 
                key={notif._id} 
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 ${!notif.isRead ? 'bg-indigo-50/20' : ''}`}
              >
                <div className="mt-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Info size={20} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!notif.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.isRead && (
                  <div className="flex-shrink-0 flex items-center">
                    <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Check back later for updates."
        />
      )}
    </div>
  );
};

export default Notifications;
