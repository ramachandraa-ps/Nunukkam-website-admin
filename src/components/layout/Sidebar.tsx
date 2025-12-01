import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

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

    return (
        <>
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
        </>
    );
};

export default Sidebar;
