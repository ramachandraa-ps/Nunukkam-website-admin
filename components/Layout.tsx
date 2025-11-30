import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Toast from './shared/Toast';
import { useStore } from '../store/useStore';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'course' | 'user' | 'college' | 'chapter' | 'skill';
  icon: string;
  path: string;
}

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts, removeToast, courses, users, colleges, chapters, skills } = useStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functionality
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search courses
    courses.forEach(course => {
      if (course.title.toLowerCase().includes(query) || course.description.toLowerCase().includes(query)) {
        results.push({
          id: course.id,
          title: course.title,
          subtitle: `Course - ${course.status}`,
          category: 'course',
          icon: 'auto_stories',
          path: `/courses/edit/${course.id}`,
        });
      }
    });

    // Search users
    users.filter(u => u.status === 'active').forEach(user => {
      if (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)) {
        results.push({
          id: user.id,
          title: user.name,
          subtitle: `${user.role} - ${user.designation}`,
          category: 'user',
          icon: 'person',
          path: `/users/edit/${user.id}`,
        });
      }
    });

    // Search colleges
    colleges.forEach(college => {
      if (college.name.toLowerCase().includes(query) || college.city.toLowerCase().includes(query)) {
        results.push({
          id: college.id,
          title: college.name,
          subtitle: `${college.city}, ${college.state}`,
          category: 'college',
          icon: 'school',
          path: `/colleges/edit/${college.id}`,
        });
      }
    });

    // Search chapters
    chapters.forEach(chapter => {
      if (chapter.name.toLowerCase().includes(query)) {
        results.push({
          id: chapter.id,
          title: chapter.name,
          subtitle: 'Chapter',
          category: 'chapter',
          icon: 'menu_book',
          path: `/courses/chapters/edit/${chapter.id}`,
        });
      }
    });

    // Search skills
    skills.forEach(skill => {
      if (skill.name.toLowerCase().includes(query)) {
        results.push({
          id: skill.id,
          title: skill.name,
          subtitle: skill.description || 'Skill',
          category: 'skill',
          icon: 'psychology',
          path: '/courses/skills',
        });
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  }, [searchQuery, courses, users, colleges, chapters, skills]);

  const handleSearchSelect = (result: SearchResult) => {
    navigate(result.path);
    setSearchQuery('');
    setShowSearchResults(false);
    setIsSearchExpanded(false);
  };

  const getCategoryColor = (category: SearchResult['category']) => {
    switch (category) {
      case 'course': return 'bg-purple-100 text-purple-700';
      case 'user': return 'bg-blue-100 text-blue-700';
      case 'college': return 'bg-green-100 text-green-700';
      case 'chapter': return 'bg-yellow-100 text-yellow-700';
      case 'skill': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Course Master', icon: 'auto_stories', path: '/courses' },
    { name: 'User Management', icon: 'group', path: '/users' },
    { name: 'Colleges', icon: 'school', path: '/colleges' },
    { name: 'Reports', icon: 'bar_chart', path: '/reports' },
  ];

  const bottomNavItems = [
    { name: 'Settings', icon: 'settings', path: '/settings' },
  ];

  // Helper for Breadcrumbs
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-500 hover:text-primary-700 cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const formattedName = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

          return (
            <React.Fragment key={name}>
              <span className="text-gray-300">/</span>
              <span
                className={`${isLast ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-primary-700 cursor-pointer'}`}
                onClick={() => !isLast && navigate(routeTo)}
              >
                {formattedName}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Sidebar panel toggle button (like Nunukkam Trainer Portal)
  const SidebarToggle = () => (
    <button
      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
      title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer rectangle */}
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        {/* Sidebar divider line */}
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-background-dark font-sans text-gray-900">

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#1F2937] border-r border-gray-100 dark:border-gray-700
          transition-all duration-300 ease-in-out flex flex-col overflow-hidden
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Logo Section */}
        <div className={`flex-shrink-0 flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-700 transition-all duration-300 ${isSidebarCollapsed ? 'h-[72px] py-2' : 'h-28 py-2'}`}>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img
              src="/logo.png"
              alt="Nunukkam"
              className={`object-contain transition-all duration-300 ${isSidebarCollapsed ? 'w-14 h-14' : 'w-24 h-24'}`}
            />
            {!isSidebarCollapsed && (
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium tracking-wide">Admin Portal</p>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isSidebarCollapsed ? item.name : ''}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary-700 text-white shadow-md shadow-purple-100'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                  ${isSidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Navigation - Settings & Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
          {/* Settings */}
          {bottomNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isSidebarCollapsed ? item.name : ''}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary-700 text-white shadow-md shadow-purple-100'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                  ${isSidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}

          {/* Logout */}
          <button
            onClick={() => navigate('/login')}
            className={`
              flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium
              text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 transition-colors
              ${isSidebarCollapsed ? 'justify-center' : ''}
            `}
            title="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#1F2937] border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">

          {/* Left Section: Toggle & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-700"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <SidebarToggle />

            <div className="hidden md:block">
              {getBreadcrumbs()}
            </div>
          </div>

          {/* Right Section: Search, Notifications, Profile */}
          <div className="flex items-center gap-4 md:gap-6">

            {/* Animated Search Bar */}
            <div ref={searchRef} className={`relative transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-full md:w-80' : 'w-10'}`}>
              <div className={`
                  flex items-center rounded-lg overflow-hidden
                  ${isSearchExpanded ? 'bg-gray-50 border border-gray-200' : 'bg-transparent'}
              `}>
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="p-2.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <span className="material-symbols-outlined">search</span>
                </button>
                <input
                  type="text"
                  placeholder="Search courses, users, colleges..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => {
                    setIsSearchExpanded(true);
                    if (searchQuery) setShowSearchResults(true);
                  }}
                  className={`
                    bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 w-full pr-3 py-2
                    ${isSearchExpanded ? 'block' : 'hidden'}
                  `}
                />
                {searchQuery && isSearchExpanded && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery && isSearchExpanded && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center">
                      <span className="material-symbols-outlined text-3xl text-gray-300 mb-2 block">search_off</span>
                      <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.category}-${result.id}`}
                          onClick={() => handleSearchSelect(result)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(result.category)}`}>
                            <span className="material-symbols-outlined">{result.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                            <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${getCategoryColor(result.category)}`}>
                            {result.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-50 relative transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Avatar */}
            <div
              onClick={() => navigate('/settings')}
              className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-medium ring-2 ring-offset-2 ring-transparent cursor-pointer hover:ring-primary-200 transition-all"
            >
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
