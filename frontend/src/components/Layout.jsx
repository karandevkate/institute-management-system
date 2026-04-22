import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, roleTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode((value) => !value);
  };

  const navItems = {
    'ROLE_ADMIN': [
      { name: 'Dashboard', icon: 'dashboard', path: '/admin' },
      { name: 'Users', icon: 'group', path: '/admin/students' },
      { name: 'Trainers', icon: 'psychology', path: '/admin/trainers' },
      { name: 'Courses', icon: 'menu_book', path: '/admin/courses' },
      { name: 'Batches', icon: 'layers', path: '/admin/batches' },
    ],
    'ROLE_TRAINER': [
      { name: 'Dashboard', icon: 'dashboard', path: '/trainer' },
      { name: 'Assignments', icon: 'assignment', path: '/trainer/assignments' },
      { name: 'Resources', icon: 'folder_open', path: '/trainer/resources' },
    ],
    'ROLE_STUDENT': [
      { name: 'Dashboard', icon: 'dashboard', path: '/student' },
      { name: 'Tasks', icon: 'assignment', path: '/student/tasks' },
      { name: 'Resources', icon: 'folder_open', path: '/student/resources' },
    ]
  };

  return (
    <div className={`flex min-h-screen bg-background text-on-surface ${isDarkMode ? 'app-dark' : ''}`}>
      {/* SideNavBar */}
      <aside className="layout-sidebar fixed left-0 top-0 h-screen w-64 bg-surface-container-low flex flex-col p-6 z-50 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div>
              <h1 className="font-headline text-lg font-extrabold text-[#4F46E5]">CPV Management System</h1>
              <p className="font-body uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">{roleTitle || 'Management Suite'}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {navItems[user.role]?.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && item.path !== '/trainer' && item.path !== '/student' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${isActive
                    ? 'text-[#4F46E5] bg-white dark:bg-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800 transition-all'
                  }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-headline">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 pt-6">
          <Link to="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800 transition-all">
            <span className="material-symbols-outlined">help</span>
            <span className="font-headline font-semibold">Support</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800 transition-all w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-headline font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* TopNavBar */}
        <header className="layout-topbar fixed top-0 left-64 right-0 z-40 bg-[#f7f9fb]/80 backdrop-blur-xl flex justify-between items-center px-8 py-3 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
          <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 mr-2">search</span>
            <input
              type="text"
              className="bg-transparent border-none focus:ring-0 text-sm font-body w-full text-slate-600 dark:text-slate-200 outline-none"
              placeholder="Search CPV..."
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95 duration-150">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95 duration-150"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-body font-semibold text-sm text-slate-900 dark:text-slate-100">{user.username}</span>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="pt-24 px-8 pb-12 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
