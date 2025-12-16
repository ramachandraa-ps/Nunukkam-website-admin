import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@nunukkam.com');
  const [password, setPassword] = useState('Admin@123');
  const [attempts, setAttempts] = useState(5);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setAttempts(prev => prev - 1);
      setError(`Invalid email ID/Phone number/password. ${attempts - 1} attempts left`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-sm w-full max-w-md p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-10">
          <img
            src="/logo.png"
            alt="Nunukkam"
            className="w-24 h-24 object-contain mx-auto mb-2"
          />
          <h2 className="text-2xl font-bold text-[#6A1C9A] tracking-wide mb-3">Nunukkam</h2>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Enter your credentials to access the dashboard</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Email or Mobile Number</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#6A1C9A]/20 focus:border-[#6A1C9A] outline-none transition-all text-gray-900 placeholder-gray-500 shadow-sm text-sm"
              placeholder="trainer@nunukkam.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#6A1C9A]/20 focus:border-[#6A1C9A] outline-none transition-all pr-12 text-gray-900 placeholder-gray-500 shadow-sm text-sm"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                style={{ outline: "none" }}
              >
                <span className="material-symbols-outlined text-xl leading-none">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 bg-white text-[#6A1C9A] focus:ring-[#6A1C9A]/20 transition-all cursor-pointer accent-[#6A1C9A]" />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">Remember me</span>
            </label>
            <button type="button" onClick={() => navigate('/reset-password')} className="text-sm font-bold text-[#6A1C9A] hover:text-purple-800 transition-colors focus:outline-none">
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="w-full bg-[#6A1C9A] hover:bg-purple-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-200 transform hover:-translate-y-0.5 mt-4 text-sm tracking-wide">
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-medium">© 2024 Nunukkam. Single device login only.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;