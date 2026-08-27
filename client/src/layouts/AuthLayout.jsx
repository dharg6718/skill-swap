import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Repeat } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="flex flex-col items-center justify-center">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 mb-6">
            <Repeat size={32} />
            <span className="text-2xl font-bold">SkillSwap</span>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
