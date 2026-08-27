import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getNotifications, markAsRead } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await getNotifications({ limit: 5 });
        if (res.success) setNotifications(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
      setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
    }
    setIsOpen(false);
    navigate('/notifications');
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors relative"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button 
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View All
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                >
                  <p className={`text-sm ${!notif.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
