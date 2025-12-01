import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
    const variants = {
        primary: "bg-purple-100 text-purple-700",
        secondary: "bg-blue-100 text-blue-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        danger: "bg-red-100 text-red-700",
        neutral: "bg-gray-100 text-gray-700",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
