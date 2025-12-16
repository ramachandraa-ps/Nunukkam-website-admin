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
        {
            name: 'Program Management',
            icon: 'collections_bookmark',
            path: '/colleges',
            children: [
                { name: 'Program Master', path: '/colleges/master' },
                { name: 'Colleges', path: '/colleges' },
            ]
        },
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
                    fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#1F2937] border-r border-gray-100 dark:border-gray-700
                    transition-all duration-300 ease-in-out flex flex-col overflow-hidden
                    ${isSidebarCollapsed ? 'w-20' : 'w-64'}
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Section */}
                <div className={`flex-shrink-0 flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-700 transition-all duration-300 ${isSidebarCollapsed ? 'h-[72px] py-2' : 'h-28 py-2'}`}>
                    <div
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => {
                            if (location.pathname === '/dashboard') {
                                // Scroll to top
                                const mainContent = document.getElementById('main-content');
                                if (mainContent) {
                                    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            } else {
                                navigate('/dashboard');
                            }
                        }}
                    >
                        <img
                            src="/logo.png"
                            alt="Nunukkam"
                            className={`object-contain transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-24 h-24'}`}
                        />
                        {!isSidebarCollapsed && (
                            <p className="text-xs text-center text-gray-700 dark:text-gray-300 font-medium tracking-wide mt-2">Admin Portal</p>
                        )}
                    </div>
                </div>


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
                                        flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                        ${isItemActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                                    `}
                                    title={isSidebarCollapsed ? item.name : ''}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[20px] ${isItemActive ? 'fill' : ''}`}>{item.icon}</span>
                                        {!isSidebarCollapsed && <span>{item.name}</span>}
                                    </div>
                                    {!isSidebarCollapsed && item.children && (
                                        <span className="material-symbols-outlined text-[20px]">
                                            {isExpanded ? 'expand_less' : 'expand_more'}
                                        </span>
                                    )}
                                </NavLink>

                                {/* Sub-menu */}
                                {item.children && isExpanded && !isSidebarCollapsed && (
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
                  flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                `}
                                title={isSidebarCollapsed ? item.name : ''}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${item.path === location.pathname ? 'fill' : ''}`}>{item.icon}</span>
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
