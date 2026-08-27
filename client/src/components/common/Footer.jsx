import { Repeat2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Repeat2 size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">SkillSwap</p>
            <p className="text-xs text-slate-500">Learn, teach, grow together.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
          <span className="text-slate-600">&copy; {new Date().getFullYear()} SkillSwap</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
