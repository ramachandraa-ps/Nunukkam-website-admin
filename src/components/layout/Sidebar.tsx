import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

interface NavItem {
    name: string;
    icon: string;
    path: string;
    children?: { name: string; path: string; icon?: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const navItems: NavItem[] = [
        { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
        {
            name: 'Courses',
            icon: 'auto_stories',
            path: '/courses',
            children: [
                { name: 'Course Master', path: '/courses' }, // Matches wireframe "Course Master" sub-item
                { name: 'Create Course', path: '/courses/create' },
                { name: 'Add Core Skills', path: '/courses/core-skills' },
                { name: 'Add Skills', path: '/courses/skills' },
                { name: 'Add Assessment Types', path: '/courses/assessment-types' },
                { name: 'Add Chapters', path: '/courses/chapters' },
            ]
        },
        { name: 'Program Management', icon: 'collections_bookmark', path: '/colleges' },
        { name: 'User Management', icon: 'group', path: '/users' },
        { name: 'Reports', icon: 'bar_chart', path: '/reports' },
    ];

    const bottomNavItems = [
        { name: 'Settings', icon: 'settings', path: '/settings' },
    ];

    // Auto-expand menu if active link is child
    useEffect(() => {
        const activeItem = navItems.find(item =>
            item.path !== '/dashboard' && location.pathname.startsWith(item.path)
        );
        if (activeItem && activeItem.children) {
            setExpandedMenu(activeItem.name);
        }
    }, [location.pathname]);

    const handleMenuClick = (item: NavItem, e: React.MouseEvent) => {
        if (item.children) {
            e.preventDefault();
            setExpandedMenu(expandedMenu === item.name ? null : item.name);
        } else {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Sidebar Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          absolute top-16 left-4 z-50 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-gray-700
          rounded-xl shadow-2xl transition-all duration-200 ease-in-out flex flex-col overflow-hidden max-h-[calc(100vh-5rem)]
          ${isMobileMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
          w-64 origin-top-left
        `}
            >


                {/* Navigation Items */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path) && item.path !== '/dashboard'; // Simple active check, improved below for children
                        // Dashboard exact match check
                        const isDashboardActive = item.path === '/dashboard' && location.pathname === '/dashboard';
                        const isItemActive = isDashboardActive || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        const isExpanded = expandedMenu === item.name;

                        return (
                            <div key={item.name}>
                                <NavLink
                                    to={item.path}
                                    onClick={(e) => handleMenuClick(item, e)}
                                    className={`
                                        flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                        ${isItemActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[20px] ${isItemActive ? 'fill' : ''}`}>{item.icon}</span>
                                        <span>{item.name}</span>
                                    </div>
                                    {item.children && (
                                        <span className="material-symbols-outlined text-[20px]">
                                            {isExpanded ? 'expand_less' : 'expand_more'}
                                        </span>
                                    )}
                                </NavLink>

                                {/* Sub-menu */}
                                {item.children && isExpanded && (
                                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-700 pl-2">
                                        {item.children.map((child) => (
                                            <NavLink
                                                key={child.path}
                                                to={child.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                end={child.path === '/courses'} // Add exact match for the main list if needed
                                                className={({ isActive }) => `
                                                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'text-primary-700 font-medium bg-primary-50/50'
                                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}
                                                `}
                                            >
                                                <span>{child.name}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                `}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${item.path === location.pathname ? 'fill' : ''}`}>{item.icon}</span>
                                <span>{item.name}</span>
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
