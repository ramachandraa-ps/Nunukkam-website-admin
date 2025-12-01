import React from 'react';

interface StatItem {
    title: string;
    value: string;
    change: string;
    icon: string;
}

interface StatsGridProps {
    stats: StatItem[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary-600">{stat.icon}</span>
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-400">{stat.title}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                        <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{stat.change}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
