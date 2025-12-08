import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <span className="material-symbols-outlined text-9xl text-gray-300 dark:text-gray-600">
                        sentiment_dissatisfied
                    </span>
                </div>
                <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Oops! The page you are looking for does not exist.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/30"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};

export default NotFound;
