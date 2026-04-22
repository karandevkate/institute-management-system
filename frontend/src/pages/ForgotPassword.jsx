import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[500px] bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-[0px_32px_64px_-12px_rgba(53,37,205,0.08)]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl text-primary mb-6">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Forgot Password?</h2>
          <p className="text-on-surface-variant font-medium">
            Enter your institutional email to receive a password reset link.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="p-6 bg-tertiary/10 text-tertiary rounded-2xl">
              <p className="font-bold">Reset link sent!</p>
              <p className="text-sm">Please check your email for instructions to reset your password.</p>
            </div>
            <Link
              to="/login"
              className="inline-block font-bold text-primary hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">alternate_email</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-slate-400/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  id="email"
                  placeholder="name@institute.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-4">
              <Link
                to="/login"
                className="text-sm font-bold text-primary hover:underline"
              >
                Back to Authentication
              </Link>
            </div>
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

export default ForgotPassword;
