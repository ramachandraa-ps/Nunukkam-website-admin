import React from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../common/Breadcrumbs';
import Search from '../common/Search';

interface HeaderProps {
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, setIsSidebarCollapsed, setIsMobileMenuOpen }) => {
    const navigate = useNavigate();



    return (
        <header className="h-16 bg-white dark:bg-[#1F2937] border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
            {/* Left Section: Toggle & Breadcrumbs */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="text-gray-400 hover:text-gray-700"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                <div className="hidden md:block">
                    <Breadcrumbs />
                </div>
            </div>

            {/* Right Section: Search, Notifications, Profile */}
            <div className="flex items-center gap-4 md:gap-6">
                <Search />

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
    );
};

export default Header;
