import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, Settings, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Portfolio', path: '/admin/portfolio', icon: ImageIcon },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-stone-50 text-stone-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col shadow-sm">
        <div className="h-20 flex items-center px-6 border-b border-stone-100">
          <Link to="/admin" className="font-serif text-xl font-bold text-burgundy-800 tracking-widest uppercase">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-burgundy-50 text-burgundy-800 font-medium shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-burgundy-600' : 'text-stone-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-stone-100 flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center px-8 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-stone-800 tracking-tight">
            {navItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
          </h1>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-stone-50/50">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
