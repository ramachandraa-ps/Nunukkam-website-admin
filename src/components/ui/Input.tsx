import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: string;
    label?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ icon, label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
            <div className="relative group">
                {icon && (
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-700 transition-colors">
                        {icon}
                    </span>
                )}
                <input
                    className={`
            w-full border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 
            focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all text-sm
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default Input;
