import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-sm w-full max-w-md p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-[#6A1C9A]">lock_reset</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Reset Password</h2>
          <p className="text-gray-500 text-sm font-medium px-4 leading-relaxed">
            Enter your registered email ID to receive a password reset link.
          </p>
        </div>

        {!isSubmitted ? (
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">
                Email ID
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#6A1C9A]/20 focus:border-[#6A1C9A] outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#6A1C9A] hover:bg-purple-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-200 transform hover:-translate-y-0.5 mt-2 text-sm tracking-wide"
            >
              Send Reset Link
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-green-500 text-2xl font-bold">check</span>
              </div>
              <h3 className="text-green-700 font-bold text-sm">Link Sent!</h3>
              <p className="text-green-600 text-xs font-medium">
                Please check your inbox. The link is valid for 1 hour.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gray-700 font-bold text-sm transition-colors gap-2">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;