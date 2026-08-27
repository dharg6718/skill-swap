import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, BookOpen, Send, Calendar, LogOut, ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
  const { logout } = useAuth();

  const links = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { to: '/admin/skills', icon: <BookOpen size={20} />, label: 'Skills' },
    { to: '/admin/requests', icon: <Send size={20} />, label: 'Requests' },
    { to: '/admin/sessions', icon: <Calendar size={20} />, label: 'Sessions' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 border-b border-indigo-700">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            SkillSwap <span className="text-sm font-normal bg-indigo-600 px-2 py-1 rounded">Admin</span>
          </h2>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-3 transition-colors ${
                      isActive ? 'bg-indigo-900 border-l-4 border-indigo-400' : 'hover:bg-indigo-700'
                    }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-indigo-700 space-y-2">
          <NavLink to="/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-indigo-700 rounded transition-colors text-indigo-200 hover:text-white">
            <ArrowLeft size={20} />
            Back to App
          </NavLink>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-indigo-700 rounded transition-colors text-red-300 hover:text-red-100">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
