import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[500px] bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-error mb-4">Invalid Link</h2>
          <p className="mb-6 text-on-surface-variant">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" title="Forgot Password" className="text-primary font-bold hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[500px] bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-[0px_32px_64px_-12px_rgba(53,37,205,0.08)]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl text-primary mb-6">
            <span className="material-symbols-outlined text-3xl">lock_open</span>
          </div>
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Reset Password</h2>
          <p className="text-on-surface-variant font-medium">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-6 bg-tertiary/10 text-tertiary rounded-2xl">
              <p className="font-bold">Password Reset Successful!</p>
              <p className="text-sm">Your password has been updated. Redirecting to login...</p>
            </div>
            <Link
              to="/login"
              className="inline-block font-bold text-primary hover:underline"
            >
              Go to Login now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1" htmlFor="password">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">lock</span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-slate-400/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">lock</span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-slate-400/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                    id="confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
      <footer className="fixed bottom-8 left-0 w-full text-center pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
          © 2024 CPV IMS • Encrypted Institutional Workspace
        </p>
      </footer>
    </div>
  );
};

export default ResetPassword;
