import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Repeat2, Menu, X, LayoutDashboard, Compass, Sparkles, Send, CalendarDays, Bell, ChevronDown, Settings, ShieldCheck, LogOut, User, Bot } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getUnreadCount } from '../../services/notificationService';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/matches', label: 'Matches', icon: Sparkles },
  { to: '/requests', label: 'Requests', icon: Send },
  { to: '/sessions', label: 'Sessions', icon: CalendarDays },
  { to: '/chat', label: 'Coach', icon: Bot },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        if (res.success) setUnreadCount(res.data.count);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 gradient-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Repeat2 size={20} className="text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 hidden sm:block">
                Skill<span className="text-indigo-600">Swap</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive(to)
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2.5 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                  >
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`hidden sm:block text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 animate-slideDown z-50">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                      >
                        <User size={15} className="text-gray-400" /> My Profile
                      </Link>
                      <Link
                        to="/profile/edit"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                      >
                        <Settings size={15} className="text-gray-400" /> Edit Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                        >
                          <ShieldCheck size={15} className="text-indigo-500" /> Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-50 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Hamburger */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-all"
                >
                  {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-semibold text-gray-700 px-4 py-2 rounded-lg hover:text-indigo-600 hover:bg-gray-50 transition-all">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && user && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slideDown">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(to)
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={17} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
