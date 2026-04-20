import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'ROLE_STUDENT' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const user = await login(formData.username, formData.password);
        if (user.role === 'ROLE_ADMIN') navigate('/admin');
        else if (user.role === 'ROLE_TRAINER') navigate('/trainer');
        else navigate('/student');
      } else {
        await api.post('/auth/signup', {
          ...formData,
          role: formData.role
        });
        setIsLogin(true);
        alert('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const roles = [
    { id: 'ROLE_ADMIN', label: 'Admin', icon: 'admin_panel_settings' },
    { id: 'ROLE_TRAINER', label: 'Trainer', icon: 'psychology' },
    { id: 'ROLE_STUDENT', label: 'Student', icon: 'person' }
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[1200px] grid lg:grid-cols-2 bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0px_32px_64px_-12px_rgba(53,37,205,0.08)]">
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-on-tertiary-container rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary-container rounded-full blur-[120px]"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg text-primary">
                <span className="material-symbols-outlined">school</span>
              </div>
              <span className="font-headline font-extrabold text-white text-xl tracking-tight">Academic Atelier</span>
            </div>
          </div>
          <div className="relative z-10">
            <h1 className="font-headline text-5xl font-extrabold text-white leading-[1.1] mb-6">
              Elevating the <br /><span className="text-on-tertiary-container">Art of Learning.</span>
            </h1>
            <p className="text-primary-fixed-dim text-lg max-w-md font-medium leading-relaxed">
              A curated management environment designed for institutions that prioritize precision and student excellence.
            </p>
          </div>
          <div className="relative z-10 flex gap-4">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-semibold">
              v4.2.0 Stable
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-semibold">
              Secure Session
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 md:p-16 lg:p-20 bg-surface-container-lowest">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6 text-primary">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg text-white">
                <span className="material-symbols-outlined">school</span>
              </div>
            </div>
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">{isLogin ? 'Welcome Back' : 'Join the Atelier'}</h2>
            <p className="text-on-surface-variant font-medium">Log in to manage your atelier dashboard.</p>
          </div>

          {error && <div className="mb-6 p-4 bg-error/10 text-error rounded-xl text-sm font-semibold">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Institutional Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200 ${
                        formData.role === role.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined mb-1">{role.icon}</span>
                      <span className="text-[11px] font-bold uppercase tracking-tight">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1" htmlFor="username">Username or Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-slate-400/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  id="username"
                  placeholder="Enter username or email"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">alternate_email</span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-slate-400/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                    id="email"
                    placeholder="name@institute.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400" htmlFor="password">Access Key</label>
                {isLogin && <a className="text-xs font-bold text-primary hover:text-primary-container transition-colors" href="#">Forgot Access?</a>}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">lock</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-slate-400/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  id="password"
                  placeholder="********"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center gap-3 px-1">
                <input className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 bg-surface-container-low" id="remember" type="checkbox" />
                <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">Remember this session</label>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200" type="submit">
              {isLogin ? 'Authenticate Session' : 'Register Account'}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                className="text-sm font-bold text-primary hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Join the Atelier" : "Already have an account? Authenticate"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <footer className="fixed bottom-8 left-0 w-full text-center pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
          © 2024 Atelier IMS • Encrypted Institutional Workspace
        </p>
      </footer>
    </div>
  );
};

export default Login;
