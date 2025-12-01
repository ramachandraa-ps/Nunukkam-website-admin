import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../shared/Toast';
import { useStore } from '../../store/useStore';

const MainLayout: React.FC = () => {
    const { toasts, removeToast } = useStore();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-background-dark font-sans text-gray-900">
            {/* Toast Notifications */}
            <Toast toasts={toasts} removeToast={removeToast} />

            {/* Sidebar */}
            <Sidebar
                isSidebarCollapsed={isSidebarCollapsed}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Main Content Wrapper */}
            <div
                className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
            >
                {/* Header */}
                <Header
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
