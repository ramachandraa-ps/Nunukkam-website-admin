import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 to-primary-800 p-8 shadow-lg shadow-purple-200 text-white">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome back, Admin!</h2>
                    <p className="text-white/80 text-sm md:text-base max-w-xl">Manage your courses, programs, and users efficiently with the new dashboard.</p>
                    <button
                        onClick={() => navigate('/reports')}
                        className="mt-6 px-6 py-3 bg-white text-primary-700 font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        View Analytics
                    </button>
                </div>
                {/* Glassmorphism Stats Panel */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 min-w-[240px]">
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wide">System Status</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-lg font-bold">All Systems Operational</span>
                    </div>
                </div>
            </div>

            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-xl"></div>
        </div>
    );
};

export default HeroSection;
