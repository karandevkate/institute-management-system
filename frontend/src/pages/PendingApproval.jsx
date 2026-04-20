import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-surface font-body text-on-surface flex items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-tertiary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content Shell */}
      <main className="relative w-full max-w-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Minimal Branding Anchor */}
          <div className="mb-12 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-[0_12px_32px_rgba(53,37,205,0.12)]">
              <span className="material-symbols-outlined">school</span>
            </div>
            <span className="font-headline text-xl font-extrabold tracking-tight text-primary">Academic Atelier</span>
          </div>

          {/* Central Content Card */}
          <div className="w-full bg-white/70 backdrop-blur-2xl rounded-[2rem] p-8 md:p-16 shadow-[0_32px_64px_rgba(53,37,205,0.04)] border border-white/40">
            {/* Under Review Illustration/Icon Container */}
            <div className="relative w-32 h-32 mx-auto mb-10">
              {/* Rotating Tonal Rings */}
              <div className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute inset-2 border-2 border-primary/10 rounded-full"></div>
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-5xl">pending_actions</span>
                </div>
              </div>
              {/* Status Indicator Badge */}
              <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg">
                <div className="w-4 h-4 bg-tertiary rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Messaging */}
            <div className="space-y-4">
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-background tracking-tight">
                Your account is currently waiting for admin approval.
              </h1>
              <p className="text-on-surface-variant text-lg max-w-md mx-auto leading-relaxed">
                Once verified, you will gain access to your learning dashboard. We appreciate your patience while we review your credentials.
              </p>
            </div>

            {/* Info Chips */}
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="font-label text-xs uppercase tracking-wider font-semibold">Typical review: 24-48h</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span className="font-label text-xs uppercase tracking-wider font-semibold">Identity verification in progress</span>
              </div>
            </div>

            {/* Action / Support */}
            <div className="mt-12 pt-8 border-t border-primary/5">
              <p className="font-body text-sm text-on-surface-variant mb-4">Need help or have questions?</p>
              <div className="flex flex-col gap-3">
                <button className="px-6 py-3 rounded-full bg-surface-container-high text-on-surface font-semibold hover:bg-surface-container-highest transition-all active:scale-95 focus:ring-2 focus:ring-primary/20 outline-none">
                  Contact Support Team
                </button>
                <button onClick={handleLogout} className="text-primary font-bold text-sm hover:underline">
                  Logout and check later
                </button>
              </div>
            </div>
          </div>

          {/* Footer Meta */}
          <footer className="mt-12 opacity-60">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] font-semibold text-on-surface-variant">
              Application ID: ATELIER-SR-{Math.floor(100000 + Math.random() * 900000)}
            </p>
          </footer>
        </div>
      </main>

      {/* Visual Polish: Decorative Asymmetric Shapes */}
      <div className="fixed top-20 right-[15%] w-12 h-12 border-2 border-primary/10 rounded-lg rotate-12 hidden lg:block"></div>
      <div className="fixed bottom-20 left-[15%] w-16 h-16 border-2 border-tertiary/10 rounded-full hidden lg:block"></div>
    </div>
  );
};

export default PendingApproval;
