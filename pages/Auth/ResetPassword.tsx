import React from 'react';
import { Link } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary-600">lock_reset</span>
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Your Password</h2>
        <p className="text-center text-gray-500 mb-8">Enter your registered email ID</p>

        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email ID
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter registered email ID"
            />
          </div>
          <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Submit
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center text-primary-600 font-medium hover:underline">
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;