import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { forgotPassword, verifyResetToken, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  // Verify token if present
  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        setIsLoading(true);
        const valid = await verifyResetToken(token);
        setIsTokenValid(valid);
        if (!valid) {
          setError('This reset link is invalid or has expired. Please request a new one.');
        }
        setIsLoading(false);
      }
    };
    checkToken();
  }, [token, verifyResetToken]);

  // Handle forgot password (request reset link)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    const result = await forgotPassword({ email: email.trim() });

    if (result.success) {
      setIsSubmitted(true);
      setSuccessMessage(result.message);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  // Handle reset password with token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);

    const result = await resetPassword(token, { newPassword });

    if (result.success) {
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  // Show loading while verifying token
  if (token && isLoading && isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-sm w-full max-w-md p-8 md:p-12 border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6A1C9A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Reset password form (when token is present and valid)
  if (token && isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-sm w-full max-w-md p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-[#6A1C9A]">lock_reset</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Set New Password</h2>
            <p className="text-gray-500 text-sm font-medium px-4 leading-relaxed">
              Enter your new password below.
            </p>
          </div>

          {successMessage ? (
            <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-green-500 text-2xl font-bold">check</span>
              </div>
              <h3 className="text-green-700 font-bold text-sm">Password Reset!</h3>
              <p className="text-green-600 text-xs font-medium">{successMessage}</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#6A1C9A]/20 focus:border-[#6A1C9A] outline-none transition-all pr-12 text-gray-900 placeholder-gray-400 shadow-sm text-sm"
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl leading-none">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#6A1C9A]/20 focus:border-[#6A1C9A] outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm text-sm"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#6A1C9A] hover:bg-purple-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-200 transform hover:-translate-y-0.5 text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
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
  }

  // Forgot password form (default - no token)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-sm w-full max-w-md p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-[#6A1C9A]">lock_reset</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Reset Password</h2>
          <p className="text-gray-500 text-sm font-medium px-4 leading-relaxed">
            {token && !isTokenValid
              ? 'This reset link is invalid or has expired.'
              : 'Enter your registered email ID to receive a password reset link.'}
          </p>
        </div>

        {!isSubmitted ? (
          <form className="space-y-8" onSubmit={handleForgotPassword}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">
                Email ID
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#6A1C9A]/20 focus:border-[#6A1C9A] outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm text-sm"
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {error && (
                <p className="text-red-500 text-xs font-medium mt-1">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6A1C9A] hover:bg-purple-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-200 transform hover:-translate-y-0.5 mt-2 text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
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
                {successMessage || 'Please check your inbox. The link is valid for 1 hour.'}
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
