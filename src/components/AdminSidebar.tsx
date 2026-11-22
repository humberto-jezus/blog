import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, LogOut, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useI18n();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/pages', icon: FileText, label: t('admin.pages') },
    { path: '/admin/new', icon: PlusCircle, label: t('admin.newArticle') },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Admin Nav Bar */}
      <div className="md:hidden w-full bg-white border-b border-gray-200 px-3 py-2.5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 text-[#0067b8]'
                : 'text-[#404040] hover:bg-gray-100'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={logout}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 whitespace-nowrap cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          {t('admin.logout')}
        </button>
      </div>

      {/* Desktop Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] hidden md:flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-xs font-bold text-[#505050] uppercase tracking-wider mb-6">
            Menu de ADM
          </h2>
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-[#0067b8]'
                    : 'text-[#404040] hover:bg-gray-100 hover:text-[#1a1a1a]'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-bold text-[#404040] hover:bg-gray-100 hover:text-[#1a1a1a] transition-colors mb-2"
          >
            <Home className="h-4 w-4" />
            {t('nav.home')}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-bold text-[#404040] hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
